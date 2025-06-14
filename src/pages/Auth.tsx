
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Atom, Zap, Lock, User, Mail, Github } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already authenticated
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        window.location.href = '/';
      }
    };
    checkUser();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        if (data.user) {
          toast({
            title: "Autentificare reușită!",
            description: "Bun venit în sistemul cuantic!",
          });
          window.location.href = '/';
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: fullName,
            }
          }
        });
        
        if (error) throw error;
        
        toast({
          title: "Cont creat cu succes!",
          description: "Verificați email-ul pentru a confirma contul.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Eroare",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'github') => {
    setSocialLoading(provider);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
        }
      });
      
      if (error) throw error;
      
      // The redirect will happen automatically
    } catch (error: any) {
      toast({
        title: "Eroare autentificare",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSocialLoading(null);
    }
  };

  const GoogleIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Atom className="w-12 h-12 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
              <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-xl animate-pulse" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Autentificare Cuantică
            </h1>
          </div>
          <p className="text-xl text-blue-200 mb-2">Acces securizat la sistemul cuantic hibrid</p>
          <Badge variant="outline" className="border-cyan-400 text-cyan-400">
            <Lock className="w-4 h-4 mr-1" />
            Criptografie Cuantică
          </Badge>
        </header>

        {/* Auth Form */}
        <div className="max-w-md mx-auto">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-8 quantum-glow">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {isLogin ? 'Autentificare' : 'Înregistrare'}
              </h2>
              <p className="text-gray-300">
                {isLogin ? 'Accesați sistemul cuantic' : 'Creați un cont nou'}
              </p>
            </div>

            {/* Social Auth Buttons */}
            <div className="space-y-3 mb-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialAuth('google')}
                disabled={socialLoading !== null}
                className="w-full bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                {socialLoading === 'google' ? (
                  <Zap className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                <span className="ml-2">Continuați cu Google</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialAuth('github')}
                disabled={socialLoading !== null}
                className="w-full bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                {socialLoading === 'github' ? (
                  <Zap className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Github className="w-4 h-4 mr-2" />
                )}
                Continuați cu GitHub
              </Button>
            </div>

            <div className="relative mb-6">
              <Separator className="bg-white/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 px-3 text-sm text-gray-300">
                  sau
                </span>
              </div>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nume complet
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Introduceți numele complet"
                      className="pl-10 bg-white/20 border-white/30 text-white placeholder-gray-300"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Introduceți email-ul"
                    className="pl-10 bg-white/20 border-white/30 text-white placeholder-gray-300"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Parolă
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Introduceți parola"
                    className="pl-10 bg-white/20 border-white/30 text-white placeholder-gray-300"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || socialLoading !== null}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 animate-spin" />
                    Procesare...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    {isLogin ? 'Autentificare' : 'Înregistrare'}
                  </div>
                )}
              </Button>
            </form>

            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                {isLogin 
                  ? 'Nu aveți cont? Înregistrați-vă aici' 
                  : 'Aveți deja cont? Autentificați-vă'}
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
