import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Music, Menu, X } from 'lucide-react';
import { useLocation } from 'wouter';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useState } from 'react';

export function Navigation() {
  const { user, isAdmin, firebaseUser } = useAuth();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await signOut(auth);
      setLocation('/');
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    setLocation('/login');
    setIsMobileMenuOpen(false);
  };

  const handleAdminDashboard = () => {
    setLocation('/admin');
    setIsMobileMenuOpen(false);
  };

  const handleDashboard = () => {
    setLocation('/dashboard');
    setIsMobileMenuOpen(false);
  };

  const handleHome = () => {
    setLocation('/');
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={handleHome}>
          <Music className="w-6 h-6 text-accent" />
          <span className="text-xl font-bold text-foreground hidden sm:inline">RandyBeats</span>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={handleHome}
            className="text-foreground hover:text-accent transition-colors text-sm"
          >
            Store
          </button>
          {user && (
            <button
              onClick={handleDashboard}
              className="text-foreground hover:text-accent transition-colors text-sm"
            >
              My Beats
            </button>
          )}
          {isAdmin && (
            <button
              onClick={handleAdminDashboard}
              className="text-foreground hover:text-accent transition-colors text-sm"
            >
              Admin
            </button>
          )}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-2">
          {!firebaseUser ? (
            <Button
              onClick={handleLogin}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              size="sm"
            >
              Login
            </Button>
          ) : (
            <>
              <span className="text-xs text-muted-foreground">
                {user?.email?.substring(0, 20)}
              </span>
              <Button
                onClick={handleLogout}
                disabled={isLoading}
                variant="outline"
                className="border-border text-foreground hover:bg-card"
                size="sm"
              >
                {isLoading ? 'Logging out...' : 'Logout'}
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-foreground hover:text-accent transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-card border-b border-border">
          <div className="container py-4 space-y-3">
            <button
              onClick={handleHome}
              className="block w-full text-left px-4 py-2 text-foreground hover:text-accent transition-colors rounded hover:bg-muted"
            >
              Store
            </button>
            {user && (
              <button
                onClick={handleDashboard}
                className="block w-full text-left px-4 py-2 text-foreground hover:text-accent transition-colors rounded hover:bg-muted"
              >
                My Beats
              </button>
            )}
            {isAdmin && (
              <button
                onClick={handleAdminDashboard}
                className="block w-full text-left px-4 py-2 text-foreground hover:text-accent transition-colors rounded hover:bg-muted"
              >
                Admin
              </button>
            )}

            <div className="border-t border-border pt-3 mt-3">
              {!firebaseUser ? (
                <Button
                  onClick={handleLogin}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                  size="sm"
                >
                  Login
                </Button>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground px-4 py-2">
                    {user?.email}
                  </p>
                  <Button
                    onClick={handleLogout}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full border-border text-foreground hover:bg-card"
                    size="sm"
                  >
                    {isLoading ? 'Logging out...' : 'Logout'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
