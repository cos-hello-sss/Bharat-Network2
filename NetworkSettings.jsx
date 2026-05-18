import React from 'react';
// src/components/network/NetworkSettings.jsx
import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  updateNetwork, deleteNetwork, getAllUsers,
  addModerator, removeModerator, leaveNetwork
} from './db';
import {
  X, Globe, Lock, Trash2, UserPlus, UserMinus,
  Copy, Check, Loader2, ShieldCheck, Save
} from 'lucide-react';
import { useNetworks } from './useNetworks';

export default function NetworkSettings({ network, onClose, onUpdate }) {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { refetch } = useNetworks();
  const [tab, setTab] = useState('general');
  const [form, setForm] = useState({ name: network.name, description: network.description || '', isPublic: network.isPublic });
  const [allUsers, setAllUsers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const isOwner = network.ownerId === user.uid;
  const canManage = isOwner || isAdmin;
  const inviteLink = `${window.location.origin}/join/${network.id}`;

  useEffect(() => {
    if (tab === 'members') fetchUsers();
  }, [tab]);

  const fetchUsers = async () => {
    const users = await getAllUsers();
    setAllUsers(users.filter(u => network.members?.includes(u.id)));
  };

  const saveGeneral = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    await updateNetwork(network.id, { name: form.name.trim(), description: form.description.trim(), isPublic: form.isPublic });
    await onUpdate();
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${network.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    await deleteNetwork(network.id);
    await refetch();
    navigate('/');
  };

  const toggleMod = async (memberId) => {
    if (network.moderators?.includes(memberId)) {
      await removeModerator(network.id, memberId);
    } else {
      await addModerator(network.id, memberId);
    }
    await onUpdate();
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const TABS = [
    { id: 'general', label: 'General' },
    { id: 'members', label: 'Members & Mods' },
    { id: 'invite', label: 'Invite Link' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-ink-900 border border-ink-700 rounded-2xl w-full max-w-lg shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-800">
          <h2 className="font-display text-lg font-bold text-ink-50">Network Settings</h2>
          <button onClick={onClose} className="text-ink-500 hover:text-ink-100 transition-colors"><X size={20} /></button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-ink-800 px-6">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors -mb-px
                ${tab === t.id ? 'border-saffron-500 text-saffron-400' : 'border-transparent text-ink-500 hover:text-ink-300'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {tab === 'general' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-ink-300 mb-2 block">Network Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="input" maxLength={60} disabled={!canManage} />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-300 mb-2 block">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="input resize-none" rows={3} maxLength={300} disabled={!canManage} />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-300 mb-3 block">Visibility</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { val: true, icon: Globe, label: 'Public' },
                    { val: false, icon: Lock, label: 'Private' },
                  ].map(opt => (
                    <button key={String(opt.val)} type="button"
                      onClick={() => canManage && setForm(f => ({ ...f, isPublic: opt.val }))}
                      disabled={!canManage}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all
                        ${form.isPublic === opt.val ? 'border-saffron-500 bg-saffron-500/10 text-saffron-400' : 'border-ink-700 bg-ink-800 text-ink-400'}
                        ${!canManage ? 'opacity-60 cursor-not-allowed' : 'hover:border-ink-600'}`}>
                      <opt.icon size={16} /> {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {canManage && (
                <div className="flex gap-3 pt-2">
                  <button onClick={saveGeneral} disabled={saving} className="btn-primary flex items-center gap-2 flex-1 justify-center">
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Changes
                  </button>
                </div>
              )}

              {isOwner && (
                <div className="pt-4 border-t border-ink-800">
                  <div className="text-sm font-semibold text-red-400 mb-2">Danger Zone</div>
                  <button onClick={handleDelete} disabled={deleting}
                    className="btn-danger flex items-center gap-2 text-sm w-full justify-center">
                    {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    Delete Network
                  </button>
                </div>
              )}
            </div>
          )}

          {tab === 'members' && (
            <div className="space-y-2">
              <div className="text-xs text-ink-500 mb-3">
                Moderators can create/delete chatrooms, delete meetings and fact checks.
              </div>
              {allUsers.length === 0 ? (
                <div className="text-ink-600 text-sm text-center py-4">Loading members…</div>
              ) : allUsers.map(u => {
                const isMod = network.moderators?.includes(u.id);
                const isOwnerUser = network.ownerId === u.id;
                return (
                  <div key={u.id} className="flex items-center gap-3 p-3 bg-ink-800 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-saffron-500/20 flex items-center justify-center text-saffron-400 font-bold text-sm shrink-0">
                      {(u.displayName || u.email || '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-ink-200 text-sm font-semibold truncate">{u.displayName || 'User'}</div>
                      <div className="text-ink-500 text-xs truncate">{u.email}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isOwnerUser && <span className="badge-saffron text-[10px]">Owner</span>}
                      {isMod && !isOwnerUser && <span className="badge-ink text-[10px]">Mod</span>}
                      {canManage && !isOwnerUser && (
                        <button onClick={() => toggleMod(u.id)}
                          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg border transition-all
                            ${isMod
                              ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                              : 'bg-ink-700 border-ink-600 text-ink-400 hover:text-saffron-400 hover:border-saffron-500/30'}`}>
                          {isMod ? <><UserMinus size={11} /> Remove Mod</> : <><UserPlus size={11} /> Make Mod</>}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'invite' && (
            <div className="space-y-4">
              <p className="text-ink-400 text-sm">Share this link to invite people to the network.</p>
              <div className="flex gap-2">
                <input readOnly value={inviteLink} className="input flex-1 text-sm font-mono text-ink-400" />
                <button onClick={copyLink} className="btn-secondary px-3 shrink-0">
                  {copied ? <Check size={16} className="text-jade-400" /> : <Copy size={16} />}
                </button>
              </div>
              <div className="text-xs text-ink-600">
                {network.isPublic
                  ? 'This network is public — anyone can also find and join it without a link.'
                  : 'This network is private — only people with this link can join.'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
