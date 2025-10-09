-- RLS Policy Verification Script
-- Run this in Supabase SQL Editor to verify your security setup

-- ============================================
-- PART 1: Verify Schema Setup
-- ============================================

-- Check if user_roles table exists
SELECT 
  table_name, 
  table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_roles', 'finance_entries', 'sales_entries', 'notifications');

-- Check if RPC function exists
SELECT 
  routine_name, 
  routine_type,
  data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'get_user_profile';

-- ============================================
-- PART 2: Verify RLS is Enabled
-- ============================================

SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('user_roles', 'finance_entries', 'sales_entries', 'notifications');

-- ============================================
-- PART 3: List All RLS Policies
-- ============================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual as using_expression,
  with_check as check_expression
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- PART 4: Check Existing User Roles
-- ============================================

-- List all users with their roles
SELECT 
  u.id,
  u.email,
  ur.role,
  ur.name,
  u.created_at
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
ORDER BY u.created_at DESC
LIMIT 20;

-- Count users by role
SELECT 
  COALESCE(ur.role, 'no_role') as role,
  COUNT(*) as user_count
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
GROUP BY ur.role
ORDER BY user_count DESC;

-- ============================================
-- PART 5: Test RPC Function
-- ============================================

-- Test get_user_profile for your current user
-- Replace with actual user ID or use auth.uid() if running with RLS context
SELECT * FROM get_user_profile(auth.uid());

-- ============================================
-- PART 6: Create Test Users (Optional)
-- ============================================

-- UNCOMMENT BELOW TO CREATE TEST USERS
-- NOTE: You'll need to create these users via Supabase Auth Dashboard first,
-- then use their IDs here

/*
-- After creating users in Auth Dashboard, get their IDs:
SELECT id, email FROM auth.users WHERE email LIKE '%@test.com' ORDER BY created_at DESC;

-- Then assign roles (replace UUIDs with actual user IDs):
INSERT INTO public.user_roles (user_id, role, name) VALUES
  ('REPLACE_WITH_FINANCE_USER_ID', 'finance', 'Finance Test User'),
  ('REPLACE_WITH_SALES_USER_ID', 'sales', 'Sales Test User'),
  ('REPLACE_WITH_OPERATIONS_USER_ID', 'operations', 'Operations Test User'),
  ('REPLACE_WITH_MARKETING_USER_ID', 'marketing', 'Marketing Test User'),
  ('REPLACE_WITH_ADMIN_USER_ID', 'admin', 'Admin Test User')
ON CONFLICT (user_id) 
DO UPDATE SET 
  role = EXCLUDED.role, 
  name = EXCLUDED.name;
*/

-- ============================================
-- PART 7: Verify Notifications Table
-- ============================================

-- Check notifications table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'notifications'
ORDER BY ordinal_position;

-- Check notifications RLS policies
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename = 'notifications';

-- ============================================
-- PART 8: Security Audit
-- ============================================

-- Check for users without roles (potential security issue)
SELECT 
  u.id,
  u.email,
  u.created_at
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE ur.user_id IS NULL
AND u.created_at > NOW() - INTERVAL '30 days'
ORDER BY u.created_at DESC;

-- Check for invalid role values
SELECT 
  user_id,
  role,
  name
FROM public.user_roles
WHERE role NOT IN ('admin', 'manager', 'finance', 'sales', 'operations', 'marketing');

-- ============================================
-- PART 9: Grant Permissions Verification
-- ============================================

-- Check if authenticated role has execute permission on RPC
SELECT 
  routine_name,
  grantee,
  privilege_type
FROM information_schema.routine_privileges
WHERE routine_schema = 'public'
AND routine_name = 'get_user_profile'
AND grantee = 'authenticated';

-- ============================================
-- SUCCESS CRITERIA CHECKLIST
-- ============================================

/*
✅ Expected Results:

PART 1: Should show 4 tables (user_roles, finance_entries, sales_entries, notifications)
PART 2: All tables should have rls_enabled = true
PART 3: Should show policies for finance_select, finance_modify, sales_select, sales_modify, and notification policies
PART 4: Should show your users with their assigned roles
PART 5: Should return your role and name
PART 6: (Optional) Create test users
PART 7: Should show notifications table with proper columns (id, user_id, type, title, message, is_broadcast, created_at, read_at)
PART 8: Should ideally show no users without roles (or only very recent signups)
PART 9: Should show 'authenticated' has EXECUTE privilege on get_user_profile

If any of these fail, review the migration scripts and re-run them.
*/

