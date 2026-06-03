'use client';

import { useEffect } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { createClient } from '@/lib/supabase/client';

export function useRealtimeNotifications() {
  const { refreshNotifications } = useNotifications();

  useEffect(() => {
    // Listen for custom events from other parts of the app
    const handleNewComment = (event: CustomEvent) => {
      console.log('New comment event received:', event.detail);
      refreshNotifications();
    };

    const handleNewReaction = (event: CustomEvent) => {
      console.log('New reaction event received:', event.detail);
      refreshNotifications();
    };

    window.addEventListener('new-comment', handleNewComment as EventListener);
    window.addEventListener('new-reaction', handleNewReaction as EventListener);

    return () => {
      window.removeEventListener('new-comment', handleNewComment as EventListener);
      window.removeEventListener('new-reaction', handleNewReaction as EventListener);
    };
  }, [refreshNotifications]);

  // Function to trigger notification refresh
  const triggerNotificationRefresh = (type: 'comment' | 'reaction', data: any) => {
    const event = new CustomEvent(type === 'comment' ? 'new-comment' : 'new-reaction', {
      detail: data
    });
    window.dispatchEvent(event);
  };

  return { triggerNotificationRefresh };
}
