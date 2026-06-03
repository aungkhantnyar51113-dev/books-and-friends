import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SessionDetail } from '@/components/SessionDetail';
import { Suspense } from 'react';
import { SessionDetailSkeleton } from '@/components/Skeletons';

async function SessionContent({ id }: { id: string }) {
  const supabase = await createClient();
  if (!supabase) notFound();

  const { data: session, error } = await supabase
    .from('reading_sessions')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !session) notFound();

  // Fetch all data in parallel
  let progressRes, commentsRes, userRes, participantsRes;
  try {
    [progressRes, commentsRes, userRes, participantsRes] = await Promise.all([
      (supabase as any)
        .from('progress')
        .select(`
          id,
          user_id,
          chapter,
          updated_at,
          profiles (display_name)
        `)
        .eq('session_id', id)
        .order('chapter', { ascending: false }),
      (supabase
        .from('comments')
        .select(`
          id,
          user_id,
          content,
          created_at,
          updated_at,
          profiles (display_name, avatar_url)
        `)
        .eq('session_id', id)
        .order('created_at', { ascending: true })),
      supabase.auth.getUser(),
      (supabase as any)
        .from('participants')
        .select(`
          id,
          user_id,
          profiles!inner(
            display_name,
            avatar_url
          )
        `)
        .eq('session_id', id)
    ]);
  } catch (err) {
    console.error('Error in Promise.all fetching data:', err);
    throw err;
  }

  const { data: progress, error: progErr } = progressRes;
  const { data: comments, error: commErr } = commentsRes;
  const { data: { user } } = userRes;
  const { data: participants, error: partErr } = participantsRes;

  if (progErr) {
    console.error('Progress fetch error detail:', JSON.stringify(progErr, null, 2));
  }
  if (commErr) {
    console.error('Comments fetch error detail:', JSON.stringify(commErr, null, 2));
  }
  if (partErr) {
    console.error('Participants fetch error detail:', JSON.stringify(partErr, null, 2));
  }

  const commentIds = (comments || []).map((c: any) => c.id);
  const { data: reactions } = commentIds.length > 0 
    ? await supabase
        .from('reactions')
        .select('id, comment_id, user_id, reaction_type')
        .in('comment_id', commentIds)
    : { data: [] };

  const { data: participant } = user
    ? await (supabase as any)
        .from('participants')
        .select('id')
        .eq('session_id', id)
        .eq('user_id', user.id)
        .maybeSingle()
    : { data: null };

  const progressWithProfiles = (progress || []).map((p: any) => ({
    ...p,
    profiles: Array.isArray(p.profiles) ? p.profiles[0] : (p.profiles || { display_name: 'Anonymous' }),
  }));

  const commentsWithReactions = (comments || []).map((c: any) => ({
    ...c,
    profiles: Array.isArray(c.profiles) ? c.profiles[0] : (c.profiles || { display_name: 'Anonymous' }),
    reactions: (reactions || []).filter((r: any) => r.comment_id === c.id),
  }));

  // Combine participants with their progress
  const participantsWithProgress = (participants || []).map((participant: any) => {
    const userProgress = progress?.find((p: any) => p.user_id === participant.user_id);
    return {
      ...participant,
      progress: userProgress ? { chapter: userProgress.chapter } : { chapter: 0 },
      profiles: Array.isArray(participant.profiles) ? participant.profiles[0] : (participant.profiles || { display_name: 'Anonymous' })
    };
  });

  return (
    <SessionDetail
      session={session}
      progress={progressWithProfiles as any}
      comments={commentsWithReactions as any}
      participants={participantsWithProgress as any}
      isParticipant={!!participant}
      currentUserId={user?.id ?? null}
    />
  );
}

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <Suspense fallback={<SessionDetailSkeleton />}>
      <SessionContent id={id} />
    </Suspense>
  );
}
