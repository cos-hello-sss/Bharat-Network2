import React from 'react';
// src/components/meetings/MeetingsSection.jsx
import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  getMeetings, createMeeting, rsvpMeeting, unrsvpMeeting,
  updateMeeting, deleteMeeting
} from './db';
import {
  Calendar, Clock, Plus, Video, Link as LinkIcon,
  Users, Trash2, Loader2, Edit3, Check, X, ExternalLink
} from 'lucide-react';
import { format, isPast, formatDistanceToNow } from 'date-fns';

export default function MeetingsSection({ networkId, canModerate }) {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', scheduledAt: '', meetingUrl: '', platform: 'google_meet' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchMeetings(); }, [networkId]);

  const fetchMeetings = async () => {
    setLoading(true);
    const m = await getMeetings(networkId);
    setMeetings(m);
    setLoading(false);
  };

  const create = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.scheduledAt) return;
    setSaving(true);
    await createMeeting(networkId, {
      title: form.title.trim(),
      description: form.description.trim(),
      scheduledAt: new Date(form.scheduledAt),
      meetingUrl: form.meetingUrl.trim(),
      platform: form.platform,
      createdBy: user.uid,
      createdByName: user.displayName || user.email,
    });
    setForm({ title: '', description: '', scheduledAt: '', meetingUrl: '', platform: 'google_meet' });
    setShowCreate(false);
    await fetchMeetings();
    setSaving(false);
  };

  const toggleRsvp = async (m) => {
    if (m.attendees?.includes(user.uid)) {
      await unrsvpMeeting(networkId, m.id, user.uid);
    } else {
      await rsvpMeeting(networkId, m.id, user.uid);
    }
    await fetchMeetings();
  };

  const del = async (meetingId) => {
    if (!confirm('Delete this meeting?')) return;
    await deleteMeeting(networkId, meetingId);
    await fetchMeetings();
  };

  const upcoming = meetings.filter(m => !isPast(m.scheduledAt?.toDate?.() || new Date()));
  const past = meetings.filter(m => isPast(m.scheduledAt?.toDate?.() || new Date()));

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">Meetings</h2>
          {canModerate && (
            <button onClick={() => setShowCreate(s => !s)} className="btn-primary text-sm flex items-center gap-2">
              <Plus size={15} /> Schedule Meeting
            </button>
          )}
        </div>

        {showCreate && (
          <form onSubmit={create} className="card mb-6 animate-slide-up space-y-4">
            <h3 className="font-semibold text-ink-100">Schedule a Meeting</h3>
            <input placeholder="Meeting title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="input" required maxLength={100} />
            <textarea placeholder="Description (optional)" value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="input resize-none" rows={2} maxLength={500} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-ink-500 mb-1 block">Date & Time *</label>
                <input type="datetime-local" value={form.scheduledAt}
                  onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))}
                  className="input" required />
              </div>
              <div>
                <label className="text-xs text-ink-500 mb-1 block">Platform</label>
                <select value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}
                  className="input">
                  <option value="google_meet">Google Meet</option>
                  <option value="zoom">Zoom</option>
                  <option value="teams">Microsoft Teams</option>
                  <option value="jitsi">Jitsi</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <input placeholder="Meeting URL (optional)" value={form.meetingUrl}
              onChange={e => setForm(f => ({ ...f, meetingUrl: e.target.value }))}
              className="input" type="url" />
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary text-sm flex items-center gap-2">
                {saving && <Loader2 size={14} className="animate-spin" />} Schedule
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="flex items-center gap-2 text-ink-500 py-8 justify-center">
            <Loader2 size={18} className="animate-spin" />
          </div>
        ) : meetings.length === 0 ? (
          <div className="card border-dashed border-ink-700 text-center py-12">
            <Video size={32} className="text-ink-700 mx-auto mb-3" />
            <p className="text-ink-500">No meetings scheduled yet.</p>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <div className="mb-8">
                <div className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-3">Upcoming</div>
                <div className="space-y-3">
                  {upcoming.map(m => <MeetingCard key={m.id} meeting={m} uid={user.uid} onRsvp={toggleRsvp} onDelete={del} canModerate={canModerate} />)}
                </div>
              </div>
            )}
            {past.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-3">Past</div>
                <div className="space-y-3 opacity-60">
                  {past.map(m => <MeetingCard key={m.id} meeting={m} uid={user.uid} onRsvp={toggleRsvp} onDelete={del} canModerate={canModerate} isPast />)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function MeetingCard({ meeting, uid, onRsvp, onDelete, canModerate, isPast }) {
  const ts = meeting.scheduledAt?.toDate?.();
  const isAttending = meeting.attendees?.includes(uid);
  const platformColors = { google_meet: 'text-blue-400', zoom: 'text-blue-500', teams: 'text-purple-400', jitsi: 'text-jade-400', other: 'text-ink-400' };

  return (
    <div className="card hover:border-ink-700 transition-colors">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-saffron-500/10 border border-saffron-500/20 flex flex-col items-center justify-center shrink-0">
          {ts ? (
            <>
              <span className="text-saffron-400 text-xs font-semibold uppercase">{format(ts, 'MMM')}</span>
              <span className="text-saffron-300 font-bold font-display text-lg leading-none">{format(ts, 'd')}</span>
            </>
          ) : <Calendar size={20} className="text-saffron-400" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-ink-100">{meeting.title}</h3>
            {canModerate && (
              <button onClick={() => onDelete(meeting.id)} className="text-red-500 hover:text-red-400 shrink-0">
                <Trash2 size={14} />
              </button>
            )}
          </div>
          {meeting.description && <p className="text-ink-500 text-sm mt-0.5">{meeting.description}</p>}
          <div className="flex items-center gap-4 mt-2 text-sm text-ink-500">
            {ts && (
              <span className="flex items-center gap-1.5">
                <Clock size={13} />
                {format(ts, 'MMM d, yyyy · h:mm a')}
                {!isPast && <span className="text-saffron-400 text-xs">· {formatDistanceToNow(ts, { addSuffix: true })}</span>}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Users size={13} />
              {meeting.attendees?.length || 0} attending
            </span>
          </div>
          <div className="flex items-center gap-3 mt-3">
            {!isPast && (
              <button onClick={() => onRsvp(meeting)}
                className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg font-semibold transition-all
                  ${isAttending
                    ? 'bg-jade-500/15 text-jade-400 border border-jade-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20'
                    : 'bg-ink-800 text-ink-300 border border-ink-700 hover:border-saffron-500/30 hover:text-saffron-400'}`}>
                {isAttending ? <><Check size={13} /> Attending</> : 'RSVP'}
              </button>
            )}
            {meeting.meetingUrl && !isPast && (
              <a href={meeting.meetingUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-saffron-400 hover:text-saffron-300">
                <ExternalLink size={13} /> Join Meeting
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
