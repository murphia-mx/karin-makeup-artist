import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthService } from '../services/AuthService';
import type { Session } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Check active session via Strategy Provider
    AuthService.getSession().then((session) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes via Strategy Provider
    const subscription = AuthService.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-surface flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-text animate-spin" />
      </div>
    );
  }

  if (!session) {
    // Redirect to login if unauthenticated, saving the intented location
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Future Role-based authorization logic goes here (e.g. checking user metadata or custom claims)
  // const userRole = session.user.user_metadata?.role || 'admin';
  // if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
  //   return <Navigate to="/unauthorized" replace />;
  // }

  return <Outlet />;
};
