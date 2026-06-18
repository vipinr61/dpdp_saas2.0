'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Customer } from '@/lib/types';
import { Plus, MoreHorizontal, Zap, Eye, Trash2, Loader } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

export default function CustomersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [scanningCustomerId, setScanningCustomerId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', industry: '' });

  const tenantId = user?.tenant_id;

  const fetchCustomers = async () => {
    if (!tenantId) return;
    try {
      const { data } = await supabase
        .from('customers')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
      setCustomers(data || []);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenantId) fetchCustomers();
  }, [tenantId]);

  const handleAddCustomer = async () => {
    if (!formData.name || !formData.industry || !tenantId) return;

    try {
      const { error } = await supabase.from('customers').insert({
        tenant_id: tenantId,
        name: formData.name,
        industry: formData.industry,
        status: 'Active',
        overall_risk_score: 50,
      });

      if (!error) {
        setFormData({ name: '', industry: '' });
        setOpen(false);
        await fetchCustomers();
      }
    } catch (error) {
      console.error('Failed to add customer:', error);
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'bg-red-900/20 text-red-400 border-red-700/30';
    if (score >= 50) return 'bg-yellow-900/20 text-yellow-400 border-yellow-700/30';
    return 'bg-green-900/20 text-green-400 border-green-700/30';
  };

  const handleRunScan = async (customer: Customer) => {
    setScanningCustomerId(customer.id);

    try {
      // Get repositories for this customer
      const { data: repos } = await supabase
        .from('repositories')
        .select('*')
        .eq('customer_id', customer.id)
        .limit(1);

      let targetRepo = repos?.[0];

      // If no repository exists, create a default one
      if (!targetRepo) {
        const { data: newRepo } = await supabase
          .from('repositories')
          .insert({
            customer_id: customer.id,
            type: 'AWS S3',
            name: `${customer.name} - Primary Data Source`,
            status: 'Connected',
          })
          .select()
          .maybeSingle();

        targetRepo = newRepo;
      }

      if (!targetRepo) {
        setScanningCustomerId(null);
        return;
      }

      // Create a scan
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
        // Simulate scan completion after 3 seconds
        setTimeout(async () => {
          const filesScanned = Math.floor(Math.random() * 1000) + 500;
          const piiFound = Math.floor(Math.random() * 50) + 10;
          const newRiskScore = Math.min(100, Math.max(10, customer.overall_risk_score + Math.floor(Math.random() * 20) - 10));

          await supabase
            .from('scans')
            .update({
              status: 'Completed',
              completed_at: new Date().toISOString(),
              files_scanned: filesScanned,
              pii_found: piiFound,
            })
            .eq('id', newScan.id);

          // Update customer's last assessment date and risk score
          await supabase
            .from('customers')
            .update({
              last_assessment_date: new Date().toISOString(),
              overall_risk_score: newRiskScore,
            })
            .eq('id', customer.id);

          await fetchCustomers();
        }, 3000);

        // Navigate to the scans tab for this customer
        router.push(`/customers/${customer.id}/scans`);
      }
    } catch (error) {
      console.error('Failed to run scan:', error);
    } finally {
      setScanningCustomerId(null);
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) return;

    try {
      await supabase.from('customers').delete().eq('id', customerId);
      await fetchCustomers();
    } catch (error) {
      console.error('Failed to delete customer:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-50">Customer Engagements</h1>
          <p className="text-slate-400 mt-1">Manage and assess your client organizations</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
              <Plus className="w-4 h-4" /> Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-slate-50">Add New Customer</DialogTitle>
              <DialogDescription>Enter details for the new customer organization</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-slate-200">Customer Name</Label>
                <Input
                  placeholder="e.g., TechCorp India Ltd"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-2 bg-slate-800 border-slate-700 text-slate-50"
                />
              </div>
              <div>
                <Label className="text-slate-200">Industry</Label>
                <Input
                  placeholder="e.g., Financial Services"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="mt-2 bg-slate-800 border-slate-700 text-slate-50"
                />
              </div>
              <Button
                onClick={handleAddCustomer}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Create Customer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-50">All Customers</CardTitle>
          <CardDescription>Manage your client organizations and assessments</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full bg-slate-800" />
              ))}
            </div>
          ) : customers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400">Name</TableHead>
                    <TableHead className="text-slate-400">Industry</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400">Risk Score</TableHead>
                    <TableHead className="text-slate-400">Last Assessment</TableHead>
                    <TableHead className="text-slate-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id} className="border-slate-800 hover:bg-slate-800/50">
                      <TableCell className="font-medium text-slate-200">{customer.name}</TableCell>
                      <TableCell className="text-slate-400">{customer.industry}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${
                            customer.status === 'Active'
                              ? 'bg-green-900/20 text-green-400 border-green-700/30'
                              : 'bg-slate-700/50 text-slate-400 border-slate-600/50'
                          }`}
                        >
                          {customer.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRiskColor(customer.overall_risk_score)} variant="outline">
                          {customer.overall_risk_score}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-400">
                        {customer.last_assessment_date
                          ? new Date(customer.last_assessment_date).toLocaleDateString()
                          : 'Never'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800">
                            <DropdownMenuLabel className="text-slate-50">Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-800" />
                            <DropdownMenuItem
                              onClick={() => handleRunScan(customer)}
                              disabled={scanningCustomerId === customer.id}
                              className="text-emerald-400 focus:bg-slate-800 cursor-pointer"
                            >
                              {scanningCustomerId === customer.id ? (
                                <><Loader className="w-4 h-4 mr-2 animate-spin" /> Running Scan...</>
                              ) : (
                                <><Zap className="w-4 h-4 mr-2" /> Run DPDP Scan</>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="focus:bg-slate-800 cursor-pointer">
                              <Link href={`/customers/${customer.id}`} className="text-slate-300">
                                <Eye className="w-4 h-4 mr-2" /> View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-800" />
                            <DropdownMenuItem
                              onClick={() => handleDeleteCustomer(customer.id)}
                              className="text-red-400 focus:bg-slate-800 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-400">No customers yet. Create one to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
