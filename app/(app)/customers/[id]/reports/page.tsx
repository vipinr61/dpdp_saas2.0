'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Report } from '@/lib/types';
import { FileDown, Plus, Loader } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ReportsPage() {
  const { id } = useParams() as { id: string };
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchReports = async () => {
    try {
      const { data } = await supabase
        .from('reports')
        .select('*')
        .eq('customer_id', id)
        .order('created_at', { ascending: false });

      setReports(data || []);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchReports();
  }, [id]);

  const handleGenerateReport = async () => {
    setGenerating(true);

    setTimeout(async () => {
      try {
        const now = new Date();
        const month = now.toLocaleString('default', { month: 'long', year: 'numeric' });
        const reportName = `DPDP Assessment Report - ${month}`;

        const { error } = await supabase.from('reports').insert({
          customer_id: id,
          report_name: reportName,
        });

        if (!error) {
          await fetchReports();
        }
      } catch (error) {
        console.error('Failed to generate report:', error);
      } finally {
        setGenerating(false);
      }
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-50">DPDP Reports</h2>
        <Button
          onClick={handleGenerateReport}
          disabled={generating}
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
        >
          {generating ? (
            <>
              <Loader className="w-4 h-4 animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" /> Generate Report
            </>
          )}
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-32 bg-slate-800" />
          ))}
        </div>
      ) : reports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((report) => (
            <Card key={report.id} className="bg-slate-900 border-slate-800">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-50">{report.report_name}</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Generated {new Date(report.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 gap-2 mt-4"
                  variant="outline"
                >
                  <FileDown className="w-4 h-4" /> Download PDF
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="py-12 text-center">
            <FileDown className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 mb-4">No reports generated yet</p>
            <Button
              onClick={handleGenerateReport}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Generate Your First Report
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
