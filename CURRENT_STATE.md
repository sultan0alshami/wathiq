# 📊 Wathiq Dashboard - Current State

## ✅ What's Implemented

### 1. Authentication System
- **Login Page**: `/login` route with Supabase authentication
- **Protected Routes**: All dashboard routes require authentication
- **Logout Functionality**: Logout button in sidebar and header dropdown

### 2. Role-Based Access Control (RBAC)
- **6 User Roles**: admin, manager, finance, sales, operations, marketing
- **Permission System**: Each role has specific access to dashboard sections
- **Dynamic Sidebar**: Shows only authorized sections based on user role

### 3. User Management
- **Supabase Integration**: User authentication and role management
- **User Profiles**: Each user has a name and role stored in `user_roles` table
- **Session Management**: Automatic session handling with Supabase

## 📁 Project Structure

### Frontend (React + TypeScript + Vite)
```
src/
├── components/
│   ├── layout/
│   │   ├── DashboardLayout.tsx
│   │   ├── Header.tsx (with logout dropdown)
│   │   └── Sidebar.tsx (permission-filtered navigation)
│   ├── pages/
│   │   └── ManagerDashboard.tsx
│   ├── ui/ (Shadcn components)
│   └── ProtectedRoute.tsx
├── contexts/
│   ├── AuthContext.tsx (manages auth state, role, permissions)
│   ├── DateContext.tsx
│   └── ThemeContext.tsx
├── lib/
│   └── supabase.ts (Supabase client + permission logic)
├── pages/
│   ├── Login.tsx
│   └── [other dashboard pages]
└── App.tsx (routing with protected routes)
```

### Backend (Node.js + Python)
```
backend/
├── server.js (Express server for PDF generation)
├── generate_pdf.py (Python/Weasyprint for Arabic PDFs)
└── package.json
```

## 🔐 User Accounts

### Test Accounts
| Email | Password | Role | Permissions |
|-------|----------|------|-------------|
| admin@wathiq.com | Admin@123456 | admin | All sections + export |
| manager@wathiq.com | Manager@123456 | manager | All sections + export |
| finance@wathiq.com | Finance@123456 | finance | Finance, Suppliers, Charts |
| sales@wathiq.com | Sales@123456 | sales | Sales, Customers, Charts |
| operations@wathiq.com | Operations@123456 | operations | Operations, Suppliers, Charts |
| marketing@wathiq.com | Marketing@123456 | marketing | Marketing, Customers, Charts |

**Note**: All users can see Dashboard, Reports, and Charts sections by default.

## 🗄️ Database Structure

### Supabase Tables
- **`auth.users`**: Built-in Supabase auth table
- **`public.user_roles`**: Custom table linking user_id to role and name
  ```sql
  Columns:
  - user_id (UUID, FK to auth.users)
  - role (TEXT: 'admin' | 'manager' | 'finance' | 'sales' | 'operations' | 'marketing')
  - name (TEXT: User's display name in Arabic)
  ```

## 🔧 Environment Variables

