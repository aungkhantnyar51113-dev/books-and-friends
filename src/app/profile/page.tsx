import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { GoalEditor } from '@/components/GoalEditor';
import { AvatarUpload } from '@/components/AvatarUpload';
import { MonthlyProgress } from '@/components/MonthlyProgress';

export default async function ProfilePage() {
  const supabase = await createClient();
  if (!supabase) redirect('/login');
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-serif text-3xl font-bold mb-8 text-stone-900 dark:text-white text-center">My Profile</h1>
      
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8 shadow-sm">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-8">
          <AvatarUpload 
            userId={user.id} 
            avatarUrl={profile?.avatar_url} 
            displayName={profile?.display_name} 
          />
          <h2 className="text-xl font-bold text-stone-900 dark:text-white mt-4">
            {profile?.display_name || 'Book Lover'}
          </h2>
          <p className="text-stone-500 dark:text-stone-400">{user.email}</p>
        </div>

        <hr className="border-stone-100 dark:border-stone-800 mb-8" />

        {/* Monthly Goal Section */}
        <div>
          <h3 className="font-serif text-lg font-semibold mb-4 text-stone-800 dark:text-stone-200 flex items-center gap-2">
            📚 Monthly Reading Goal
          </h3>
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800">
            <GoalEditor userId={user.id} initialGoal={profile?.monthly_goal || 0} />
            
            {/* Real progress visual */}
            <MonthlyProgress userId={user.id} monthlyGoal={profile?.monthly_goal || 0} />
          </div>
        </div>
      </div>
    </div>
  );
}
