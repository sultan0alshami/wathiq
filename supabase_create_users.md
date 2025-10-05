# 📝 Supabase User Creation Guide

## Step-by-Step Instructions

### 1. Go to Supabase Authentication

1. Open your Supabase project: https://kjtjlcvcwmlrbqdzfwca.supabase.co
2. Click on **Authentication** in the left sidebar
3. Click on **Users** tab

### 2. Create Each User

For each user below, click **"Add user"** → **"Create new user"**

#### 👑 User 1: Admin
- **Email:** `admin@wathiq.com`
- **Password:** `Wathiq@Admin2024`
- **Auto Confirm User:** ✅ Check this box
- Click **Create user**

#### 📊 User 2: Manager
- **Email:** `manager@wathiq.com`
- **Password:** `Wathiq@Manager2024`
- **Auto Confirm User:** ✅ Check this box
- Click **Create user**

#### 💰 User 3: Finance
- **Email:** `finance@wathiq.com`
- **Password:** `Wathiq@Finance2024`
- **Auto Confirm User:** ✅ Check this box
- Click **Create user**

#### 📈 User 4: Sales
- **Email:** `sales@wathiq.com`
- **Password:** `Wathiq@Sales2024`
- **Auto Confirm User:** ✅ Check this box
- Click **Create user**

#### ⚙️ User 5: Operations
- **Email:** `operations@wathiq.com`
- **Password:** `Wathiq@Operations2024`
- **Auto Confirm User:** ✅ Check this box
- Click **Create user**

#### 📢 User 6: Marketing
- **Email:** `marketing@wathiq.com`
- **Password:** `Wathiq@Marketing2024`
- **Auto Confirm User:** ✅ Check this box
- Click **Create user**

### 3. Verify All Users Are Created

After creating all 6 users, you should see them listed in the Users table with their email addresses.

### 4. Next Step

After creating all users, go to **SQL Editor** and run the `supabase_insert_roles.sql` script to assign roles to these users.
