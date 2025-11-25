# Wathiq Transport Management System

[![Status](https://img.shields.io/badge/Status-Production%20Ready-green.svg)](https://wathiq-7eby.onrender.com)
[![Version](https://img.shields.io/badge/Version-1.0.0-blue.svg)](https://github.com/sultan0alshami/wathiq)
[![Deployment](https://img.shields.io/badge/Deployment-Live-brightgreen.svg)](https://wathiq-7eby.onrender.com)

A comprehensive business management platform built with React, TypeScript, and Supabase. This system provides complete management capabilities for transport businesses including finance, sales, operations, marketing, customers, and suppliers.

## 🎉 **PRODUCTION READY**

✅ **Fully Operational** - All systems working perfectly  
✅ **Mobile Optimized** - Responsive design for all devices  
✅ **Database Integrated** - Full Supabase backend integration  
✅ **Real-time Features** - Live notifications and updates  
✅ **PDF Generation** - Automated report generation  
✅ **Security Implemented** - Enterprise-grade security measures

## 🚀 Features

### Core Modules
- **Dashboard**: Real-time KPIs and business overview
- **Finance**: Complete financial management and reporting
- **Sales**: Sales tracking and customer management
- **Operations**: Operational workflow management
- **Marketing**: Marketing campaigns and task management
- **Customers**: Customer relationship management
- **Suppliers**: Supplier management and tracking
- **Trips**: Field operations log with checklist + media uploads
- **Reports**: Comprehensive business reporting
- **Charts**: Data visualization and analytics
- **Download Center**: Document and report downloads

### Technical Features
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Real-time Notifications**: Live updates via Supabase
- **PDF Generation**: Automated report generation
- **Multi-language Support**: Arabic interface with RTL support
- **Role-based Access**: Admin and Manager user roles
- **Offline Trips Queue**: Capture trips offline and auto-sync when connected
- **Supabase Service Layer**: Finance, Sales, Operations, Marketing, Customers, Suppliers, and Trips all read/write directly from Supabase via dedicated services
- **Secure Authentication**: Supabase Auth integration
- **Database Integration**: Full Supabase backend integration

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Radix UI** for components
- **React Router** for navigation
- **React Hook Form** for forms
- **Recharts** for data visualization

### Backend
- **Supabase** for database and authentication
- **Node.js** for PDF generation service
- **PostgreSQL** database
- **Row Level Security (RLS)** for data protection
- **/api/trips/sync** API for secure media uploads + notifications

### Deployment
- **Render** for hosting (Full-stack deployment)
- **Vercel** for frontend-only deployment
- **Docker** for containerization
- **GitHub** for version control

## 🌐 **Live Deployment**

### **Production URLs**
- **Main Application**: [https://wathiq-7eby.onrender.com](https://wathiq-7eby.onrender.com)
- **Features**: Full-stack with PDF generation and real-time notifications
- **Status**: ✅ **LIVE** and fully operational

### **Branch Strategy**
- **`main`**: Production-ready code (Vercel deployment)
- **`render`**: Full-stack deployment (Render hosting)
- **`development`**: Development branch
- **`production`**: Stable production branch
- **`backup9`**: Latest working state backup

## 📋 Prerequisites

- Node.js 18+ 
- npm 8+
- Git
- Supabase account

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/sultan0alshami/wathiq.git
    cd wathiq
    ```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_TRIPS_API_URL=/api/trips/sync
SUPABASE_SERVICE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_role_key
TRIPS_BUCKET=trip-evidence
```

### 4. Database Setup
Run the SQL scripts in the `supabase/` directory in order:
1. `001_schema.sql` - Basic schema
2. `002_notifications.sql` - Notifications setup
3. `005_safe_business_data_tables.sql` - Business data tables
4. `006_safe_rls_policies.sql` - Security policies
5. `008_trip_reports.sql` - Trips schema (reports/photos/RLS)
6. `009_finance_schema_updates.sql` - Finance-specific adjustments (title/attachment/liquidity)

After running the migrations, use `007_check_existing_tables.sql` to verify that every table exists and RLS is enabled.

### 5. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## 🏗️ Project Structure

```
wathiq/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── layout/         # Layout components (Header, Sidebar, etc.)
│   │   └── ui/             # UI components (buttons, forms, etc.)
│   ├── contexts/           # React contexts (Auth, Notifications, etc.)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and configurations
│   ├── pages/              # Page components
│   ├── services/           # Business logic services
│   └── types/              # TypeScript type definitions
├── supabase/               # Database schema and migrations
├── backend/                # PDF generation service
└── public/                 # Static assets
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:prod` - Build with production optimizations
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run test` - Run tests
- `npm run test:coverage` - Run tests with coverage
- `npm run type-check` - TypeScript type checking

## 🚀 Deployment

### Render Deployment

1. **Connect Repository**: Link your GitHub repository to Render
2. **Create Web Service**: 
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Environment: Node.js
3. **Set Environment Variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_URL`
   - `SUPABASE_SERVICE_KEY`

### Docker Deployment

```bash
# Build Docker image
docker build -t wathiq-transport .

# Run container
docker run -p 8080:8080 wathiq-transport
```

## 🔐 Security

- **Row Level Security (RLS)** enabled on all tables
- **Authentication** via Supabase Auth
- **Role-based access control** (Admin/Manager/Trips Officer + domain roles)
- **Input validation** with Zod schemas
- **XSS protection** with DOMPurify
- **CSRF protection** via Supabase

## 👤 Trips Officer Onboarding

- Recommended Abwaab field account: `hani.bakhash@abwaab.sa`
- Default role: `trips` (access to Trips module only)
- See `Documentation/TRIPS_OFFICER_CREDENTIALS.md` for full setup and SQL snippet

## 📱 Mobile Support

- **Responsive design** for all screen sizes
- **Touch-friendly interface**
- **Mobile-optimized navigation**
- **Progressive Web App** capabilities

## 🌐 Internationalization

- **Arabic language support** with RTL layout
- **Localized messages** and UI text
- **Cultural date/time formatting**
- **Arabic PDF generation** support

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=AuthContext
```

## 📊 Performance

- **Code splitting** for optimal loading
- **Lazy loading** of components
- **Bundle optimization** with manual chunks
- **Image optimization** and compression
- **Caching strategies** for static assets

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**: Check Node.js version (18+ required)
2. **Database Connection**: Verify Supabase credentials
3. **Authentication Issues**: Check RLS policies
4. **Mobile Layout**: Clear browser cache

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your environment.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact: sultan12alshami@gmail.com

## 🔄 Version History

- **v1.0.0** - Initial production release
  - Complete business management system
  - Mobile-responsive design
  - Supabase integration
  - PDF generation
  - Real-time notifications

---

**Wathiq Transport Management System** - Streamlining your business operations with modern technology.