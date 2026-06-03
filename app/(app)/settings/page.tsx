'use client';

import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsPage() {
  const { user, loading } = useAuth();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-50">Settings</h1>
        <p className="text-slate-400 mt-1">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Settings */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-50">Account Information</CardTitle>
            <CardDescription>Your profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <>
                <Skeleton className="h-4 w-full bg-slate-800" />
                <Skeleton className="h-4 w-full bg-slate-800" />
                <Skeleton className="h-4 w-full bg-slate-800" />
              </>
            ) : (
              <>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Name</p>
                  <p className="text-lg font-semibold text-slate-50 mt-1">{user?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Email</p>
                  <p className="text-lg font-semibold text-slate-50 mt-1">{user?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Role</p>
                  <p className="text-lg font-semibold text-slate-50 mt-1">{user?.role}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-50">Preferences</CardTitle>
            <CardDescription>Configure your settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-slate-200 font-medium mb-2">Theme</p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 border-slate-700 text-slate-200 hover:bg-slate-800">
                  Dark
                </Button>
                <Button variant="outline" className="flex-1 border-slate-700 text-slate-400 hover:bg-slate-800">
                  Light
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-200 font-medium mb-2">Notifications</p>
              <p className="text-xs text-slate-400">Email notifications for scan completions and risk alerts</p>
            </div>
          </CardContent>
        </Card>

        {/* API Keys */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-50">API Configuration</CardTitle>
            <CardDescription>Manage integrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-400">API integrations and keys are coming soon.</p>
            <Button variant="outline" className="w-full border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-slate-50" disabled>
              Generate API Key (Coming Soon)
            </Button>
          </CardContent>
        </Card>

        {/* Support */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-50">Support & Documentation</CardTitle>
            <CardDescription>Get help and resources</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-slate-50">
              📖 Documentation
            </Button>
            <Button variant="outline" className="w-full justify-start border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-slate-50">
              💬 Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
