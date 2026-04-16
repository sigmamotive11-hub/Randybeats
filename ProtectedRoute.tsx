import { ReactNode, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { firebaseUser, loading, isAdmin } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (loading) return;

    if (!firebaseUser) {
      // Redirect to login if not authenticated
      setLocation('/login');
      return;
    }

    if (requireAdmin && !isAdmin) {
      // Redirect to home if not admin
      setLocation('/');
      return;
    }
  }, [firebaseUser, loading, isAdmin, requireAdmin, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  // If not authenticated or not admin (when required), don't render children
  if (!firebaseUser || (requireAdmin && !isAdmin)) {
    return null;
  }

  return <>{children}</>;
}
