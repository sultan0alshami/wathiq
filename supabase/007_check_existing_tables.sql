-- =====================================================
-- CHECK EXISTING TABLES
-- This script shows which tables already exist in your database
-- =====================================================

-- Check which business data tables already exist
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'finance_entries',
    'finance_categories',
    'sales_meetings',
    'operations_entries',
    'marketing_campaigns',
    'marketing_tasks',
    'marketing_customer_interactions',
    'customers',
    'suppliers',
    'supplier_documents',
    'trip_reports',
    'trip_photos'
)
ORDER BY tablename;

-- Check if RLS is enabled on existing tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'finance_entries',
    'finance_categories',
    'sales_meetings',
    'operations_entries',
    'marketing_campaigns',
    'marketing_tasks',
    'marketing_customer_interactions',
    'customers',
    'suppliers',
    'supplier_documents',
    'trip_reports',
    'trip_photos'
)
ORDER BY tablename;

-- Check existing policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN (
    'finance_entries',
    'finance_categories',
    'sales_meetings',
    'operations_entries',
    'marketing_campaigns',
    'marketing_tasks',
    'marketing_customer_interactions',
    'customers',
    'suppliers',
    'supplier_documents',
    'trip_reports',
    'trip_photos'
)
ORDER BY tablename, policyname;
