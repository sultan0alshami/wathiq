# 🗄️ Database Migration Guide

## Complete Migration from localStorage to Supabase

This guide will help you migrate your Wathiq application from localStorage to a fully integrated Supabase database.

## 📋 Prerequisites

1. **Supabase Project Setup**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Get your project URL and anon key
   - Get your service role key (for backend operations)

2. **Environment Variables**
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_URL=your_supabase_project_url
   SUPABASE_SERVICE_KEY=your_supabase_service_role_key
   ```

## 🚀 Migration Steps

### Step 1: Run Database Migrations

Execute the SQL files in your Supabase SQL editor in this order:

1. **Create Tables** (`supabase/003_business_data_tables.sql`)
   ```sql
   -- Run this in Supabase SQL Editor
   -- Creates all business data tables
   ```

2. **Set up RLS Policies** (`supabase/004_rls_policies.sql`)
   ```sql
   -- Run this in Supabase SQL Editor
   -- Sets up Row Level Security policies
   ```

### Step 2: Update Your Application

1. **Install New Dependencies** (if needed)
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Update Environment Variables**
   - Add Supabase credentials to your hosting platform (Render, Vercel, etc.)
   - Update local `.env` file

3. **Deploy the New Code**
   - The new Supabase hooks and migration service are ready to use
   - Deploy to your hosting platform

### Step 3: Run Data Migration

1. **Access the Migration Dialog**
   - The migration status will appear at the top of your dashboard
   - Click "ترحيل البيانات" (Migrate Data) button

2. **Monitor Migration Progress**
   - The migration will show real-time progress
   - All localStorage data will be transferred to Supabase
   - localStorage data will be cleared after successful migration

3. **Verify Migration**
   - Check that all your data appears in the Supabase dashboard
   - Test that the application works with the new database

## 🔧 Technical Implementation

### New Files Created

1. **Database Schema**
   - `supabase/003_business_data_tables.sql` - All business tables
   - `supabase/004_rls_policies.sql` - Security policies

2. **Migration Service**
   - `src/services/DataMigrationService.ts` - Handles data migration
   - `src/components/ui/data-migration-dialog.tsx` - Migration UI
   - `src/components/ui/migration-status.tsx` - Migration status indicator

3. **Supabase Hooks**
   - `src/hooks/useSupabaseData.ts` - Data access hooks
   - `src/hooks/useRealtimeData.ts` - Real-time subscriptions

4. **Example Implementation**
   - `src/pages/SalesSupabase.tsx` - Example of using new hooks

### Database Tables Created

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `finance_entries` | Financial transactions | type, category, amount, date |
| `sales_meetings` | Sales meetings | customer_name, outcome, meeting_time |
| `operations_entries` | Daily operations | type, status, priority, assigned_to |
| `marketing_tasks` | Marketing tasks | title, due_date, status, priority |
| `marketing_campaigns` | Marketing campaigns | name, type, budget, status |
| `marketing_customer_interactions` | Customer interactions | customer_name, interaction_type |
| `customers` | Customer information | name, phone, email, arrival_date |
| `suppliers` | Supplier information | name, contact_person, category |
| `supplier_documents` | Supplier documents | name, type, file_url |

### Security Features

- **Row Level Security (RLS)** - Users can only access their own data
- **User-based filtering** - All queries filtered by `user_id`
- **Secure policies** - CRUD operations protected by RLS policies

### Real-time Features

- **Live updates** - Changes sync across devices instantly
- **Optimistic updates** - UI updates immediately, syncs in background
- **Conflict resolution** - Last-write-wins for concurrent edits

## 🔄 Migration Process Details

### Data Migration Flow

1. **Scan localStorage** - Find all wathiq data keys
2. **Parse data** - Convert JSON to database format
3. **Batch insert** - Insert data in batches for performance
4. **Verify integrity** - Check that all data was migrated
5. **Clear localStorage** - Remove local data after successful migration

### Error Handling

- **Partial failures** - Continue migration even if some records fail
- **Detailed logging** - Track which records failed and why
- **Rollback option** - Keep localStorage until migration is confirmed

### Performance Optimizations

- **Batch operations** - Insert multiple records at once
- **Progress tracking** - Show real-time migration progress
- **Memory efficient** - Process data in chunks to avoid memory issues

## 🧪 Testing the Migration

### Before Migration

1. **Backup your data**
   ```javascript
   // In browser console
   const backup = {};
   for (let i = 0; i < localStorage.length; i++) {
     const key = localStorage.key(i);
     if (key && key.startsWith('wathiq_data_')) {
       backup[key] = localStorage.getItem(key);
     }
   }
   console.log(JSON.stringify(backup));
   ```

2. **Test current functionality**
   - Verify all pages work with localStorage
   - Check that data persists between sessions

### After Migration

1. **Verify data integrity**
   - Check Supabase dashboard for all your data
   - Compare record counts with original data

2. **Test new functionality**
   - Real-time updates work across devices
   - Data persists after browser cache clear
   - All CRUD operations work correctly

3. **Performance testing**
   - Page load times are acceptable
   - Real-time updates are responsive
   - No memory leaks or performance issues

## 🚨 Troubleshooting

### Common Issues

1. **Migration fails with authentication error**
   - Ensure user is logged in
   - Check Supabase environment variables
   - Verify RLS policies are set up correctly

2. **Data appears duplicated**
   - Check if migration was run multiple times
   - Clear Supabase tables and re-run migration
   - Verify RLS policies prevent cross-user data access

3. **Real-time updates not working**
   - Check Supabase Realtime is enabled
   - Verify user authentication
   - Check browser console for WebSocket errors

4. **Performance issues**
   - Check database indexes are created
   - Monitor Supabase dashboard for slow queries
   - Consider pagination for large datasets

### Recovery Options

1. **Restore from backup**
   - Use the localStorage backup created before migration
   - Re-run migration after fixing issues

2. **Partial migration recovery**
   - Clear Supabase tables
   - Re-run migration from scratch

3. **Rollback to localStorage**
   - Temporarily disable Supabase hooks
   - Re-enable localStorage-based data access

## 📊 Monitoring and Maintenance

### Supabase Dashboard

- Monitor database usage and performance
- Check RLS policy effectiveness
- Review real-time subscription activity

### Application Monitoring

- Track migration success rates
- Monitor real-time update performance
- Check for any data consistency issues

### Regular Maintenance

- Clean up old data periodically
- Monitor storage usage
- Update RLS policies as needed
- Backup database regularly

## 🎯 Next Steps

After successful migration:

1. **Update all pages** to use new Supabase hooks
2. **Remove localStorage dependencies** from remaining components
3. **Implement advanced features** like data export/import
4. **Add data analytics** and reporting capabilities
5. **Set up automated backups** and monitoring

## 📞 Support

If you encounter issues during migration:

1. Check the browser console for error messages
2. Review Supabase logs in the dashboard
3. Verify all environment variables are set correctly
4. Test with a small dataset first

The migration is designed to be safe and reversible, so you can always rollback if needed.
