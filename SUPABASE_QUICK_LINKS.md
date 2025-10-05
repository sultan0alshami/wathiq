# 🔗 Supabase Quick Links - Wathiq Project

## Your Project Information

- **Project Name:** Wathiq
- **Project ID:** kjtjlcvcwmlrbqdzfwca
- **Project URL:** https://kjtjlcvcwmlrbqdzfwca.supabase.co
- **Region:** Your selected region

---

## 📌 Direct Links to Each Step

### Step 1: SQL Editor (Create Tables)
**Click here:** https://supabase.com/dashboard/project/kjtjlcvcwmlrbqdzfwca/sql

**What to do:**
1. Click "New query"
2. Copy content from `supabase_setup.sql`
3. Paste and click RUN

---

### Step 2: Create Users
**Click here:** https://supabase.com/dashboard/project/kjtjlcvcwmlrbqdzfwca/auth/users

**What to do:**
1. Click "Add user"
2. Select "Create new user"
3. Create all 6 users (see credentials below)
4. ⚠️ **IMPORTANT:** Check "Auto Confirm User" for each!

---

### Step 3: Assign Roles (SQL Editor Again)
**Click here:** https://supabase.com/dashboard/project/kjtjlcvcwmlrbqdzfwca/sql

**What to do:**
1. Click "New query"
2. Copy content from `supabase_insert_roles.sql`
3. Paste and click RUN
4. You should see a table with 6 users and their roles

---

### Verification: View User Roles Table
**Click here:** https://supabase.com/dashboard/project/kjtjlcvcwmlrbqdzfwca/editor

**What to do:**
1. Find "user_roles" table in the left sidebar
2. Click on it
3. You should see 6 rows with user_id and role columns

---

### View Policies (Optional)
**Click here:** https://supabase.com/dashboard/project/kjtjlcvcwmlrbqdzfwca/auth/policies

**What to do:**
- Verify that policies for "user_roles" table are created
- You should see 3 policies

---

## 👥 Users to Create

Copy-paste these exactly:

### 1. Admin
```
Email: admin@wathiq.com
Password: Wathiq@Admin2024
☑️ Auto Confirm User
```

### 2. Manager
```
Email: manager@wathiq.com
Password: Wathiq@Manager2024
☑️ Auto Confirm User
```

### 3. Finance
```
Email: finance@wathiq.com
Password: Wathiq@Finance2024
☑️ Auto Confirm User
```

### 4. Sales
```
Email: sales@wathiq.com
Password: Wathiq@Sales2024
☑️ Auto Confirm User
```

### 5. Operations
```
Email: operations@wathiq.com
Password: Wathiq@Operations2024
☑️ Auto Confirm User
```

### 6. Marketing
```
Email: marketing@wathiq.com
Password: Wathiq@Marketing2024
☑️ Auto Confirm User
```

---

## 🎯 After Setup - Test Your App

1. **Frontend:** http://localhost:8080
2. **Backend:** http://localhost:5000

---

## 📂 Files You Need

In your project root, you'll find:

1. **`supabase_setup.sql`** - Run this first in SQL Editor
2. **`supabase_insert_roles.sql`** - Run this after creating users
3. **`COMPLETE_SETUP_STEPS.md`** - Detailed instructions
4. **`.env`** - Already created with your credentials ✅

---

## ✅ Setup Checklist

- [ ] Step 1: Run `supabase_setup.sql` in SQL Editor
- [ ] Step 2: Create 6 users in Authentication
- [ ] Step 3: Run `supabase_insert_roles.sql` in SQL Editor
- [ ] Step 4: Verify table has 6 rows
- [ ] Step 5: Test login at http://localhost:8080
- [ ] Step 6: Celebrate! 🎉

---

## 🆘 Need Help?

Open the **COMPLETE_SETUP_STEPS.md** file for detailed troubleshooting and step-by-step screenshots.

**Project Dashboard:** https://supabase.com/dashboard/project/kjtjlcvcwmlrbqdzfwca
