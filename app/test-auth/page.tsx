'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TestAuthPage() {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<any>(null);

  const testLogin = async () => {
    setLoading(true);
    setTestResult('Testing login...');

    try {
      // Step 1: Check current session
      const { data: sessionData } = await supabase.auth.getSession();
      setSessionInfo(sessionData);

      if (sessionData.session) {
        setTestResult('Already logged in as: ' + sessionData.session.user.email);
        return;
      }

      // Step 2: Attempt login
      setTestResult('Attempting login with admin@techsecure.com...');

      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@techsecure.com',
        password: 'password123',
      });

      if (error) {
        setTestResult(`Login failed: ${error.message}`);
        setSessionInfo(error);
        return;
      }

      if (!data.session) {
        setTestResult('Login succeeded but no session returned');
        return;
      }

      setTestResult(`Login succeeded! User: ${data.session.user.email}`);
      setSessionInfo(data.session.user);

      // Wait a moment and redirect
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    } catch (err: any) {
      setTestResult(`Error: ${err.message}`);
      setSessionInfo(err);
    } finally {
      setLoading(false);
    }
  };

  const testLogout = async () => {
    setLoading(true);
    setTestResult('Logging out...');

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        setTestResult(`Logout failed: ${error.message}`);
        return;
      }

      setTestResult('Logged out successfully');
      setSessionInfo(null);
    } catch (err: any) {
      setTestResult(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkSession = async () => {
    setLoading(true);
    setTestResult('Checking session...');

    try {
      const { data } = await supabase.auth.getSession();
      setSessionInfo(data.session?.user || null);

      if (data.session?.user) {
        setTestResult(`Current user: ${data.session.user.email}`);
      } else {
        setTestResult('No active session');
      }
    } catch (err: any) {
      setTestResult(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 mb-2">Test Authentication</h1>
          <p className="text-slate-400">Test Supabase auth connection directly</p>
        </div>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-50">Quick Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={testLogin}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {loading ? 'Testing...' : 'Test Login'}
              </Button>
              <Button
                onClick={checkSession}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Check Session
              </Button>
              <Button
                onClick={testLogout}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Logout
              </Button>
            </div>

            {testResult && (
              <div className="p-3 bg-slate-800 border border-slate-700 rounded text-slate-200 text-sm font-mono">
                {testResult}
              </div>
            )}

            {sessionInfo && (
              <div className="p-3 bg-slate-800 border border-slate-700 rounded">
                <p className="text-slate-400 text-sm mb-2">Session Info:</p>
                <pre className="text-slate-300 text-xs overflow-auto bg-slate-900 p-2 rounded">
                  {JSON.stringify(sessionInfo, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button className="bg-slate-700 hover:bg-slate-600 text-white" onClick={() => window.location.href = '/login'}>
            Back to Login
          </Button>
          <Button className="bg-slate-700 hover:bg-slate-600 text-white" onClick={() => window.location.href = '/debug'}>
            Connection Debug
          </Button>
        </div>
      </div>
    </div>
  );
}
