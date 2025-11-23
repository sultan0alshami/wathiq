# 🚀 Production Deployment Guide

This guide covers deploying the Wathiq Transport Management System to production environments.

## 📋 Pre-Deployment Checklist

### ✅ Code Quality
- [ ] All tests passing (`npm run test`)
- [ ] No linting errors (`npm run lint`)
- [ ] TypeScript compilation successful (`npm run type-check`)
- [ ] Production build successful (`npm run build:prod`)

### ✅ Security Review
- [ ] Environment variables secured
- [ ] RLS policies implemented
- [ ] Input validation in place
- [ ] Authentication working
- [ ] HTTPS enabled

### ✅ Performance Optimization
- [ ] Bundle size optimized
- [ ] Images compressed
- [ ] Caching configured
- [ ] CDN setup (if applicable)

## 🌐 Deployment Options

### Option 1: Render (Recommended)

#### 1. Connect Repository
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the `render` branch

#### 2. Configure Service
```yaml
Name: wathiq-transport-management
Environment: Node
Build Command: npm run build
Start Command: npm start
Plan: Starter (or higher for production)
```

#### 3. Environment Variables
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_TRIPS_API_URL=/api/trips/sync
SUPABASE_SERVICE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
TRIPS_BUCKET=trip-evidence
NODE_ENV=production
```

#### 4. Advanced Settings
- **Auto-Deploy**: Enable for automatic deployments
- **Health Check Path**: `/`
- **Dockerfile**: Use the provided Dockerfile

### Option 2: Vercel

#### 1. Install Vercel CLI
```bash
npm i -g vercel
```

#### 2. Deploy
```bash
vercel --prod
```

#### 3. Environment Variables
Set in Vercel dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_TRIPS_API_URL`

### Option 3: Docker

#### 1. Build Image
```bash
docker build -t wathiq-transport .
```

#### 2. Run Container
```bash
docker run -d \
  --name wathiq-app \
  -p 8080:8080 \
  -e VITE_SUPABASE_URL=your_url \
  -e VITE_SUPABASE_ANON_KEY=your_key \
  -e VITE_TRIPS_API_URL=/api/trips/sync \
  -e SUPABASE_SERVICE_URL=your_url \
  -e SUPABASE_SERVICE_KEY=your_service_role_key \
  -e TRIPS_BUCKET=trip-evidence \
  wathiq-transport
```

#### 3. Docker Compose
```yaml
version: '3.8'
services:
  wathiq-app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
      - VITE_TRIPS_API_URL=/api/trips/sync
      - SUPABASE_SERVICE_URL=${SUPABASE_SERVICE_URL}
      - SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
      - TRIPS_BUCKET=${TRIPS_BUCKET}
    restart: unless-stopped
```

## 🗄️ Database Setup

### 1. Supabase Project Setup
1. Create new Supabase project
2. Note down URL and API keys
3. Run migration scripts in order:

```sql
-- 1. Basic schema
\i supabase/001_schema.sql

-- 2. Notifications
\i supabase/002_notifications.sql

-- 3. Business data tables
\i supabase/005_safe_business_data_tables.sql

-- 4. Security policies
\i supabase/006_safe_rls_policies.sql

-- 5. Trips schema + RLS
\i supabase/008_trip_reports.sql
```

### 2. User Management
```sql
-- Create admin user
INSERT INTO user_roles (user_id, name, role, email) 
VALUES (
  'your-user-id',
  'Admin User',
  'admin',
  'admin@wathiq.com'
);
```

> Tip: For field-only accounts (role `trips`), follow `Documentation/TRIPS_OFFICER_CREDENTIALS.md`.

### 3. RLS Verification
```sql
-- Test RLS policies
SELECT * FROM user_roles; -- Should only show user's own data
```

## 🔧 Environment Configuration

### Production Environment Variables

#### Frontend (.env.production)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_TRIPS_API_URL=/api/trips/sync
VITE_APP_ENV=production
```

#### Backend (Render Environment)
```env
SUPABASE_SERVICE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
TRIPS_BUCKET=trip-evidence
NODE_ENV=production
PORT=8080
```

## 📊 Monitoring & Analytics

### 1. Error Tracking
- Enable error boundaries
- Monitor console errors
- Set up alerts for critical errors

### 2. Performance Monitoring
- Monitor Core Web Vitals
- Track bundle size
- Monitor API response times

### 3. User Analytics
- Track user engagement
- Monitor feature usage
- Analyze user flows

## 🔒 Security Hardening

### 1. HTTPS Configuration
```nginx
# Nginx configuration
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 2. Security Headers
```javascript
// Add to server configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

### 3. Rate Limiting
```javascript
// Implement rate limiting
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
```

## 🚀 CI/CD Pipeline

### GitHub Actions Workflow
```yaml
name: Deploy to Production

on:
  push:
    branches: [render]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test
    
    - name: Run linting
      run: npm run lint
    
    - name: Build application
      run: npm run build:prod
    
    - name: Deploy to Render
      uses: johnbeynon/render-deploy-action@v1.0.0
      with:
        service-id: ${{ secrets.RENDER_SERVICE_ID }}
        api-key: ${{ secrets.RENDER_API_KEY }}
```

## 📈 Performance Optimization

### 1. Bundle Analysis
```bash
# Analyze bundle size
npm run build:prod
npx vite-bundle-analyzer dist
```

### 2. Image Optimization
- Use WebP format for images
- Implement lazy loading
- Optimize image sizes

### 3. Caching Strategy
```javascript
// Service Worker for caching
const CACHE_NAME = 'wathiq-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});
```

## 🔍 Health Checks

### 1. Application Health
```javascript
// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  });
});
```

### 2. Database Health
```javascript
// Database connectivity check
app.get('/health/db', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    
    res.status(200).json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build:prod
```

#### 2. Database Connection Issues
- Verify Supabase credentials
- Check network connectivity
- Review RLS policies

#### 3. Authentication Problems
- Check JWT token expiration
- Verify user roles in database
- Review authentication flow

### Debug Commands
```bash
# Check application logs
docker logs wathiq-app

# Monitor resource usage
docker stats wathiq-app

# Access container shell
docker exec -it wathiq-app sh
```

## 📞 Support & Maintenance

### 1. Regular Maintenance
- [ ] Update dependencies monthly
- [ ] Monitor security advisories
- [ ] Review and rotate API keys
- [ ] Backup database regularly

### 2. Monitoring Setup
- Set up uptime monitoring
- Configure error alerts
- Monitor performance metrics
- Track user analytics

### 3. Backup Strategy
```bash
# Database backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Application backup
tar -czf app_backup_$(date +%Y%m%d).tar.gz /path/to/app
```

---

## 🎯 Post-Deployment Checklist

- [ ] Application accessible via HTTPS
- [ ] All features working correctly
- [ ] Database queries performing well
- [ ] Authentication flow complete
- [ ] Mobile responsiveness verified
- [ ] PDF generation working
- [ ] Notifications functioning
- [ ] Error monitoring active
- [ ] Performance metrics tracked
- [ ] Backup procedures tested

**🎉 Congratulations! Your Wathiq Transport Management System is now live in production!**
