# 🚀 Wathiq System - Quick Start Guide

## 📋 System Overview

**Wathiq** is a comprehensive business management system with:
- ✅ PDF report generation with Arabic support
- ✅ WhatsApp Cloud API integration for automated reports
- ✅ Role-based authentication and access control
- ✅ Daily scheduled reports
- ✅ Multi-department dashboard

---

## ⚡ Quick Setup (3 Steps)

### 1️⃣ Set Up Supabase (5 minutes)

1. Create account at [supabase.com](https://supabase.com)
2. Create new project named "Wathiq"
3. Go to **Settings** → **API**, copy:
   - Project URL
   - anon public key
4. Create `.env` file in project root:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
5. In Supabase **SQL Editor**, run the setup SQL from `SUPABASE_SETUP_GUIDE.md`
6. Create users and assign roles (see guide)

### 2️⃣ Start Backend Server

```bash
cd backend
node server.js
```

Should see: `Backend server listening at http://localhost:5000`

### 3️⃣ Start Frontend

```bash
# In new terminal, from project root
npm run dev
```

Should see: `Local: http://localhost:8080/`

---

## 🔐 Test Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@wathiq.com | Wathiq@Admin2024 |
| Manager | manager@wathiq.com | Wathiq@Manager2024 |
| Finance | finance@wathiq.com | Wathiq@Finance2024 |
| Sales | sales@wathiq.com | Wathiq@Sales2024 |
| Operations | operations@wathiq.com | Wathiq@Operations2024 |
| Marketing | marketing@wathiq.com | Wathiq@Marketing2024 |

---

## 🎯 What Each Role Can Access

### 👑 Admin
- ✅ All sections
- ✅ Export PDF reports
- ✅ User management
- ✅ Full system access

### 📊 Manager
- ✅ All sections
- ✅ Export PDF reports
- ❌ User management

### 💰 Finance
- ✅ Finance section
- ✅ Suppliers section
- ❌ Other sections

### 📈 Sales
- ✅ Sales section
- ✅ Customers section
- ❌ Other sections

### ⚙️ Operations
- ✅ Operations section
- ✅ Suppliers section
- ❌ Other sections

### 📢 Marketing
- ✅ Marketing section
- ✅ Customers section
- ❌ Other sections

---

## 📱 WhatsApp Integration (Optional)

To enable automated WhatsApp reports:

1. Set up WhatsApp Business API (see main README)
2. Add to `backend/.env`:
   ```env
   WHATSAPP_TOKEN=your_token
   WHATSAPP_PHONE_ID=your_phone_id
   MANAGER_PHONE=966xxxxxxxxx
   ```
3. Install dotenv:
   ```bash
   cd backend
   npm install dotenv
   ```
4. Add to top of `backend/server.js`:
   ```javascript
   require('dotenv').config();
   ```

---

## 📂 Project Structure

```
wathiq/
├── backend/                    # Node.js + Python backend
│   ├── server.js              # Express server
│   ├── generate_pdf.py        # PDF generation with Weasyprint
│   ├── fonts/                 # Arabic fonts (Dubai)
│   └── assets/                # Logo and images
├── src/
│   ├── pages/                 # All page components
│   │   └── Login.tsx          # Login page
│   ├── components/            # Reusable components
│   │   ├── layout/            # Layout components
│   │   └── ProtectedRoute.tsx # Route protection
│   ├── contexts/              # React contexts
│   │   ├── AuthContext.tsx    # Authentication
│   │   └── DateContext.tsx    # Date management
│   ├── lib/
│   │   └── supabase.ts        # Supabase config
│   └── services/              # API services
├── SUPABASE_SETUP_GUIDE.md    # Detailed Supabase setup
├── AUTHENTICATION_SUMMARY.md   # Auth implementation details
└── .env                       # Environment variables (create this!)
```

---

## 🐛 Common Issues

### "Cannot connect to Supabase"
- ✅ Create `.env` file with your credentials
- ✅ Restart dev server: `npm run dev`

### "User has no role"
- ✅ Run the SQL to create `user_roles` table
- ✅ Insert roles for each user

### "Backend not responding"
- ✅ Make sure backend is running: `cd backend && node server.js`
- ✅ Check it's on port 5000

### "PDF not generating"
- ✅ Install Python dependencies: `cd backend && pip install weasyprint`
- ✅ Make sure Dubai fonts are in `backend/fonts/`

---

## 📚 Documentation Files

1. **QUICK_START.md** (this file) - Get started quickly
2. **SUPABASE_SETUP_GUIDE.md** - Complete Supabase setup
3. **AUTHENTICATION_SUMMARY.md** - Auth system details
4. **README.md** - Full project documentation

---

## ✅ Testing Checklist

- [ ] Supabase project created
- [ ] `.env` file configured
- [ ] Database table created
- [ ] Users created in Supabase
- [ ] Roles assigned to users
- [ ] Backend server running (port 5000)
- [ ] Frontend server running (port 8080)
- [ ] Can login with test credentials
- [ ] Can see appropriate sections based on role
- [ ] Can logout successfully
- [ ] PDF generation works
- [ ] (Optional) WhatsApp integration configured

---

## 🎉 You're Ready!

1. Open browser: `http://localhost:8080`
2. Login with any test credential
3. Explore the dashboard
4. Generate a PDF report
5. Test different user roles

**Need help?** Check the detailed guides:
- `SUPABASE_SETUP_GUIDE.md` for database setup
- `AUTHENTICATION_SUMMARY.md` for auth details

---

**Built with ❤️ for Wathiq Business Management**
