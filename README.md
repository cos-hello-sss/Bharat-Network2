# Bharat Network 🛡️

**Truth, verified together.** A collaborative platform to fight misinformation and propaganda through community fact-checking, moderated chatrooms, and organized meetings.

---

## Features

- **Authentication** — Google Sign-In + Email/Password via Firebase Auth
- **Networks** — Public or private invite-link communities
- **Chatrooms** — Real-time messaging within networks
- **Meetings** — Schedule and RSVP to meetings with Google Meet/Zoom links
- **Fact Check Panel** — Submit news headlines and vote: True / False / Misleading
- **Moderators** — Network owners select moderators who can manage content
- **Admins** — Site-wide admins (set in Firebase via `isAdmin: true`) can access the Admin Panel

---

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend/DB**: Firebase Firestore (real-time)
- **Auth**: Firebase Auth (Google + Email)
- **Hosting**: Cloudflare Pages

---

## Setup Guide

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com) → Create project
2. **Authentication** → Sign-in methods → Enable:
   - Email/Password
   - Google
3. **Firestore Database** → Create database → Start in **production mode**
4. **Project Settings** → General → Add web app → Copy config

### 2. Firestore Security Rules

In Firebase Console → Firestore → Rules, paste the contents of `firestore.rules`.

### 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in your Firebase config:

```bash
cp .env.example .env.local
```

### 4. Create First Admin

After signing up, go to Firebase Console → Firestore → `users` collection → find your user document → add field:
```
isAdmin: true  (boolean)
```

### 5. Local Development

```bash
npm install
npm run dev
```

### 6. Deploy to Cloudflare Pages

1. Push code to GitHub
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages → Create project
3. Connect GitHub repo
4. Build settings:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. **Environment variables** → Add all `VITE_FIREBASE_*` variables from `.env.example`
6. Deploy!

---

## How Roles Work

| Role | Can Do |
|------|--------|
| **Member** | Join networks, chat, RSVP meetings, vote on fact checks, submit news |
| **Moderator** | + Create/delete chatrooms, delete meetings & fact checks |
| **Network Owner** | + Add/remove moderators, edit/delete network, manage settings |
| **Admin** | Everything + Admin Panel (view all users/networks, grant admin to others) |

### Setting Admins
Admins are **manually set** in Firebase Firestore. In the `users` collection, set `isAdmin: true` on the user document. Admins cannot grant themselves admin access through the UI.

---

## Data Structure

```
users/{uid}
  displayName, email, photoURL, isAdmin, createdAt

networks/{networkId}
  name, description, isPublic, ownerId, ownerName,
  members[], moderators[], memberCount, createdAt

networks/{networkId}/chatrooms/{chatroomId}
  name, createdBy, createdAt

networks/{networkId}/chatrooms/{chatroomId}/messages/{msgId}
  text, uid, displayName, photoURL, createdAt

networks/{networkId}/meetings/{meetingId}
  title, description, scheduledAt, meetingUrl, platform,
  createdBy, createdByName, attendees[], status, createdAt

networks/{networkId}/factchecks/{factId}
  headline, description, sourceUrl, source,
  submittedBy, submittedByName, votesTrue, votesFalse,
  votesMisleading, voters[], createdAt
```
