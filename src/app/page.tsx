'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { CurrentSession } from '@/components/CurrentSession';
import LoadingScreen from '@/components/LoadingScreen';
import AnimatedSection from '@/components/AnimatedSection';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#FDFCF9] pt-32">
        {/* Hero Section */}
        <section className="grid md:grid-cols-2 gap-12 items-center mb-24">
          {/* Left Side - Hero Content */}
          <AnimatedSection direction="left" delay={100}>
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl md:text-6xl font-bold text-[#1A1A1A] leading-tight">
                  Turn reading into a shared ritual.
                </h1>
                <p className="text-xl text-stone-600 leading-relaxed max-w-lg">
                  Create reading sessions, track progress together, and discuss books in a focused, single-thread conversation. Read better, together.
                </p>
              </div>
              
              <div className="flex gap-4">
                <Link
                  href="/sessions"
                  className="px-6 py-3 rounded-full bg-[#1A1A1A] text-white font-medium text-base hover:bg-stone-800 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  Browse sessions
                </Link>
                <Link
                  href="/sessions/new"
                  className="px-6 py-3 rounded-full bg-transparent text-[#1A1A1A] font-medium text-base border-2 border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  Create a session
                </Link>
              </div>
            </div>
          </AnimatedSection>

          {/* Right Side - Current Session Card */}
          <AnimatedSection direction="right" delay={300}>
            <div>
              <CurrentSession />
            </div>
          </AnimatedSection>
        </section>

        {/* Feature Grid */}
        <section className="grid md:grid-cols-3 gap-8 mb-24">
          <AnimatedSection direction="up" delay={500}>
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-2xl mb-6 animate-pulse">
                📚
              </div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">Create Sessions</h3>
              <p className="text-stone-600 leading-relaxed">
                Start a reading session for any book. Add title, author, and chapters. Get cover art from Google Books instantly.
              </p>
            </div>
          </AnimatedSection>
          
          <AnimatedSection direction="up" delay={700}>
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl mb-6 animate-pulse">
                📖
              </div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">Track Progress</h3>
              <p className="text-stone-600 leading-relaxed">
                Update your current chapter as you read. See how everyone in the group is progressing in real-time.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection direction="up" delay={900}>
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-2xl mb-6 animate-pulse">
                💬
              </div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">Discuss Together</h3>
              <p className="text-stone-600 leading-relaxed">
                One thread per session. Comment, edit, delete. React with emojis. Stay in the loop with notifications.
              </p>
            </div>
          </AnimatedSection>
        </section>

        {/* CTA Section */}
        <AnimatedSection direction="up" delay={1100}>
          <section className="text-center py-20 rounded-3xl bg-white border border-stone-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <h2 className="text-4xl font-bold text-[#1A1A1A] mb-4">Ready to read together?</h2>
            <p className="text-stone-600 mb-8 text-lg max-w-2xl mx-auto">
              Join thousands of readers turning solitary reading into a shared experience.
            </p>
            <Link
              href="/register"
              className="px-12 py-4 rounded-2xl bg-[#1A1A1A] text-white font-semibold text-lg hover:bg-stone-800 transition-all duration-300 hover:scale-105 hover:shadow-lg inline-block"
            >
              Get Started Free
            </Link>
          </section>
        </AnimatedSection>
    </div>
  );
}
