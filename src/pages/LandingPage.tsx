import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Cpu, Code2, Lock, ArrowRight, Zap, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="bg-navy-950 text-white min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 bg-[url('/assets/LEGIT_Launching_Soon_Poster.png')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-navy-950"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
            <span className="text-sm font-medium">Platform Phase 4 is Live</span>
          </div>
          
          <img src="/assets/Legit_Banner-removebg-preview.png" alt="Pruvate Banner" className="mx-auto h-32 md:h-48 object-contain mb-8 filter drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]" />
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Next-Generation <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">Security</span>
          </h1>
          
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-400 mb-10">
            Enterprise-grade protection with seamless integration. Hardware locked, cryptographically secured, and fully automated.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            {user ? (
              <Link to="/dashboard" className="glow-btn flex items-center text-lg px-8 py-3">
                Go to Dashboard
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link to="/signup" className="glow-btn flex items-center text-lg px-8 py-3">
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link to="/login" className="bg-navy-800 hover:bg-navy-700 text-white border border-navy-700 font-semibold py-3 px-8 rounded-lg transition-colors flex items-center text-lg">
                  Redeem Key
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-navy-900 border-y border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose Pruvate?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Our infrastructure is built from the ground up with security and performance in mind.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="glass-card p-6 border-t-4 border-t-brand-500 hover:-translate-y-1 transition-transform">
              <Shield className="w-10 h-10 text-brand-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">Kernel-Level Protection</h3>
              <p className="text-gray-400 text-sm">Advanced anti-tamper mechanisms operating at ring-0 to prevent unauthorized access.</p>
            </div>
            <div className="glass-card p-6 border-t-4 border-t-purple-500 hover:-translate-y-1 transition-transform">
              <Cpu className="w-10 h-10 text-purple-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">Hardware Locking</h3>
              <p className="text-gray-400 text-sm">Strict HWID binding ensures your license is only used on your authorized machine.</p>
            </div>
            <div className="glass-card p-6 border-t-4 border-t-green-500 hover:-translate-y-1 transition-transform">
              <Code2 className="w-10 h-10 text-green-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">Lua Marketplace</h3>
              <p className="text-gray-400 text-sm">Access and share community-verified scripts securely through our integrated hub.</p>
            </div>
            <div className="glass-card p-6 border-t-4 border-t-orange-500 hover:-translate-y-1 transition-transform">
              <Zap className="w-10 h-10 text-orange-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">Instant Delivery</h3>
              <p className="text-gray-400 text-sm">Keys are processed and activated instantly with zero downtime or manual intervention.</p>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
        <div className="flex flex-col md:flex-row justify-between relative">
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-navy-800 -z-10 transform -translate-y-1/2"></div>
          
          {[
            { step: '1', title: 'Create Account', desc: 'Sign up securely on our platform.', icon: <Lock className="w-6 h-6" /> },
            { step: '2', title: 'Redeem License', desc: 'Enter your license key to activate your subscription.', icon: <Zap className="w-6 h-6" /> },
            { step: '3', title: 'Download & Play', desc: 'Download our secure loader and get started.', icon: <Download className="w-6 h-6" /> }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center mb-8 md:mb-0 relative">
              <div className="w-16 h-16 rounded-full bg-navy-900 border-4 border-brand-500 flex items-center justify-center text-xl font-bold mb-4 shadow-[0_0_15px_rgba(59,130,246,0.3)] z-10">
                {item.icon}
              </div>
              <h3 className="text-lg font-bold mb-2">{item.title}</h3>
              <p className="text-gray-400 text-center max-w-[200px] text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
