'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';
import { UserProgressBar } from './UserProgressBar';

interface Session {
  id: string;
  title: string;
  author: string;
  chapters: number;
  book_cover_url?: string;
  created_at: string;
  participants_count?: number;
}

interface Participant {
  id: string;
  user_id: string;
  profiles: {
    display_name: string | null;
  };
  progress: {
    chapter: number;
  }[];
}

export function CurrentSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCurrentSession() {
      try {
        const supabase = createClient();
        
        // Fetch the most recent session with participants and their progress
        const { data: sessions } = await (supabase as any)
          .from('reading_sessions')
          .select(`
            *,
            participants!inner(
              id,
              user_id,
              profiles!inner(
                display_name
              )
            ),
            progress!inner(
              chapter,
              user_id
            )
          `)
          .order('created_at', { ascending: false })
          .limit(1);

        if (sessions && sessions.length > 0) {
          const sessionData = sessions[0];
          
          // Combine participants with their progress
          const participantsWithProgress = (sessionData.participants || []).map((participant: any) => {
            const userProgress = sessionData.progress?.find((p: any) => p.user_id === participant.user_id);
            return {
              ...participant,
              progress: userProgress ? [userProgress] : [{ chapter: 0 }]
            };
          });

          setSession({
            id: sessionData.id,
            title: sessionData.title,
            author: sessionData.author,
            chapters: sessionData.chapters,
            book_cover_url: sessionData.book_cover_url,
            created_at: sessionData.created_at,
            participants_count: sessionData.participants?.length || 0
          });
          
          setParticipants(participantsWithProgress);
        }
      } catch (error) {
        console.error('Error fetching current session:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCurrentSession();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-200">
        <div className="animate-pulse">
          <div className="h-6 bg-stone-200 rounded w-32 mb-4"></div>
          <div className="h-4 bg-stone-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-stone-200 rounded w-36"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-200">
        <h3 className="text-lg font-bold text-[#1A1A1A] mb-3">Current Session</h3>
        <p className="text-stone-600 mb-4">No active sessions yet. Be the first to create one!</p>
        <Link
          href="/sessions/create"
          className="inline-block px-6 py-3 rounded-2xl bg-[#1A1A1A] text-white font-medium hover:bg-stone-800 transition-colors"
        >
          Create First Session
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-200">
      <div className="flex items-start gap-6">
        {session.book_cover_url ? (
          <div className="w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden shadow-md">
            <Image
              src={session.book_cover_url}
              alt={session.title}
              width={80}
              height={112}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-20 h-28 flex-shrink-0 rounded-lg bg-stone-200 flex items-center justify-center">
            <span className="text-2xl">📚</span>
          </div>
        )}
        
        <div className="flex-1">
          <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">Current Session</h3>
          <h4 className="text-xl font-bold text-[#1A1A1A] mb-2">{session.title}</h4>
          <p className="text-stone-600 mb-3">by {session.author}</p>
          
          <div className="flex items-center gap-4 text-sm text-stone-500 mb-4">
            <span>📖 {session.chapters} chapters</span>
            <span>👥 {session.participants_count} participant{session.participants_count !== 1 ? 's' : ''}</span>
          </div>
          
          <Link
            href={`/sessions/${session.id}`}
            className="inline-block px-6 py-3 rounded-2xl bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors"
          >
            Join Session
          </Link>
        </div>
      </div>
    </div>
  );
}
