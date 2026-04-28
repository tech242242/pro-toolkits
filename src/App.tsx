import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import Layout from './components/Layout';
import { Activity } from 'lucide-react';

// Lazy load pages for faster initial rendering (Code Splitting)
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const PublicView = lazy(() => import('./pages/PublicView'));
const MediaDownload = lazy(() => import('./pages/MediaDownload'));
const ShortLinkRedirect = lazy(() => import('./pages/ShortLinkRedirect'));
const SmartRedirect = lazy(() => import('./pages/SmartRedirect'));
const PortfolioView = lazy(() => import('./pages/PortfolioView'));

function HomeOrRedirect() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center relative w-full h-full text-[#F0F0F0]">
        <div className="flex flex-col items-center gap-6">
           <div className="w-16 h-16 border border-zinc-800 flex items-center justify-center relative before:absolute before:inset-0 before:border before:border-cyan-400 before:rotate-45 before:animate-spin">
              <Activity className="w-6 h-6 text-zinc-500 animate-pulse" />
           </div>
           <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.3em] animate-pulse">Initializing Subsystems</div>
        </div>
      </div>
    );
  }

  // Redirect to their dashboard if logged in and profile loaded
  if (user && profile) {
    return <Navigate to={`/admin/${profile.username}`} replace />;
  }
  
  // Otherwise redirect to login
  return <Navigate to="/login" replace />;
}

function LoadingSpinner() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center relative w-full h-full text-[#F0F0F0] min-h-[50vh]">
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 border border-zinc-800 flex items-center justify-center relative before:absolute before:inset-0 before:border before:border-cyan-400 before:rotate-45 before:animate-spin">
          <Activity className="w-6 h-6 text-zinc-500 animate-pulse" />
        </div>
        <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.3em] animate-pulse">Loading Subsystems</div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<HomeOrRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin/:username" element={<AdminDashboard />} />
              <Route path="/:username" element={<PublicView />} />
              <Route path="/:username/link/:slug" element={<ShortLinkRedirect />} />
              <Route path="/:username/media/:toolId/:filename" element={<MediaDownload />} />
              <Route path="/:username/media/:toolId" element={<MediaDownload />} />
              <Route path="/:username/m/:slug" element={<SmartRedirect />} />
              <Route path="/:username/v/:slug" element={<SmartRedirect />} />
              <Route path="/:username/wb/:slug" element={<PortfolioView />} />
              <Route path="/:username/:slug" element={<SmartRedirect />} />
            </Routes>
          </Suspense>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}
