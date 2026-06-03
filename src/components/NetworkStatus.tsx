'use client';

import { useState, useEffect } from 'react';

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    // Initial check
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowBackOnline(true);
      setTimeout(() => setShowBackOnline(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBackOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 w-full z-[100] animate-in fade-in slide-in-from-top">
        <div className="bg-red-600 text-white text-center py-2 text-sm font-medium shadow-lg">
          <span className="mr-2">⚠️</span>
          You are offline. Please check your internet connection.
        </div>
      </div>
    );
  }

  if (showBackOnline) {
    return (
      <div className="fixed top-0 left-0 w-full z-[100] animate-in fade-in slide-in-from-top fade-out duration-1000 fill-mode-forwards delay-[2000ms]">
        <div className="bg-emerald-600 text-white text-center py-2 text-sm font-medium shadow-lg">
          <span className="mr-2">✅</span>
          Back online!
        </div>
      </div>
    );
  }

  return null;
}
