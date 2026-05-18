import React from 'react';
// src/pages/AuthPage.jsx
import { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function AuthPage() {
  const [mode, setMode] = useState('signin'); // signin | signup | reset
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle, signUpWithEmail, signInWithEmail, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setInfo('');
    setLoading(true);
    try {
      if (mode === 'reset') {
        await resetPassword(form.email);
        setInfo('Password reset email sent. Check your inbox.');
        setMode('signin');
      } else if (mode === 'signup') {
        if (!form.name.trim()) return setError('Please enter your name.');
        await signUpWithEmail(form.email, form.password, form.name.trim());
        navigate('/');
      } else {
        await signInWithEmail(form.email, form.password);
        navigate('/');
      }
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const googleSignIn = async () => {
    setError(''); setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-950 flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] bg-ink-900 border-r border-ink-800 p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23f97316\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}
        />
        <div className="relative">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-saffron-500 flex items-center justify-center shadow-lg shadow-saffron-500/30">
              <Shield size={20} className="text-white" />
            </div>
            <span className="font-display text-xl font-bold text-ink-50">Bharat Network</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-ink-50 leading-tight mb-6">
            Truth, verified<br />
            <span className="text-saffron-400 italic">together.</span>
          </h1>
          <p className="text-ink-400 font-body leading-relaxed text-lg">
            A collaborative platform to fight misinformation and propaganda through community fact-checking and open discourse.
          </p>
        </div>
        <div className="relative space-y-4">
          {[
            { label: 'Community Networks', desc: 'Create or join trusted circles for curated discourse' },
            { label: 'Live Fact Checking', desc: 'Vote on news accuracy with your community' },
            { label: 'Moderated Spaces', desc: 'Safe, admin-monitored discussion environments' },
          ].map(f => (
            <div key={f.label} className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-saffron-500 mt-2 shrink-0" />
              <div>
                <div className="text-ink-200 font-semibold text-sm">{f.label}</div>
                <div className="text-ink-500 text-sm">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-saffron-500 flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <span className="font-display text-xl font-bold text-ink-50">Bharat Network</span>
          </div>

          <h2 className="font-display text-3xl font-bold text-ink-50 mb-2">
            {mode === 'signin' ? 'Welcome back' : mode === 'signup' ? 'Join the network' : 'Reset password'}
          </h2>
          <p className="text-ink-400 mb-8">
            {mode === 'signin' ? 'Sign in to your account to continue.' : mode === 'signup' ? 'Create your account to get started.' : 'Enter your email to receive a reset link.'}
          </p>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm mb-5">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          {info && (
            <div className="flex items-center gap-2 p-3 bg-jade-500/10 border border-jade-500/20 rounded-lg text-jade-400 text-sm mb-5">
              {info}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            {mode === 'signup' && (
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
                <input name="name" type="text" placeholder="Full name" value={form.name}
                  onChange={handle} className="input pl-10" required />
              </div>
            )}
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
              <input name="email" type="email" placeholder="Email address" value={form.email}
                onChange={handle} className="input pl-10" required />
            </div>
            {mode !== 'reset' && (
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
                <input name="password" type={showPw ? 'text' : 'password'} placeholder="Password"
                  value={form.password} onChange={handle} className="input pl-10 pr-10" required minLength={6} />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            )}
            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2">
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
              {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
            </button>
          </form>

          {mode !== 'reset' && (
            <>
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-ink-800" />
                <span className="text-ink-600 text-sm">or</span>
                <div className="flex-1 h-px bg-ink-800" />
              </div>
              <button onClick={googleSignIn} disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-ink-800 hover:bg-ink-700 border border-ink-700 rounded-lg transition-all duration-200 font-semibold text-ink-200 disabled:opacity-60">
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </>
          )}

          <div className="mt-6 text-center text-sm text-ink-500 space-y-1">
            {mode === 'signin' && (
              <>
                <div><button onClick={() => setMode('reset')} className="text-saffron-400 hover:text-saffron-300">Forgot password?</button></div>
                <div>No account? <button onClick={() => setMode('signup')} className="text-saffron-400 hover:text-saffron-300">Sign up</button></div>
              </>
            )}
            {mode === 'signup' && (
              <div>Already have an account? <button onClick={() => setMode('signin')} className="text-saffron-400 hover:text-saffron-300">Sign in</button></div>
            )}
            {mode === 'reset' && (
              <div><button onClick={() => setMode('signin')} className="text-saffron-400 hover:text-saffron-300">← Back to sign in</button></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function friendlyError(code) {
  const map = {
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
  };
  return map[code] || 'Something went wrong. Please try again.';
}
