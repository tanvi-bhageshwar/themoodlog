import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Sparkles, Lock, Mail, User, ArrowRight, Loader2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      showToast('Passwords do not match.', 'warning');
      return;
    }
    if (password.length < 8) {
      showToast('Password must be at least 8 characters long.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name, email, password, passwordConfirm);
      navigate('/dashboard');
    } catch {
      // Handled by AuthContext toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="register-page-container"
      className="min-h-screen flex items-center justify-center p-4 bg-[#0d1117] text-zinc-100"
    >
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 text-zinc-950 font-bold mb-3 shadow-lg shadow-amber-500/10">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Begin Your Journal</h1>
          <p className="text-xs text-zinc-400 mt-1">Create your private, secure MoodLog account</p>
        </div>

        {/* Card */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 sm:p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reg-name" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Your Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivera"
                  className="w-full bg-[#0d1117] border border-[#30363d] focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full bg-[#0d1117] border border-[#30363d] focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Password (min 8 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="reg-password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0d1117] border border-[#30363d] focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-confirm" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="reg-confirm"
                  type="password"
                  required
                  minLength={8}
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0d1117] border border-[#30363d] focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              id="register-submit-button"
              disabled={isSubmitting}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-zinc-950 font-semibold text-sm rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-zinc-400">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-400 hover:text-amber-300 font-medium underline underline-offset-2">
              Sign in
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-zinc-600">
          Your reflections are stored securely and never shared or sold.
        </p>
      </div>
    </div>
  );
};
