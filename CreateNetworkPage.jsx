import React from 'react';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { createNetwork } from './db';
import { useNetworks } from './useNetworks';
import { Globe, Lock, ArrowLeft, Loader2, Shield } from 'lucide-react';

export default function CreateNetworkPage() {
  const { user } = useAuth();
  const { refetch } = useNetworks();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', description: '', isPublic: true });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Network name is required.');
    setLoading(true);
    try {
      const ref = await createNetwork({
        name: form.name.trim(),
        description: form.description.trim(),
        isPublic: form.isPublic,
        ownerId: user.uid,
        ownerName: user.displayName || user.email,
        members: [user.uid],
        moderators: [],
      });
      await refetch();
      navigate(`/network/${ref.id}`);
    } catch (e) {
      setError('Failed to create network. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-ink-400 hover:text-ink-100 mb-8 transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="mb-8">
        <h1 className="section-title">Create a Network</h1>
        <p className="text-ink-400">Build a trusted community space for verified discourse and fact-checking.</p>
      </div>

      <form onSubmit={submit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-ink-300 mb-2">Network Name *</label>
          <input name="name" type="text" placeholder="e.g. Mumbai Truth Circle"
            value={form.name} onChange={handle} className="input" maxLength={60} required />
        </div>

        <div>
          <label className="block text-sm font-semibold text-ink-300 mb-2">Description</label>
          <textarea name="description" placeholder="What is this network about?"
            value={form.description} onChange={handle} className="input resize-none" rows={3} maxLength={300} />
          <div className="text-right text-xs text-ink-600 mt-1">{form.description.length}/300</div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-ink-300 mb-3">Visibility</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { val: true, icon: Globe, title: 'Public', desc: 'Anyone can discover and join this network' },
              { val: false, icon: Lock, title: 'Private', desc: 'Invite-only via shareable link' },
            ].map(opt => (
              <button key={String(opt.val)} type="button"
                onClick={() => setForm(f => ({ ...f, isPublic: opt.val }))}
                className={`flex flex-col items-start gap-2 p-4 rounded-xl border-2 text-left transition-all duration-200
                  ${form.isPublic === opt.val
                    ? 'border-saffron-500 bg-saffron-500/10'
                    : 'border-ink-700 bg-ink-800 hover:border-ink-600'}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${form.isPublic === opt.val ? 'bg-saffron-500 text-white' : 'bg-ink-700 text-ink-400'}`}>
                  <opt.icon size={16} />
                </div>
                <div>
                  <div className={`font-semibold text-sm ${form.isPublic === opt.val ? 'text-saffron-300' : 'text-ink-200'}`}>{opt.title}</div>
                  <div className="text-ink-500 text-xs mt-0.5">{opt.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {!form.isPublic && (
          <div className="flex items-start gap-3 p-4 bg-ink-800/50 border border-ink-700 rounded-xl text-sm text-ink-400">
            <Shield size={16} className="text-saffron-400 mt-0.5 shrink-0" />
            <span>After creating the network, you'll get a shareable invite link to send to members.</span>
          </div>
        )}

        {error && <div className="text-red-400 text-sm">{error}</div>}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={loading}
            className="btn-primary flex items-center gap-2 flex-1 justify-center">
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            Create Network
          </button>
        </div>
      </form>
    </div>
  );
}
