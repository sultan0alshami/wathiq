# Security Testing - Quick Start Guide

## ✅ What You've Already Done
- [x] Run Supabase migrations (`001_schema.sql`, `002_notifications.sql`)
- [x] Deploy backend to Koyeb
- [x] Add Supabase secrets to Koyeb (`SUPABASE_SERVICE_URL`, `SUPABASE_SERVICE_KEY`)
- [x] Test PDF generation with Arabic support

---

## 🔍 Next Steps: Verify Everything Works

### Step 1: Verify Database Setup (2 minutes)

1. **Open Supabase Dashboard** → SQL Editor
2. **Paste the contents of** `supabase/test_rls_policies.sql`
3. **Click "Run"**
4. **Check results:**
   - ✅ Should show 4 tables with RLS enabled
   - ✅ Should show `get_user_profile` function exists
   - ✅ Should show RLS policies for finance/sales

If anything fails, re-run the migrations from `supabase/001_schema.sql` and `supabase/002_notifications.sql`.

---

### Step 2: Create Test Users (5 minutes)

#### Option A: Via Supabase Dashboard (Easiest)

1. **Go to Authentication** → Users → **Add User**
2. **Create 5 test accounts:**

   | Email | Password | Role |
   |-------|----------|------|
   | `finance@test.com` | `Test1234!` | finance |
   | `sales@test.com` | `Test1234!` | sales |
   | `operations@test.com` | `Test1234!` | operations |
   | `marketing@test.com` | `Test1234!` | marketing |
   | `admin@test.com` | `Test1234!` | admin |

3. **After creating users, go to SQL Editor and run:**

```sql
-- Get the user IDs
SELECT id, email FROM auth.users WHERE email LIKE '%@test.com';

-- Assign roles (replace UUIDs with actual IDs from above)
INSERT INTO public.user_roles (user_id, role, name) VALUES
  ('REPLACE_WITH_FINANCE_ID', 'finance', 'Finance Test'),
  ('REPLACE_WITH_SALES_ID', 'sales', 'Sales Test'),
  ('REPLACE_WITH_OPERATIONS_ID', 'operations', 'Operations Test'),
  ('REPLACE_WITH_MARKETING_ID', 'marketing', 'Marketing Test'),
  ('REPLACE_WITH_ADMIN_ID', 'admin', 'Admin Test')
ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role, name = EXCLUDED.name;
```

#### Option B: Quick SQL Script

```sql
-- This creates users and assigns roles in one go
-- (Only works if you have direct database access or use Supabase Auth Admin API)

-- For now, use Option A via Dashboard
```

---

### Step 3: Manual Testing in Your App (10 minutes)

#### Test Finance Role

1. **Logout if currently logged in**
2. **Login as** `finance@test.com`
3. **Verify sidebar shows:**
   - ✅ لوحة التحكم (Dashboard)
   - ✅ التقارير (Reports)
   - ✅ الرسوم البيانية (Charts)
   - ✅ المالية (Finance)
   - ✅ الموردين (Suppliers)
   - ❌ المبيعات (Sales) - should NOT appear
   - ❌ العمليات (Operations) - should NOT appear
   - ❌ التسويق (Marketing) - should NOT appear

4. **Try to access unauthorized page:**
   - Manually type `/manager/sales` in the browser URL
   - **Expected:** Should show "غير مصرح" (Unauthorized) page

#### Test Sales Role

1. **Logout and login as** `sales@test.com`
2. **Verify sidebar shows:**
   - ✅ Dashboard, Reports, Charts, Sales, Customers
   - ❌ Finance, Operations, Marketing

3. **Try `/manager/finance`** → Should be blocked

#### Test Operations Role

1. **Login as** `operations@test.com`
2. **Should see:** Dashboard, Reports, Charts, Operations, Suppliers
3. **Try `/manager/sales`** → Blocked

#### Test Marketing Role

1. **Login as** `marketing@test.com`
2. **Should see:** Dashboard, Reports, Charts, Marketing, Customers
3. **Try `/manager/finance`** → Blocked

#### Test Admin Role

1. **Login as** `admin@test.com`
2. **Should see:** ALL sections in sidebar
3. **Can access any URL** without restrictions

---

### Step 4: Run Automated Tests (3 minutes)

```bash
# Run the new auth integration tests
npm test -- auth-integration.test.tsx

# Expected output:
# ✓ Finance role access control (4 tests)
# ✓ Sales role access control (2 tests)
# ✓ Operations role access control (2 tests)
# ✓ Marketing role access control (2 tests)
# ✓ Admin role access control (1 test)
# ✓ Manager role access control (1 test)
# ✓ Unauthenticated access (1 test)
# ✓ Loading state (1 test)
```

---

### Step 5: Test Server-Side Authorization (Optional)

If you want to add extra security checks in your components:

```typescript
import { AuthService } from '@/services/AuthService';

// Example: Before submitting finance data
const handleFinanceSubmit = async () => {
  try {
    // This will throw if user lacks permission
    await AuthService.requireAccess('finance');
    
    // Proceed with the action
    await submitFinanceData(formData);
    toast.success('تم الحفظ بنجاح');
  } catch (err) {
    // User already got a toast notification from requireAccess
    console.error('Unauthorized', err);
  }
};

// Example: Check if user is admin before showing a button
const [isAdmin, setIsAdmin] = React.useState(false);

React.useEffect(() => {
  AuthService.isAdmin().then(setIsAdmin);
}, []);

return (
  <>
    {isAdmin && <Button onClick={handleAdminAction}>إدارة</Button>}
  </>
);
```

---

## 🎯 Success Criteria

After completing all steps, you should have:

✅ **Database:** RLS policies active, `get_user_profile` RPC working  
✅ **Test Users:** 5 users with different roles created  
✅ **UI Navigation:** Sidebar only shows permitted sections per role  
✅ **Route Protection:** Direct URL access to unauthorized pages blocked  
✅ **Automated Tests:** All auth integration tests passing  
✅ **Console:** No errors during role switching or page navigation  

---

## 🚨 Troubleshooting

### Issue: "RLS policy violation" when accessing data
**Solution:** User doesn't have a role assigned. Run:
```sql
SELECT * FROM public.user_roles WHERE user_id = 'YOUR_USER_ID';
-- If empty, insert a role
```

### Issue: Sidebar shows all sections for finance user
**Solution:** Check AuthContext is loading permissions correctly:
- Open DevTools → Console
- Look for `[AuthContext] User role loaded: finance`
- Check `localStorage.getItem('wathiq_auth')` has correct session

### Issue: Tests fail with "Cannot find module '@/contexts/AuthContext'"
**Solution:** Run `npm install` to ensure all dependencies are installed.

### Issue: get_user_profile function not found
**Solution:** Re-run `supabase/001_schema.sql` migration in SQL Editor.

---

## 📊 What to Report Back

After testing, let me know:
1. ✅ / ❌ All test users created and roles assigned?
2. ✅ / ❌ Finance user blocked from sales page?
3. ✅ / ❌ Sales user blocked from finance page?
4. ✅ / ❌ Admin can access all pages?
5. ✅ / ❌ Automated tests passing?
6. Any errors in browser console?

Then we can move on to the next phase: **Notifications System Testing** 🔔

