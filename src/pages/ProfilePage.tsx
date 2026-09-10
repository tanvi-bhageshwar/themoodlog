import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authApi } from '../api/auth';
import {
  User,
  Lock,
  Mail,
  ShieldCheck,
  Calendar,
  LogOut,
  Save,
  Loader2,
  HeartHandshake,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfileName, logout } = useAuth();
  const { showToast } = useToast();

  // Name form
  const [name, setName] = useState(user?.name || '');
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim() === user?.name) return;

    setIsUpdatingName(true);
    try {
      await updateProfileName(name.trim());
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== newPasswordConfirm) {
      showToast('New passwords do not match.', 'warning');
      return;
    }
    if (newPassword.length < 8) {
      showToast('New password must be at least 8 characters long.', 'warning');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await authApi.updatePassword(currentPassword, newPassword, newPasswordConfirm);
      showToast(res.message || 'Password updated successfully.', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirm('');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to change password.';
      showToast(msg, 'error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently';

  return (
    <div id="profile-page" className="max-w-3xl space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-2 border-b border-[#21262d]">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
          Account & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Manage your personal credentials, profile name, and security settings.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 text-zinc-950 font-bold text-xl flex items-center justify-center shadow-lg shadow-amber-500/10 uppercase">
              {user?.name ? user.name.slice(0, 2) : 'ML'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100">{user?.name}</h2>
              <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-zinc-500" />
                <span>{user?.email}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
            <span>Member since {memberSince}</span>
          </div>
        </div>
      </div>

      {/* Edit Profile Name Form */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-md">
        <h3 className="text-sm font-semibold text-zinc-100 mb-1">Personal Display Name</h3>
        <p className="text-xs text-zinc-400 mb-4">
          The name used to personalize your daily greetings and reflections.
        </p>

        <form onSubmit={handleUpdateName} className="space-y-4">
          <div>
            <label htmlFor="profile-name-input" className="block text-xs font-medium text-zinc-300 mb-1.5">
              Full Name
            </label>
            <div className="relative max-w-md">
              <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="profile-name-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] focus:border-amber-500/60 rounded-xl pl-10 pr-3.5 py-2 text-sm text-zinc-100 outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            id="profile-update-name-button"
            disabled={isUpdatingName || !name.trim() || name.trim() === user?.name}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-zinc-950 font-semibold text-xs rounded-xl shadow-md transition-all disabled:opacity-40"
          >
            {isUpdatingName ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Name</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-md">
        <h3 className="text-sm font-semibold text-zinc-100 mb-1">Update Password</h3>
        <p className="text-xs text-zinc-400 mb-4">
          Ensure your account stays protected with a strong, distinct password.
        </p>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label htmlFor="curr-pass-input" className="block text-xs font-medium text-zinc-300 mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="curr-pass-input"
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0d1117] border border-[#30363d] focus:border-amber-500/60 rounded-xl pl-10 pr-3.5 py-2 text-sm text-zinc-100 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor="new-pass-input" className="block text-xs font-medium text-zinc-300 mb-1.5">
              New Password (min 8 characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="new-pass-input"
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0d1117] border border-[#30363d] focus:border-amber-500/60 rounded-xl pl-10 pr-3.5 py-2 text-sm text-zinc-100 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor="new-pass-confirm-input" className="block text-xs font-medium text-zinc-300 mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="new-pass-confirm-input"
                type="password"
                required
                minLength={8}
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0d1117] border border-[#30363d] focus:border-amber-500/60 rounded-xl pl-10 pr-3.5 py-2 text-sm text-zinc-100 outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            id="profile-update-password-button"
            disabled={isUpdatingPassword || !currentPassword || !newPassword}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-zinc-950 font-semibold text-xs rounded-xl shadow-md transition-all disabled:opacity-40"
          >
            {isUpdatingPassword ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Update Password</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Wellness & Medical Disclaimer */}
      <div className="bg-[#12161c] border border-[#21262d] rounded-2xl p-5 text-xs text-zinc-400 space-y-2.5">
        <div className="flex items-center gap-2 text-amber-400 font-semibold">
          <HeartHandshake className="w-4 h-4 flex-shrink-0" />
          <span>Wellness & Safety Statement</span>
        </div>
        <p className="leading-relaxed">
          MoodLog is an expressive wellness diary designed to encourage self-reflection, mindfulness, and healthy habits. <strong>MoodLog is not a medical device, diagnosis engine, or psychotherapy substitute.</strong>
        </p>
        <p className="leading-relaxed">
          If you or someone you know is experiencing thoughts of suicide or a severe mental health crisis, please dial <strong>988</strong> (in the US & Canada) or text <strong>HOME</strong> to <strong>741741</strong> immediately.
        </p>
        <div className="flex items-center gap-2 pt-2 text-[11px] text-zinc-500 border-t border-[#21262d]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Your journal records are private, salted, and isolated to your user account.</span>
        </div>
      </div>

      {/* Sign Out Card */}
      <div className="pt-2 flex justify-between items-center">
        <span className="text-xs text-zinc-500">Finished your session?</span>
        <button
          id="profile-sign-out-button"
          onClick={logout}
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs font-semibold rounded-xl transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
