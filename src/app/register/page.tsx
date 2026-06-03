'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (!supabase) {
      setError('Connection to authentication server failed. Please try again later.');
      setLoading(false);
      return;
    }
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { 
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        },
      });
      if (error) {
        const isNetworkError = 
          error.message === 'Failed to fetch' || 
          error.message.includes('NetworkError') || 
          error.message.includes('network') ||
          (error as any).status === 0;

        setError(isNetworkError 
          ? 'Please check your internet connection and try again.' 
          : error.message
        );
        setLoading(false);
        return;
      }
    } catch (err: any) {
      console.error('Unexpected register error:', err);
      setError('Please check your internet connection and try again.');
      setLoading(false);
      return;
    }
    setLoading(false);
    setSuccess(true);
    router.refresh();
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h1 className="font-serif text-2xl font-bold mb-4">Check your email</h1>
        <p className="text-stone-600 dark:text-stone-400 mb-6">
          We&apos;ve sent you a confirmation link. Click it to verify your account, then log in.
        </p>
        <Link
          href="/login"
          className="inline-block px-6 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600"
        >
          Go to Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="font-serif text-2xl font-bold mb-6">Sign up</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
            Display name
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            className="w-full px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-stone-500">At least 6 characters</p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Signing up...' : 'Sign up'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-stone-600 dark:text-stone-400">
        Already have an account?{' '}
        <Link href="/login" className="text-amber-600 dark:text-amber-400 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
