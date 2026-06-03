'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function JoinButton({ sessionId, userId }: { sessionId: string; userId: string | null }) {
  const [joining, setJoining] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleJoin() {
    if (!userId) {
      router.push('/login');
      return;
    }
    setJoining(true);
    try {
      const { error: partError } = await (supabase as any).from('participants').insert({
        user_id: userId,
        session_id: sessionId,
      });
      if (partError) throw partError;

      const { error: progError } = await (supabase as any).from('progress').insert({
        user_id: userId,
        session_id: sessionId,
        chapter: 0,
      });
      if (progError) throw progError;

      router.refresh();
    } catch (err: any) {
      console.error('Error joining session:', err);
      alert(`Failed to join session: ${err.message}`);
    } finally {
      setJoining(false);
    }
  }

  return (
    <button
      onClick={handleJoin}
      disabled={joining}
      className="px-6 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600 disabled:opacity-50 transition-colors"
    >
      {joining ? 'Joining...' : 'Join Session'}
    </button>
  );
}
