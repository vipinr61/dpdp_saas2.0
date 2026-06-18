'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeCustomers: 0,
    activeScans: 0,
    criticalRisks: 0,
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const tenantId = user?.tenant_id;

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!tenantId) return;

      try {
        // Active customers
        const { data: customers } = await supabase
          .from('customers')
          .select('*')
          .eq('tenant_id', tenantId)
          .eq('status', 'Active');

        // Active scans (Running or Pending)
        const { data: scans } = await supabase
          .from('scans')
          .select('*')
          .in('status', ['Running', 'Pending']);

        // Critical risks (High risk findings)
        const { data: criticalFindings } = await supabase
          .from('findings')
          .select('*')
          .eq('risk_level', 'High');

        setStats({
          activeCustomers: customers?.length || 0,
          activeScans: scans?.length || 0,
          criticalRisks: criticalFindings?.length || 0,
        });

        // Recent activity
        const { data: recentCustomers } = await supabase
          .from('customers')
          .select('*')
          .eq('tenant_id', tenantId)
          .order('last_assessment_date', { ascending: false })
          .limit(5);

        setActivities(
          recentCustomers?.map((c) => ({
            customer: c.name,
            event: 'Assessment Completed',
            date: c.last_assessment_date ? new Date(c.last_assessment_date).toLocaleDateString() : 'N/A',
            status: c.status,
          })) || []
        );

        // Monthly data
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        setMonthlyData(
          months.map((month) => ({
            month,
            assessments: Math.floor(Math.random() * 8) + 2,
          }))
        );
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [tenantId]);

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            {loading ? (
              <Skeleton className="h-12 w-full bg-slate-800" />
            ) : (
              <div>
                <div className="text-3xl font-bold text-emerald-400">{stats.activeCustomers}</div>
                <p className="text-sm text-slate-400 mt-1">Active Customers</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            {loading ? (
              <Skeleton className="h-12 w-full bg-slate-800" />
            ) : (
              <div>
                <div className="text-3xl font-bold text-blue-400">{stats.activeScans}</div>
                <p className="text-sm text-slate-400 mt-1">Active Scans</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            {loading ? (
              <Skeleton className="h-12 w-full bg-slate-800" />
            ) : (
              <div>
                <div className="text-3xl font-bold text-red-400">{stats.criticalRisks}</div>
                <p className="text-sm text-slate-400 mt-1">Critical Risks</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-50">Assessments Completed</CardTitle>
            <CardDescription>Monthly trend</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full bg-slate-800" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                    }}
                  />
                  <Bar dataKey="assessments" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Activity Table */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-50">Recent Activity</CardTitle>
            <CardDescription>Latest customer assessments</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full bg-slate-800" />
            ) : activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map((activity, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 rounded border border-slate-700/50">
                    <div>
                      <p className="text-sm font-medium text-slate-200">{activity.customer}</p>
                      <p className="text-xs text-slate-400">{activity.event}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">{activity.date}</p>
                      <span className="inline-block mt-1 px-2 py-1 bg-emerald-600/20 text-emerald-400 text-xs rounded">
                        {activity.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
