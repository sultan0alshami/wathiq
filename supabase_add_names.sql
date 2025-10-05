-- ============================================
-- ADD USER NAMES TO WATHIQ SYSTEM
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Add name column to user_roles table
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS name TEXT;

-- Step 2: Update existing users with Arabic names
UPDATE public.user_roles
SET name = CASE 
  WHEN role = 'admin' THEN 'أحمد المدير'
  WHEN role = 'manager' THEN 'محمد المشرف'
  WHEN role = 'finance' THEN 'فاطمة المالية'
  WHEN role = 'sales' THEN 'خالد المبيعات'
  WHEN role = 'operations' THEN 'سارة العمليات'
  WHEN role = 'marketing' THEN 'عمر التسويق'
END
WHERE name IS NULL;

-- Step 3: Make name NOT NULL for future inserts
ALTER TABLE public.user_roles 
ALTER COLUMN name SET NOT NULL;

-- Step 4: Verify the changes
SELECT 
  u.email,
  ur.name,
  ur.role,
  ur.updated_at
FROM public.user_roles ur
JOIN auth.users u ON u.id = ur.user_id
ORDER BY ur.role;

-- Expected output:
-- admin@wathiq.com      | أحمد المدير      | admin
-- manager@wathiq.com    | محمد المشرف      | manager
-- finance@wathiq.com    | فاطمة المالية    | finance
-- sales@wathiq.com      | خالد المبيعات    | sales
-- operations@wathiq.com | سارة العمليات    | operations
-- marketing@wathiq.com  | عمر التسويق      | marketing
