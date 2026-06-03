'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface GoalEditorProps {
  userId: string;
  initialGoal: number;
}

export function GoalEditor({ userId, initialGoal }: GoalEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [goal, setGoal] = useState(initialGoal);
  const [newGoal, setNewGoal] = useState(initialGoal.toString());
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSave() {
    const goalNum = parseInt(newGoal, 10);
    if (isNaN(goalNum) || goalNum < 0) {
      alert('Please enter a valid number of books.');
      return;
    }

    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from('profiles')
        .update({ monthly_goal: goalNum })
        .eq('id', userId);

      if (error) {
        console.error('Supabase error saving goal:', error);
        throw error;
      }

      setGoal(goalNum);
      setIsEditing(false);
      router.refresh();
    } catch (err: any) {
      console.error('Detailed error saving reading goal:', {
        message: err.message,
        code: err.code,
        details: err.details,
        hint: err.hint
      });
      alert(`Failed to save goal: ${err.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <p className="text-sm text-stone-600 dark:text-stone-400 mb-1">Target books per month</p>
          <input
            type="number"
            min="0"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            className="w-24 px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 font-bold text-amber-600 dark:text-amber-400 focus:ring-2 focus:ring-amber-500 outline-none"
            autoFocus
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={() => {
              setIsEditing(false);
              setNewGoal(goal.toString());
            }}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-sm font-medium hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1">
        <p className="text-sm text-stone-600 dark:text-stone-400 mb-1">Target books per month</p>
        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
          {goal} books
        </p>
      </div>
      <button
        onClick={() => setIsEditing(true)}
        className="px-4 py-2 rounded-lg bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
      >
        Edit Goal
      </button>
    </div>
  );
}
