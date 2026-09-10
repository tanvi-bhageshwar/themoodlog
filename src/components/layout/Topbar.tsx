import React from 'react';
import { Sparkles, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Topbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header
      id="app-topbar"
      className="md:hidden flex items-center justify-between px-4 py-3 bg-[#12161c] border-b border-[#21262d] sticky top-0 z-40"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-zinc-950 font-bold">
          <Sparkles className="w-4 h-4 text-zinc-950" />
        </div>
        <span className="font-bold text-zinc-100 text-base">MoodLog</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-400 font-medium truncate max-w-[120px]">
          {user?.name || 'Account'}
        </span>
        <button
          id="mobile-logout-button"
          onClick={logout}
          className="p-1.5 text-zinc-400 hover:text-rose-400 rounded-md"
          title="Sign out"
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
