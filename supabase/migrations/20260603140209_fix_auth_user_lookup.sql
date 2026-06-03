/*
  # Fix Authentication User Lookup

  This migration adds a policy to allow authenticated users to look up
  their own user record by email, which is necessary for the login flow.
  
  The issue was that after login, the user couldn't query the users table
  because RLS policies required them to already know their tenant_id.
  
  Solution: Add a SELECT policy that allows users to find their record by email.
*/

-- Add a policy that allows any authenticated user to select their own record
-- This is necessary for the post-login user lookup by email
CREATE POLICY "Users can find their own record by email"
  ON users FOR SELECT
  TO authenticated
  USING (email = auth.jwt()->>'email');
