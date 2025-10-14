# 🔍 Supabase URL Test

## Issue: DNS resolution failure for Supabase project

The backend is failing with:
```
getaddrinfo ENOTFOUND vxlcguvopddtbjmkmqjb.supabase.co
```

This means the Supabase project URL might be:
1. **Incorrect** - Wrong project reference URL
2. **Deleted** - Project was deleted or suspended
3. **DNS issue** - Temporary DNS resolution problem
4. **Network blocking** - Koyeb blocking Supabase domains

---

## 🧪 Test Steps

### Step 1: Verify Supabase Project URL

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Check your project list**
3. **Click on your project**
4. **Go to Settings → API**
5. **Copy the "Project URL"**

**Expected format:** `https://[project-id].supabase.co`

### Step 2: Test URL in Browser

Open this URL in browser:
```
https://vxlcguvopddtbjmkmqjb.supabase.co/rest/v1/
```

**Expected:** JSON response with Supabase API info
**If 404/DNS error:** Project doesn't exist or URL is wrong

### Step 3: Check Project Status

In Supabase Dashboard:
- Is the project **active**?
- Is it **paused** or **suspended**?
- Are there any billing issues?

---

## 🔧 Possible Solutions

### Solution 1: Correct Project URL

If the URL is wrong, update the environment variable:

1. **Get correct URL from Supabase Dashboard**
2. **Update in Koyeb:**
   - Go to Koyeb → Your service → Environment
   - Update `SUPABASE_SERVICE_URL` with correct URL
   - Redeploy

### Solution 2: Use Alternative DNS

Add DNS resolution to the backend:

```javascript
// In server.js, replace the URL with IP
const SUPABASE_URL = process.env.SUPABASE_SERVICE_URL?.replace(
  'vxlcguvopddtbjmkmqjb.supabase.co', 
  '76.76.21.21'  // Supabase IP
);
```

### Solution 3: Test with Different Project

Create a new Supabase project and test with that URL.

### Solution 4: Use Different Hosting

If Koyeb blocks Supabase, try:
- Railway
- Render
- Fly.io
- Google Cloud Run

---

## 🎯 Immediate Action

**Check your Supabase project:**

1. **Login to Supabase Dashboard**
2. **Verify project exists and is active**
3. **Copy the exact Project URL from Settings → API**
4. **Test the URL in browser**

**If project exists:** Update environment variable with correct URL
**If project doesn't exist:** Create new project or restore from backup

---

**What do you see when you go to your Supabase Dashboard?**
