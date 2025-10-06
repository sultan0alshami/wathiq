Deploy Wathiq Frontend to Vercel

1. Vercel project
   - New Project → Import your GitHub repo
   - Framework: Vite (auto)
   - Build settings:
     - Install: npm ci
     - Build: npm run build
     - Output: dist

2. Environment variables (Production + Preview)
   - VITE_SUPABASE_URL = your Supabase project URL
   - VITE_SUPABASE_ANON_KEY = your Supabase anon key
   - (Optional) VITE_API_URL = backend base URL if used

3. Supabase Auth URLs
   - Authentication → URL Configuration
   - Site URL: https://your-app.vercel.app
   - Redirect URLs: same (and optionally https://*.vercel.app)

4. Deploy and test
   - Deploy
   - Open URL → login with test users
   - Verify role menus and Arabic names from public.user_roles

Notes
- Frontend is static; auth/data via Supabase
- Add VITE_API_URL later if you connect a backend/API

