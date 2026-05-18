import React from 'react';
// src/components/layout/Layout.jsx
import { useState } from 'react';
import { Outlet, useNavigate, NavLink, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import {
  Shield, Home, Plus, ChevronDown, LogOut, Settings,
  ShieldCheck, Menu, X, Users
} from 'lucide-react';
import { useNetworks } from './useNetworks';

export default function Layout() {
  const { user, profile, isAdmin, logout } = useAuth();
  const { networks } = useNetworks();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const Sidebar = () => (
    <aside className="flex flex-col h-full w-64 bg-ink-900/80 border-r border-ink-800">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-ink-800">
        <div className="w-8 h-8 rounded-lg bg-saffron-500 flex items-center justify-center shadow-lg shadow-saffron-500/30">
          <Shield size={16} className="text-white" />
        </div>
        <span className="font-display text-lg font-bold text-ink-50">Bharat Network</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <NavLink to="/" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Home size={16} /> Home
        </NavLink>
        {isAdmin && (
          <NavLink to="/admin" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <ShieldCheck size={16} /> Admin Panel
          </NavLink>
        )}

        <div className="pt-4 pb-2">
          <div className="flex items-center justify-between px-3">
            <span className="text-xs font-semibold text-ink-600 uppercase tracking-wider">My Networks</span>
            <Link to="/network/create" className="text-ink-500 hover:text-saffron-400 transition-colors">
              <Plus size={14} />
            </Link>
          </div>
        </div>

        {networks.length === 0 ? (
          <div className="px-3 py-2 text-ink-600 text-xs">No networks yet</div>
        ) : (
          networks.map(n => (
            <NavLink key={n.id} to={`/network/${n.id}`}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <div className="w-5 h-5 rounded bg-saffron-500/20 flex items-center justify-center text-saffron-400 text-xs font-bold shrink-0">
                {n.name[0].toUpperCase()}
              </div>
              <span className="truncate">{n.name}</span>
              {!n.isPublic && <span className="ml-auto text-ink-600"><Users size={11} /></span>}
            </NavLink>
          ))
        )}

        <Link to="/network/create"
          className="sidebar-link mt-2 border border-dashed border-ink-700 hover:border-saffron-500/50 text-ink-500">
          <Plus size={16} /> Create Network
        </Link>
      </nav>

      {/* User */}
      <div className="border-t border-ink-800 p-3">
        <button onClick={() => setUserMenuOpen(o => !o)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-ink-800 transition-colors">
          <div className="w-8 h-8 rounded-full bg-saffron-500/20 flex items-center justify-center overflow-hidden shrink-0">
            {user?.photoURL
              ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
              : <span className="text-saffron-400 font-bold text-sm">{(user?.displayName || user?.email || 'U')[0].toUpperCase()}</span>}
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="text-ink-200 text-sm font-semibold truncate">{user?.displayName || 'User'}</div>
            <div className="text-ink-500 text-xs truncate">{user?.email}</div>
          </div>
          <ChevronDown size={14} className={`text-ink-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
        </button>
        {userMenuOpen && (
          <div className="mt-1 bg-ink-800 border border-ink-700 rounded-lg overflow-hidden">
            {isAdmin && (
              <div className="px-3 py-1.5 border-b border-ink-700">
                <span className="badge-saffron text-[10px]">Admin</span>
              </div>
            )}
            <button onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 text-sm transition-colors">
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-ink-950/70" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-ink-800 bg-ink-900">
          <button onClick={() => setSidebarOpen(true)} className="text-ink-400 hover:text-ink-100">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-saffron-500" />
            <span className="font-display font-bold text-ink-100">Bharat Network</span>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
