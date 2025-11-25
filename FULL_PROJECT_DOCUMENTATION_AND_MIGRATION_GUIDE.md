# 📋 Wathiq Transport Management System – Production Documentation (November 2025)

This document replaces the legacy migration notes and captures the current Supabase-first architecture, deployment flow, and operational procedures for the Wathiq platform.

---

## 1. Executive Overview

| Item | Status |
|------|--------|
| **Current Release** | November 25 2025 – Supabase-first deployment |
| **Frontend** | React 18.3 + TypeScript + Vite + Tailwind + Radix/Shadcn |
| **Backend** | Node.js 20 + Express + Python (WeasyPrint) via Docker |
| **Database** | Supabase PostgreSQL with full Row Level Security |
| **Auth** | Supabase Auth (email/password) with role matrix |
| **Hosting** | Render (full stack) + Vercel (static fallback) |
| **Data Persistence** | Supabase tables for every module + offline trips queue |
| **Documentation** | README, API guide, Deployment guide, Checklist suite |

Key achievements in this release:
- Migrated Finance, Sales, Operations, Marketing, Customers, Suppliers, and Trips from LocalStorage to Supabase tables with dedicated service classes.
- Hardened `/api/trips/sync` to support updates, attachment replacement, and Supabase notifications.
- Added safe SQL scripts (`005`, `006`, `009`) and a verification helper (`007`) so migrations can run repeatedly without downtime.
- Refreshed every public-facing document to describe the Supabase-first workflow and offline behavior.

---

## 2. Architecture Snapshot

### Frontend
- `src/services/*.ts`: FinanceService, SalesService, OperationsService, MarketingService, CustomersService, SupplierService, TripReportsService centralize Supabase interactions.
- `src/pages/*.tsx`: Each business module consumes its service and renders localized Arabic UI with shadcn components.
- `src/lib/mockData.ts`: Provides shared formats (e.g., Gregorian formatter) and trip defaults for offline drafts.
- Contexts: `AuthContext`, `DateContext`, `NotificationsContext`, `ThemeContext`.

### Backend
- `backend/server.js`: Express app that serves the built frontend, exposes `/generate-pdf`, `/api/trips/sync`, `/trips/sync`, and `/health`.
- `generate_pdf.py`: Arabic PDF generation + optional WhatsApp delivery.
- Dockerfile: Builds the React app first, then bundles backend + Python dependencies into the runtime image.

### Database (Supabase)
- Core tables: `finance_entries`, `finance_liquidity`, `sales_entries`, `operations_entries`, `operations_expectations`, `marketing_tasks`, `marketing_yesterday_tasks`, `marketing_planned_tasks`, `crm_customers`, `suppliers`, `supplier_documents`, `trip_reports`, `trip_photos`, `notifications`, `user_roles`.
- Safe migration scripts:
  1. `001_schema.sql`
  2. `002_notifications.sql`
  3. `005_safe_business_data_tables.sql`
  4. `006_safe_rls_policies.sql`
  5. `008_trip_reports.sql`
  6. `009_finance_schema_updates.sql`
  7. `007_check_existing_tables.sql` (verification)

### Data Flow
1. User authenticates via Supabase Auth (JWT stored client-side).
2. Frontend services query Supabase directly using the anon key; RLS filters rows per `auth.uid()`.
3. Trips module merges Supabase data with offline drafts/recycle bin stored locally.
4. Backend endpoints use the service role key for privileged operations (PDF generation, trip sync attachments, notifications).

---

## 3. Environment & Configuration

### `.env` / Render Environment Variables
```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon_key>
VITE_TRIPS_API_URL=/api/trips/sync
SUPABASE_SERVICE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_KEY=<service_role_key>
TRIPS_BUCKET=trip-evidence
FRONTEND_URL=https://wathiq-7eby.onrender.com       # optional strict CORS
VERCEL_URL=<vercel-domain>                          # optional strict CORS
WHATSAPP_TOKEN=<optional>
WHATSAPP_PHONE_ID=<optional>
MANAGER_PHONE=<optional>
NODE_ENV=production
```

Render automatically injects these values as Docker build args (for Vite `VITE_*`) and runtime environment variables (for Express + Supabase service client).

### Local Development
```bash
git clone https://github.com/sultan0alshami/wathiq.git
cd wathiq
npm install
cp env.example.txt .env    # populate with local Supabase project keys
npm run dev                # http://localhost:5173

# Backend-only tests (optional)
cd backend
npm install
npm start                  # http://localhost:5000
```

---

## 4. Module Overview

