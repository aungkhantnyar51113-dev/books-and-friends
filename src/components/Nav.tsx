'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { useRouter, usePathname } from 'next/navigation';
import { NotificationBadge } from '@/components/NotificationBadge';

export function Nav() {
  const { user, loading, signOut: authSignOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // Close menu when clicking outside or pressing escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    try {
      await authSignOut();
      setIsOpen(false);
      router.refresh();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navLink = (href: string, label: string, isMobile = false) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        onClick={() => setIsOpen(false)}
        className={`px-3 py-2 text-sm font-medium transition-all duration-300 relative group flex flex-col items-center ${
          isActive
            ? 'text-amber-600 dark:text-amber-500'
            : 'text-stone-600 hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-500'
        } ${isMobile ? 'block w-full !items-start px-4 py-3 text-base border-b border-stone-100 dark:border-stone-800' : ''}`}
      >
        <span>{label}</span>
        {/* Desktop underline */}
        {!isMobile && (
          <span 
            className={`absolute -bottom-[1px] left-3 right-3 h-[2px] bg-amber-500 transition-all duration-300 ${
              isActive ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-50'
            }`}
          />
        )}
        {/* Mobile active indicator */}
        {isMobile && isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-amber-500 rounded-full" />
        )}
      </Link>
    );
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-stone-200 bg-white/60 dark:bg-stone-950/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <Link href="/" className="font-libre font-bold text-lg tracking-tight text-stone-900 dark:text-white shrink-0 hover:scale-105 transition-transform duration-300">
              Books <span className="text-amber-500">&</span> Friends
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 transition-all duration-300 relative w-10 h-10"
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              <div className="absolute inset-0 flex items-center justify-center transition-all duration-500 ease-in-out">
                <svg 
                  className={`w-6 h-6 absolute transition-all duration-500 transform ${
                    isOpen ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
                <svg 
                  className={`w-6 h-6 absolute transition-all duration-500 transform ${
                    isOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLink('/', 'Home')}
              {navLink('/sessions', 'Sessions')}
              {user && navLink('/dashboard', 'Dashboard')}
              {user && <NotificationBadge />}
              {user && navLink('/profile', 'Profile')}
              {loading ? (
                <span className="px-3 py-2 text-sm text-stone-400">...</span>
              ) : user ? (
                <>
                  <Link
                    href="/sessions/new"
                    className="px-4 py-2 ml-2 rounded-xl bg-amber-500 text-white text-sm font-semibold shadow-lg shadow-amber-500/20 hover:bg-amber-600 hover:scale-105 active:scale-95 transition-all duration-300"
                  >
                    New Session
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="px-3 py-2 ml-1 text-sm font-medium text-stone-600 hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-500 transition-all duration-300"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-3 py-2 text-sm font-medium text-stone-600 hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-500 transition-all duration-300"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 ml-2 rounded-xl bg-amber-500 text-white text-sm font-semibold shadow-lg shadow-amber-500/20 hover:bg-amber-600 hover:scale-105 active:scale-95 transition-all duration-300"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay - Outside nav element for proper z-index */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-[998] md:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Mobile Sidebar */}
          <div className={`fixed inset-y-0 right-0 w-3/4 max-w-sm bg-white dark:bg-stone-950 shadow-2xl z-[999] md:hidden transform transition-transform duration-300 ease-in-out overflow-y-auto ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}>
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-200 dark:border-stone-800">
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className="font-libre font-bold text-lg tracking-tight text-stone-900 dark:text-white"
                >
                  Books <span className="text-amber-500">&</span> Friends
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 transition-all duration-300"
                  aria-label="Close menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {navLink('/', 'Home', true)}
              {navLink('/sessions', 'Sessions', true)}
              {user && navLink('/dashboard', 'Dashboard', true)}
              {user && navLink('/notifications', 'Notifications', true)}
              {user && navLink('/profile', 'Profile', true)}
              
              {user ? (
                <>
                  <div className="pt-4 mt-4 border-t border-stone-200 dark:border-stone-800">
                    <Link
                      href="/sessions/new"
                      onClick={() => setIsOpen(false)}
                      className="block w-full text-center px-4 py-3 rounded-xl bg-amber-500 text-white text-sm font-semibold shadow-lg shadow-amber-500/20 active:scale-95 transition-all mb-2"
                    >
                      New Session
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-3 text-sm font-medium text-stone-600 hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-500 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                </>
              ) : (
                <div className="pt-4 mt-4 border-t border-stone-200 dark:border-stone-800 grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center px-4 py-3 text-sm font-medium text-stone-600 hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-500 transition-all rounded-lg border border-stone-300 dark:border-stone-700"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center px-4 py-3 rounded-xl bg-amber-500 text-white text-sm font-semibold shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
