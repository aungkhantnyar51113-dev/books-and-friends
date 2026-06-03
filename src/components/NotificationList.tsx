'use client';

import { useNotifications } from '@/contexts/NotificationContext';
import Link from 'next/link';

export function NotificationList() {
  const { notifications, markAsRead } = useNotifications();
  const unreadCount = notifications.filter(n => !n.read_at).length;

  if (!notifications.length) {
    return (
      <>
        <h1 className="font-serif text-2xl font-bold mb-6">Notifications</h1>
        <p className="text-stone-500 dark:text-stone-400">No notifications yet.</p>
      </>
    );
  }

  return (
    <>
      <h1 className="font-serif text-2xl font-bold mb-6">
        Notifications
        {unreadCount > 0 && (
          <span className="ml-2 text-sm font-normal text-amber-600 dark:text-amber-400">
            ({unreadCount} unread)
          </span>
        )}
      </h1>

      <ul className="space-y-3">
        {notifications.map((n) => {
          const rawComment = n.comments as any;
          const comment = Array.isArray(rawComment) ? rawComment[0] : rawComment;
          const rawSession = n.reading_sessions as any;
          const session = Array.isArray(rawSession) ? rawSession[0] : rawSession;
          const isUnread = !n.read_at;
          const profile = Array.isArray(comment?.profiles) ? comment.profiles[0] : comment?.profiles;
          
          const handleMarkAsRead = async (e: React.MouseEvent) => {
            e.preventDefault();
            await markAsRead(n.id);
          };

          return (
            <li key={n.id}>
              <div
                className={`block p-4 rounded-xl border transition-colors ${
                  isUnread
                    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                    : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                }`}
              >
                <Link href={`/sessions/${n.session_id}#comment-${n.comment_id}`}>
                  <p className="text-sm text-stone-900 dark:text-stone-100">
                    <span className="font-medium">
                      {profile?.display_name || 'Someone'}
                    </span>
                    {' '}commented on{' '}
                    <span className="font-medium">{session?.title || 'a session'}</span>
                  </p>
                  <p className="text-sm text-stone-600 dark:text-stone-400 mt-1 line-clamp-2">
                    &ldquo;{comment?.content?.slice(0, 100)}
                    {comment?.content && comment.content.length > 100 ? '...' : ''}&rdquo;
                  </p>
                  <p className="text-xs text-stone-500 mt-2">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </Link>
                {isUnread && (
                  <button
                    onClick={handleMarkAsRead}
                    className="text-xs text-amber-600 dark:text-amber-400 hover:underline mt-2"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
