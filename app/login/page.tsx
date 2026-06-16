'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Shield, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@techsecure.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debug, setDebug] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setDebug('Attempting sign in...');

    try {
      setDebug('Calling Supabase auth.signInWithPassword...');

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (authError) {
        setDebug(`Auth error: ${authError.message}`);
        setError(authError.message || 'Invalid credentials');
        console.error('Sign in error:', authError);
        setLoading(false);
        return;
      }

      if (!data || !data.session) {
        setDebug('No session returned from auth');
        setError('No session returned. Please try again.');
        setLoading(false);
        return;
      }

      setDebug('Session created, redirecting to dashboard...');

      // Hard navigation ensures the new session is picked up cleanly
      window.location.href = '/dashboard';
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setDebug(`Caught error: ${message}`);
      setError(message);
      console.error('Sign in error:', err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-emerald-500" />
            <h1 className="text-3xl font-bold text-slate-50">Privotek</h1>
          </div>
          <p className="text-slate-400">Your Data, Our Mission</p>
        </div>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Access your DPDP Assessment Dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Email</label>
                <Input
                  type="email"
                  placeholder="admin@techsecure.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-slate-50"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Password</label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-slate-50"
                  disabled={loading}
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-900/30 border border-red-700 rounded text-red-200 text-sm flex gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Login Error</p>
                    <p>{error}</p>
                  </div>
                </div>
              )}

              {debug && (
                <div className="p-2 bg-blue-900/20 border border-blue-700/50 rounded text-blue-300 text-xs font-mono">
                  {debug}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-800">
              <p className="text-xs text-slate-400 text-center mb-3 font-semibold">Demo Credentials</p>
              <div className="space-y-2 text-xs text-slate-400">
                <div className="bg-slate-800/50 p-2 rounded">
                  <p>Email: <span className="text-slate-200 font-mono">admin@techsecure.com</span></p>
                  <p className="mt-1">Password: <span className="text-slate-200 font-mono">password123</span></p>
                </div>
                <p className="text-xs text-slate-500">Use these to sign in with admin access</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
