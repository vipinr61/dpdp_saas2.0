export interface Tenant {
  id: string;
  name: string;
  subscription_tier: string;
  created_at: string;
}

export interface User {
  id: string;
  tenant_id: string;
  email: string;
  name: string;
  role: 'PlatformAdmin' | 'ConsultantAdmin' | 'ConsultantAnalyst' | 'CustomerViewer';
  created_at: string;
}

export interface Customer {
  id: string;
  tenant_id: string;
  name: string;
  industry: string;
  status: 'Active' | 'Archived';
  overall_risk_score: number;
  last_assessment_date: string | null;
  created_at: string;
}

export interface Repository {
  id: string;
  customer_id: string;
  type: 'SharePoint' | 'OneDrive' | 'AWS S3';
  name: string;
  status: 'Connected' | 'Error' | 'Pending';
  last_sync: string;
  created_at: string;
}

export interface Scan {
  id: string;
  repository_id: string;
  status: 'Pending' | 'Running' | 'Completed' | 'Failed';
  started_at: string;
  completed_at: string | null;
  files_scanned: number;
  pii_found: number;
  created_at: string;
}

export interface Finding {
  id: string;
  scan_id: string;
  file_name: string;
  file_path: string;
  detection_type: 'Aadhaar' | 'PAN' | 'Passport' | 'Email' | 'Phone';
  confidence_score: number;
  risk_level: 'High' | 'Medium' | 'Low';
  created_at: string;
}

export interface Report {
  id: string;
  customer_id: string;
  report_name: string;
  created_at: string;
}
