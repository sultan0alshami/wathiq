# 🔍 Debug Notifications - Step by Step

## Issue: Still no notifications appearing

Let's debug this systematically.

---

## Step 1: Check Browser Console (CRITICAL)

1. **Open your app**: https://wathiq-three.vercel.app
2. **Open DevTools** (F12) → **Console tab**
3. **Clear console** (trash icon)
4. **Refresh page** (F5)

### What do you see?

**Look for these messages:**

✅ **Success (notifications working):**
```
[NotificationsContext] Loaded 3 notifications from Supabase
[NotificationsContext] Setting up Realtime subscription for user: 7b601100-...
[NotificationsContext] Realtime status: SUBSCRIBED
```

❌ **Problem 1 (RLS blocking query):**
```
[NotificationsContext] Error loading notifications: {...policy...}
```
**Solution:** RLS policies need fixing (see Step 3)

❌ **Problem 2 (Table doesn't exist):**
```
[NotificationsContext] Error loading notifications: {relation "notifications" does not exist}
```
**Solution:** Run `supabase/002_notifications.sql` (see Step 2)

❌ **Problem 3 (Loaded 0 notifications):**
```
[NotificationsContext] Loaded 0 notifications from Supabase
```
**Solution:** No data in table, create test notifications (see Step 4)

---

## Step 2: Verify Table Exists

**In Supabase Dashboard** → SQL Editor:

```sql
-- Check if notifications table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'notifications'
) as table_exists;
```

**Expected:** `table_exists: true`

**If false:** Run this to create the table:

```sql
-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  title text NOT NULL,
  message text,
  is_broadcast boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  read_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create index for performance
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications (user_id);
CREATE INDEX IF NOT EXISTS notifications_is_broadcast_idx ON public.notifications (is_broadcast);
```

---

## Step 3: Check RLS Policies

```sql
-- List all RLS policies for notifications
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'notifications';
```

**Expected policies:**
- `notifications_select_policy` (SELECT)
- `notifications_update_policy` (UPDATE)
- `notifications_insert_self` (INSERT)

**If missing or wrong, run this:**

```sql
-- Drop old policies (if they exist)
DROP POLICY IF EXISTS "notifications_select_policy" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_policy" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_self" ON public.notifications;

-- Create correct policies
-- Allow authenticated users to SELECT their own notifications + broadcasts
CREATE POLICY "notifications_select_policy"
ON public.notifications FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR is_broadcast = true
);

-- Allow authenticated users to UPDATE their own notifications (mark as read)
CREATE POLICY "notifications_update_policy"
ON public.notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to INSERT notifications for themselves
CREATE POLICY "notifications_insert_self"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR is_broadcast = true);

-- Allow service role to INSERT broadcast notifications (for backend)
CREATE POLICY "notifications_insert_broadcast"
ON public.notifications FOR INSERT
TO service_role
WITH CHECK (is_broadcast = true);
```

---

## Step 4: Create Test Notifications

**Run this SQL to create test data:**

```sql
-- Get your user ID first
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;
```

**Copy your user ID, then run:**

```sql
-- Replace YOUR_USER_ID with your actual UUID
DO $$
DECLARE
  user_uuid uuid := '7b601100-e2ab-41eb-85b5-765d2e3107fc'; -- Replace with your user ID
BEGIN
  -- Insert broadcast notifications (visible to all)
  INSERT INTO public.notifications (type, title, message, is_broadcast, created_at) VALUES
    ('success', 'مرحباً بك', 'تم تفعيل نظام الإشعارات بنجاح', true, NOW() - INTERVAL '1 hour'),
    ('info', 'معلومة مهمة', 'يرجى مراجعة التقارير اليومية', true, NOW() - INTERVAL '30 minutes'),
    ('warning', 'تحذير', 'انتبه للسيولة المالية المنخفضة', true, NOW() - INTERVAL '15 minutes');

  -- Insert user-specific notifications
  INSERT INTO public.notifications (user_id, type, title, message, is_broadcast, created_at) VALUES
    (user_uuid, 'success', 'إشعار خاص', 'هذا إشعار خاص بك فقط', false, NOW() - INTERVAL '5 minutes'),
    (user_uuid, 'error', 'خطأ في النظام', 'يرجى التحقق من الإعدادات', false, NOW() - INTERVAL '2 minutes');
END $$;
```

---

## Step 5: Verify Data Exists

```sql
-- Count notifications
SELECT 
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE is_broadcast = true) as broadcast_count,
  COUNT(*) FILTER (WHERE user_id = '7b601100-e2ab-41eb-85b5-765d2e3107fc') as user_count
FROM public.notifications;
```

**Expected:**
- `total_count`: 5
- `broadcast_count`: 3
- `user_count`: 2

---

## Step 6: Test RLS Manually

**This simulates what the frontend does:**

```sql
-- Set current user context (simulates authenticated user)
SET request.jwt.claims.sub = '7b601100-e2ab-41eb-85b5-765d2e3107fc';

-- Try to SELECT notifications (same query frontend uses)
SELECT * FROM public.notifications
WHERE user_id = '7b601100-e2ab-41eb-85b5-765d2e3107fc' OR is_broadcast = true
ORDER BY created_at DESC;
```

**Expected:** Should return 5 rows (3 broadcasts + 2 user-specific)

**If it returns 0 rows:** RLS is blocking the query. The policies need to be fixed.

---

## Step 7: Check Realtime Status

**In Supabase Dashboard** → Settings → API:

1. **Scroll to "Realtime"**
2. **Check:** "Enable Realtime" is ON
3. **Check:** `notifications` table is in the list of enabled tables

**If Realtime is disabled:**
- Enable it
- Wait 1-2 minutes for changes to propagate
- Refresh your app

---

## Step 8: Final Frontend Test

1. **Clear browser cache:**
   - Open DevTools → Application tab → Storage
   - Right-click "Local Storage" → Clear
   - Or run in console: `localStorage.clear()`

2. **Refresh page** (F5)

3. **Login again**

4. **Check console:**
   ```
   [NotificationsContext] Loaded X notifications from Supabase
   ```

5. **Check header:**
   - Bell icon should show badge with number

---

## 🎯 Quick Diagnosis

**Tell me what you see in the browser console:**

| Message | Meaning | Action |
|---------|---------|--------|
| `Loaded 0 notifications` | No data in database | Run Step 4 to create test data |
| `Error loading notifications: {...policy...}` | RLS blocking query | Run Step 3 to fix policies |
| `Error loading notifications: {relation...}` | Table doesn't exist | Run Step 2 to create table |
| `Loaded 5 notifications` ✅ | **Everything works!** | Check if bell icon appears |
| `Realtime status: CLOSED` | Realtime disabled | Enable in Step 7 |
| No logs at all | Context not loaded | Check if NotificationsProvider in `main.tsx` |

---

## 🚨 Emergency: Manual Check

**If nothing works, run this complete diagnostic:**

```sql
-- Complete diagnostic query
SELECT 
  'Table exists' as check_type,
  EXISTS(SELECT FROM information_schema.tables WHERE table_name = 'notifications') as result
UNION ALL
SELECT 
  'RLS enabled',
  relrowsecurity::text
FROM pg_class
WHERE relname = 'notifications'
UNION ALL
SELECT 
  'Total notifications',
  COUNT(*)::text
FROM public.notifications
UNION ALL
SELECT 
  'RLS policies count',
  COUNT(*)::text
FROM pg_policies
WHERE tablename = 'notifications';
```

**Share the results and I'll help you fix it!**

---

**What do you see in the browser console? Copy and paste the exact logs here.** 🔍

