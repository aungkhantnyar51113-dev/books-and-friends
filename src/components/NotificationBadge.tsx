'use client';

import { useNotifications } from '@/contexts/NotificationContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function NotificationBadge() {
  const { unreadCount, isLoading } = useNotifications();
  const pathname = usePathname();
  const isActive = pathname === '/notifications';

  if (isLoading) {
    return (
      <div className="relative">
        <div className="w-5 h-5 bg-stone-200 dark:bg-stone-700 rounded-full animate-pulse" />
      </div>
    );
  }

  return (
    <Link
      href="/notifications"
      className={`relative px-3 py-2 text-sm font-medium transition-all duration-300 relative group flex flex-col items-center ${
        isActive
          ? 'text-amber-600 dark:text-amber-500'
          : 'text-stone-600 hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-500'
      }`}
    >
      <span className="flex items-center gap-1">
        Notifications
        {unreadCount > 0 && (
          <span className="relative">
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
          </span>
        )}
      </span>
      
      {/* Desktop underline */}
      <span 
        className={`absolute -bottom-[1px] left-3 right-3 h-[2px] bg-amber-500 transition-all duration-300 ${
          isActive ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-50'
        }`}
      />

      {/* Badge */}
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1 animate-bounce">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
