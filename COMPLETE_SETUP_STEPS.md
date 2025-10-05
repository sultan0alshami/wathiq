# 🚀 Complete Supabase Setup - Step by Step

## ✅ What's Already Done

- ✅ Supabase project created: `Wathiq`
- ✅ Project URL: `https://kjtjlcvcwmlrbqdzfwca.supabase.co`
- ✅ API Key obtained
- ✅ `.env` file created with credentials
- ✅ SQL scripts prepared

---

## 📋 Follow These Steps Exactly

### **STEP 1: Create Database Table** ⏱️ 2 minutes

1. Open your Supabase project: https://supabase.com/dashboard/project/kjtjlcvcwmlrbqdzfwca
2. Click **SQL Editor** in the left sidebar
3. Click **"New query"** button (top right)
4. Open the file `supabase_setup.sql` (in your project root)
5. **Copy ALL the content** from `supabase_setup.sql`
6. **Paste it** into the Supabase SQL Editor
7. Click **RUN** button (or press Ctrl+Enter)
8. You should see: ✅ **Success. No rows returned**

**What this does:**
- Creates `user_roles` table
- Sets up Row Level Security (RLS)
- Creates access policies
- Adds indexes for performance

---

### **STEP 2: Create Users** ⏱️ 5 minutes

1. In Supabase, click **Authentication** in left sidebar
2. Click **Users** tab
3. Click **"Add user"** button
4. Select **"Create new user"**

**Create these 6 users (one by one):**

#### User 1: Admin 👑
```
Email: admin@wathiq.com
Password: Wathiq@Admin2024
☑️ Auto Confirm User: YES (check this box!)
```
Click **"Create user"**

#### User 2: Manager 📊
```
Email: manager@wathiq.com
Password: Wathiq@Manager2024
☑️ Auto Confirm User: YES
```
Click **"Create user"**

#### User 3: Finance 💰
```
Email: finance@wathiq.com
Password: Wathiq@Finance2024
☑️ Auto Confirm User: YES
```
Click **"Create user"**

#### User 4: Sales 📈
```
Email: sales@wathiq.com
Password: Wathiq@Sales2024
☑️ Auto Confirm User: YES
```
Click **"Create user"**

#### User 5: Operations ⚙️
```
Email: operations@wathiq.com
Password: Wathiq@Operations2024
☑️ Auto Confirm User: YES
```
Click **"Create user"**

#### User 6: Marketing 📢
```
Email: marketing@wathiq.com
Password: Wathiq@Marketing2024
☑️ Auto Confirm User: YES
```
Click **"Create user"**

**Verify:** You should now see all 6 users in the Users list.

---

### **STEP 3: Assign Roles to Users** ⏱️ 1 minute

1. Go back to **SQL Editor**
2. Click **"New query"**
3. Open the file `supabase_insert_roles.sql`
4. **Copy ALL the content**
5. **Paste it** into the SQL Editor
6. Click **RUN** button

**Expected Result:**
You should see a table showing all 6 users with their roles:

| email | role | created_at |
|-------|------|------------|
| admin@wathiq.com | admin | timestamp |
| finance@wathiq.com | finance | timestamp |
| manager@wathiq.com | manager | timestamp |
| marketing@wathiq.com | marketing | timestamp |
| operations@wathiq.com | operations | timestamp |
| sales@wathiq.com | sales | timestamp |

If you see this table with all 6 users, **SUCCESS!** ✅

---

### **STEP 4: Verify Everything Works** ⏱️ 2 minutes

1. Make sure your development servers are running:
   - Backend: Should be running on port 5000
   - Frontend: Should be running on port 8080

2. If not running, restart them:
   ```bash
   # Terminal 1 - Backend
   cd backend
   node server.js
   
   # Terminal 2 - Frontend (new terminal window)
   npm run dev
   ```

3. Open browser: `http://localhost:8080`

4. You should see the **Login Page** with Wathiq branding

5. **Test Login** with any user:
   ```
   Email: admin@wathiq.com
   Password: Wathiq@Admin2024
   ```

6. If login works, you should see:
   - Dashboard loads
   - Sidebar shows your email and role
   - Logout button appears

**Try logging in with different users to test permissions!**

---

## 🎯 Quick Test Checklist

After completing all steps, verify:

- [ ] Database table `user_roles` exists
- [ ] 6 users created in Authentication
- [ ] All 6 users have roles assigned
- [ ] Can access login page
- [ ] Can login with admin@wathiq.com
- [ ] Can login with finance@wathiq.com
- [ ] Can see user email in sidebar
- [ ] Can see role badge in sidebar
- [ ] Can logout successfully
- [ ] Finance user only sees Finance + Suppliers sections
- [ ] Admin user sees all sections

---

## 🐛 Troubleshooting

### Problem: "Table user_roles does not exist"
**Solution:** Go back to Step 1 and run `supabase_setup.sql`

### Problem: "No rows returned" when assigning roles
**Solution:** Make sure you created all 6 users first (Step 2)

### Problem: "User not found" when logging in
**Solution:** 
1. Check you created the user in Authentication → Users
2. Check you checked "Auto Confirm User"
3. Check you're using the correct email and password

### Problem: "Cannot read properties of null (reading 'role')"
**Solution:** Run Step 3 to assign roles to users

### Problem: Login page doesn't appear
**Solution:** 
1. Make sure `.env` file exists in project root
2. Restart frontend server: `npm run dev`
3. Check browser console for errors

---

## 📧 Login Credentials Summary

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@wathiq.com | Wathiq@Admin2024 |
| Manager | manager@wathiq.com | Wathiq@Manager2024 |
| Finance | finance@wathiq.com | Wathiq@Finance2024 |
| Sales | sales@wathiq.com | Wathiq@Sales2024 |
| Operations | operations@wathiq.com | Wathiq@Operations2024 |
| Marketing | marketing@wathiq.com | Wathiq@Marketing2024 |

---

## ✅ Success Criteria

You'll know everything is working when:

1. ✅ Can access `http://localhost:8080` and see login page
2. ✅ Can login with any of the 6 users
3. ✅ Dashboard loads after login
4. ✅ Sidebar shows logged-in user's email and role
5. ✅ Can logout and return to login page
6. ✅ Different users see different sections based on permissions

---

## 🎉 You're Done!

Once all steps are complete, your system is **fully operational** with:
- ✅ Secure authentication
- ✅ Role-based access control
- ✅ 6 different user types
- ✅ Beautiful login UI
- ✅ PDF generation working
- ✅ WhatsApp integration ready

**Enjoy your Wathiq Business Management System!** 🚀
