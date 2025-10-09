# Security & Authorization Testing Guide

## Prerequisites
✅ Supabase migrations run (`001_schema.sql`, `002_notifications.sql`)  
✅ Koyeb backend deployed  
✅ Environment variables set

---

## Step 1: Verify RPC Functions

### Test `get_user_profile` RPC

1. **Go to Supabase Dashboard** → SQL Editor
2. **Run this query** to test the RPC function:

```sql
-- First, check if the function exists
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'get_user_profile';

-- Test the function (replace with your actual user ID)
SELECT * FROM get_user_profile('YOUR_USER_ID_HERE'::uuid);
```

**Expected Result:** Should return `role` and `name` columns for the user.

---

## Step 2: Create Test Users with Different Roles

### Manual Setup via Supabase Dashboard

1. **Go to Authentication → Users**
2. **Create 5 test users:**
   - `finance@test.com` (password: `Test1234!`)
   - `sales@test.com` (password: `Test1234!`)
   - `operations@test.com` (password: `Test1234!`)
   - `marketing@test.com` (password: `Test1234!`)
   - `admin@test.com` (password: `Test1234!`)

3. **Go to SQL Editor and assign roles:**

```sql
-- Get user IDs first
SELECT id, email FROM auth.users WHERE email LIKE '%@test.com';

-- Then insert roles (replace UUIDs with actual IDs from above)
INSERT INTO public.user_roles (user_id, role, name) VALUES
  ('FINANCE_USER_ID', 'finance', 'Finance Test User'),
  ('SALES_USER_ID', 'sales', 'Sales Test User'),
  ('OPERATIONS_USER_ID', 'operations', 'Operations Test User'),
  ('MARKETING_USER_ID', 'marketing', 'Marketing Test User'),
  ('ADMIN_USER_ID', 'admin', 'Admin Test User')
ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role, name = EXCLUDED.name;
```

---

## Step 3: Verify RLS Policies

### Test Finance Access Control

```sql
-- Login as finance user in Supabase SQL Editor (use RLS toggle)
-- Or run with SET LOCAL role to simulate

-- This should work (finance user accessing own data)
INSERT INTO public.finance_entries (user_id, amount, type)
VALUES (auth.uid(), 1000, 'income');

SELECT * FROM public.finance_entries WHERE user_id = auth.uid();

-- This should fail (finance user trying to access sales data)
SELECT * FROM public.sales_entries;
-- Expected: Empty result or error (depending on RLS)
```

### Test Sales Access Control

```sql
-- Switch to sales user
INSERT INTO public.sales_entries (user_id, outcome)
VALUES (auth.uid(), 'positive');

SELECT * FROM public.sales_entries WHERE user_id = auth.uid();

-- This should fail (sales user trying to access finance data)
SELECT * FROM public.finance_entries;
-- Expected: Empty result or error
```

---

## Step 4: Test Protected Routes in the App

### Automated Test Script

Create a test file to verify route protection:

**File: `__tests__/auth-integration.test.tsx`**

This will test:
1. Login with different roles
2. Verify correct redirects
3. Verify unauthorized access is blocked
4. Verify navigation menu shows only permitted sections

### Manual Testing Steps

1. **Test Finance Role:**
   - Login as `finance@test.com`
   - ✅ Should see: Dashboard, Reports, Charts, Finance, Suppliers
   - ❌ Should NOT see: Sales, Operations, Marketing
   - Try to manually navigate to `/manager/sales` → should show "غير مصرح" (Unauthorized)

2. **Test Sales Role:**
   - Login as `sales@test.com`
   - ✅ Should see: Dashboard, Reports, Charts, Sales
   - ❌ Should NOT see: Finance, Operations, Marketing
   - Try `/manager/finance` → Unauthorized

3. **Test Operations Role:**
   - Login as `operations@test.com`
   - ✅ Should see: Dashboard, Reports, Charts, Operations
   - ❌ Should NOT see: Finance, Sales, Marketing
   - Try `/manager/sales` → Unauthorized

4. **Test Marketing Role:**
   - Login as `marketing@test.com`
   - ✅ Should see: Dashboard, Reports, Charts, Marketing
   - ❌ Should NOT see: Finance, Sales, Operations
   - Try `/manager/finance` → Unauthorized