| Module | Supabase Tables | Notes |
|--------|-----------------|-------|
| Finance | `finance_entries`, `finance_liquidity` | Entries grouped per date; liquidity upsert uses singleton row keyed by `user_id`. |
| Sales | `sales_entries` | Meeting date/time stored separately; service handles counters for “customers contacted”. |
| Operations | `operations_entries`, `operations_expectations` | Expectations table uses upsert logic with service role fallback. |
| Marketing | `marketing_tasks`, `marketing_yesterday_tasks`, `marketing_planned_tasks` | Services manage moving tasks between lists and recording planned work. |
| Customers | `crm_customers` (new) + legacy `customers` | CRM tracks pipeline status + estimated value. |
| Suppliers | `suppliers`, `supplier_documents` | Documents stored as base64 → Supabase storage via backend. |
| Trips | `trip_reports`, `trip_photos` | Offline drafts + recycle bin stored locally; synced data reloads from Supabase each login. |
| Notifications | `notifications`, `user_roles` | Backend inserts broadcast notifications for trip/PDF events. |

---

## 5. Deployment Workflow

1. **Supabase**
   - Execute SQL scripts in order (Section 2) using the SQL editor.
   - Run `supabase/007_check_existing_tables.sql` to confirm every table exists and `rls_enabled = true`.
   - Seed `user_roles` as needed; see `Documentation/TRIPS_OFFICER_CREDENTIALS.md` for trips-only accounts.

2. **Render (Full Stack)**
   - Connect GitHub repo, select Docker environment (auto-detected).
   - Set the environment variables listed above.
   - Health check path: `/`.
   - Auto-deploy from `render` or `main` branch as required.

3. **Vercel (Static fallback)**
   - Build command: `npm run build`.
   - Output directory: `dist`.
   - Same `VITE_*` environment variables (no server key).
   - Backend-only features (PDF/trip sync) require the Render deployment URL.

4. **Verification**
   - Run smoke test (login, navigate all modules).
   - Create a trip, attach photos, verify status “متزامن” after sync, log out + clear cache → record remains.
   - Trigger `/generate-pdf` to confirm notification insertion and optional WhatsApp send.

---

## 6. Monitoring & Maintenance

- **Health Checks**: Render hits `/health`; respond with `{ status: 'ok', timestamp }`.
- **Supabase Dashboard**: Monitor auth sessions, RLS policies, and storage usage.
- **Logs**: Render logs capture Express output; Supabase logs capture SQL/RLS errors.
- **Backups**: Use Supabase automated backups or `pg_dump` for manual exports.
- **Testing**: `npm run test`, `npm run lint`, `npm run type-check` prior to releases.
- **Rate Limits**: `/generate-pdf` and `/api/trips/sync` share simple in-memory throttling (10 requests / 15 minutes per IP).

---

## 7. Troubleshooting Cheatsheet

| Symptom | Resolution |
|---------|------------|
| Trips disappear after logout/cache clear | Ensure Supabase tables contain the records; confirm `TripReportsService.listByDate` succeeds and the user’s role has RLS access. |
| `meeting_date` / `operations_expectations` errors during migrations | Re-run `005_safe_business_data_tables.sql`; it auto-renames legacy columns/tables before creating indexes. |
| CORS failures when calling Supabase REST from Render | Set `FRONTEND_URL` and `VERCEL_URL` env vars so backend CORS whitelist includes the production origin. |
| Attachments not uploading | Confirm `TRIPS_BUCKET` exists (backend auto-creates) and `SUPABASE_SERVICE_KEY` is present. |
| PDF notifications missing | Backend falls back from client insert → HTTP insert; check Render logs for Supabase errors. |

---

## 8. Future Enhancements (Optional)

1. **Advanced Analytics**: Add Supabase RPC views for conversion funnels and aggregated KPIs.
2. **Supabase Edge Functions**: Move multi-table operations (e.g., supplier document uploads) to serverless functions for tighter auditing.
3. **CI/CD**: Automate Render deploys via GitHub Actions once secrets can be stored securely.
4. **Native Mobile Wrapper**: Leverage the existing responsive UI inside Capacitor or React Native WebView for offline-first operators.

---

## 9. Contact & Ownership

- **Primary Maintainer**: Sultan Alshami (sultan12alshami@gmail.com)
- **Issue Tracking**: GitHub Issues on `sultan0alshami/wathiq`
- **Documentation Sources**: `README.md`, `API_DOCUMENTATION.md`, `DEPLOYMENT_GUIDE.md`, `FINAL_IMPLEMENTATION_REPORT.md`, `FINAL_TESTING_CHECKLIST.md`, `SYSTEM_STATUS_REPORT.md`

This document should be revisited after any schema change or deployment pipeline update to keep the operational picture accurate.

