import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  const isExpired = searchParams.get('expired') === 'true';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      // Handled by AuthContext toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('alex@moodlog.example');
    setPassword('Password123!');
    setIsSubmitting(true);
    try {
      await login('alex@moodlog.example', 'Password123!');
      navigate('/dashboard');
    } catch {
      // Handled by AuthContext toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="login-page-container"
      className="min-h-screen flex items-center justify-center p-4 bg-[#0d1117] text-zinc-100"
    >
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 text-zinc-950 font-bold mb-3 shadow-lg shadow-amber-500/10">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Welcome Back</h1>
          <p className="text-xs text-zinc-400 mt-1">Sign in to continue your mindful journaling practice</p>
        </div>

        {/* Expired Session Notice */}
        {isExpired && (
          <div className="mb-4 p-3 rounded-xl bg-amber-950/40 border border-amber-800/50 text-amber-300 text-xs text-center">
            Your session has expired. Please sign in again.
          </div>
        )}

        {/* Card */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 sm:p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-[#0d1117] border border-[#30363d] focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0d1117] border border-[#30363d] focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              id="login-submit-button"
              disabled={isSubmitting}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-zinc-950 font-semibold text-sm rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Pre-fill for Reviewers */}
          <div className="mt-5 pt-4 border-t border-[#21262d]">
            <button
              type="button"
              id="demo-login-button"
              onClick={handleDemoLogin}
              disabled={isSubmitting}
              className="w-full py-2 px-3 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-zinc-300 hover:text-amber-300 text-xs font-medium rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Fill Demo Portfolio Account</span>
            </button>
          </div>

          <div className="mt-5 text-center text-xs text-zinc-400">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-amber-400 hover:text-amber-300 font-medium underline underline-offset-2">
              Create account
            </Link>
          </div>
        </div>

        {/* Non-clinical disclaimer note */}
        <p className="mt-6 text-center text-[11px] text-zinc-600">
          MoodLog is a mindful journaling tool, not a clinical diagnostic instrument.
        </p>
      </div>
    </div>
  );
};
