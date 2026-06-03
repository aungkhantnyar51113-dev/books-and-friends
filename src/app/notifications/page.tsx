'use client';

import { Suspense } from 'react';
import { NotificationSkeleton } from '@/components/Skeletons';
import { NotificationList } from '@/components/NotificationList';

export default function NotificationsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Suspense fallback={<NotificationSkeleton />}>
        <NotificationList />
      </Suspense>
    </div>
  );
}

