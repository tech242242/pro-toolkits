import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { Activity } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const { username } = useParams();

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center relative w-full h-full text-[#F0F0F0] min-h-[50vh]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border border-zinc-800 flex items-center justify-center relative before:absolute before:inset-0 before:border before:border-cyan-400 before:rotate-45 before:animate-spin">
            <Activity className="w-6 h-6 text-zinc-500 animate-pulse" />
          </div>
          <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.3em] animate-pulse">Verifying Authorization</div>
        </div>
      </div>
    );
  }

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If logged in but profile not loaded yet, wait (loading check above usually covers this, but being safe)
  if (!profile) {
     return <div className="flex-1 flex items-center justify-center text-cyan-400 font-mono text-[10px] tracking-widest uppercase">Fetching Profile Data...</div>;
  }

  // Handle username-based authorization if the route has a username param
  if (username && profile.username !== username) {
    // List of admin usernames that can access any dashboard
    const admins = ['mrsaqib242', 'mrsaqib243', 'ali', 'fahad'];
    if (!admins.includes(profile.username)) {
      return <Navigate to={`/admin/${profile.username}`} replace />;
    }
  }

  return <>{children}</>;
}
