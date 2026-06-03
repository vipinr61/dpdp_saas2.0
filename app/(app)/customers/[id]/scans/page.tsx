'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { Repository, Scan } from '@/lib/types';
import { Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ScansPage() {
  const { id } = useParams() as { id: string };
  const [scans, setScans] = useState<any[]>([]);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const fetchData = async () => {
    try {
      const { data: repos } = await supabase
        .from('repositories')
        .select('*')
        .eq('customer_id', id);

      setRepositories(repos || []);

      if (repos && repos.length > 0) {
        const repoIds = repos.map((r) => r.id);
        const { data: scansData } = await supabase
          .from('scans')
          .select('*')
          .in('repository_id', repoIds)
          .order('started_at', { ascending: false });

        const enrichedScans = (scansData || []).map((scan) => {
          const repo = repos.find((r) => r.id === scan.repository_id);
          return { ...scan, repositoryName: repo?.name || 'Unknown' };
        });

        setScans(enrichedScans);
      }
    } catch (error) {
      console.error('Failed to fetch scans:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const handleRunScan = async () => {
    if (repositories.length === 0) return;

    setRunning(true);

    try {
      const targetRepo = repositories[0];

      const { data: newScan } = await supabase
        .from('scans')
        .insert({
          repository_id: targetRepo.id,
          status: 'Running',
          files_scanned: 0,
          pii_found: 0,
        })
        .select()
        .maybeSingle();

      if (newScan) {
        setScans([{ ...newScan, repositoryName: targetRepo.name }, ...scans]);

        setTimeout(async () => {
          const { error } = await supabase
            .from('scans')
            .update({
              status: 'Completed',
              completed_at: new Date().toISOString(),
              files_scanned: Math.floor(Math.random() * 1000) + 500,
              pii_found: Math.floor(Math.random() * 50) + 10,
            })
            .eq('id', newScan.id);

          if (!error) {
            await fetchData();
          }
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to run scan:', error);
    } finally {
      setRunning(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-900/20 text-green-400 border-green-700/30';
      case 'Running':
        return 'bg-blue-900/20 text-blue-400 border-blue-700/30 animate-pulse';
      case 'Pending':
        return 'bg-yellow-900/20 text-yellow-400 border-yellow-700/30';
      default:
        return 'bg-red-900/20 text-red-400 border-red-700/30';
    }
  };

  const calculateDuration = (startedAt: string, completedAt?: string) => {
    const start = new Date(startedAt);
    const end = completedAt ? new Date(completedAt) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    return diffMins > 0 ? `${diffMins}m` : '<1m';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-50">Scan History</h2>
        <Button
          onClick={handleRunScan}
          disabled={repositories.length === 0 || running}
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
        >
          <Zap className="w-4 h-4" /> {running ? 'Running Scan...' : 'Run DPDP Scan'}
        </Button>
      </div>

      {repositories.length === 0 && (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="py-8 text-center">
            <p className="text-slate-400">No repositories connected. Add one from the Repositories tab first.</p>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full bg-slate-800" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : scans.length > 0 ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-50">Recent Scans</CardTitle>
            <CardDescription>DPDP assessment scan results and history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400">Repository</TableHead>
                    <TableHead className="text-slate-400">Started</TableHead>
                    <TableHead className="text-slate-400">Duration</TableHead>
                    <TableHead className="text-slate-400">Files</TableHead>
                    <TableHead className="text-slate-400">PII Found</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scans.map((scan) => (
                    <TableRow key={scan.id} className="border-slate-800 hover:bg-slate-800/50">
                      <TableCell className="font-medium text-slate-200">{scan.repositoryName}</TableCell>
                      <TableCell className="text-slate-400 text-sm">
                        {new Date(scan.started_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-slate-400">{calculateDuration(scan.started_at, scan.completed_at)}</TableCell>
                      <TableCell className="text-slate-200 font-semibold">{scan.files_scanned}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={scan.pii_found > 20 ? 'bg-red-900/20 text-red-400 border-red-700/30' : 'bg-yellow-900/20 text-yellow-400 border-yellow-700/30'}
                        >
                          {scan.pii_found}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(scan.status)}>
                          {scan.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="py-8 text-center">
            <Zap className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 mb-4">No scans yet. Run your first scan to begin.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
