'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DebugPage() {
  const [status, setStatus] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Test 1: Check if supabase client is initialized
        setStatus((prev: any) => ({ ...prev, clientInit: !!supabase }));

        // Test 2: Check URL and key
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        setStatus((prev: any) => ({
          ...prev,
          urlConfigured: !!url,
          keyConfigured: !!key,
          url: url?.slice(0, 30) + '...',
        }));

        // Test 3: Try to read public data (if any)
        const { data: authUsers, error: usersError } = await supabase.auth.admin.listUsers();

        if (usersError) {
          setStatus((prev: any) => ({
            ...prev,
            authError: usersError.message,
          }));
        } else {
          setUsers(authUsers?.users || []);
          setStatus((prev: any) => ({
            ...prev,
            authUsersCount: authUsers?.users?.length || 0,
          }));
        }

        // Test 4: Try basic query
        const { data: customersData, error: customersError } = await supabase
          .from('customers')
          .select('count');

        setStatus((prev: any) => ({
          ...prev,
          customersAccessible: !customersError,
          customersError: customersError?.message,
        }));
      } catch (err: any) {
        setStatus((prev: any) => ({
          ...prev,
          criticalError: err.message,
        }));
      } finally {
        setLoading(false);
      }
    };

    checkConnection();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 mb-2">Supabase Connection Debug</h1>
          <p className="text-slate-400">Check if Supabase is properly configured</p>
        </div>

        {loading && <p className="text-slate-400">Checking connection...</p>}

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-50">Configuration Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-400">Client Initialized</p>
                <p className="text-lg font-semibold text-emerald-400">
                  {status.clientInit ? '✓ YES' : '✗ NO'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">URL Configured</p>
                <p className="text-lg font-semibold text-emerald-400">
                  {status.urlConfigured ? '✓ YES' : '✗ NO'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Key Configured</p>
                <p className="text-lg font-semibold text-emerald-400">
                  {status.keyConfigured ? '✓ YES' : '✗ NO'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Supabase URL</p>
                <p className="text-xs text-slate-300 font-mono">{status.url}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-50">Auth Users</CardTitle>
          </CardHeader>
          <CardContent>
            {status.authError ? (
              <div className="p-3 bg-red-900/30 border border-red-700 rounded text-red-200 text-sm">
                <p className="font-semibold">Error</p>
                <p>{status.authError}</p>
              </div>
            ) : (
              <div>
                <p className="text-emerald-400 font-semibold mb-4">
                  {status.authUsersCount || 0} users found
                </p>
                <div className="space-y-2">
                  {users.length > 0 ? (
                    users.map((user: any) => (
                      <div key={user.id} className="p-2 bg-slate-800 rounded text-sm text-slate-200">
                        {user.email}
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400">No auth users found</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-50">Database Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-slate-400">Can Access Customers Table</p>
                <p className="text-lg font-semibold text-emerald-400">
                  {status.customersAccessible ? '✓ YES' : '✗ NO'}
                </p>
              </div>
              {status.customersError && (
                <div className="p-3 bg-red-900/30 border border-red-700 rounded text-red-200 text-sm">
                  {status.customersError}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {status.criticalError && (
          <Card className="bg-red-900/20 border-red-700">
            <CardHeader>
              <CardTitle className="text-red-400">Critical Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-200">{status.criticalError}</p>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => window.location.href = '/login'}>
            Back to Login
          </Button>
          <Button variant="outline" className="border-slate-700 text-slate-200" onClick={() => window.location.reload()}>
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}
