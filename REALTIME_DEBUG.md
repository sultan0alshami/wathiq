# 🔴 Realtime Notifications Not Working - Debug Guide

## Issue: Realtime subscription shows "SUBSCRIBED" but no notifications appear

---

## ✅ What's Working:
- Notifications load from database (18 notifications)
- Mark as read works
- Mark all as read works
- Realtime status: SUBSCRIBED
- Colored icons display correctly

## ❌ What's NOT Working:
- New notifications don't appear in real-time
- No console log: `[NotificationsContext] New notification received`
- PDF generation doesn't trigger notifications

---

## 🔍 Step 1: Check Supabase Realtime Settings

### In Supabase Dashboard:

1. **Go to:** Settings → API
2. **Scroll to:** Realtime section
3. **Check:** "Enable Realtime" is ON
4. **Check:** Tables section

**Critical Check:**
```
Is "notifications" table listed under Realtime enabled tables?
```

**If NOT listed:**
1. Click "Manage Realtime" or "Enable Realtime for tables"
2. Find `notifications` table
3. Enable Realtime for it
4. Wait 1-2 minutes for changes to apply

---

## 🔍 Step 2: Check Realtime Policies

The issue might be RLS blocking Realtime events.

### Run this in Supabase SQL Editor:

```sql
-- Check if Realtime is enabled at database level
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'notifications';

-- Check RLS policies
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
WHERE tablename = 'notifications';
```

**Expected:**
- `rowsecurity`: true (RLS enabled)
- At least 3 policies: SELECT, UPDATE, INSERT

---

## 🔍 Step 3: Test Realtime Manually

### Test if Realtime works at all:

1. **Open your app** (keep console open)
2. **In another tab**, open Supabase Dashboard → Table Editor
3. **Click on `notifications` table**
4. **Click "Insert row" button (UI, not SQL)**
5. **Fill in:**
   - type: `info`
   - title: `UI Test`
   - message: `Testing from UI`
   - is_broadcast: `true` (check the box)
6. **Click Insert**

**Expected in console:**
```
[NotificationsContext] New notification received: {id: "...", type: "info", ...}
```

**If still nothing:** Realtime is not enabled or blocked by RLS.

---

## 🔍 Step 4: Check Realtime Publication

Supabase Realtime uses PostgreSQL publications. Check if it exists:

```sql
-- Check if supabase_realtime publication exists
SELECT * FROM pg_publication WHERE pubname = 'supabase_realtime';

-- Check which tables are in the publication
SELECT 
  schemaname,
  tablename
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

**Expected:**
- `supabase_realtime` publication exists
- `notifications` table is in the publication

**If notifications is NOT in publication, run:**
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

---

## 🔍 Step 5: Network/WebSocket Check

### Check if WebSocket connection is working:

1. **Open DevTools** → Network tab
2. **Filter by:** WS (WebSocket)
3. **Look for:** Connection to Supabase Realtime

**Expected:**
- WebSocket connection to `wss://[your-project].supabase.co/realtime/v1/websocket`
- Status: `101 Switching Protocols` (successful)
- Messages tab shows ping/pong

**If connection fails:**
- Check firewall/proxy settings
- Try different network (mobile hotspot)

---

## 🔍 Step 6: Verify RLS Policies Allow Realtime

The issue might be that RLS policies block Realtime events.

### Run this to fix RLS for Realtime:

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "notifications_select_policy" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_policy" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_self" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_broadcast" ON public.notifications;

-- Create new policies with proper Realtime support
CREATE POLICY "notifications_select_policy"
ON public.notifications FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR is_broadcast = true
);

CREATE POLICY "notifications_update_policy"
ON public.notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_insert_self"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR is_broadcast = true);

-- IMPORTANT: Allow service role to insert (for backend)
CREATE POLICY "notifications_insert_service"
ON public.notifications FOR INSERT
TO service_role
WITH CHECK (true);

-- IMPORTANT: Allow anon to select broadcasts (for Realtime)
CREATE POLICY "notifications_select_broadcasts_anon"
ON public.notifications FOR SELECT
TO anon
USING (is_broadcast = true);
```

---

## 🔍 Step 7: Test Backend PDF Notification

The backend might not be emitting notifications correctly.

### Check Koyeb Environment Variables:

1. **Go to Koyeb Dashboard** → Your service → Environment
2. **Verify these exist and are correct:**
   - `SUPABASE_SERVICE_URL` = `https://vxlcguvopddtbjmkmqjb.supabase.co`
   - `SUPABASE_SERVICE_KEY` = Your service_role key (from Supabase Settings → API)

**To get service_role key:**
1. Supabase Dashboard → Settings → API
2. Copy "service_role" key (NOT anon key!)
3. Add to Koyeb environment
4. Redeploy

### Test PDF Generation:

1. **Go to Reports page**
2. **Generate PDF**
3. **Check Koyeb logs:**

**Expected in logs:**
```
Supabase notification emitted successfully.
```

**If you see:**
```
Supabase service role not configured
```
→ Environment variables missing

**If you see:**
```
Failed to emit Supabase notification: 401
```
→ Service role key is wrong

---

## 🎯 Quick Fix Checklist

Run these in order:

### 1. Enable Realtime (Supabase Dashboard)
- Settings → API → Enable Realtime → Enable for `notifications` table

### 2. Add to Publication (SQL)
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

### 3. Fix RLS Policies (SQL)
```sql
-- Run the policies from Step 6 above
```

### 4. Test Realtime (SQL while app is open)
```sql
INSERT INTO public.notifications (type, title, message, is_broadcast)
VALUES ('info', 'Realtime Test', 'If you see this without refresh, Realtime works!', true);
```

### 5. Check Console
```
[NotificationsContext] New notification received: {...}
```

---

## 📊 Diagnostic Results

**Fill this out and share:**

| Check | Status | Notes |
|-------|--------|-------|
| Realtime enabled in Supabase Settings | ⬜ Yes / ⬜ No | |
| `notifications` table in Realtime list | ⬜ Yes / ⬜ No | |
| `supabase_realtime` publication exists | ⬜ Yes / ⬜ No | |
| `notifications` in publication | ⬜ Yes / ⬜ No | |
| WebSocket connection established | ⬜ Yes / ⬜ No | |
| RLS policies allow SELECT for broadcasts | ⬜ Yes / ⬜ No | |
| Test notification appears in UI | ⬜ Yes / ⬜ No | |
| Koyeb env vars configured | ⬜ Yes / ⬜ No | |
| Backend logs show "emitted successfully" | ⬜ Yes / ⬜ No | |

---

## 🚀 Most Likely Solution

Based on the symptoms, the issue is probably:

1. **Realtime not enabled for `notifications` table** (95% likely)
2. **Table not in `supabase_realtime` publication** (80% likely)
3. **RLS blocking Realtime events** (50% likely)

**Start with Step 1 - check Supabase Realtime settings!**

---

**Which step reveals the issue? Let me know what you find!**

