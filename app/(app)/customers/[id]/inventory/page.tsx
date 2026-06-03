'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { supabase } from '@/lib/supabase';
import { Repository, Finding } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const ITEMS_PER_PAGE = 10;

export default function InventoryPage() {
  const { id } = useParams() as { id: string };
  const [findings, setFindings] = useState<Finding[]>([]);
  const [filtered, setFiltered] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  const fetchFindings = async () => {
    try {
      const { data: repos } = await supabase
        .from('repositories')
        .select('id')
        .eq('customer_id', id);

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
      const { data } = await supabase
        .from('findings')
        .select('*')
        .in('scan_id', scanIds)
        .order('created_at', { ascending: false });

      setFindings(data || []);
    } catch (error) {
      console.error('Failed to fetch findings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchFindings();
  }, [id]);

  useEffect(() => {
    let result = findings;

    if (searchTerm) {
      result = result.filter((f) => f.file_path.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (riskFilter) {
      result = result.filter((f) => f.risk_level === riskFilter);
    }

    if (typeFilter) {
      result = result.filter((f) => f.detection_type === typeFilter);
    }

    setFiltered(result);
    setCurrentPage(1);
  }, [findings, searchTerm, riskFilter, typeFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedFindings = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'High':
        return 'bg-red-900/20 text-red-400 border-red-700/30';
      case 'Medium':
        return 'bg-yellow-900/20 text-yellow-400 border-yellow-700/30';
      default:
        return 'bg-green-900/20 text-green-400 border-green-700/30';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-50">Data Inventory</h2>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          placeholder="Search file paths..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-slate-800 border-slate-700 text-slate-50"
        />

        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-50">
            <SelectValue placeholder="Filter by Risk Level" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="">All Levels</SelectItem>
            <SelectItem value="High" className="text-slate-50">High Risk</SelectItem>
            <SelectItem value="Medium" className="text-slate-50">Medium Risk</SelectItem>
            <SelectItem value="Low" className="text-slate-50">Low Risk</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-50">
            <SelectValue placeholder="Filter by Detection Type" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="">All Types</SelectItem>
            <SelectItem value="Aadhaar" className="text-slate-50">Aadhaar</SelectItem>
            <SelectItem value="PAN" className="text-slate-50">PAN</SelectItem>
            <SelectItem value="Passport" className="text-slate-50">Passport</SelectItem>
            <SelectItem value="Email" className="text-slate-50">Email</SelectItem>
            <SelectItem value="Phone" className="text-slate-50">Phone</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Findings Table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-50">PII Findings</CardTitle>
          <CardDescription>Detected personal data across repositories</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full bg-slate-800" />
              ))}
            </div>
          ) : paginatedFindings.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="text-slate-400">File Path</TableHead>
                      <TableHead className="text-slate-400">Detection Type</TableHead>
                      <TableHead className="text-slate-400">Confidence</TableHead>
                      <TableHead className="text-slate-400">Risk Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedFindings.map((finding) => (
                      <TableRow key={finding.id} className="border-slate-800 hover:bg-slate-800/50">
                        <TableCell className="font-mono text-xs text-slate-300 max-w-sm truncate">
                          {finding.file_path}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-slate-800 text-slate-200 border-slate-700">
                            {finding.detection_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-200">{finding.confidence_score}%</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getRiskColor(finding.risk_level)}>
                            {finding.risk_level}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      {currentPage > 1 && (
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(currentPage - 1);
                            }}
                            className="text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                          />
                        </PaginationItem>
                      )}

                      {Array.from({ length: totalPages }).map((_, i) => (
                        <PaginationItem key={i + 1}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(i + 1);
                            }}
                            isActive={currentPage === i + 1}
                            className={`${
                              currentPage === i + 1
                                ? 'bg-emerald-600/20 text-emerald-400'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                            }`}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                      {currentPage < totalPages && (
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(currentPage + 1);
                            }}
                            className="text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                          />
                        </PaginationItem>
                      )}
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-400">No findings match your filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {filtered.length > 0 && (
        <div className="text-sm text-slate-400">
          Showing {startIdx + 1} to {Math.min(startIdx + ITEMS_PER_PAGE, filtered.length)} of {filtered.length} findings
        </div>
      )}
    </div>
  );
}
