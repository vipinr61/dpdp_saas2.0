-- Fix circular RLS policy on users table
-- The "view users in own tenant" policy queries the users table inside its own policy,
-- causing infinite recursion since RLS is evaluated during the policy check itself.

-- Drop the problematic circular policy
DROP POLICY IF EXISTS "Users can view users in own tenant" ON public.users;

-- Create a SECURITY DEFINER function to break the recursion
-- This function runs with superuser privileges, bypassing RLS

CREATE OR REPLACE FUNCTION public.get_current_user_tenant_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM public.users WHERE email = auth.jwt() ->> 'email';
$$;

-- Now we can use this function in the policy without recursion
CREATE POLICY "Users can view users in own tenant" ON public.users
  FOR SELECT
  TO authenticated
  USING (tenant_id = public.get_current_user_tenant_id());
