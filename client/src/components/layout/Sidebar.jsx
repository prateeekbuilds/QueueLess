import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ListOrdered,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Layers,
  Building,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';

export default function Sidebar({ onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isBusinessAdmin = user?.role === 'BUSINESS_ADMIN' || user?.role === 'PLATFORM_ADMIN';
  const isStaff = user?.role === 'STAFF';

  const navItems = [
    {
      name: 'Dashboard',
      to: '/dashboard',
      icon: LayoutDashboard,
      visible: isBusinessAdmin || isStaff,
    },
    {
      name: 'New Queue',
      to: '/dashboard/queues/new',
      icon: PlusCircle,
      visible: isBusinessAdmin,
    },
    {
      name: 'Staff Management',
      to: '/dashboard/staff',
      icon: Users,
      visible: isBusinessAdmin,
    },
    {
      name: 'Analytics',
      to: '/dashboard/analytics',
      icon: BarChart3,
      visible: isBusinessAdmin || isStaff,
    },
    {
      name: 'Business Settings',
      to: '/dashboard/settings',
      icon: Settings,
      visible: isBusinessAdmin,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 h-full bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800/80">
        <NavLink to="/" className="flex items-center gap-2.5 font-bold text-white text-lg tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
            <Layers className="w-5 h-5" />
          </div>
          <span>Queue<span className="text-blue-400">Less</span></span>
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Navigation
        </div>

        {navItems
          .filter((item) => item.visible)
          .map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                onClick={onClose}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  )
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700/50 flex items-center justify-center font-semibold text-xs">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-slate-400 truncate">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-rose-950/50 hover:text-rose-300 transition-colors border border-transparent hover:border-rose-900/50"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}

