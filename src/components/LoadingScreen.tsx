'use client';

import { useState, useEffect } from 'react';

export default function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2500);

    return () => {
      clearInterval(dotsInterval);
      clearTimeout(timer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-[#FDFCF9] z-50 flex items-center justify-center">
      <div className="text-center space-y-8">
        {/* Animated Book Icon */}
        <div className="relative">
          <div className="w-24 h-24 mx-auto">
            <div className="absolute inset-0 bg-amber-100 rounded-2xl animate-pulse" />
            <div className="relative flex items-center justify-center h-full text-5xl animate-bounce">
              📚
            </div>
          </div>
        </div>
        
        {/* Loading Text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-[#1A1A1A] animate-fade-in">
            Find more interesting{dots}
          </h2>
          <p className="text-stone-600 animate-fade-in-delay">
            Loading your reading journey...
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        .animate-fade-in-delay {
          animation: fade-in 0.8s ease-out 0.3s forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
