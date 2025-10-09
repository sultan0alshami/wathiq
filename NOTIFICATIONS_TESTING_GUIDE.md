# Phase 2: Notifications System Testing Guide

## ✅ Security Phase Complete!

All AuthService protections have been added:
- ✅ Delete actions protected in Finance, Sales, Operations pages
- ✅ Bulk export in Reports guarded with permission check
- ✅ Admin user management button (conditional rendering)

---

## 🔔 Phase 2: Notifications System

### Overview

The notifications system consists of:
1. **`NotificationsContext`** - React context managing notification state
2. **Supabase `notifications` table** - Backend storage with RLS
3. **Supabase Realtime** - Live notification delivery
4. **Header notification dropdown** - UI for viewing notifications
5. **Backend PDF generation** - Emits notifications after PDF creation

---

## Step 1: Verify Notifications Table (5 min)

### 1.1 Check Table Exists

**In Supabase Dashboard** → SQL Editor:

```sql
-- Verify notifications table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'notifications'
ORDER BY ordinal_position;
```

**Expected columns:**
- `id` (uuid)
- `user_id` (uuid, nullable) - null for broadcast
- `type` (text) - 'info', 'success', 'warning', 'error'
- `title` (text)
- `message` (text)
- `is_broadcast` (boolean)
- `created_at` (timestamp)
- `read_at` (timestamp, nullable)

### 1.2 Check RLS Policies

```sql
-- List notification RLS policies
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename = 'notifications';
```

**Expected policies:**
- `notifications_select_policy` - Users can select their own + broadcast
- `notifications_update_policy` - Users can update their own (mark read)
- `notifications_insert_self` - Users can create for themselves + broadcast

---

## Step 2: Test Notification Creation (10 min)

### 2.1 Manual Test via SQL

**Create a test broadcast notification:**

```sql
-- Insert a test broadcast notification
INSERT INTO public.notifications (type, title, message, is_broadcast, created_at)
VALUES (
  'info',
  'إشعار تجريبي',
  'هذا إشعار تجريبي للتحقق من النظام',
  true,
  NOW()
);
```

### 2.2 Create User-Specific Notification

```sql
-- Replace with your actual user ID
INSERT INTO public.notifications (user_id, type, title, message, is_broadcast, created_at)
VALUES (
  '7b601100-e2ab-41eb-85b5-765d2e3107fc',
  'success',
  'إشعار خاص',
  'هذا إشعار خاص بك فقط',
  false,
  NOW()
);
```

### 2.3 Check Notifications in UI

