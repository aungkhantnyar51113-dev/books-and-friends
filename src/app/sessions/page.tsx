import { createClient } from '@/lib/supabase/server';
import { SessionList } from '@/components/SessionList';
import { Suspense } from 'react';
import { SessionCardSkeleton } from '@/components/Skeletons';

async function SessionsListWrapper() {
  const supabase = await createClient();
  if (!supabase) return (
    <p className="text-stone-500">Service temporarily unavailable. Please configure Supabase credentials.</p>
  );

  const { data: sessions, error } = await (supabase as any)
    .from('reading_sessions')
    .select('id, title, author, chapters, created_at, book_cover_url')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching sessions:', error);
    return <p className="text-stone-500 italic">Failed to load sessions. Please try again later.</p>;
  }

  // Get participant count per session
  const sessionsWithCount = await Promise.all(
    (sessions || []).map(async (s: any) => {
      const { count } = await (supabase as any)
        .from('participants')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', s.id);
      return { ...s, participant_count: count ?? 0 };
    })
  );

  return <SessionList sessions={sessionsWithCount} />;
}

export default async function SessionsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-serif text-2xl font-bold mb-6">Reading Sessions</h1>
      <Suspense fallback={<div className="space-y-3">{[1, 2, 3].map(i => <SessionCardSkeleton key={i} />)}</div>}>
        <SessionsListWrapper />
      </Suspense>
    </div>
  );
}
