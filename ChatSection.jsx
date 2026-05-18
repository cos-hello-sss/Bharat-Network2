import React from 'react';
// src/components/chat/ChatSection.jsx
import { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import {
  getChatrooms, createChatroom, sendMessage,
  subscribeToMessages, deleteChatroom
} from './db';
import { Hash, Plus, Send, Trash2, Loader2, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ChatSection({ networkId, canModerate }) {
  const { user } = useAuth();
  const [chatrooms, setChatrooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [sending, setSending] = useState(false);
  const msgEnd = useRef(null);
  const unsub = useRef(null);

  useEffect(() => {
    fetchRooms();
  }, [networkId]);

  useEffect(() => {
    if (!activeRoom) return;
    if (unsub.current) unsub.current();
    unsub.current = subscribeToMessages(networkId, activeRoom.id, setMessages);
    return () => unsub.current?.();
  }, [activeRoom]);

  useEffect(() => {
    msgEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchRooms = async () => {
    setLoading(true);
    const rooms = await getChatrooms(networkId);
    setChatrooms(rooms);
    if (rooms.length > 0) setActiveRoom(rooms[0]);
    setLoading(false);
  };

  const createRoom = async () => {
    if (!newRoomName.trim()) return;
    const ref = await createChatroom(networkId, {
      name: newRoomName.trim(),
      createdBy: user.uid,
    });
    setNewRoomName('');
    setCreating(false);
    await fetchRooms();
  };

  const deleteRoom = async (roomId) => {
    if (!confirm('Delete this chatroom? All messages will be lost.')) return;
    if (activeRoom?.id === roomId) setActiveRoom(null);
    await deleteChatroom(networkId, roomId);
    await fetchRooms();
  };

  const sendMsg = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeRoom) return;
    setSending(true);
    await sendMessage(networkId, activeRoom.id, {
      text: input.trim(),
      uid: user.uid,
      displayName: user.displayName || user.email,
      photoURL: user.photoURL,
    });
    setInput('');
    setSending(false);
  };

  return (
    <div className="flex h-full">
      {/* Rooms sidebar */}
      <div className="w-52 border-r border-ink-800 bg-ink-900/40 flex flex-col shrink-0">
        <div className="px-3 py-3 border-b border-ink-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Chatrooms</span>
          {canModerate && (
            <button onClick={() => setCreating(c => !c)} className="text-ink-500 hover:text-saffron-400 transition-colors">
              <Plus size={14} />
            </button>
          )}
        </div>

        {creating && (
          <div className="p-2 border-b border-ink-800">
            <input
              value={newRoomName} onChange={e => setNewRoomName(e.target.value)}
              placeholder="Room name..." className="input text-sm py-1.5"
              onKeyDown={e => e.key === 'Enter' && createRoom()}
              autoFocus maxLength={40}
            />
            <div className="flex gap-1 mt-1">
              <button onClick={createRoom} className="btn-primary text-xs py-1 flex-1">Create</button>
              <button onClick={() => setCreating(false)} className="btn-ghost text-xs py-1">✕</button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto py-1">
          {loading ? (
            <div className="flex items-center justify-center py-4 text-ink-600"><Loader2 size={16} className="animate-spin" /></div>
          ) : chatrooms.length === 0 ? (
            <div className="px-3 py-4 text-ink-600 text-xs text-center">
              {canModerate ? 'Create your first chatroom ↑' : 'No chatrooms yet'}
            </div>
          ) : (
            chatrooms.map(r => (
              <div key={r.id}
                className={`group flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors
                  ${activeRoom?.id === r.id ? 'bg-saffron-500/10 text-saffron-400' : 'text-ink-400 hover:bg-ink-800 hover:text-ink-100'}`}
                onClick={() => setActiveRoom(r)}>
                <Hash size={14} className="shrink-0" />
                <span className="flex-1 truncate text-sm">{r.name}</span>
                {canModerate && (
                  <button onClick={e => { e.stopPropagation(); deleteRoom(r.id); }}
                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition-all">
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {!activeRoom ? (
          <div className="flex-1 flex items-center justify-center text-ink-500">
            <div className="text-center">
              <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
              <p>Select a chatroom to start messaging</p>
            </div>
          </div>
        ) : (
          <>
            <div className="px-5 py-3 border-b border-ink-800 flex items-center gap-2">
              <Hash size={16} className="text-ink-500" />
              <span className="font-semibold text-ink-200">{activeRoom.name}</span>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-ink-600 text-sm py-10">
                  No messages yet. Start the conversation!
                </div>
              )}
              {messages.map((m, i) => {
                const isOwn = m.uid === user.uid;
                const ts = m.createdAt?.toDate?.();
                return (
                  <div key={m.id} className={`flex items-end gap-2.5 ${isOwn ? 'flex-row-reverse' : ''}`}>
                    <div className="w-7 h-7 rounded-full bg-ink-700 flex items-center justify-center overflow-hidden shrink-0 mb-0.5">
                      {m.photoURL
                        ? <img src={m.photoURL} alt="" className="w-full h-full object-cover" />
                        : <span className="text-ink-300 text-xs font-bold">{(m.displayName || '?')[0].toUpperCase()}</span>}
                    </div>
                    <div className={`max-w-xs lg:max-w-md ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      <span className={`text-xs text-ink-500 ${isOwn ? 'text-right' : ''}`}>
                        {!isOwn && <span className="font-medium text-ink-400">{m.displayName} · </span>}
                        {ts && formatDistanceToNow(ts, { addSuffix: true })}
                      </span>
                      <div className={`px-3.5 py-2 text-sm leading-relaxed ${isOwn ? 'chat-bubble-own text-saffron-100' : 'chat-bubble-other text-ink-100'}`}>
                        {m.text}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={msgEnd} />
            </div>

            <form onSubmit={sendMsg} className="px-5 py-4 border-t border-ink-800">
              <div className="flex gap-3">
                <input value={input} onChange={e => setInput(e.target.value)}
                  placeholder={`Message #${activeRoom.name}`}
                  className="input flex-1" maxLength={1000} />
                <button type="submit" disabled={!input.trim() || sending}
                  className="btn-primary px-4 disabled:opacity-50">
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
