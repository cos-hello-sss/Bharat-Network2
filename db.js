// src/utils/db.js — Firestore helpers
import {
  collection, doc, addDoc, setDoc, getDoc, getDocs,
  updateDoc, deleteDoc, query, where, orderBy, limit,
  onSnapshot, serverTimestamp, arrayUnion, arrayRemove,
  increment
} from 'firebase/firestore';
import { db } from './firebase';

// ─── Users ──────────────────────────────────────────────────────────────────
export const createUserProfile = async (uid, data) => {
  await setDoc(doc(db, 'users', uid), {
    ...data,
    isAdmin: false,
    createdAt: serverTimestamp(),
  }, { merge: true });
};

export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const getAllUsers = async () => {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ─── Networks ────────────────────────────────────────────────────────────────
export const createNetwork = async (data) => {
  return await addDoc(collection(db, 'networks'), {
    ...data,
    createdAt: serverTimestamp(),
    memberCount: 1,
  });
};

export const getNetwork = async (id) => {
  const snap = await getDoc(doc(db, 'networks', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const getPublicNetworks = async () => {
  const q = query(
    collection(db, 'networks'),
    where('isPublic', '==', true),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getUserNetworks = async (uid) => {
  const q = query(
    collection(db, 'networks'),
    where('members', 'array-contains', uid)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const updateNetwork = async (id, data) => {
  await updateDoc(doc(db, 'networks', id), data);
};

export const deleteNetwork = async (id) => {
  await deleteDoc(doc(db, 'networks', id));
};

export const joinNetwork = async (networkId, uid) => {
  await updateDoc(doc(db, 'networks', networkId), {
    members: arrayUnion(uid),
    memberCount: increment(1),
  });
};

export const leaveNetwork = async (networkId, uid) => {
  await updateDoc(doc(db, 'networks', networkId), {
    members: arrayRemove(uid),
    memberCount: increment(-1),
  });
};

export const addModerator = async (networkId, uid) => {
  await updateDoc(doc(db, 'networks', networkId), {
    moderators: arrayUnion(uid),
  });
};

export const removeModerator = async (networkId, uid) => {
  await updateDoc(doc(db, 'networks', networkId), {
    moderators: arrayRemove(uid),
  });
};

// ─── Chatrooms ────────────────────────────────────────────────────────────────
export const createChatroom = async (networkId, data) => {
  return await addDoc(collection(db, 'networks', networkId, 'chatrooms'), {
    ...data,
    createdAt: serverTimestamp(),
  });
};

export const getChatrooms = async (networkId) => {
  const q = query(
    collection(db, 'networks', networkId, 'chatrooms'),
    orderBy('createdAt', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const sendMessage = async (networkId, chatroomId, data) => {
  return await addDoc(
    collection(db, 'networks', networkId, 'chatrooms', chatroomId, 'messages'),
    { ...data, createdAt: serverTimestamp() }
  );
};

export const subscribeToMessages = (networkId, chatroomId, callback) => {
  const q = query(
    collection(db, 'networks', networkId, 'chatrooms', chatroomId, 'messages'),
    orderBy('createdAt', 'asc'),
    limit(100)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};

export const deleteChatroom = async (networkId, chatroomId) => {
  await deleteDoc(doc(db, 'networks', networkId, 'chatrooms', chatroomId));
};

// ─── Meetings ────────────────────────────────────────────────────────────────
export const createMeeting = async (networkId, data) => {
  return await addDoc(collection(db, 'networks', networkId, 'meetings'), {
    ...data,
    createdAt: serverTimestamp(),
    status: 'scheduled',
    attendees: [],
  });
};

export const getMeetings = async (networkId) => {
  const q = query(
    collection(db, 'networks', networkId, 'meetings'),
    orderBy('scheduledAt', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const rsvpMeeting = async (networkId, meetingId, uid) => {
  await updateDoc(doc(db, 'networks', networkId, 'meetings', meetingId), {
    attendees: arrayUnion(uid),
  });
};

export const unrsvpMeeting = async (networkId, meetingId, uid) => {
  await updateDoc(doc(db, 'networks', networkId, 'meetings', meetingId), {
    attendees: arrayRemove(uid),
  });
};

export const updateMeeting = async (networkId, meetingId, data) => {
  await updateDoc(doc(db, 'networks', networkId, 'meetings', meetingId), data);
};

export const deleteMeeting = async (networkId, meetingId) => {
  await deleteDoc(doc(db, 'networks', networkId, 'meetings', meetingId));
};

// ─── Fact Checks ─────────────────────────────────────────────────────────────
export const createFactCheck = async (networkId, data) => {
  return await addDoc(collection(db, 'networks', networkId, 'factchecks'), {
    ...data,
    createdAt: serverTimestamp(),
    votesTrue: 0,
    votesFalse: 0,
    votesMisleading: 0,
    voters: [],
  });
};

export const getFactChecks = async (networkId) => {
  const q = query(
    collection(db, 'networks', networkId, 'factchecks'),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const voteFactCheck = async (networkId, factId, uid, vote, previousVote) => {
  const ref = doc(db, 'networks', networkId, 'factchecks', factId);
  const updates = { voters: arrayUnion(uid) };
  if (previousVote) updates[`votes${previousVote}`] = increment(-1);
  updates[`votes${vote}`] = increment(1);
  await updateDoc(ref, updates);
};

export const subscribeToFactChecks = (networkId, callback) => {
  const q = query(
    collection(db, 'networks', networkId, 'factchecks'),
    orderBy('createdAt', 'desc'),
    limit(30)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};

export const deleteFactCheck = async (networkId, factId) => {
  await deleteDoc(doc(db, 'networks', networkId, 'factchecks', factId));
};
