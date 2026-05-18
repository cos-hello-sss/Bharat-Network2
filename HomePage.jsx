import React from 'react';
// src/pages/HomePage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useNetworks } from './useNetworks';
import { joinNetwork } from './db';
import {
  Plus, Globe, Lock, Users, ChevronRight, TrendingUp,
  MessageSquare, Video, CheckCircle, Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function HomePage() {
  const { user } = useAuth();
  const { networks, publicNetworks, loading, refetch } = useNetworks();
  const [joiningId, setJoiningId] = useState(null);

  const handleJoin = async (networkId) => {
    setJoiningId(networkId);
    try {
      await joinNetwork(networkId, user.uid);
      await refetch();
    } catch (e) { console.error(e); }
    setJoiningId(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display text-3xl font-bold text-ink-50 mb-2">
          Welcome back, <span className="text-saffron-400">{user?.displayName?.split(' ')[0] || 'Friend'}</span>
        </h1>
        <p className="text-ink-400">Your trusted networks for verified discourse.</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: 'My Networks', value: networks.length, icon: Users },
          { label: 'Available', value: publicNetworks.length, icon: Globe },
          { label: 'Verified Claims', value: '—', icon: CheckCircle },
        ].map(s => (
          <div key={s.label} className="card flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-saffron-500/10 flex items-center justify-center shrink-0">
              <s.icon size={18} className="text-saffron-400" />
            </div>
            <div>
              <div className="text-2xl font-display font-bold text-ink-50">{s.value}</div>
              <div className="text-xs text-ink-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* My Networks */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-ink-50">My Networks</h2>
          <Link to="/network/create" className="btn-primary flex items-center gap-2 text-sm py-2">
            <Plus size={15} /> Create Network
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-ink-500 py-4">
            <Loader2 size={16} className="animate-spin" /> Loading…
          </div>
        ) : networks.length === 0 ? (
          <div className="card border-dashed border-ink-700 text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-ink-800 flex items-center justify-center mx-auto mb-4">
              <Users size={24} className="text-ink-600" />
            </div>
            <p className="text-ink-400 mb-4">You haven't joined any networks yet.</p>
            <Link to="/network/create" className="btn-primary inline-flex items-center gap-2">
              <Plus size={15} /> Create your first network
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {networks.map(n => <NetworkCard key={n.id} network={n} uid={user.uid} />)}
          </div>
        )}
      </section>

      {/* Discover */}
      {publicNetworks.length > 0 && (
        <section>
          <h2 className="font-display text-xl font-bold text-ink-50 mb-4">Discover Public Networks</h2>
          <div className="space-y-3">
            {publicNetworks.map(n => (
              <div key={n.id} className="card flex items-center gap-4 hover:border-ink-700 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-saffron-500/10 flex items-center justify-center text-saffron-400 font-bold font-display text-lg shrink-0">
                  {n.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-ink-100 font-semibold">{n.name}</span>
                    <Globe size={12} className="text-ink-500" />
                  </div>
                  <div className="text-ink-500 text-sm truncate">{n.description || 'No description'}</div>
                </div>
                <div className="text-ink-500 text-sm shrink-0">{n.memberCount || 1} members</div>
                <button onClick={() => handleJoin(n.id)} disabled={joiningId === n.id}
                  className="btn-secondary text-sm py-1.5 px-3 shrink-0">
                  {joiningId === n.id ? <Loader2 size={14} className="animate-spin" /> : 'Join'}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function NetworkCard({ network, uid }) {
  const isOwner = network.ownerId === uid;
  const isMod = network.moderators?.includes(uid);
  const ts = network.createdAt?.toDate?.();

  return (
    <Link to={`/network/${network.id}`}
      className="card flex items-center gap-4 hover:border-saffron-500/30 transition-all duration-200 group">
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-saffron-500/20 to-saffron-600/10 flex items-center justify-center text-saffron-400 font-bold font-display text-xl shrink-0 border border-saffron-500/20">
        {network.name[0].toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-ink-100 font-semibold group-hover:text-saffron-300 transition-colors">{network.name}</span>
          {network.isPublic ? <Globe size={12} className="text-ink-500" /> : <Lock size={12} className="text-ink-500" />}
          {isOwner && <span className="badge-saffron text-[10px]">Owner</span>}
          {!isOwner && isMod && <span className="badge-ink text-[10px]">Moderator</span>}
        </div>
        <div className="text-ink-500 text-sm flex items-center gap-3">
          <span className="flex items-center gap-1"><Users size={11} /> {network.memberCount || 1}</span>
          {ts && <span>{formatDistanceToNow(ts, { addSuffix: true })}</span>}
        </div>
      </div>
      <div className="flex items-center gap-3 text-ink-600 shrink-0">
        <span className="flex items-center gap-1 text-xs"><MessageSquare size={12} /></span>
        <span className="flex items-center gap-1 text-xs"><Video size={12} /></span>
        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}
