# 🔐 Supabase Authentication Setup Guide

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in:
   - **Project Name**: Wathiq
   - **Database Password**: (create a strong password)
   - **Region**: Choose closest to Saudi Arabia
5. Click "Create new project"

## Step 2: Get API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

3. Create a `.env` file in your project root:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 3: Create Database Table

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Paste and run this SQL:

```sql
-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'finance', 'sales', 'operations', 'marketing')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own role
CREATE POLICY "Users can read own role" ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy to allow authenticated users to read all roles (for admin purposes)
CREATE POLICY "Authenticated users can read all roles" ON public.user_roles
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Create index for faster lookups
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
```

## Step 4: Create Users

1. In Supabase dashboard, go to **Authentication** → **Users**
2. Click "Add user" → "Create new user"
3. Create these users:

### 👑 Admin User
- **Email**: `admin@wathiq.com`
- **Password**: `Wathiq@Admin2024`
- **Auto Confirm User**: ✅ Yes

### 📊 Manager User
- **Email**: `manager@wathiq.com`
- **Password**: `Wathiq@Manager2024`
- **Auto Confirm User**: ✅ Yes

### 💰 Finance User
- **Email**: `finance@wathiq.com`
- **Password**: `Wathiq@Finance2024`
- **Auto Confirm User**: ✅ Yes

### 📈 Sales User
- **Email**: `sales@wathiq.com`
- **Password**: `Wathiq@Sales2024`
- **Auto Confirm User**: ✅ Yes

### ⚙️ Operations User
- **Email**: `operations@wathiq.com`
- **Password**: `Wathiq@Operations2024`
- **Auto Confirm User**: ✅ Yes

### 📢 Marketing User
- **Email**: `marketing@wathiq.com`
- **Password**: `Wathiq@Marketing2024`
- **Auto Confirm User**: ✅ Yes

## Step 5: Assign Roles to Users

1. After creating all users, go back to **SQL Editor**
2. For each user, get their `user_id` from the **Authentication** → **Users** page
3. Run this SQL for each user (replace `USER_ID` and `ROLE`):

```sql
-- Admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID_FROM_AUTH_PAGE', 'admin');

-- Manager
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID_FROM_AUTH_PAGE', 'manager');

-- Finance
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID_FROM_AUTH_PAGE', 'finance');

-- Sales
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID_FROM_AUTH_PAGE', 'sales');

-- Operations
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID_FROM_AUTH_PAGE', 'operations');

-- Marketing
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID_FROM_AUTH_PAGE', 'marketing');
```

**OR** use this easier method:

```sql
-- Get all user IDs and insert roles based on email
INSERT INTO public.user_roles (user_id, role)
SELECT 
  id,
  CASE 
    WHEN email = 'admin@wathiq.com' THEN 'admin'
    WHEN email = 'manager@wathiq.com' THEN 'manager'
    WHEN email = 'finance@wathiq.com' THEN 'finance'
    WHEN email = 'sales@wathiq.com' THEN 'sales'
    WHEN email = 'operations@wathiq.com' THEN 'operations'
    WHEN email = 'marketing@wathiq.com' THEN 'marketing'
  END as role
FROM auth.users
WHERE email IN (
  'admin@wathiq.com',
  'manager@wathiq.com',
  'finance@wathiq.com',
  'sales@wathiq.com',
  'operations@wathiq.com',
  'marketing@wathiq.com'
);
```

## 📋 User Credentials Summary

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Admin** | admin@wathiq.com | Wathiq@Admin2024 | Full access to all sections + management |
| **Manager** | manager@wathiq.com | Wathiq@Manager2024 | Full access to all sections + export |
| **Finance** | finance@wathiq.com | Wathiq@Finance2024 | Finance + Suppliers only |
| **Sales** | sales@wathiq.com | Wathiq@Sales2024 | Sales + Customers only |
| **Operations** | operations@wathiq.com | Wathiq@Operations2024 | Operations + Suppliers only |
| **Marketing** | marketing@wathiq.com | Wathiq@Marketing2024 | Marketing + Customers only |

## 🔒 Permission Matrix

| Section | Admin | Manager | Finance | Sales | Operations | Marketing |
|---------|-------|---------|---------|-------|------------|-----------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Finance | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Sales | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Operations | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Marketing | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Customers | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| Suppliers | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Export PDF | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Management | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

## Step 6: Test Authentication

1. Make sure your `.env` file is configured
2. Restart your development server:
   ```bash
   npm run dev
   ```
3. Navigate to `http://localhost:8080`
4. You should be redirected to the login page
5. Try logging in with any of the user credentials above
6. Verify that you only see the sections you have permission for

## 🚨 Important Security Notes

1. **Change all passwords** in production to more secure ones
2. **Never commit** the `.env` file to git
3. **Enable Email Confirmation** in Supabase for production (Settings → Authentication → Email Auth)
4. **Set up proper RLS policies** for your data tables
5. **Use environment-specific** Supabase projects (dev, staging, prod)

## 🔧 Troubleshooting

### Issue: "Invalid API credentials"
- Double-check your `.env` file values
- Make sure you copied the correct URL and anon key
- Restart the dev server after changing `.env`

### Issue: "User not found" or "No role assigned"
- Verify the user exists in Authentication → Users
- Check that the role was inserted in the `user_roles` table
- Run: `SELECT * FROM public.user_roles;` in SQL Editor

### Issue: "Permission denied"
- Check RLS policies are correctly set
- Verify the user's role in the database
- Check browser console for detailed error messages

## 📞 Support

For issues or questions, check:
- Supabase Documentation: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
