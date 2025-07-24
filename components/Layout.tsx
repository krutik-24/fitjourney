import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';


interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout, loading } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-dark">
      <nav className="bg-primary shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/">
                <h1 className="text-xl font-bold text-white cursor-pointer">FitJourney</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {loading ? (
                <div className="text-white">Loading...</div>
              ) : user ? (
                <>
                  <Link href="/dashboard" className="text-white hover:text-accent">
                    Dashboard
                  </Link>
                  <span className="text-white">Welcome, {user.name}</span>
                  <button 
                    onClick={handleLogout}
                    className="bg-white text-primary hover:bg-gray-100 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-white hover:text-accent">
                    Login
                  </Link>
                  <Link href="/signup" className="btn-secondary">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
      
      <footer className="bg-primary/10 mt-auto">
        <div className="max-w-7xl mx-auto py-4 px-4 text-center text-primary/70">
          <p>&copy; 2025 FitJourney. Your fitness companion.</p>
        </div>
      </footer>
    </div>
  );
}