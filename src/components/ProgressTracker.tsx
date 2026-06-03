'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function ProgressTracker({ 
  sessionId, 
  userId, 
  totalChapters, 
  myProgress, 
  allProgress 
}: { 
  sessionId: string; 
  userId: string | null; 
  totalChapters: number; 
  myProgress: any; 
  allProgress: any[]; 
}) {
  const [myChapter, setMyChapter] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [hasChanged, setHasChanged] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [originalChapter, setOriginalChapter] = useState<number>(0);
  const router = useRouter();
  const supabase = createClient();

  // Filter progress to show only current user's data
  const currentUserProgress = allProgress.filter(p => p.user_id === userId);
  
  // Set initial values when component loads
  useEffect(() => {
    if (myProgress) {
      const chapter = myProgress.chapter || 0;
      setOriginalChapter(chapter);
      setInputValue(String(chapter));
      setHasChanged(false);
    }
  }, [myProgress]);

  async function handleUpdateProgress(chapter: number) {
    if (!userId) return;
    setUpdating(true);
    try {
      const { error } = await (supabase as any)
        .from('progress')
        .upsert({
          user_id: userId,
          session_id: sessionId,
          chapter,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,session_id'
        });
      if (error) throw error;
      setMyChapter(chapter);
      setInputValue(String(chapter));
      setOriginalChapter(chapter);
      setHasChanged(false);
      // Force a more comprehensive refresh
      router.refresh();
      // Also trigger a custom event for cross-component updates
      window.dispatchEvent(new CustomEvent('progress-updated', { 
        detail: { userId, sessionId, chapter } 
      }));
    } catch (err: any) {
      console.error('Error updating progress:', err);
      alert(`Failed to update progress: ${err.message}`);
    } finally {
      setUpdating(false);
      setMyChapter(null);
    }
  }

  return (
    <section className="mb-12">
      <h2 className="font-serif text-xl font-bold mb-6 text-stone-900 dark:text-white">Your Reading Journey</h2>
      <div className="rounded-2xl bg-white border border-stone-200 p-6 shadow-sm">
        {myChapter !== null ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-stone-700">Current Chapter:</label>
              <input
                type="number"
                min={0}
                max={totalChapters}
                value={inputValue}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setInputValue(newValue);
                  setHasChanged(newValue !== String(originalChapter));
                }}
                className="flex-1 max-w-24 px-4 py-2 rounded-full border border-stone-300 bg-stone-50 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder={String(myProgress?.chapter ?? 0)}
              />
              {hasChanged && (
                <>
                  <button
                    onClick={() => handleUpdateProgress(parseInt(inputValue, 10) || 0)}
                    disabled={updating}
                    className="px-6 py-2 rounded-full bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 disabled:opacity-50 transition-colors"
                  >
                    {updating ? 'Updating...' : 'Update'}
                  </button>
                  <button
                    onClick={() => {
                      setInputValue(String(originalChapter));
                      setHasChanged(false);
                    }}
                    disabled={updating}
                    className="px-3 py-2 rounded-full border border-stone-300 text-stone-600 text-sm hover:bg-stone-100 disabled:opacity-50 transition-colors"
                    title="Reset to original value"
                  >
                    ✕
                  </button>
                </>
              )}
            </div>
            <div className="text-xs text-stone-500">
              Chapter {inputValue || myProgress?.chapter || 0} of {totalChapters}
            </div>
          </div>
        ) : (
          <button
            onClick={() => {
              setMyChapter(myProgress?.chapter ?? 0);
              setInputValue(String(myProgress?.chapter ?? 0));
            }}
            className="w-full px-4 py-3 rounded-full border border-stone-300 bg-stone-50 text-stone-900 hover:bg-stone-100 transition-colors text-left"
          >
            <span className="font-medium">Chapter {myProgress?.chapter ?? 0}</span>
            <span className="text-stone-500 ml-2">✏️ Edit</span>
          </button>
        )}
      </div>
    </section>
  );
}
