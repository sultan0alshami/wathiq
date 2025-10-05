-- ============================================
-- WATHIQ - INSERT USER ROLES
-- Run this AFTER creating users in Authentication UI
-- ============================================

-- This script automatically assigns roles to users based on their email addresses
-- Make sure all 6 users are created in Authentication → Users first

INSERT INTO public.user_roles (user_id, role)
SELECT 
  id,
  CASE 
    WHEN email = 'admin@wathiq.com' THEN 'admin'
    WHEN email = 'manager@wathiq.com' THEN 'manager'
    WHEN email = 'finance@wathiq.com' THEN 'finance'
    WHEN email = 'sales@wathiq.com' THEN 'sales'
    WHEN email = 'operations@wathiq.com' THEN 'operations'
    WHEN email = 'marketing@wathiq.com' THEN 'marketing'
  END as role
FROM auth.users
WHERE email IN (
  'admin@wathiq.com',
  'manager@wathiq.com',
  'finance@wathiq.com',
  'sales@wathiq.com',
  'operations@wathiq.com',
  'marketing@wathiq.com'
)
ON CONFLICT (user_id) DO UPDATE
SET role = EXCLUDED.role,
    updated_at = timezone('utc'::text, now());

-- ============================================
-- VERIFICATION QUERY
-- Run this to verify roles were assigned correctly
-- ============================================

SELECT 
  u.email,
  ur.role,
  ur.created_at
FROM public.user_roles ur
JOIN auth.users u ON u.id = ur.user_id
ORDER BY ur.role;

-- Expected output:
-- admin@wathiq.com        | admin      | timestamp
-- manager@wathiq.com      | manager    | timestamp
-- finance@wathiq.com      | finance    | timestamp
-- sales@wathiq.com        | sales      | timestamp  
-- operations@wathiq.com   | operations | timestamp
-- marketing@wathiq.com    | marketing  | timestamp
