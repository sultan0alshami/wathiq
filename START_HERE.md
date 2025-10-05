# 🎯 START HERE - Wathiq Setup

## ✅ What's Already Done

1. ✅ Supabase project created
2. ✅ `.env` file created with your credentials
3. ✅ SQL scripts prepared
4. ✅ All code committed to GitHub

---

## 🚀 What You Need to Do (10 Minutes Total)

### **OPTION 1: Follow the Visual Guide** (Recommended)

Open this file: **`COMPLETE_SETUP_STEPS.md`**

It has:
- ✅ Step-by-step instructions
- ✅ Exact commands to run
- ✅ Screenshots of what you should see
- ✅ Troubleshooting tips

### **OPTION 2: Use Quick Links**

Open this file: **`SUPABASE_QUICK_LINKS.md`**

It has:
- ✅ Direct clickable links to each Supabase page
- ✅ Quick copy-paste commands
- ✅ All user credentials

---

## 📋 The 3 Steps You Need to Do

### STEP 1: Create Database Table (2 min)
1. Go to: https://supabase.com/dashboard/project/kjtjlcvcwmlrbqdzfwca/sql
2. Click "New query"
3. Copy ALL content from `supabase_setup.sql` file
4. Paste into SQL Editor
5. Click RUN
6. Should see: "Success. No rows returned"

---

### STEP 2: Create 6 Users (5 min)
1. Go to: https://supabase.com/dashboard/project/kjtjlcvcwmlrbqdzfwca/auth/users
2. Click "Add user" → "Create new user"
3. Create each user (emails and passwords in the guide)
4. ⚠️ **IMPORTANT:** Check "Auto Confirm User" box for each!

**Users to create:**
- admin@wathiq.com
- manager@wathiq.com
- finance@wathiq.com
- sales@wathiq.com
- operations@wathiq.com
- marketing@wathiq.com

---

### STEP 3: Assign Roles (1 min)
1. Go to: https://supabase.com/dashboard/project/kjtjlcvcwmlrbqdzfwca/sql
2. Click "New query"
3. Copy ALL content from `supabase_insert_roles.sql` file
4. Paste into SQL Editor
5. Click RUN
6. Should see a table with 6 users and their roles

---

## 🎉 Test It!

After completing the 3 steps:

1. Open: http://localhost:8080
2. Login with:
   ```
   Email: admin@wathiq.com
   Password: Wathiq@Admin2024
   ```
3. You should see the dashboard!

---

## 📂 Important Files

| File | Purpose |
|------|---------|
| **START_HERE.md** | 👈 You are here |
| **COMPLETE_SETUP_STEPS.md** | Detailed step-by-step guide |
| **SUPABASE_QUICK_LINKS.md** | Quick links and credentials |
| **supabase_setup.sql** | SQL to create tables (Step 1) |
| **supabase_insert_roles.sql** | SQL to assign roles (Step 3) |

---

## 🆘 Need Help?

1. Check **COMPLETE_SETUP_STEPS.md** for troubleshooting
2. Verify `.env` file exists in project root
3. Make sure both servers are running:
   - Backend: `cd backend && node server.js`
   - Frontend: `npm run dev`

---

## 🎯 Your Next Action

**Click here to start:** Open `COMPLETE_SETUP_STEPS.md` and follow Step 1!

Or use quick links: Open `SUPABASE_QUICK_LINKS.md` and click the first link!

---

**Estimated Time: 10 minutes** ⏱️

**Difficulty: Easy** ⭐⭐☆☆☆

Let's go! 🚀
