'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { searchBooks, getBookCoverUrl, getAuthors } from '@/lib/google-books';
import type { GoogleBookVolume } from '@/lib/google-books';

export default function NewSessionPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState<'search' | 'form'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GoogleBookVolume[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedBook, setSelectedBook] = useState<GoogleBookVolume | null>(null);
  const [chapters, setChapters] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return null;
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    setError(null);
    try {
      const results = await searchBooks(searchQuery);
      setSearchResults(results);
      setStep('search');
    } catch {
      setError('Failed to search books. Check your API key in .env.local.');
    } finally {
      setSearching(false);
    }
  }

  function selectBook(book: GoogleBookVolume) {
    setSelectedBook(book);
    setStep('form');
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !selectedBook || !chapters || parseInt(chapters, 10) < 1) return;
    setLoading(true);
    setError(null);

    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data: session, error: err } = await (supabase as any)
        .from('reading_sessions')
        .insert({
          title: selectedBook.volumeInfo.title,
          author: getAuthors(selectedBook),
          chapters: parseInt(chapters, 10),
          created_by: user.id,
          book_cover_url: getBookCoverUrl(selectedBook),
          google_books_id: selectedBook.id,
          description: selectedBook.volumeInfo.description?.slice(0, 500) || null,
        })
        .select('id')
        .single();

      if (err) throw err;

      // Join the session automatically
      const { error: partErr } = await (supabase as any).from('participants').insert({
        user_id: user.id,
        session_id: session.id,
      });
      if (partErr) throw partErr;

      // Initialize progress
      const { error: progErr } = await (supabase as any).from('progress').insert({
        user_id: user.id,
        session_id: session.id,
        chapter: 0,
      });
      if (progErr) throw progErr;

      router.push(`/sessions/${session.id}`);
      router.refresh();
    } catch (err: any) {
      console.error('Error creating session:', err);
      setError(err.message || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-serif text-2xl font-bold mb-6">Create Reading Session</h1>

      {step === 'search' ? (
        <form onSubmit={handleSearch} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}
          <p className="text-stone-600 dark:text-stone-400">
            Search for your book to fetch cover and details from Google Books.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Book title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              disabled={searching}
              className="px-6 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600 disabled:opacity-50"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>
          {searchResults.length > 0 && (
            <div className="space-y-2 mt-6">
              <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
                Select a book:
              </p>
              <ul className="space-y-2">
                {searchResults.map((book) => (
                  <li key={book.id}>
                    <button
                      type="button"
                      onClick={() => selectBook(book)}
                      className="w-full flex gap-3 p-3 rounded-lg border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-900 text-left"
                    >
                      {getBookCoverUrl(book) ? (
                        <div className="relative w-10 h-14 flex-shrink-0">
                          <Image
                            src={getBookCoverUrl(book)!}
                            alt=""
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-14 bg-stone-200 dark:bg-stone-800 rounded flex items-center justify-center text-xl flex-shrink-0">
                          📖
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{book.volumeInfo.title}</p>
                        <p className="text-sm text-stone-500">{getAuthors(book)}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </form>
      ) : (
        <form onSubmit={handleCreate} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}
          {selectedBook && (
            <div className="flex gap-4 p-4 rounded-xl bg-stone-100 dark:bg-stone-900">
              {getBookCoverUrl(selectedBook) ? (
                <div className="relative w-16 h-24 flex-shrink-0">
                  <Image
                    src={getBookCoverUrl(selectedBook)!}
                    alt=""
                    fill
                    priority
                    className="object-cover rounded-lg"
                  />
                </div>
              ) : (
                <div className="w-16 h-24 bg-stone-200 dark:bg-stone-800 rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
                  📖
                </div>
              )}
              <div>
                <p className="font-serif font-semibold">{selectedBook.volumeInfo.title}</p>
                <p className="text-stone-600 dark:text-stone-400">{getAuthors(selectedBook)}</p>
                <button
                  type="button"
                  onClick={() => setStep('search')}
                  className="text-sm text-amber-600 dark:text-amber-400 hover:underline mt-2"
                >
                  Change book
                </button>
              </div>
            </div>
          )}
          <div>
            <label htmlFor="chapters" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
              Number of chapters
            </label>
            <input
              id="chapters"
              type="number"
              min={1}
              value={chapters}
              onChange={(e) => setChapters(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep('search')}
              className="px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Session'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
