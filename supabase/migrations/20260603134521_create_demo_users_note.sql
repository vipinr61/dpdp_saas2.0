/*
  # Create Demo Users for Testing

  This migration creates demo users that can be used for testing the DPDP platform.
  
  NOTE: These credentials are for demo/testing only and should be changed in production.
*/

-- Note: In a real setup, these users would be created via Supabase Auth dashboard
-- For local development and demo purposes, we'll provide instructions below

-- The demo user credentials are:
-- Email: admin@techsecure.com
-- Password: password123
-- Role: ConsultantAdmin

-- Email: analyst@techsecure.com
-- Password: password123
-- Role: ConsultantAnalyst

-- To create these users in Supabase Auth, use the Supabase dashboard:
-- 1. Go to Authentication > Users
-- 2. Click "Add user"
-- 3. Enter the email and password
-- 4. The users table entries are already seeded in the seed_mock_data migration
