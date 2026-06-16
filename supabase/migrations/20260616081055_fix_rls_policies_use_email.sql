-- Fix RLS policies to match users by email instead of auth.uid()
-- The users table uses custom IDs that don't match Supabase auth UIDs

-- Customers table policies
DROP POLICY IF EXISTS "Users can view customers in own tenant" ON customers;
DROP POLICY IF EXISTS "Users can insert customers to own tenant" ON customers;
DROP POLICY IF EXISTS "Users can update customers in own tenant" ON customers;

CREATE POLICY "Users can view customers in own tenant" ON customers
  FOR SELECT
  TO authenticated
  USING (tenant_id = (
    SELECT tenant_id FROM users WHERE email = auth.jwt() ->> 'email'
  ));

CREATE POLICY "Users can insert customers to own tenant" ON customers
  FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = (
    SELECT tenant_id FROM users WHERE email = auth.jwt() ->> 'email'
  ));

CREATE POLICY "Users can update customers in own tenant" ON customers
  FOR UPDATE
  TO authenticated
  USING (tenant_id = (
    SELECT tenant_id FROM users WHERE email = auth.jwt() ->> 'email'
  ))
  WITH CHECK (tenant_id = (
    SELECT tenant_id FROM users WHERE email = auth.jwt() ->> 'email'
  ));

-- Users table policies
DROP POLICY IF EXISTS "Users can view users in own tenant" ON users;
DROP POLICY IF EXISTS "Users can find their own record by email" ON users;

CREATE POLICY "Users can view users in own tenant" ON users
  FOR SELECT
  TO authenticated
  USING (tenant_id = (
    SELECT tenant_id FROM users u WHERE u.email = auth.jwt() ->> 'email'
  ));

CREATE POLICY "Users can find their own record by email" ON users
  FOR SELECT
  TO authenticated
  USING (email = auth.jwt() ->> 'email');
