import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import Layout from './components/Layout';
import { Activity } from 'lucide-react';
import PWAInstallButton from './components/PWAInstallButton';

// Lazy load pages for faster initial rendering (Code Splitting)
import GlobalTracker from './components/GlobalTracker';
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const AdminDashboard = lazy(() => import('./pages/admin-dashboard/AdminDashboard'));
const PublicView = lazy(() => import('./pages/PublicView'));
const MediaDownload = lazy(() => import('./pages/MediaDownload'));
const ShortLinkRedirect = lazy(() => import('./pages/ShortLinkRedirect'));
const SmartRedirect = lazy(() => import('./pages/SmartRedirect'));
const PortfolioView = lazy(() => import('./pages/PortfolioView'));
const SimDatabaseView = lazy(() => import('./pages/SimDatabaseView'));
const SmsBomberView = lazy(() => import('./pages/SmsBomberView'));
const ChatbotView = lazy(() => import('./pages/ChatbotView'));
const AiImageGeneratorView = lazy(() => import('./pages/AiImageGeneratorView'));
const TikTokDownloaderView = lazy(() => import('./pages/TikTokDownloaderView'));
const HiddenAdminStats = lazy(() => import('./pages/HiddenAdminStats'));
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdminDashboard'));
import ProtectedRoute from './components/ProtectedRoute';

import { SkeletonDashboard } from './components/SkeletonLoader';

function HomeOrRedirect() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <SkeletonDashboard />;
  }

  // Redirect to their dashboard if logged in and profile loaded
  if (user && profile) {
    return <Navigate to={`/admin/${profile.username}`} replace />;
  }
  
  // Otherwise redirect to login
  return <Navigate to="/login" replace />;
}

function LoadingSpinner() {
  return <SkeletonDashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <GlobalTracker />
        <Layout>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<HomeOrRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin/:username" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/db/:admin_username" element={<SimDatabaseView />} />
              <Route path="/bomber/:admin_username" element={<SmsBomberView />} />
              <Route path="/cb/:admin_username" element={<ChatbotView />} />
              <Route path="/image/:admin_username" element={<AiImageGeneratorView />} />
              <Route path="/tiktok/:admin_username" element={<TikTokDownloaderView />} />
              <Route path="/super-saqib-admin" element={<SuperAdminDashboard />} />
              <Route path="/:username" element={<PublicView />} />
              <Route path="/:username/saqibadmin" element={<HiddenAdminStats />} />
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
        <PWAInstallButton />
      </BrowserRouter>
    </AuthProvider>
  );
}
