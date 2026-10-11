import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [status, setStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  useEffect(() => {
    fetch('/health')
      .then(res => {
        if (res.ok) setStatus('online');
        else setStatus('offline');
      })
      .catch(() => setStatus('offline'));
  }, []);

  return (
    <nav className="bg-navy-900/60 backdrop-blur-md border-b border-navy-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-3">
              <img src="/assets/Legit_NoBG.png" alt="Pruvate" className="h-8 w-8 object-contain" />
              <span className="text-xl font-bold text-white tracking-tight">Pruvate</span>
            </Link>
            
            <div className="hidden md:flex space-x-6">
              <Link to="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
              {user && (
                <>
                  <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors">Dashboard</Link>
                  <Link to="/marketplace" className="text-gray-300 hover:text-white transition-colors">Marketplace</Link>
                  {user.admin && (
                    <Link to="/admin" className="text-brand-400 hover:text-brand-300 transition-colors">Admin Panel</Link>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="hidden sm:flex items-center space-x-2 text-sm">
              <span className="text-gray-400">Systems:</span>
              {status === 'checking' && <span className="text-gray-500">Checking...</span>}
              {status === 'online' && (
                <span className="flex items-center text-green-400">
                  <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
                  Operational
                </span>
              )}
              {status === 'offline' && (
                <span className="flex items-center text-red-400">
                  <span className="w-2 h-2 rounded-full bg-red-400 mr-2"></span>
                  Offline
                </span>
              )}
            </div>

            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-navy-800 px-3 py-1.5 rounded-full border border-navy-700">
                  <UserIcon className="w-4 h-4 text-brand-400" />
                  <span className="text-sm text-gray-200">{user.username}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-white hover:bg-navy-800 rounded-lg transition-all"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Log in</Link>
                <Link to="/signup" className="glow-btn text-sm">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
