-- ============================================
-- WATHIQ SUPABASE DATABASE SETUP
-- Complete SQL Setup Script
-- ============================================

-- Step 1: Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'finance', 'sales', 'operations', 'marketing')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Step 2: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Step 3: Enable Row Level Security
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
DROP POLICY IF EXISTS "Authenticated users can read all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- Step 5: Create RLS Policies
-- Policy 1: Users can read their own role
CREATE POLICY "Users can read own role" 
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Policy 2: All authenticated users can read all roles (needed for permission checks)
CREATE POLICY "Authenticated users can read all roles" 
ON public.user_roles
FOR SELECT
TO authenticated
USING (true);

-- Policy 3: Only admins can insert/update/delete roles
CREATE POLICY "Admins can manage roles" 
ON public.user_roles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Step 6: Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 7: Create trigger for updated_at
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON public.user_roles;
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant appropriate permissions to authenticated users
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

-- ============================================
-- VERIFICATION QUERIES (Run these to verify)
-- ============================================

-- Check if table was created successfully
-- SELECT * FROM public.user_roles;

-- Check if policies are in place
-- SELECT * FROM pg_policies WHERE tablename = 'user_roles';

-- ============================================
-- NOTES
-- ============================================
-- After creating users in Supabase Authentication UI,
-- run the insert script to assign roles to users.
-- See: supabase_insert_roles.sql
