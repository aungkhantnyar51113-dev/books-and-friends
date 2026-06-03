'use client';

import { useRouter, usePathname } from 'next/navigation';

export function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  // Don't show the back button on the Home page
  if (pathname === '/') return null;

  return (
    <button
      onClick={() => router.back()}
      className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 dark:bg-stone-900/10 backdrop-blur-xl border border-white/20 dark:border-stone-800/50 text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/30 hover:bg-white/20 dark:hover:bg-stone-900/20 shadow-lg shadow-black/5 transition-all duration-300 active:scale-95"
    >
      <span className="text-lg leading-none transition-transform duration-300 group-hover:-translate-x-1">
        ←
      </span>
      <span className="text-sm font-semibold tracking-wide">Back</span>
    </button>
  );
}
