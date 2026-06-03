/*
  # Create Core Privotek DPDP Tables

  1. New Tables
    - `tenants` - Multi-tenant accounts for consulting firms
      - id (uuid, primary key)
      - name (text) - Firm name
      - subscription_tier (text) - Free, Pro, Enterprise
      - created_at (timestamp)
    
    - `users` - Users within tenant organizations
      - id (uuid, primary key)
      - tenant_id (uuid, foreign key)
      - email (text, unique)
      - name (text)
      - role (text) - PlatformAdmin, ConsultantAdmin, ConsultantAnalyst, CustomerViewer
      - created_at (timestamp)
    
    - `customers` - Client organizations being assessed
      - id (uuid, primary key)
      - tenant_id (uuid, foreign key)
      - name (text)
      - industry (text)
      - status (text) - Active, Archived
      - overall_risk_score (integer, 0-100)
      - last_assessment_date (timestamp, nullable)
      - created_at (timestamp)
    
    - `repositories` - Data sources connected to customers
      - id (uuid, primary key)
      - customer_id (uuid, foreign key)
      - type (text) - SharePoint, OneDrive, AWS S3
      - name (text)
      - status (text) - Connected, Error, Pending
      - last_sync (timestamp)
      - created_at (timestamp)
    
    - `scans` - DPDP scans performed on repositories
      - id (uuid, primary key)
      - repository_id (uuid, foreign key)
      - status (text) - Pending, Running, Completed, Failed
      - started_at (timestamp)
      - completed_at (timestamp, nullable)
      - files_scanned (integer)
      - pii_found (integer)
      - created_at (timestamp)
    
    - `findings` - PII detection findings from scans
      - id (uuid, primary key)
      - scan_id (uuid, foreign key)
      - file_name (text)
      - file_path (text)
      - detection_type (text) - Aadhaar, PAN, Passport, Email, Phone
      - confidence_score (integer, 0-100)
      - risk_level (text) - High, Medium, Low
      - created_at (timestamp)
    
    - `reports` - Generated DPDP assessment reports
      - id (uuid, primary key)
      - customer_id (uuid, foreign key)
      - report_name (text)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for tenant data isolation
    - Add policies for users to access their tenant data only
    - Add policies for customer data scoped by tenant

  3. Indexes
    - Add indexes for common queries (tenant_id, customer_id, etc.)
*/

-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subscription_tier text DEFAULT 'Free',
  created_at timestamptz DEFAULT now()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text DEFAULT 'ConsultantAnalyst' CHECK (role IN ('PlatformAdmin', 'ConsultantAdmin', 'ConsultantAnalyst', 'CustomerViewer')),
  created_at timestamptz DEFAULT now()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  industry text NOT NULL,
  status text DEFAULT 'Active' CHECK (status IN ('Active', 'Archived')),
  overall_risk_score integer DEFAULT 0 CHECK (overall_risk_score >= 0 AND overall_risk_score <= 100),
  last_assessment_date timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create repositories table
CREATE TABLE IF NOT EXISTS repositories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('SharePoint', 'OneDrive', 'AWS S3')),
  name text NOT NULL,
  status text DEFAULT 'Pending' CHECK (status IN ('Connected', 'Error', 'Pending')),
  last_sync timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create scans table
CREATE TABLE IF NOT EXISTS scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id uuid NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
  status text DEFAULT 'Pending' CHECK (status IN ('Pending', 'Running', 'Completed', 'Failed')),
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  files_scanned integer DEFAULT 0,
  pii_found integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create findings table
CREATE TABLE IF NOT EXISTS findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id uuid NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  detection_type text NOT NULL CHECK (detection_type IN ('Aadhaar', 'PAN', 'Passport', 'Email', 'Phone')),
  confidence_score integer DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  risk_level text DEFAULT 'Medium' CHECK (risk_level IN ('High', 'Medium', 'Low')),
  created_at timestamptz DEFAULT now()
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  report_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Tenants policies (admins can view their own tenant)
CREATE POLICY "Users can view own tenant"
  ON tenants FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE users.tenant_id = tenants.id AND users.id = auth.uid()
  ));

-- Users policies (view users in same tenant)
CREATE POLICY "Users can view users in own tenant"
  ON users FOR SELECT
  TO authenticated
  USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins can insert users to own tenant"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) AND
    (SELECT role FROM users WHERE id = auth.uid()) IN ('PlatformAdmin', 'ConsultantAdmin')
  );

-- Customers policies (view customers in own tenant)
CREATE POLICY "Users can view customers in own tenant"
  ON customers FOR SELECT
  TO authenticated
  USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert customers to own tenant"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update customers in own tenant"
  ON customers FOR UPDATE
  TO authenticated
  USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()))
  WITH CHECK (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- Repositories policies (through customer tenant)
CREATE POLICY "Users can view repositories in own tenant"
  ON repositories FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM customers WHERE customers.id = repositories.customer_id AND customers.tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  ));

CREATE POLICY "Users can insert repositories"
  ON repositories FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM customers WHERE customers.id = repositories.customer_id AND customers.tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  ));

CREATE POLICY "Users can update repositories"
  ON repositories FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM customers WHERE customers.id = repositories.customer_id AND customers.tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM customers WHERE customers.id = repositories.customer_id AND customers.tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  ));

-- Scans policies (through repository -> customer -> tenant)
CREATE POLICY "Users can view scans in own tenant"
  ON scans FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM repositories r JOIN customers c ON r.customer_id = c.id WHERE r.id = scans.repository_id AND c.tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  ));

CREATE POLICY "Users can insert scans"
  ON scans FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM repositories r JOIN customers c ON r.customer_id = c.id WHERE r.id = scans.repository_id AND c.tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  ));

CREATE POLICY "Users can update scans"
  ON scans FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM repositories r JOIN customers c ON r.customer_id = c.id WHERE r.id = scans.repository_id AND c.tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM repositories r JOIN customers c ON r.customer_id = c.id WHERE r.id = scans.repository_id AND c.tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  ));

-- Findings policies (through scan -> repository -> customer -> tenant)
CREATE POLICY "Users can view findings in own tenant"
  ON findings FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM scans s JOIN repositories r ON s.repository_id = r.id JOIN customers c ON r.customer_id = c.id WHERE s.id = findings.scan_id AND c.tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  ));

CREATE POLICY "Users can insert findings"
  ON findings FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM scans s JOIN repositories r ON s.repository_id = r.id JOIN customers c ON r.customer_id = c.id WHERE s.id = findings.scan_id AND c.tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  ));

-- Reports policies (through customer -> tenant)
CREATE POLICY "Users can view reports in own tenant"
  ON reports FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM customers c WHERE c.id = reports.customer_id AND c.tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  ));

CREATE POLICY "Users can insert reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM customers c WHERE c.id = reports.customer_id AND c.tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  ));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_customers_tenant_id ON customers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_repositories_customer_id ON repositories(customer_id);
CREATE INDEX IF NOT EXISTS idx_scans_repository_id ON scans(repository_id);
CREATE INDEX IF NOT EXISTS idx_findings_scan_id ON findings(scan_id);
CREATE INDEX IF NOT EXISTS idx_reports_customer_id ON reports(customer_id);
