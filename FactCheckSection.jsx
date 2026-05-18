import React from 'react';
// src/components/factcheck/FactCheckSection.jsx
import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  createFactCheck, subscribeToFactChecks, voteFactCheck, deleteFactCheck
} from './db';
import {
  Plus, CheckCircle2, XCircle, AlertTriangle, Link as LinkIcon,
  Loader2, Trash2, ExternalLink, TrendingUp, BarChart2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const VOTES = [
  { key: 'True', label: 'True', icon: CheckCircle2, color: 'jade', bg: 'bg-jade-500/10', border: 'border-jade-500/20', text: 'text-jade-400' },
  { key: 'False', label: 'False', icon: XCircle, color: 'red', bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400' },
  { key: 'Misleading', label: 'Misleading', icon: AlertTriangle, color: 'saffron', bg: 'bg-saffron-500/10', border: 'border-saffron-500/20', text: 'text-saffron-400' },
];

export default function FactCheckSection({ networkId, canModerate }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ headline: '', description: '', sourceUrl: '', source: '' });
  const [saving, setSaving] = useState(false);
  const [userVotes, setUserVotes] = useState({});

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToFactChecks(networkId, (data) => {
      setItems(data);
      setLoading(false);
    });
    return unsub;
  }, [networkId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.headline.trim()) return;
    setSaving(true);
    await createFactCheck(networkId, {
      headline: form.headline.trim(),
      description: form.description.trim(),
      sourceUrl: form.sourceUrl.trim(),
      source: form.source.trim(),
      submittedBy: user.uid,
      submittedByName: user.displayName || user.email,
    });
    setForm({ headline: '', description: '', sourceUrl: '', source: '' });
    setShowCreate(false);
    setSaving(false);
  };

  const vote = async (item, voteKey) => {
    const prev = userVotes[item.id];
    if (prev === voteKey) return;
    setUserVotes(v => ({ ...v, [item.id]: voteKey }));
    await voteFactCheck(networkId, item.id, user.uid, voteKey, prev);
  };

  const del = async (id) => {
    if (!confirm('Delete this fact check?')) return;
    await deleteFactCheck(networkId, id);
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="section-title">Fact Check Panel</h2>
            <p className="text-ink-500 text-sm">Community voting on news accuracy</p>
          </div>
          <button onClick={() => setShowCreate(s => !s)} className="btn-primary text-sm flex items-center gap-2">
            <Plus size={15} /> Add News Item
          </button>
        </div>

        {showCreate && (
          <form onSubmit={submit} className="card mb-6 animate-slide-up space-y-4">
            <h3 className="font-semibold text-ink-100">Submit News for Fact-Checking</h3>
            <input placeholder="News headline *" value={form.headline}
              onChange={e => setForm(f => ({ ...f, headline: e.target.value }))}
              className="input" required maxLength={200} />
            <textarea placeholder="Brief description or quote from the article..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="input resize-none" rows={3} maxLength={1000} />
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Source name (e.g. NDTV)" value={form.source}
                onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                className="input" maxLength={100} />
              <input placeholder="Article URL" value={form.sourceUrl} type="url"
                onChange={e => setForm(f => ({ ...f, sourceUrl: e.target.value }))}
                className="input" />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary text-sm flex items-center gap-2">
                {saving && <Loader2 size={14} className="animate-spin" />} Submit
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-12 text-ink-500">
            <Loader2 size={24} className="animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="card border-dashed border-ink-700 text-center py-12">
            <BarChart2 size={32} className="text-ink-700 mx-auto mb-3" />
            <p className="text-ink-500">No news items submitted yet.</p>
            <p className="text-ink-600 text-sm mt-1">Be the first to submit a headline for community fact-checking.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map(item => (
              <FactCard key={item.id} item={item} uid={user.uid}
                userVote={userVotes[item.id] || (item.voters?.includes(user.uid) ? null : null)}
                onVote={vote} onDelete={del} canModerate={canModerate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FactCard({ item, uid, userVote, onVote, onDelete, canModerate }) {
  const ts = item.createdAt?.toDate?.();
  const total = (item.votesTrue || 0) + (item.votesFalse || 0) + (item.votesMisleading || 0);
  const hasVoted = item.voters?.includes(uid);

  const getVerdict = () => {
    if (total < 3) return null;
    const t = item.votesTrue || 0;
    const f = item.votesFalse || 0;
    const m = item.votesMisleading || 0;
    const max = Math.max(t, f, m);
    if (max === t && t > total * 0.5) return { label: 'Likely True', cls: 'badge-jade' };
    if (max === f && f > total * 0.5) return { label: 'Likely False', cls: 'badge-red' };
    if (max === m) return { label: 'Misleading', cls: 'badge-saffron' };
    return { label: 'Disputed', cls: 'badge-ink' };
  };

  const verdict = getVerdict();

  return (
    <div className="card hover:border-ink-700 transition-colors animate-slide-up">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {item.source && <span className="badge-ink text-[10px]">{item.source}</span>}
            {verdict && <span className={`${verdict.cls} text-[10px]`}>{verdict.label}</span>}
          </div>
          <h3 className="font-semibold text-ink-100 leading-snug">{item.headline}</h3>
        </div>
        {canModerate && (
          <button onClick={() => onDelete(item.id)} className="text-red-500 hover:text-red-400 shrink-0">
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {item.description && (
        <p className="text-ink-400 text-sm mb-3 leading-relaxed">{item.description}</p>
      )}

      <div className="flex items-center gap-3 text-xs text-ink-600 mb-4">
        <span>by {item.submittedByName}</span>
        {ts && <span>{formatDistanceToNow(ts, { addSuffix: true })}</span>}
        {item.sourceUrl && (
          <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-saffron-500 hover:text-saffron-400">
            <ExternalLink size={11} /> Source
          </a>
        )}
      </div>

      {/* Vote bars */}
      {total > 0 && (
        <div className="mb-4 space-y-1.5">
          {VOTES.map(v => {
            const count = item[`votes${v.key}`] || 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={v.key} className="flex items-center gap-2 text-xs">
                <span className={`w-20 shrink-0 ${v.text}`}>{v.label}</span>
                <div className="flex-1 h-1.5 bg-ink-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${v.key === 'True' ? 'bg-jade-500' : v.key === 'False' ? 'bg-red-500' : 'bg-saffron-500'}`}
                    style={{ width: `${pct}%` }} />
                </div>
                <span className="text-ink-500 w-10 text-right">{pct}%</span>
              </div>
            );
          })}
          <div className="text-ink-600 text-xs pt-0.5">{total} vote{total !== 1 ? 's' : ''}</div>
        </div>
      )}

      {/* Voting buttons */}
      <div className="flex gap-2 flex-wrap">
        {VOTES.map(v => {
          const isMyVote = userVote === v.key || (hasVoted && !userVote);
          return (
            <button key={v.key} onClick={() => onVote(item, v.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all duration-150
                ${userVote === v.key
                  ? `${v.bg} ${v.border} ${v.text}`
                  : 'bg-ink-800 border-ink-700 text-ink-400 hover:border-ink-600 hover:text-ink-200'}`}>
              <v.icon size={13} />
              {v.label}
              {item[`votes${v.key}`] > 0 && <span className="ml-0.5 text-xs opacity-70">{item[`votes${v.key}`]}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
