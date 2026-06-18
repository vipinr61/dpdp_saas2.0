-- Fix RLS policies to match users by email instead of auth.uid()
-- The users table uses custom IDs that don't match Supabase auth UIDs

-- Repositories table
DROP POLICY IF EXISTS "Users can view repositories in own tenant" ON repositories;
DROP POLICY IF EXISTS "Users can insert repositories" ON repositories;
DROP POLICY IF EXISTS "Users can update repositories" ON repositories;

CREATE POLICY "Users can view repositories in own tenant" ON repositories
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM customers c
    WHERE c.id = repositories.customer_id
    AND c.tenant_id = (SELECT tenant_id FROM users WHERE email = auth.jwt() ->> 'email')
  ));

CREATE POLICY "Users can insert repositories" ON repositories
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM customers c
    WHERE c.id = repositories.customer_id
    AND c.tenant_id = (SELECT tenant_id FROM users WHERE email = auth.jwt() ->> 'email')
  ));

CREATE POLICY "Users can update repositories" ON repositories
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM customers c
    WHERE c.id = repositories.customer_id
    AND c.tenant_id = (SELECT tenant_id FROM users WHERE email = auth.jwt() ->> 'email')
  ));

-- Scans table
DROP POLICY IF EXISTS "Users can view scans in own tenant" ON scans;
DROP POLICY IF EXISTS "Users can insert scans" ON scans;
DROP POLICY IF EXISTS "Users can update scans" ON scans;

CREATE POLICY "Users can view scans in own tenant" ON scans
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM repositories r
    JOIN customers c ON c.id = r.customer_id
    WHERE r.id = scans.repository_id
    AND c.tenant_id = (SELECT tenant_id FROM users WHERE email = auth.jwt() ->> 'email')
  ));

CREATE POLICY "Users can insert scans" ON scans
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM repositories r
    JOIN customers c ON c.id = r.customer_id
    WHERE r.id = scans.repository_id
    AND c.tenant_id = (SELECT tenant_id FROM users WHERE email = auth.jwt() ->> 'email')
  ));

CREATE POLICY "Users can update scans" ON scans
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM repositories r
    JOIN customers c ON c.id = r.customer_id
    WHERE r.id = scans.repository_id
    AND c.tenant_id = (SELECT tenant_id FROM users WHERE email = auth.jwt() ->> 'email')
  ));

-- Findings table
DROP POLICY IF EXISTS "Users can view findings in own tenant" ON findings;
DROP POLICY IF EXISTS "Users can insert findings" ON findings;

CREATE POLICY "Users can view findings in own tenant" ON findings
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM scans s
    JOIN repositories r ON r.id = s.repository_id
    JOIN customers c ON c.id = r.customer_id
    WHERE s.id = findings.scan_id
    AND c.tenant_id = (SELECT tenant_id FROM users WHERE email = auth.jwt() ->> 'email')
  ));

CREATE POLICY "Users can insert findings" ON findings
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM scans s
    JOIN repositories r ON r.id = s.repository_id
    JOIN customers c ON c.id = r.customer_id
    WHERE s.id = findings.scan_id
    AND c.tenant_id = (SELECT tenant_id FROM users WHERE email = auth.jwt() ->> 'email')
  ));

-- Reports table
DROP POLICY IF EXISTS "Users can view reports in own tenant" ON reports;
DROP POLICY IF EXISTS "Users can insert reports" ON reports;

CREATE POLICY "Users can view reports in own tenant" ON reports
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM customers c
    WHERE c.id = reports.customer_id
    AND c.tenant_id = (SELECT tenant_id FROM users WHERE email = auth.jwt() ->> 'email')
  ));

CREATE POLICY "Users can insert reports" ON reports
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM customers c
    WHERE c.id = reports.customer_id
    AND c.tenant_id = (SELECT tenant_id FROM users WHERE email = auth.jwt() ->> 'email')
  ));
