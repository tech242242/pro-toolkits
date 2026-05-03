import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { Activity } from 'lucide-react';
import { SkeletonDashboard } from './SkeletonLoader';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const { username } = useParams();

  if (loading) {
    return <SkeletonDashboard />;
  }

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!profile) {
     return <SkeletonDashboard />;
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
