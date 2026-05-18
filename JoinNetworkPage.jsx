import React from 'react';
// src/pages/JoinNetworkPage.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { getNetwork, joinNetwork } from './db';
import { Shield, Users, Globe, Lock, Loader2, LogIn } from 'lucide-react';

export default function JoinNetworkPage() {
  const { networkId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [network, setNetwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    getNetwork(networkId).then(n => { setNetwork(n); setLoading(false); });
  }, [networkId]);

  const handleJoin = async () => {
    if (!user) { navigate(`/auth?next=/join/${networkId}`); return; }
    setJoining(true);
    await joinNetwork(networkId, user.uid);
    navigate(`/network/${networkId}`);
  };

  if (loading || authLoading) return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-saffron-500" />
    </div>
  );

  if (!network) return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center text-center p-6">
      <div>
        <h1 className="font-display text-2xl text-ink-100 mb-3">Network not found</h1>
        <p className="text-ink-500 mb-6">This invite link may be invalid or expired.</p>
        <Link to="/" className="btn-primary">Go Home</Link>
      </div>
    </div>
  );

  const isMember = network.members?.includes(user?.uid);

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center animate-slide-up">
        <div className="flex items-center gap-3 justify-center mb-10">
          <div className="w-9 h-9 rounded-xl bg-saffron-500 flex items-center justify-center shadow-lg shadow-saffron-500/30">
            <Shield size={18} className="text-white" />
          </div>
          <span className="font-display text-xl font-bold text-ink-50">Bharat Network</span>
        </div>

        <div className="card text-left mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-saffron-500/30 to-saffron-600/10 border border-saffron-500/20 flex items-center justify-center text-saffron-300 font-bold font-display text-2xl">
              {network.name[0].toUpperCase()}
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-ink-50">{network.name}</h1>
              <div className="flex items-center gap-2 text-ink-500 text-sm mt-0.5">
                {network.isPublic ? <Globe size={12} /> : <Lock size={12} />}
                {network.isPublic ? 'Public Network' : 'Private Network'}
                <span>·</span>
                <Users size={12} />
                {network.memberCount || 1} members
              </div>
            </div>
          </div>
          {network.description && <p className="text-ink-400 text-sm">{network.description}</p>}
        </div>

        {isMember ? (
          <div className="space-y-3">
            <div className="text-ink-400 text-sm">You're already a member of this network.</div>
            <Link to={`/network/${networkId}`} className="btn-primary w-full flex items-center justify-center gap-2">
              Open Network
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {!user && (
              <p className="text-ink-500 text-sm">Sign in to join this network.</p>
            )}
            <button onClick={handleJoin} disabled={joining}
              className="btn-primary w-full flex items-center justify-center gap-2">
              {joining ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
              {user ? 'Join Network' : 'Sign In to Join'}
            </button>
            {user && <Link to="/" className="btn-ghost w-full flex items-center justify-center">Maybe Later</Link>}
          </div>
        )}
      </div>
    </div>
  );
}
