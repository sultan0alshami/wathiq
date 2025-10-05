-- ============================================
-- FIX USER NAMES - Run this in Supabase SQL Editor
-- ============================================

-- First, let's check what we have
SELECT 
  u.email,
  ur.name,
  ur.role,
  ur.user_id
FROM public.user_roles ur
JOIN auth.users u ON u.id = ur.user_id
ORDER BY ur.role;

-- Now update each user individually with EXACT user_id matching
UPDATE public.user_roles
SET name = 'أحمد المدير'
WHERE role = 'admin';

UPDATE public.user_roles
SET name = 'محمد المشرف'
WHERE role = 'manager';

UPDATE public.user_roles
SET name = 'فاطمة المالية'
WHERE role = 'finance';

UPDATE public.user_roles
SET name = 'خالد المبيعات'
WHERE role = 'sales';

UPDATE public.user_roles
SET name = 'سارة العمليات'
WHERE role = 'operations';

UPDATE public.user_roles
SET name = 'عمر التسويق'
WHERE role = 'marketing';

-- Verify the update worked
SELECT 
  u.email,
  ur.name,
  ur.role
FROM public.user_roles ur
JOIN auth.users u ON u.id = ur.user_id
ORDER BY ur.role;
