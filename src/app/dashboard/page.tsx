import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';
import { SessionCardSkeleton } from '@/components/Skeletons';

async function DashboardSessions() {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: participants } = await supabase
    .from('participants')
    .select(`
      session_id,
      reading_sessions (
        id,
        title,
        author,
        chapters,
        book_cover_url,
        created_at
      )
    `)
    .eq('user_id', user.id);

  const sessions = (participants || [])
    .map((p: any) => {
      const rs = p.reading_sessions;
      if (Array.isArray(rs)) return rs[0];
      return rs;
    })
    .filter((s: any): s is any => !!s)
    .sort(
      (a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
        <p className="text-stone-600 dark:text-stone-400 mb-4">
          You haven&apos;t joined any reading sessions yet.
        </p>
        <Link
          href="/sessions"
          className="inline-block px-6 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600"
        >
          Browse Sessions
        </Link>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {sessions.map((s: any) => (
        <li key={s.id}>
          <Link
            href={`/sessions/${s.id}`}
            className="flex gap-4 p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-amber-300 dark:hover:border-amber-700 transition-colors h-full"
          >
            <div className="w-14 h-20 flex-shrink-0 rounded-lg bg-stone-200 dark:bg-stone-800 overflow-hidden">
              {s.book_cover_url ? (
                <Image
                  src={s.book_cover_url}
                  alt=""
                  width={56}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-400 text-2xl">
                  📖
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-serif font-semibold text-stone-900 dark:text-white truncate">
                {s.title}
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-400">{s.author}</p>
              <p className="text-xs text-stone-500 mt-1">{s.chapters} chapters</p>
            </div>
            <span className="text-stone-400 text-sm self-center">
              {new Date(s.created_at).toLocaleDateString()}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  if (!supabase) redirect('/login');
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-serif text-2xl font-bold mb-6">My Sessions</h1>
      <Suspense fallback={<div className="space-y-3">{[1, 2, 3].map(i => <SessionCardSkeleton key={i} />)}</div>}>
        <DashboardSessions />
      </Suspense>
    </div>
  );
}
