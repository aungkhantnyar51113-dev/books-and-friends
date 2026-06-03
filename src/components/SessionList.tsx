'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Session {
  id: string;
  title: string;
  author: string;
  chapters: number;
  created_at: string;
  book_cover_url: string | null;
  participant_count: number;
}

export function SessionList({ sessions }: { sessions: Session[] }) {
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? sessions.filter(
        (s) =>
          s.title.toLowerCase().includes(query.toLowerCase()) ||
          s.author.toLowerCase().includes(query.toLowerCase())
      )
    : sessions;

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="search"
          placeholder="Search by book title or author..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">🔍</span>
      </div>

      {filtered.length === 0 ? (
        <p className="text-stone-500 dark:text-stone-400 py-8 text-center">
          {query ? 'No sessions match your search.' : 'No reading sessions yet.'}
        </p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((session) => (
            <li key={session.id}>
              <Link
                href={`/sessions/${session.id}`}
                className="flex gap-4 p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-amber-300 dark:hover:border-amber-700 transition-colors h-full"
              >
                <div className="w-14 h-20 flex-shrink-0 rounded-lg bg-stone-200 dark:bg-stone-800 overflow-hidden">
                  {session.book_cover_url ? (
                    <Image
                      src={session.book_cover_url}
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
                    {session.title}
                  </h2>
                  <p className="text-sm text-stone-600 dark:text-stone-400">{session.author}</p>
                  <p className="text-xs text-stone-500 mt-1">
                    {session.chapters} chapters · {session.participant_count} participant{session.participant_count !== 1 ? 's' : ''}
                  </p>
                </div>
                <span className="text-stone-400 text-sm self-center">
                  {new Date(session.created_at).toLocaleDateString()}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
