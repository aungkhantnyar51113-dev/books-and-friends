'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface MonthlyProgressProps {
  userId: string;
  monthlyGoal: number;
}

interface ProgressData {
  booksCompleted: number;
  chaptersRead: number;
  totalChaptersInGoal: number;
}

export function MonthlyProgress({ userId, monthlyGoal }: MonthlyProgressProps) {
  const [progress, setProgress] = useState<ProgressData>({
    booksCompleted: 0,
    chaptersRead: 0,
    totalChaptersInGoal: 0
  });
  const [loading, setLoading] = useState(true);

  async function fetchProgress() {
    setLoading(true);
    try {
      const supabase = createClient();
      
      // Get current month start and end
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      // Fetch all sessions user participated in this month
      const { data: sessions } = await (supabase as any)
        .from('reading_sessions')
        .select(`
          id,
          title,
          chapters,
          created_at,
          progress!inner(
            chapter,
            updated_at
          )
        `)
        .eq('progress.user_id', userId)
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString());

      if (sessions) {
        let chaptersRead = 0;
        let booksCompleted = 0;
        
        sessions.forEach((session: any) => {
          const userProgress = session.progress[0];
          chaptersRead += userProgress.chapter;
          
          // Consider a book completed if user has read all chapters
          if (userProgress.chapter >= session.chapters) {
            booksCompleted++;
          }
        });
        
        // Calculate total chapters needed for the goal (assuming average book length)
        // This is a simplified calculation - you might want to adjust this
        const avgChaptersPerBook = 12; // Adjust based on your data
        const totalChaptersInGoal = monthlyGoal * avgChaptersPerBook;
        
        setProgress({
          booksCompleted,
          chaptersRead,
          totalChaptersInGoal
        });
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProgress();
    
    // Listen for progress updates
    const handleProgressUpdate = () => {
      fetchProgress();
    };
    
    window.addEventListener('progress-updated', handleProgressUpdate);
    
    return () => {
      window.removeEventListener('progress-updated', handleProgressUpdate);
    };
  }, [userId, monthlyGoal]);

  // Calculate progress percentage
  const progressPercentage = monthlyGoal > 0 
    ? Math.min((progress.booksCompleted / monthlyGoal) * 100, 100)
    : 0;

  if (loading) {
    return (
      <div className="mt-4">
        <div className="h-2 w-full bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
          <div className="h-full bg-stone-300 rounded-full animate-pulse" />
        </div>
        <p className="text-xs text-stone-500 mt-2">Loading progress...</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="h-2 w-full bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-amber-500 rounded-full transition-all duration-500" 
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-stone-600 dark:text-stone-400">
        <span>{progress.booksCompleted} / {monthlyGoal} books completed</span>
        <span>{Math.round(progressPercentage)}%</span>
      </div>
      {progress.chaptersRead > 0 && (
        <p className="text-xs text-stone-500 mt-1">
          {progress.chaptersRead} chapters read this month
        </p>
      )}
    </div>
  );
}
