import React from 'react';
// src/pages/NetworkPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { getNetwork, joinNetwork, leaveNetwork } from './db';
import ChatSection from './ChatSection';
import MeetingsSection from './MeetingsSection';
import FactCheckSection from './FactCheckSection';
import NetworkSettings from './NetworkSettings';
import {
  MessageSquare, Video, CheckSquare, Settings, Globe, Lock,
  Users, Share2, ArrowLeft, Loader2, Copy, Check
} from 'lucide-react';
import { useNetworks } from './useNetworks';

const TABS = [
  { id: 'chat', label: 'Chatrooms', icon: MessageSquare },
  { id: 'meetings', label: 'Meetings', icon: Video },
  { id: 'factcheck', label: 'Fact Check', icon: CheckSquare },
];

export default function NetworkPage() {
  const { networkId } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { refetch } = useNetworks();
  const [network, setNetwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('chat');
  const [copied, setCopied] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const fetchNetwork = async () => {
    const n = await getNetwork(networkId);
    setNetwork(n);
    setLoading(false);
  };

  useEffect(() => { fetchNetwork(); }, [networkId]);

  if (loading) return (
    <div className="flex items-center justify-center h-full text-ink-500">
      <Loader2 size={24} className="animate-spin" />
    </div>
  );

  if (!network) return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <p className="text-ink-400">Network not found.</p>
      <Link to="/" className="btn-secondary">Go Home</Link>
    </div>
  );

  const isMember = network.members?.includes(user.uid);
  const isOwner = network.ownerId === user.uid;
  const isMod = network.moderators?.includes(user.uid);
  const canManage = isOwner || isAdmin;
  const canModerate = isMod || canManage;

  const inviteLink = `${window.location.origin}/join/${network.id}`;
  const copyLink = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = async () => {
    if (!confirm('Leave this network?')) return;
    await leaveNetwork(networkId, user.uid);
    await refetch();
    navigate('/');
  };

  const handleJoin = async () => {
    await joinNetwork(networkId, user.uid);
    await fetchNetwork();
    await refetch();
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="border-b border-ink-800 bg-ink-900/60 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-ink-500 hover:text-ink-100 transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-saffron-500/30 to-saffron-600/10 border border-saffron-500/20 flex items-center justify-center text-saffron-300 font-bold font-display text-lg">
                {network.name[0].toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display font-bold text-ink-50 text-lg leading-tight">{network.name}</h1>
                  {network.isPublic ? <Globe size={13} className="text-ink-500" /> : <Lock size={13} className="text-ink-500" />}
                  {isOwner && <span className="badge-saffron text-[10px]">Owner</span>}
                  {!isOwner && isMod && <span className="badge-ink text-[10px]">Moderator</span>}
                </div>
                <div className="text-ink-500 text-xs flex items-center gap-1">
                  <Users size={11} /> {network.memberCount || 1} members
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isMember && (
              <button onClick={copyLink}
                className="btn-ghost text-sm flex items-center gap-2">
                {copied ? <Check size={14} className="text-jade-400" /> : <Share2 size={14} />}
                {copied ? 'Copied!' : 'Invite'}
              </button>
            )}
            {canManage && (
              <button onClick={() => setSettingsOpen(true)} className="btn-ghost">
                <Settings size={16} />
              </button>
            )}
            {isMember && !isOwner && (
              <button onClick={handleLeave} className="btn-ghost text-red-500 hover:text-red-400 hover:bg-red-500/10 text-sm">
                Leave
              </button>
            )}
            {!isMember && (
              <button onClick={handleJoin} className="btn-primary text-sm">Join Network</button>
            )}
          </div>
        </div>

        {/* Tabs */}
        {isMember && (
          <div className="flex gap-1 mt-4">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150
                  ${tab === t.id
                    ? 'bg-saffron-500/15 text-saffron-400 border border-saffron-500/20'
                    : 'text-ink-400 hover:text-ink-200 hover:bg-ink-800'}`}>
                <t.icon size={14} /> {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      {!isMember ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-ink-800 flex items-center justify-center mx-auto mb-4">
              <Lock size={28} className="text-ink-600" />
            </div>
            <h2 className="font-display text-xl font-bold text-ink-100 mb-2">Members Only</h2>
            <p className="text-ink-400 mb-6">Join this network to access chatrooms, meetings, and fact-checking.</p>
            <button onClick={handleJoin} className="btn-primary">Join Network</button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          {tab === 'chat' && <ChatSection networkId={networkId} canModerate={canModerate} />}
          {tab === 'meetings' && <MeetingsSection networkId={networkId} canModerate={canModerate} network={network} />}
          {tab === 'factcheck' && <FactCheckSection networkId={networkId} canModerate={canModerate} />}
        </div>
      )}

      {settingsOpen && (
        <NetworkSettings
          network={network}
          onClose={() => setSettingsOpen(false)}
          onUpdate={fetchNetwork}
        />
      )}
    </div>
  );
}