5. **Test Admin Role:**
   - Login as `admin@test.com`
   - ✅ Should see: ALL sections
   - ✅ Can access any route without restrictions

---

## Step 5: Verify AuthContext Integration

### Check Browser Console

1. Login with any test user
2. Open DevTools → Console
3. Check for:
   - `[AuthContext] User role loaded: finance` (or respective role)
   - `[AuthContext] Permissions:` (should show correct permissions object)

### Verify localStorage

1. Open DevTools → Application → Local Storage
2. Check `wathiq_auth` key
3. Should contain user session with role information

---

## Step 6: Server-Side Authorization Test

### Create a Protected API Endpoint (Optional Enhancement)

If you want to add server-side validation beyond RLS:

**File: `src/services/AuthService.ts`**

```typescript
import { supabase } from '@/lib/supabase';

export class AuthService {
  /**
   * Server-side role check via RPC
   */
  static async verifyUserRole(requiredRoles: string[]): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase.rpc('get_user_profile', { uid: user.id });
    
    if (error || !data || data.length === 0) return false;
    
    return requiredRoles.includes(data[0].role);
  }

  /**
   * Check if user can access a specific resource
   */
  static async canAccessResource(resourceType: 'finance' | 'sales' | 'operations' | 'marketing'): Promise<boolean> {
    const roleMap: Record<string, string[]> = {
      finance: ['admin', 'manager', 'finance'],
      sales: ['admin', 'manager', 'sales'],
      operations: ['admin', 'manager', 'operations'],
      marketing: ['admin', 'manager', 'marketing'],
    };

    return this.verifyUserRole(roleMap[resourceType] || []);
  }
}
```

### Test the AuthService

```typescript
// In any component
import { AuthService } from '@/services/AuthService';

const handleFinanceAction = async () => {
  const canAccess = await AuthService.canAccessResource('finance');
  if (!canAccess) {
    toast.error('غير مصرح لك بالوصول إلى هذا القسم');
    return;
  }
  // Proceed with finance action
};
```

---

## Step 7: Penetration Testing Checklist

### Client-Side Tests
- [ ] JWT token expires correctly (check Supabase Auth settings)
- [ ] Refresh token rotation works
- [ ] Logout clears all auth state
- [ ] Protected routes redirect to login when unauthenticated
- [ ] Role-based navigation hides unauthorized links

### Server-Side Tests (RLS)
- [ ] Finance user cannot read/write sales_entries
- [ ] Sales user cannot read/write finance_entries
- [ ] Operations user cannot access finance/sales tables
- [ ] Marketing user is properly isolated
- [ ] Admin can access all tables
- [ ] Manager can access all tables

### SQL Injection Prevention
- [ ] All Supabase queries use parameterized statements (handled by SDK)
- [ ] RLS policies use `auth.uid()` not string concatenation
- [ ] No raw SQL in client code

### XSS Prevention
- [ ] DOMPurify sanitizes all user-generated HTML (✅ already implemented)
- [ ] CSP headers set (check Vercel/Koyeb headers)

---

## Common Issues & Fixes

### Issue: "RLS policy violation"
**Fix:** Ensure `user_roles` table has entry for the logged-in user.

```sql
-- Check if user has role assigned
SELECT * FROM public.user_roles WHERE user_id = 'YOUR_USER_ID';
```

### Issue: "Function get_user_profile does not exist"
**Fix:** Re-run the migration:

```sql
-- Drop and recreate
DROP FUNCTION IF EXISTS public.get_user_profile(uuid);

-- Then paste the function from 001_schema.sql
```

### Issue: Protected route shows blank page
**Fix:** Check browser console for errors. Likely causes:
- `AuthContext` not wrapping the route
- `ProtectedRoute` component not rendering children
- Role permissions not loaded

---

## Success Criteria

✅ All 5 test users can login  
✅ Each role only sees their permitted sections in sidebar  
✅ Direct URL access to unauthorized routes shows "Unauthorized" page  
✅ RLS policies block database access for wrong roles  
✅ Admin and Manager can access all sections  
✅ No console errors during role switching  
✅ Logout clears auth state completely  

---

## Next Steps After Verification

Once all tests pass:
1. Update production environment variables
2. Create your actual admin user in production Supabase
3. Assign roles to real team members
4. Document role assignment process for onboarding
5. Set up monitoring/logging for auth failures

