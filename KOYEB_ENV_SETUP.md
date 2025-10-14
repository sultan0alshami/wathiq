# 🚀 Koyeb Environment Variables Setup

## Issue: PDF generation doesn't emit notifications

The backend needs **Supabase credentials** to emit notifications after generating PDFs.

---

## 📋 Required Environment Variables

### 1. SUPABASE_SERVICE_URL

**Value:** `https://vxlcguvopddtbjmkmqjb.supabase.co`

### 2. SUPABASE_SERVICE_KEY

**Where to find it:**
1. Open Supabase Dashboard: https://supabase.com/dashboard/project/vxlcguvopddtbjmkmqjb
2. Go to: **Settings** → **API**
3. Scroll to: **Project API keys**
4. Copy the **`service_role`** key (NOT the `anon` key!)
   - It starts with: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...`
   - ⚠️ **WARNING: This is a SECRET key - never commit it to git!**

---

## 🔧 How to Add to Koyeb

### Step 1: Open Koyeb Dashboard

1. Go to: https://app.koyeb.com/
2. Click on your service (the backend app)
3. Click: **"Settings"** or **"Environment"** tab

### Step 2: Add Environment Variables

Click **"Add Variable"** or **"Edit"** and add:

| Variable Name | Value | Notes |
|---------------|-------|-------|
| `SUPABASE_SERVICE_URL` | `https://vxlcguvopddtbjmkmqjb.supabase.co` | Your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | `eyJhbGci...` (your service_role key) | ⚠️ Keep this secret! |
| `PORT` | `8000` | (Should already be set) |
| `PYTHON_PATH` | `python3` | (Optional, for Python location) |

### Step 3: Save and Redeploy

1. Click **"Save"** or **"Update"**
2. Koyeb will automatically redeploy your service
3. Wait 2-3 minutes for the new deployment

---

## ✅ Verify It's Working

### Check Logs:

1. **Go to Koyeb Dashboard** → Your service → **Logs** tab
2. **Generate a PDF** from your app (Reports page → تقرير يومي مجمع)
3. **Look for these logs:**

**✅ SUCCESS:**
```
[Backend] Attempting to emit Supabase notification...
[Backend] Supabase URL: https://vxlcguvopddtbjmkmqjb.supabase.co
[Backend] ✅ Supabase notification emitted successfully!
```

**❌ ERROR - Missing env vars:**
```
[Backend] ⚠️ Supabase service URL or KEY not configured. Skipping notification.
```
→ **Solution:** Add the environment variables (Step 2 above)

**❌ ERROR - Wrong key:**
```
[Backend] ❌ Failed to emit notification. Status: 401
```
→ **Solution:** Check you copied the **service_role** key (not anon key)

**❌ ERROR - RLS blocking:**
```
[Backend] ❌ Failed to emit notification. Status: 403
```
→ **Solution:** Check RLS policies allow service_role to INSERT

---

## 🧪 Test After Setup

### Step 1: Generate PDF

1. Go to your app: https://wathiq-three.vercel.app
2. Login
3. Go to **Reports** page
4. Click **"تقرير يومي مجمع"** (Merged Daily Report)
5. Wait for PDF to download

### Step 2: Check Notification

**Expected:**
- Bell icon badge increases by 1
- New notification appears in dropdown
- Title: **"تم إنشاء تقرير PDF"**
- Message: **"تم إنشاء التقرير بتاريخ [date] بنجاح..."**
- Icon: **Green ✅ checkmark**

**In browser console:**
```
[NotificationsContext] New notification received: {type: "success", title: "تم إنشاء تقرير PDF", ...}
```

---

## 🔍 Troubleshooting

### Issue: Still no notification after adding env vars

**Check:**
1. Did you redeploy after adding variables?
2. Are the variables spelled exactly as shown? (case-sensitive!)
3. Is the service_role key the full string? (very long, ~200 characters)

**Quick Fix:**
1. Go to Koyeb → Your service → Deployments
2. Click **"Redeploy"** to trigger a fresh deployment
3. Wait 2-3 minutes
4. Try generating PDF again

---

### Issue: 401 Unauthorized error

**Problem:** Wrong Supabase key

**Solution:**
1. Go to Supabase Dashboard → Settings → API
2. Double-check you copied **service_role** key (not anon/public key)
3. Copy the entire key (it's very long!)
4. Update `SUPABASE_SERVICE_KEY` in Koyeb
5. Redeploy

---

### Issue: 403 Forbidden error

**Problem:** RLS policies blocking service_role

**Solution:**

Run this in Supabase SQL Editor:

```sql
-- Allow service_role to INSERT notifications
DROP POLICY IF EXISTS "notifications_insert_service" ON public.notifications;

CREATE POLICY "notifications_insert_service"
ON public.notifications FOR INSERT
TO service_role
WITH CHECK (true);

-- Verify policy was created
SELECT policyname, roles 
FROM pg_policies 
WHERE tablename = 'notifications' AND policyname = 'notifications_insert_service';
```

**Expected result:** One row showing the policy exists with role = `service_role`

---

## 📊 Environment Variable Checklist

Before testing, verify:

- [ ] `SUPABASE_SERVICE_URL` is set to `https://vxlcguvopddtbjmkmqjb.supabase.co`
- [ ] `SUPABASE_SERVICE_KEY` is set to your service_role key (starts with `eyJhbGci...`)
- [ ] Both variables are saved in Koyeb
- [ ] Service has been redeployed after adding variables
- [ ] Koyeb logs show no errors about "not configured"
- [ ] Generated PDF successfully
- [ ] Notification appeared in app UI

---

## 🎯 Quick Summary

**To fix PDF notifications:**

1. **Get service_role key** from Supabase Settings → API
2. **Add to Koyeb:**
   - `SUPABASE_SERVICE_URL` = `https://vxlcguvopddtbjmkmqjb.supabase.co`
   - `SUPABASE_SERVICE_KEY` = (your service_role key)
3. **Redeploy** Koyeb service
4. **Test** by generating a PDF
5. **Check logs** in Koyeb for success message

---

**Add the environment variables now and test PDF generation!** 📄✨

