import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastContainer } from '../common/ToastContainer';
import { LayoutDashboard, BookOpen, BarChart3, User } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const mobileNavItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/journal', label: 'Journal', icon: BookOpen },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <div id="app-layout" className="flex min-h-screen bg-[#0d1117] text-zinc-100 font-sans antialiased selection:bg-amber-500/20 selection:text-amber-200">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-6">
        <Topbar />

        <main id="main-content" className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav
        id="mobile-bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#12161c]/95 backdrop-blur-md border-t border-[#21262d] flex items-center justify-around py-2 px-3"
      >
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              id={`mobile-nav-${item.label.toLowerCase()}`}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[11px] font-medium transition-colors ${
                  isActive
                    ? 'text-amber-400'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
};