### Frontend (.env)
```
VITE_SUPABASE_URL=https://kjtjlcvcwmlrbqdzfwca.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### Backend (.env)
```
# Currently none, but available for future use
```

## 🚀 How to Run

### Frontend
```bash
npm run dev
# Runs on http://localhost:8080
```

### Backend
```bash
cd backend
node server.js
# Runs on http://localhost:5000
```

## 📋 Key Features

1. **Dynamic Navigation**: Sidebar shows only permitted sections
2. **User Display**: Shows user name and role in header and sidebar
3. **Session Persistence**: Stays logged in on refresh
4. **Role-Based Permissions**: Each role sees different menu items
5. **Secure Logout**: Clears session and redirects to login
6. **Arabic Support**: Full RTL support with Arabic fonts

## 🎯 Permission Matrix

| Section | Admin | Manager | Finance | Sales | Operations | Marketing |
|---------|-------|---------|---------|-------|------------|-----------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Reports | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Finance | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Sales | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Operations | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Marketing | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Customers | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| Suppliers | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Charts | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Download | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

## 🔄 Current Status

- ✅ Authentication working
- ✅ Role-based permissions implemented
- ✅ User profiles with names
- ✅ Logout functionality
- ✅ Protected routes (improved Unauthorized UX)
- ✅ Permissions matrix aligned between code and documentation
- ✅ Backend hardened (CORS allowlist, Python path via env, rate limiting)
- ✅ Route-level code splitting for faster initial load
- ✅ Removed unused/orphan pages (Index.tsx, DataManagement.tsx)
- ✅ Supabase SQL migrations and RLS policies provided in `supabase/`
- ✅ Zustand store added for shared state; React Query removed
- ⏳ **See AUDIT_REPORT.md for detailed code review**

## 🚨 Known Issues & Limitations

### Data Storage
⚠️ **All business data is stored in browser localStorage**
- Data is NOT synced between devices or users
- Data is lost if browser cache is cleared
- No real-time collaboration between users
- No automatic server-side backups (users must export manually)
- Maximum storage: ~10MB per browser

### Permission System
⚠️ **Permissions are client-side only**
- Permissions calculated in browser (can be bypassed by technical users)
- No Row Level Security (RLS) policies in Supabase yet
- Server-side validation needed for production security
- **Action Required:** Implement RLS policies before production use

### Permission Matrix Inconsistency
⚠️ **Documentation vs Code Mismatch:**
- CURRENT_STATE.md shows Finance role has access to Dashboard, Reports, Charts
- Code (supabase.ts) shows Finance role has `dashboard: false, reports: false, charts: false`
- **Action Required:** Align code with documentation OR update documentation

### Architecture
📊 **Temporary mock data system:**
- Using `mockData.ts` + localStorage as primary storage
- No actual Supabase tables for business data (finance_entries, sales_entries, etc.)
- Migration to proper database planned
- React Query installed but **NOT USED** (consider removing or implementing)

### Backend Issues
⚠️ **Hardcoded paths that will fail in production:**
- Python executable path is hardcoded to Windows path
- Won't work on Linux/macOS (Vercel uses Linux)
- **Action Required:** Use environment variables

### Performance
- Charts page loads 30 days of data from localStorage on each render
- No pagination on Finance/Sales pages (will be slow with 100+ entries)
- Bundle size could be optimized (~800KB estimated)

### Missing Features
- ❌ No data import functionality (only export exists)
- ❌ No global search across all sections
- ❌ No notification system for reminders/alerts
- ❌ No audit log for data changes
- ❌ No automated backups

## 📝 Notes

- The system uses Supabase for authentication ONLY
- Permissions are calculated client-side based on role
- Business data (finance, sales, etc.) is stored in browser localStorage
- **CRITICAL:** See `AUDIT_REPORT.md` for 7 critical security issues that need immediate attention
- **Required Supabase Function:** `get_user_profile(uuid)` must be created in Supabase dashboard

## 📚 Required Database Setup

### Supabase Function (REQUIRED)
This function must be created in Supabase SQL Editor:

```sql
CREATE OR REPLACE FUNCTION public.get_user_profile(uid uuid)
RETURNS TABLE(role text, name text)
LANGUAGE sql 
SECURITY DEFINER 
SET search_path = public 
AS $$
  SELECT role, name 
  FROM public.user_roles 
  WHERE user_id = uid 
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_profile(uuid) TO authenticated;
```

## 🔍 Recent Audit Findings

**Audit Date:** October 7, 2025  
**Overall Health Score:** 7.2/10

### Issues Found:
- 🔴 Critical Issues: 7
- 🟠 High Priority: 9  
- 🟡 Medium Priority: 22
- 🔵 Low Priority: 8

**See AUDIT_REPORT.md for complete details and action items.**
