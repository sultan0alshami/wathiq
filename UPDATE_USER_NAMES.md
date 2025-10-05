# 👤 Add User Names - Quick Update

## What This Does

Adds user names to the system so instead of showing "admin@wathiq.com", it shows "أحمد المدير" (Ahmed the Manager) in Arabic.

---

## 🚀 Quick Steps (2 minutes)

### **Step 1: Run SQL to Add Names**

1. **Open Supabase SQL Editor:**
   https://supabase.com/dashboard/project/kjtjlcvcwmlrbqdzfwca/sql

2. **Click "New query"**

3. **Copy and paste this entire SQL:**

```sql
-- Add name column
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS name TEXT;

-- Update users with Arabic names
UPDATE public.user_roles
SET name = CASE 
  WHEN role = 'admin' THEN 'أحمد المدير'
  WHEN role = 'manager' THEN 'محمد المشرف'
  WHEN role = 'finance' THEN 'فاطمة المالية'
  WHEN role = 'sales' THEN 'خالد المبيعات'
  WHEN role = 'operations' THEN 'سارة العمليات'
  WHEN role = 'marketing' THEN 'عمر التسويق'
END
WHERE name IS NULL;

-- Make name required for future entries
ALTER TABLE public.user_roles 
ALTER COLUMN name SET NOT NULL;

-- Verify
SELECT 
  u.email,
  ur.name,
  ur.role
FROM public.user_roles ur
JOIN auth.users u ON u.id = ur.user_id
ORDER BY ur.role;
```

4. **Click "RUN"**

5. **You should see a table showing all users with their new names:**

| email | name | role |
|-------|------|------|
| admin@wathiq.com | أحمد المدير | admin |
| manager@wathiq.com | محمد المشرف | manager |
| finance@wathiq.com | فاطمة المالية | finance |
| sales@wathiq.com | خالد المبيعات | sales |
| operations@wathiq.com | سارة العمليات | operations |
| marketing@wathiq.com | عمر التسويق | marketing |

---

### **Step 2: Refresh Your Browser**

1. Go to your app: http://localhost:8080
2. **Refresh the page** (Ctrl+R or F5)
3. You should now see:
   - ✅ User's Arabic name in the header (top right)
   - ✅ User's Arabic name in the sidebar
   - ✅ Logout button in user dropdown menu
   - ✅ Logout button in sidebar

---

## ✨ What Changed

### **In the Header (Top Right)**
- Shows: **"أحمد المدير"** instead of "admin@wathiq.com"
- Role shows as: **"المدير العام"** (General Manager)
- Click on user name to see dropdown with logout button

### **In the Sidebar (Left Side)**
- User card shows Arabic name in bold
- Email shows below the name
- Logout button at bottom of sidebar

### **New Logout Options**
1. **Header Dropdown:** Click your name → Click "تسجيل الخروج"
2. **Sidebar Button:** Click "تسجيل الخروج" at bottom

---

## 🎨 User Names Assigned

| Role | Arabic Name | English Translation |
|------|-------------|---------------------|
| Admin | أحمد المدير | Ahmed the Manager |
| Manager | محمد المشرف | Mohammed the Supervisor |
| Finance | فاطمة المالية | Fatima from Finance |
| Sales | خالد المبيعات | Khaled from Sales |
| Operations | سارة العمليات | Sara from Operations |
| Marketing | عمر التسويق | Omar from Marketing |

---

## 🧪 Test It

1. **Login as admin:**
   - Email: admin@wathiq.com
   - Password: Wathiq@Admin2024
   - Should see: "أحمد المدير" in header and sidebar

2. **Test logout:**
   - Click your name in header
   - Click "تسجيل الخروج"
   - Should return to login page

3. **Try different users:**
   - Login as finance@wathiq.com
   - Should see: "فاطمة المالية"

---

## 🔄 Want to Change Names?

To use different names, modify the SQL update statement:

```sql
UPDATE public.user_roles
SET name = 'Your Custom Name'
WHERE role = 'admin';
```

Then refresh your browser!

---

## ✅ Success Checklist

- [ ] SQL ran successfully
- [ ] Table shows all 6 users with names
- [ ] Refreshed browser
- [ ] See Arabic name in header
- [ ] See Arabic name in sidebar
- [ ] Logout dropdown works in header
- [ ] Logout button works in sidebar
- [ ] Returns to login page after logout

---

**Done! Your users now have names!** 🎉
