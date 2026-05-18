import React from 'react';
// src/pages/AdminPage.jsx
import { useState, useEffect } from 'react';
import { getAllUsers, getPublicNetworks, getUserNetworks } from './db';
import { doc, updateDoc, getDocs, collection } from 'firebase/firestore';
import { db } from './firebase';
import {
  ShieldCheck, Users, Globe, Network, Loader2,
  Check, X, Search, AlertCircle
} from 'lucide-react';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('users');
  const [saving, setSaving] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [u, n] = await Promise.all([
      getAllUsers(),
      (async () => {
        const snap = await getDocs(collection(db, 'networks'));
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      })()
    ]);
    setUsers(u);
    setNetworks(n);
    setLoading(false);
  };

  const toggleAdmin = async (uid, current) => {
    setSaving(uid);
    await updateDoc(doc(db, 'users', uid), { isAdmin: !current });
    await fetchAll();
    setSaving(null);
  };

  const filteredUsers = users.filter(u =>
    (u.displayName || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const adminCount = users.filter(u => u.isAdmin).length;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-saffron-500/20 flex items-center justify-center">
          <ShieldCheck size={20} className="text-saffron-400" />
        </div>
        <div>
          <h1 className="section-title mb-0">Admin Panel</h1>
          <p className="text-ink-500 text-sm">Manage users and monitor all networks</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Users', value: users.length, icon: Users, color: 'text-saffron-400' },
          { label: 'Admins', value: adminCount, icon: ShieldCheck, color: 'text-jade-400' },
          { label: 'Networks', value: networks.length, icon: Globe, color: 'text-blue-400' },
        ].map(s => (
          <div key={s.label} className="card flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-ink-800 flex items-center justify-center shrink-0">
              <s.icon size={18} className={s.color} />
            </div>
            <div>
              <div className="text-2xl font-display font-bold text-ink-50">{s.value}</div>
              <div className="text-xs text-ink-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-ink-800 mb-6">
        {[{ id: 'users', label: 'Users' }, { id: 'networks', label: 'Networks' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`py-3 px-5 text-sm font-semibold border-b-2 transition-colors -mb-px
              ${tab === t.id ? 'border-saffron-500 text-saffron-400' : 'border-transparent text-ink-500 hover:text-ink-300'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12 text-ink-500"><Loader2 size={24} className="animate-spin" /></div>
      ) : tab === 'users' ? (
        <div>
          <div className="relative mb-4">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search users…" className="input pl-10" />
          </div>

          <div className="flex items-start gap-2 p-3 bg-saffron-500/5 border border-saffron-500/10 rounded-xl text-sm text-ink-400 mb-4">
            <AlertCircle size={15} className="text-saffron-400 mt-0.5 shrink-0" />
            <span>Admins can view all networks and moderate any network content. Grant this role carefully.</span>
          </div>

          <div className="space-y-2">
            {filteredUsers.map(u => (
              <div key={u.id} className="card flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-ink-800 flex items-center justify-center text-ink-300 font-bold shrink-0">
                  {(u.displayName || u.email || '?')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink-100">{u.displayName || 'Anonymous'}</span>
                    {u.isAdmin && <span className="badge-saffron text-[10px]">Admin</span>}
                  </div>
                  <div className="text-ink-500 text-sm truncate">{u.email}</div>
                </div>
                <button onClick={() => toggleAdmin(u.id, u.isAdmin)} disabled={saving === u.id}
                  className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg font-semibold border transition-all shrink-0
                    ${u.isAdmin
                      ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                      : 'bg-ink-800 border-ink-700 text-ink-400 hover:text-saffron-400 hover:border-saffron-500/30'}`}>
                  {saving === u.id ? <Loader2 size={12} className="animate-spin" /> : u.isAdmin ? <><X size={12} /> Revoke Admin</> : <><ShieldCheck size={12} /> Make Admin</>}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {networks.map(n => (
            <div key={n.id} className="card flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-saffron-500/10 flex items-center justify-center text-saffron-400 font-bold font-display text-lg shrink-0">
                {n.name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ink-100">{n.name}</span>
                  {n.isPublic ? (
                    <span className="badge-jade text-[10px]">Public</span>
                  ) : (
                    <span className="badge-ink text-[10px]">Private</span>
                  )}
                </div>
                <div className="text-ink-500 text-sm">
                  Owner: {n.ownerName || 'Unknown'} · {n.memberCount || 1} members · {n.moderators?.length || 0} mods
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
