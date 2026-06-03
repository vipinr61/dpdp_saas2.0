/*
  # Seed Privotek DPDP with Mock Data

  This migration seeds the database with realistic test data:
  - 1 tenant (TechSecure Consulting)
  - 2 demo users
  - 5 customers with various industries
  - Repositories per customer
  - Completed scans with findings
  - Reports generated

  This enables immediate testing of the full platform without manual data entry.
*/

-- Insert tenant
INSERT INTO tenants (id, name, subscription_tier) 
VALUES (
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  'TechSecure Consulting',
  'Enterprise'
) ON CONFLICT DO NOTHING;

-- Insert demo users for the tenant
INSERT INTO users (id, tenant_id, email, name, role) 
VALUES
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'admin@techsecure.com', 'Rajesh Kumar', 'ConsultantAdmin'),
  ('550e8400-e29b-41d4-a716-446655440002'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'analyst@techsecure.com', 'Priya Sharma', 'ConsultantAnalyst')
ON CONFLICT DO NOTHING;

-- Insert customers
INSERT INTO customers (id, tenant_id, name, industry, status, overall_risk_score, last_assessment_date) 
VALUES
  ('550e8400-e29b-41d4-a716-446655440010'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'FinTech Solutions Ltd', 'Financial Services', 'Active', 72, now() - interval '5 days'),
  ('550e8400-e29b-41d4-a716-446655440011'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'HealthCare Digital Inc', 'Healthcare', 'Active', 58, now() - interval '12 days'),
  ('550e8400-e29b-41d4-a716-446655440012'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'EduTech Global', 'Education', 'Active', 45, now() - interval '20 days'),
  ('550e8400-e29b-41d4-a716-446655440013'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'RetailCorp India', 'Retail', 'Active', 68, now() - interval '3 days'),
  ('550e8400-e29b-41d4-a716-446655440014'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'LogistiTech Solutions', 'Logistics', 'Archived', 35, now() - interval '45 days')
ON CONFLICT DO NOTHING;

-- Insert repositories for customers
INSERT INTO repositories (id, customer_id, type, name, status, last_sync) 
VALUES
  ('550e8400-e29b-41d4-a716-446655440020'::uuid, '550e8400-e29b-41d4-a716-446655440010'::uuid, 'AWS S3', 'Production Data Lake', 'Connected', now() - interval '2 hours'),
  ('550e8400-e29b-41d4-a716-446655440021'::uuid, '550e8400-e29b-41d4-a716-446655440010'::uuid, 'OneDrive', 'Finance Documents', 'Connected', now() - interval '1 hour'),
  ('550e8400-e29b-41d4-a716-446655440022'::uuid, '550e8400-e29b-41d4-a716-446655440011'::uuid, 'SharePoint', 'Patient Records', 'Connected', now() - interval '4 hours'),
  ('550e8400-e29b-41d4-a716-446655440023'::uuid, '550e8400-e29b-41d4-a716-446655440011'::uuid, 'AWS S3', 'Backup Archive', 'Pending', now() - interval '1 day'),
  ('550e8400-e29b-41d4-a716-446655440024'::uuid, '550e8400-e29b-41d4-a716-446655440012'::uuid, 'OneDrive', 'Course Materials', 'Error', now() - interval '3 days'),
  ('550e8400-e29b-41d4-a716-446655440025'::uuid, '550e8400-e29b-41d4-a716-446655440013'::uuid, 'SharePoint', 'Customer Data', 'Connected', now() - interval '1 hour'),
  ('550e8400-e29b-41d4-a716-446655440026'::uuid, '550e8400-e29b-41d4-a716-446655440014'::uuid, 'AWS S3', 'Legacy Data', 'Connected', now() - interval '30 days')
ON CONFLICT DO NOTHING;

-- Insert completed scans
INSERT INTO scans (id, repository_id, status, started_at, completed_at, files_scanned, pii_found) 
VALUES
  ('550e8400-e29b-41d4-a716-446655440030'::uuid, '550e8400-e29b-41d4-a716-446655440020'::uuid, 'Completed', now() - interval '2 days', now() - interval '1 day 23 hours', 1247, 34),
  ('550e8400-e29b-41d4-a716-446655440031'::uuid, '550e8400-e29b-41d4-a716-446655440021'::uuid, 'Completed', now() - interval '1 day', now() - interval '23 hours', 456, 12),
  ('550e8400-e29b-41d4-a716-446655440032'::uuid, '550e8400-e29b-41d4-a716-446655440022'::uuid, 'Completed', now() - interval '3 days', now() - interval '2 days 22 hours', 2341, 89),
  ('550e8400-e29b-41d4-a716-446655440033'::uuid, '550e8400-e29b-41d4-a716-446655440025'::uuid, 'Completed', now() - interval '4 days', now() - interval '3 days 23 hours', 834, 21),
  ('550e8400-e29b-41d4-a716-446655440034'::uuid, '550e8400-e29b-41d4-a716-446655440026'::uuid, 'Completed', now() - interval '50 days', now() - interval '49 days 22 hours', 567, 8)
ON CONFLICT DO NOTHING;

