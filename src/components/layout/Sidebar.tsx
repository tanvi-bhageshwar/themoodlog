import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, BarChart3, User, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/journal', label: 'Journal', icon: BookOpen },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <aside
      id="app-sidebar"
      className="hidden md:flex flex-col w-64 bg-[#12161c] border-r border-[#21262d] text-zinc-300 min-h-screen select-none"
    >
      {/* Brand Header */}
      <div className="p-6 pb-5 flex items-center gap-3 border-b border-[#21262d]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-zinc-950 font-bold shadow-lg shadow-amber-500/10">
          <Sparkles className="w-5 h-5 text-zinc-950" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-zinc-100 tracking-tight leading-none">MoodLog</h1>
          <p className="text-[11px] text-zinc-500 font-medium mt-1">Mindful Journaling</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-6 space-y-1.5" aria-label="Main Navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              id={`nav-link-${item.label.toLowerCase()}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1a202c]'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-[#21262d] bg-[#0e1217]/50">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center text-xs font-semibold uppercase flex-shrink-0">
              {user?.name ? user.name.slice(0, 2) : 'ML'}
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-zinc-200 truncate">{user?.name || 'User'}</div>
              <div className="text-[11px] text-zinc-500 truncate">{user?.email}</div>
            </div>
          </div>
          <button
            id="sidebar-logout-button"
            onClick={logout}
            className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
