'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { Repository } from '@/lib/types';
import { Plus, Cloud, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function RepositoriesPage() {
  const { id } = useParams() as { id: string };
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [testing, setTesting] = useState(false);
  const [formData, setFormData] = useState({
    type: 'AWS S3' as 'AWS S3' | 'OneDrive' | 'SharePoint',
    name: '',
  });

  const fetchRepositories = async () => {
    try {
      const { data } = await supabase
        .from('repositories')
        .select('*')
        .eq('customer_id', id)
        .order('created_at', { ascending: false });

      setRepositories(data || []);
    } catch (error) {
      console.error('Failed to fetch repositories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchRepositories();
  }, [id]);

  const handleAddRepository = async () => {
    if (!formData.name) return;

    try {
      const { error } = await supabase.from('repositories').insert({
        customer_id: id,
        type: formData.type,
        name: formData.name,
        status: 'Connected',
      });

      if (!error) {
        setFormData({ type: 'AWS S3', name: '' });
        setOpen(false);
        await fetchRepositories();
      }
    } catch (error) {
      console.error('Failed to add repository:', error);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTimeout(() => setTesting(false), 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Connected':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'Error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'AWS S3':
        return '☁️';
      case 'OneDrive':
        return '📁';
      default:
        return '🔗';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-50">Data Sources</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
              <Plus className="w-4 h-4" /> Add Data Source
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-slate-50">Connect Data Source</DialogTitle>
              <DialogDescription>Add a new data repository for scanning</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-slate-200">Repository Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger className="mt-2 bg-slate-800 border-slate-700 text-slate-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="AWS S3" className="text-slate-50">AWS S3</SelectItem>
                    <SelectItem value="OneDrive" className="text-slate-50">OneDrive</SelectItem>
                    <SelectItem value="SharePoint" className="text-slate-50">SharePoint</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-200">Repository Name</Label>
                <Input
                  placeholder="e.g., Production Data Lake"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-2 bg-slate-800 border-slate-700 text-slate-50"
                />
              </div>
              <div>
                <Label className="text-slate-200 text-xs">Connection Details</Label>
                <Input
                  placeholder="Connection string or path"
                  className="mt-2 bg-slate-800 border-slate-700 text-slate-50 text-sm"
                />
              </div>
              <Button
                onClick={handleTestConnection}
                variant="outline"
                className="w-full text-slate-200 border-slate-700 hover:bg-slate-800"
                disabled={testing}
              >
                {testing ? 'Testing...' : 'Test Connection'}
              </Button>
              <Button
                onClick={handleAddRepository}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Connect Source
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 bg-slate-800" />
          ))}
        </div>
      ) : repositories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {repositories.map((repo) => (
            <Card key={repo.id} className="bg-slate-900 border-slate-800 hover:border-emerald-600/50 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl">{getSourceIcon(repo.type)}</div>
                  {getStatusIcon(repo.status)}
                </div>
                <h3 className="font-semibold text-slate-50">{repo.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{repo.type}</p>
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <p className="text-xs text-slate-400">Last synced</p>
                  <p className="text-sm text-slate-200">{new Date(repo.last_sync).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="py-12 text-center">
            <Cloud className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 mb-4">No data sources connected yet</p>
            <Button
              onClick={() => setOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Connect First Source
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
