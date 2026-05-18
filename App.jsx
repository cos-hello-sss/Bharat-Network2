import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import AuthPage from './AuthPage';
import HomePage from './HomePage';
import NetworkPage from './NetworkPage';
import CreateNetworkPage from './CreateNetworkPage';
import AdminPage from './AdminPage';
import JoinNetworkPage from './JoinNetworkPage';
import Layout from './Layout';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? children : <Navigate to="/auth" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

const LoadingScreen = () => (
  <div className="min-h-screen bg-ink-950 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-full border-2 border-saffron-500/30 border-t-saffron-500 animate-spin" />
      <p className="text-ink-400 font-body text-sm">Loading Bharat Network…</p>
    </div>
  </div>
);

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route path="/join/:networkId" element={<JoinNetworkPage />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<HomePage />} />
        <Route path="network/create" element={<CreateNetworkPage />} />
        <Route path="network/:networkId/*" element={<NetworkPage />} />
        <Route path="admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
      </Route>
    </Routes>
  );
}