1. **Login to your app** (https://wathiq-three.vercel.app)
2. **Look at the Header** → Bell icon
3. **Expected:** Badge showing `1` (or more) unread count
4. **Click the bell icon**
5. **Expected:** Dropdown shows your test notifications

---

## Step 3: Test Supabase Realtime (15 min)

### 3.1 Open Browser DevTools

1. **Login to your app**
2. **Open DevTools** → Console tab
3. **Look for:** `[NotificationsContext]` logs

### 3.2 Create Notification While App is Open

**In Supabase SQL Editor:**

```sql
-- Create notification while app is running
INSERT INTO public.notifications (type, title, message, is_broadcast, created_at)
VALUES (
  'warning',
  'تحديث مباشر',
  'تم إنشاء هذا الإشعار بينما التطبيق مفتوح!',
  true,
  NOW()
);
```

### 3.3 Verify Real-time Update

**Expected behavior:**
- ✅ Notification appears in header dropdown **immediately** (no page refresh)
- ✅ Unread count badge updates **instantly**
- ✅ Console shows: `[NotificationsContext] New notification received`

**If it doesn't work:**
- Check browser console for Realtime connection errors
- Verify Supabase Realtime is enabled for your project
- Check RLS policies allow `SELECT` for authenticated users

---

## Step 4: Test Notification Actions (10 min)

### 4.1 Mark as Read

1. **Click bell icon** → Open notifications dropdown
2. **Find unread notification** (has blue dot)
3. **Click "تمييز كمقروء"**
4. **Expected:**
   - Blue dot disappears
   - Unread count decreases
   - Notification stays in list

### 4.2 Mark All as Read

1. **With multiple unread notifications**
2. **Click "تحديد الكل كمقروء"** at top of dropdown
3. **Expected:**
   - All blue dots disappear
   - Unread count becomes `0`
   - Badge hides

### 4.3 Verify Persistence

1. **Mark some notifications as read**
2. **Refresh the page** (F5)
3. **Expected:**
   - Read status persists
   - Unread count correct
   - Notifications still visible

---

## Step 5: Test Backend PDF Notifications (20 min)

### 5.1 Check Backend Environment

**Verify Koyeb has Supabase env vars:**

1. **Go to Koyeb Dashboard** → Your service → Environment
2. **Check these exist:**
   - `SUPABASE_SERVICE_URL` = Your Supabase project URL
   - `SUPABASE_SERVICE_KEY` = Your Supabase service role key (from Settings → API)

**If missing:** Add them now and redeploy.

### 5.2 Generate a PDF

1. **Login to your app**
2. **Go to Reports page**
3. **Click "تقرير يومي مجمع" (Merged Daily Report)**
4. **Wait for PDF to generate**

### 5.3 Check for Notification

**Expected after PDF generation:**
- ✅ Header bell shows `+1` notification
- ✅ Notification title: "تم إنشاء تقرير PDF"
- ✅ Notification type: `success` (green icon)
- ✅ Notification is broadcast (visible to all users)

### 5.4 Check Backend Logs

**In Koyeb Dashboard** → Logs tab:

```
Look for:
✅ "Supabase notification emitted successfully."
❌ "Supabase service role not configured" (means env vars missing)
❌ "Failed to emit Supabase notification" (check service key)
```

---

## Step 6: Test Notification Types (10 min)

Create notifications of different types to test UI:

```sql
-- Success notification (green)
INSERT INTO public.notifications (type, title, message, is_broadcast)
VALUES ('success', 'نجاح', 'تمت العملية بنجاح', true);

-- Error notification (red)
INSERT INTO public.notifications (type, title, message, is_broadcast)
VALUES ('error', 'خطأ', 'حدث خطأ في النظام', true);

-- Warning notification (yellow)
INSERT INTO public.notifications (type, title, message, is_broadcast)
VALUES ('warning', 'تحذير', 'يرجى الانتباه', true);

-- Info notification (blue)
INSERT INTO public.notifications (type, title, message, is_broadcast)
VALUES ('info', 'معلومة', 'معلومة مهمة', true);
```

**Expected:**
- Each notification shows correct colored icon
- Notifications appear in chronological order (newest first)

---

## 🎯 Success Criteria

After completing all steps:

✅ **Database:**
- Notifications table exists with correct schema
- RLS policies active and working
- Can insert/read notifications via SQL

✅ **Frontend:**
- Header bell icon shows unread count
- Dropdown displays notifications correctly
- Mark as read works (individual + all)
- Notifications persist across page refreshes

✅ **Realtime:**
- New notifications appear instantly without refresh
- Supabase Realtime channel connected (check console)
- No errors in browser DevTools

✅ **Backend Integration:**
- PDF generation triggers notification
- Broadcast notifications visible to all users
- Backend logs show successful emission

---

## 🚨 Troubleshooting

### Issue: Notifications don't appear in UI

**Checks:**
1. Open DevTools → Console, look for errors
2. Check `localStorage` → `wathiq_notifications` key exists
3. Verify `useNotifications` hook is working:
   ```javascript
   // In browser console
   localStorage.getItem('wathiq_notifications')
   ```

**Solution:**
- Clear localStorage: `localStorage.clear()` and re-login
- Check NotificationsProvider wraps App in `main.tsx`

---

### Issue: Realtime not working

**Symptoms:** Notifications only appear after page refresh

**Checks:**
1. **Supabase Dashboard** → Settings → API → Is Realtime enabled?
2. **Browser Console:** Look for WebSocket errors
3. **Network tab:** Check for `/realtime/v1` connection

**Solutions:**
- Enable Realtime in Supabase project settings
- Check RLS policies allow `SELECT` for your user
- Verify no firewall blocking WebSocket connections

---

### Issue: Backend notifications not appearing

**Symptoms:** PDF downloads but no notification

**Checks:**
1. **Koyeb logs:** Any errors about Supabase?
2. **Environment variables:** SUPABASE_SERVICE_URL and SUPABASE_SERVICE_KEY set?
3. **Service role key:** Is it correct? (copy from Supabase Settings → API)

**Solutions:**
```bash
# Get your service role key
# Supabase Dashboard → Settings → API → service_role key (keep secret!)

# Add to Koyeb:
# 1. Go to your service → Environment
# 2. Add:
#    SUPABASE_SERVICE_URL=https://your-project.supabase.co
#    SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1...  (service_role key)
# 3. Redeploy
```

---

### Issue: Unread count wrong

**Symptoms:** Badge shows wrong number

**Solution:**
```sql
-- Check actual unread count in database
SELECT COUNT(*) 
FROM public.notifications 
WHERE (user_id = 'YOUR_USER_ID' OR is_broadcast = true)
AND read_at IS NULL;

-- Reset all to unread for testing
UPDATE public.notifications 
SET read_at = NULL;
```

---

## 📊 Test Results Template

Use this to track your testing:

```
## Notification System Test Results

### Database Setup
- [ ] notifications table exists
- [ ] RLS policies active
- [ ] Can insert test notifications

### Frontend UI
- [ ] Bell icon shows unread count
- [ ] Dropdown displays notifications
- [ ] Mark as read works
- [ ] Mark all as read works
- [ ] Notifications persist after refresh

### Realtime
- [ ] New notifications appear instantly
- [ ] No WebSocket errors in console
- [ ] Realtime channel connected

### Backend Integration
- [ ] PDF generation triggers notification
- [ ] Backend logs show success
- [ ] SUPABASE_SERVICE env vars set

### Issues Found:
(List any problems here)

### Screenshots:
(Attach screenshots if possible)
```

---

## 🚀 Next Steps After Testing

Once all tests pass:

1. **✅ Mark notification TODOs as complete**
2. **📱 Move to Phase 3: Mobile UI Optimization**
   - Sales page mobile layout
   - Operations page mobile layout
   - Touch-friendly controls
3. **🎨 Phase 4: Final Polish**
   - Dark mode contrast audit
   - Performance optimization
   - Remove any remaining test data

---

**Ready to start? Begin with Step 1: Verify the notifications table in Supabase!** 🔔

