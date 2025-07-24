import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect logged-in users to dashboard
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Don't render anything if user is logged in (they'll be redirected)
  if (user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Redirecting to dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to FitJourney
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Your personal fitness companion. Track your workouts, plan your meals, and achieve your health goals.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/signup">
            <button className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              Get Started
            </button>
          </Link>
          <Link href="/login">
            <button className="border border-primary text-primary hover:bg-primary/5 px-8 py-3 rounded-lg font-semibold transition-colors">
              Sign In
            </button>
          </Link>
        </div>
      </div>

      {/* Features Grid - Only show when NOT logged in */}
      {!user && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Workout Tracking</h3>
            <p className="text-gray-600">
              Log your exercises, track your progress, and stay motivated with detailed workout analytics.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 2.5M7 13l2.5 2.5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Meal Planning</h3>
            <p className="text-gray-600">
              Plan your meals, track nutrition, and maintain a healthy diet with personalized recommendations.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Progress Analytics</h3>
            <p className="text-gray-600">
              Visualize your fitness journey with comprehensive charts and insights to keep you on track.
            </p>
          </div>
        </div>
      )}

      {/* Quick Stats - Only show when logged in */}
      {user && (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold text-center mb-8">Your Fitness Dashboard</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">0</div>
              <div className="text-sm text-gray-600">Workouts This Week</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">0</div>
              <div className="text-sm text-gray-600">Calories Burned</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">0</div>
              <div className="text-sm text-gray-600">Active Days</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">0%</div>
              <div className="text-sm text-gray-600">Goal Progress</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
