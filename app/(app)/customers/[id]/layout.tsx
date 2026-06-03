'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { Customer } from '@/lib/types';
import { FileText, Database, Zap, Search, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface TabItem {
  label: string;
  value: string;
  icon: any;
}

const tabs: TabItem[] = [
  { label: 'Overview', value: 'overview', icon: BarChart3 },
  { label: 'Repositories', value: 'repositories', icon: Database },
  { label: 'Scans', value: 'scans', icon: Zap },
  { label: 'Inventory', value: 'inventory', icon: Search },
  { label: 'Reports', value: 'reports', icon: FileText },
];

export default function CustomerLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { id: string };
}) {
  const { id } = useParams() as { id: string };
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const { data } = await supabase
          .from('customers')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        setCustomer(data);
      } catch (error) {
        console.error('Failed to fetch customer:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCustomer();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-64 mb-6 bg-slate-800" />
        <Skeleton className="h-12 w-full bg-slate-800" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-6">
        <p className="text-slate-400">Customer not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-50">{customer.name}</h1>
          <p className="text-slate-400 mt-1">{customer.industry} • Risk Score: {customer.overall_risk_score}</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-slate-900 border-b border-slate-800 w-full justify-start rounded-none p-0 h-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 rounded-none bg-transparent text-slate-400 hover:text-slate-200 data-[state=active]:text-slate-50"
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <CustomerOverview customer={customer} />
        </TabsContent>

        <TabsContent value="repositories" className="space-y-4">
          <RepositoriesTab customerId={customer.id} />
        </TabsContent>

        <TabsContent value="scans" className="space-y-4">
          <ScansTab customerId={customer.id} />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <InventoryTab customerId={customer.id} />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <ReportsTab customerId={customer.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CustomerOverview({ customer }: { customer: Customer }) {
  const [piiData, setPiiData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPiiData = async () => {
      try {
        const { data: repos } = await supabase
          .from('repositories')
          .select('id')
          .eq('customer_id', customer.id);

        if (!repos || repos.length === 0) {
          setLoading(false);
          return;
        }

        const repoIds = repos.map((r) => r.id);
        const { data: scans } = await supabase
          .from('scans')
          .select('id')
          .in('repository_id', repoIds);

        if (!scans || scans.length === 0) {
          setLoading(false);
          return;
        }

        const scanIds = scans.map((s) => s.id);
        const { data: findings } = await supabase
          .from('findings')
          .select('detection_type')
          .in('scan_id', scanIds);

        const types = ['Aadhaar', 'PAN', 'Passport', 'Email', 'Phone'];
        const distribution = types.map((type) => ({
          name: type,
          value: findings?.filter((f: any) => f.detection_type === type).length || 0,
        }));

        setPiiData(distribution);
      } catch (error) {
        console.error('Failed to fetch PII data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPiiData();
  }, [customer.id]);

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

  return (
    <div className="space-y-6">
      {loading ? (
        <Skeleton className="h-96 w-full bg-slate-800" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk Score Gauge */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-50 mb-4">Risk Assessment</h3>
            <div className="flex items-center justify-center">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#334155" strokeWidth="10" />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={
                      customer.overall_risk_score >= 70
                        ? '#ef4444'
                        : customer.overall_risk_score >= 50
                          ? '#f97316'
                          : '#22c55e'
                    }
                    strokeWidth="10"
                    strokeDasharray={`${(customer.overall_risk_score / 100) * 282.7} 282.7`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-slate-50">{customer.overall_risk_score}</div>
                    <div className="text-xs text-slate-400">/ 100</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PII Distribution */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-50 mb-4">PII Distribution</h3>
            <div className="space-y-3">
              {piiData.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                    <span className="text-sm text-slate-300">{item.name}</span>
                  </div>
                  <span className="font-semibold text-slate-50">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-50 mb-4">DPDP Readiness Summary</h3>
        <p className="text-slate-300 leading-relaxed">
          This organization shows{' '}
          <span className={customer.overall_risk_score >= 70 ? 'text-red-400 font-semibold' : 'text-yellow-400 font-semibold'}>
            {customer.overall_risk_score >= 70 ? 'high' : 'moderate'}
          </span>{' '}
          compliance risk. {customer.overall_risk_score >= 70 ? 'Immediate remediation is recommended.' : 'Continued monitoring is advised.'} Recent
          scans have identified personal data across multiple repositories, with particular concern around high-confidence detections of{' '}
          <span className="text-slate-50 font-medium">Aadhaar, PAN, and Email identifiers</span>. Focus on data minimization and access
          controls.
        </p>
      </div>
    </div>
  );
}

function RepositoriesTab({ customerId }: { customerId: string }) {
  return <div>Loading repositories...</div>;
}

function ScansTab({ customerId }: { customerId: string }) {
  return <div>Loading scans...</div>;
}

function InventoryTab({ customerId }: { customerId: string }) {
  return <div>Loading inventory...</div>;
}

function ReportsTab({ customerId }: { customerId: string }) {
  return <div>Loading reports...</div>;
}