-- Insert findings for scans
INSERT INTO findings (scan_id, file_name, file_path, detection_type, confidence_score, risk_level) 
VALUES
  -- Scan 1 findings (Production Data Lake)
  ('550e8400-e29b-41d4-a716-446655440030'::uuid, 'customer_accounts.csv', '/data/financial/customer_accounts.csv', 'PAN', 98, 'High'),
  ('550e8400-e29b-41d4-a716-446655440030'::uuid, 'customer_accounts.csv', '/data/financial/customer_accounts.csv', 'Aadhaar', 95, 'High'),
  ('550e8400-e29b-41d4-a716-446655440030'::uuid, 'kyc_documents.xlsx', '/data/financial/kyc_documents.xlsx', 'Passport', 92, 'High'),
  ('550e8400-e29b-41d4-a716-446655440030'::uuid, 'user_emails.txt', '/data/temp/user_emails.txt', 'Email', 89, 'Medium'),
  ('550e8400-e29b-41d4-a716-446655440030'::uuid, 'contact_list.csv', '/data/contacts/contact_list.csv', 'Phone', 85, 'Medium'),
  ('550e8400-e29b-41d4-a716-446655440030'::uuid, 'vendor_data.json', '/data/vendors/vendor_data.json', 'Email', 88, 'Medium'),
  ('550e8400-e29b-41d4-a716-446655440030'::uuid, 'employee_records.xlsx', '/data/hr/employee_records.xlsx', 'Aadhaar', 91, 'High'),
  
  -- Scan 2 findings (Finance Documents)
  ('550e8400-e29b-41d4-a716-446655440031'::uuid, 'invoices_2024.pdf', '/finance/invoices_2024.pdf', 'Email', 87, 'Medium'),
  ('550e8400-e29b-41d4-a716-446655440031'::uuid, 'bank_details.xlsx', '/finance/bank_details.xlsx', 'PAN', 94, 'High'),
  ('550e8400-e29b-41d4-a716-446655440031'::uuid, 'vendor_contracts.docx', '/finance/vendor_contracts.docx', 'Phone', 80, 'Medium'),
  ('550e8400-e29b-41d4-a716-446655440031'::uuid, 'tax_returns.pdf', '/finance/tax_returns.pdf', 'Aadhaar', 93, 'High'),
  
  -- Scan 3 findings (Patient Records)
  ('550e8400-e29b-41d4-a716-446655440032'::uuid, 'patient_master.db', '/records/patient_master.db', 'Aadhaar', 97, 'High'),
  ('550e8400-e29b-41d4-a716-446655440032'::uuid, 'patient_master.db', '/records/patient_master.db', 'Email', 96, 'High'),
  ('550e8400-e29b-41d4-a716-446655440032'::uuid, 'insurance_claims.csv', '/records/insurance_claims.csv', 'PAN', 91, 'High'),
  ('550e8400-e29b-41d4-a716-446655440032'::uuid, 'emergency_contacts.xlsx', '/records/emergency_contacts.xlsx', 'Phone', 88, 'High'),
  ('550e8400-e29b-41d4-a716-446655440032'::uuid, 'doctor_notes.txt', '/records/notes/doctor_notes.txt', 'Email', 82, 'Medium'),
  ('550e8400-e29b-41d4-a716-446655440032'::uuid, 'prescriptions.pdf', '/records/prescriptions.pdf', 'Aadhaar', 89, 'High'),
  ('550e8400-e29b-41d4-a716-446655440032'::uuid, 'test_results.csv', '/records/test_results.csv', 'Passport', 85, 'High'),
  ('550e8400-e29b-41d4-a716-446655440032'::uuid, 'contact_list.xlsx', '/records/contact_list.xlsx', 'Phone', 83, 'Medium'),
  
  -- Scan 4 findings (Customer Data)
  ('550e8400-e29b-41d4-a716-446655440033'::uuid, 'orders_database.sql', '/retail/orders_database.sql', 'Email', 90, 'High'),
  ('550e8400-e29b-41d4-a716-446655440033'::uuid, 'orders_database.sql', '/retail/orders_database.sql', 'Phone', 87, 'High'),
  ('550e8400-e29b-41d4-a716-446655440033'::uuid, 'customer_profiles.csv', '/retail/customer_profiles.csv', 'Aadhaar', 92, 'High'),
  
  -- Scan 5 findings (Legacy Data)
  ('550e8400-e29b-41d4-a716-446655440034'::uuid, 'archive_2018.tar', '/legacy/archive_2018.tar', 'PAN', 78, 'Medium'),
  ('550e8400-e29b-41d4-a716-446655440034'::uuid, 'backup_logs.txt', '/legacy/backup_logs.txt', 'Email', 75, 'Low'),
  ('550e8400-e29b-41d4-a716-446655440034'::uuid, 'employee_list_old.xlsx', '/legacy/employee_list_old.xlsx', 'Phone', 72, 'Low')
ON CONFLICT DO NOTHING;

-- Insert generated reports
INSERT INTO reports (customer_id, report_name) 
VALUES
  ('550e8400-e29b-41d4-a716-446655440010'::uuid, 'DPDP Assessment Report - May 2026'),
  ('550e8400-e29b-41d4-a716-446655440010'::uuid, 'DPDP Remediation Summary - April 2026'),
  ('550e8400-e29b-41d4-a716-446655440011'::uuid, 'DPDP Assessment Report - May 2026'),
  ('550e8400-e29b-41d4-a716-446655440013'::uuid, 'DPDP Executive Summary - May 2026')
ON CONFLICT DO NOTHING;
