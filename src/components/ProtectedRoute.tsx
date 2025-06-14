
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Atom, Zap } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Atom className="w-12 h-12 text-cyan-400 animate-spin" style={{ animationDuration: '2s' }} />
              <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-xl animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Inițializare sistem cuantic</h2>
              <p className="text-gray-300">Se verifică autentificarea...</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!user) {
    window.location.href = '/auth';
    return null;
  }

  return <>{children}</>;
};
