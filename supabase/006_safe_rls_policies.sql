-- =====================================================
-- SAFE ROW LEVEL SECURITY (RLS) POLICIES
-- This script safely applies RLS policies without conflicts
-- =====================================================

-- =====================================================
-- FINANCE TABLES RLS
-- =====================================================

-- Enable RLS on finance tables (safe to run multiple times)
ALTER TABLE finance_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_liquidity ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Users can view their own finance entries" ON finance_entries;
DROP POLICY IF EXISTS "Users can insert their own finance entries" ON finance_entries;
DROP POLICY IF EXISTS "Users can update their own finance entries" ON finance_entries;
DROP POLICY IF EXISTS "Users can delete their own finance entries" ON finance_entries;

-- Finance entries policies
CREATE POLICY "Users can view their own finance entries" ON finance_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own finance entries" ON finance_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own finance entries" ON finance_entries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own finance entries" ON finance_entries
    FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own finance categories" ON finance_categories;
DROP POLICY IF EXISTS "Users can insert their own finance categories" ON finance_categories;
DROP POLICY IF EXISTS "Users can update their own finance categories" ON finance_categories;
DROP POLICY IF EXISTS "Users can delete their own finance categories" ON finance_categories;

CREATE POLICY "Users can view their own finance categories" ON finance_categories
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own finance categories" ON finance_categories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own finance categories" ON finance_categories
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own finance categories" ON finance_categories
    FOR DELETE USING (auth.uid() = user_id);

-- Finance liquidity policies
DROP POLICY IF EXISTS "Users can view their own finance liquidity" ON finance_liquidity;
DROP POLICY IF EXISTS "Users can upsert their finance liquidity" ON finance_liquidity;
DROP POLICY IF EXISTS "Users can update their finance liquidity" ON finance_liquidity;

CREATE POLICY "Users can view their own finance liquidity" ON finance_liquidity
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert their finance liquidity" ON finance_liquidity
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their finance liquidity" ON finance_liquidity
    FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- SALES TABLES RLS
-- =====================================================

-- Enable RLS on sales tables
ALTER TABLE sales_entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own sales entries" ON sales_entries;
DROP POLICY IF EXISTS "Users can insert their own sales entries" ON sales_entries;
DROP POLICY IF EXISTS "Users can update their own sales entries" ON sales_entries;
DROP POLICY IF EXISTS "Users can delete their own sales entries" ON sales_entries;

-- Sales entries policies
CREATE POLICY "Users can view their own sales entries" ON sales_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sales entries" ON sales_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sales entries" ON sales_entries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sales entries" ON sales_entries
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- OPERATIONS TABLES RLS
-- =====================================================

-- Enable RLS on operations tables
ALTER TABLE operations_entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own operations entries" ON operations_entries;
DROP POLICY IF EXISTS "Users can insert their own operations entries" ON operations_entries;
DROP POLICY IF EXISTS "Users can update their own operations entries" ON operations_entries;
DROP POLICY IF EXISTS "Users can delete their own operations entries" ON operations_entries;

-- Operations entries policies
CREATE POLICY "Users can view their own operations entries" ON operations_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own operations entries" ON operations_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own operations entries" ON operations_entries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own operations entries" ON operations_entries
    FOR DELETE USING (auth.uid() = user_id);

DO $ops_expect$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'operations_expectations'
    ) THEN
        EXECUTE 'ALTER TABLE operations_expectations ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "Users can view their operations expectations" ON operations_expectations';
        EXECUTE 'DROP POLICY IF EXISTS "Users can upsert their operations expectations" ON operations_expectations';
        EXECUTE 'DROP POLICY IF EXISTS "Users can update their operations expectations" ON operations_expectations';
        EXECUTE 'CREATE POLICY "Users can view their operations expectations" ON operations_expectations ' ||
                'FOR SELECT USING (auth.uid() = user_id)';
        EXECUTE 'CREATE POLICY "Users can upsert their operations expectations" ON operations_expectations ' ||
                'FOR INSERT WITH CHECK (auth.uid() = user_id)';
        EXECUTE 'CREATE POLICY "Users can update their operations expectations" ON operations_expectations ' ||
                'FOR UPDATE USING (auth.uid() = user_id)';
    END IF;
END
$ops_expect$;

-- =====================================================
-- MARKETING TABLES RLS
-- =====================================================

-- Enable RLS on marketing tables
ALTER TABLE marketing_tasks ENABLE ROW LEVEL SECURITY;
DO $marketing_rls$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'marketing_yesterday_tasks'
    ) THEN
        EXECUTE 'ALTER TABLE marketing_yesterday_tasks ENABLE ROW LEVEL SECURITY';
    END IF;
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'marketing_planned_tasks'
    ) THEN
        EXECUTE 'ALTER TABLE marketing_planned_tasks ENABLE ROW LEVEL SECURITY';
    END IF;
END
$marketing_rls$;

-- Marketing campaigns policies
DROP POLICY IF EXISTS "Users can view their own marketing tasks" ON marketing_tasks;
DROP POLICY IF EXISTS "Users can insert their own marketing tasks" ON marketing_tasks;
DROP POLICY IF EXISTS "Users can update their own marketing tasks" ON marketing_tasks;
DROP POLICY IF EXISTS "Users can delete their own marketing tasks" ON marketing_tasks;
CREATE POLICY "Users can view their own marketing tasks" ON marketing_tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own marketing tasks" ON marketing_tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own marketing tasks" ON marketing_tasks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own marketing tasks" ON marketing_tasks
    FOR DELETE USING (auth.uid() = user_id);

DO $marketing_policies$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'marketing_yesterday_tasks'
    ) THEN
        EXECUTE 'DROP POLICY IF EXISTS "Users can view their own marketing yesterday tasks" ON marketing_yesterday_tasks';
        EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own marketing yesterday tasks" ON marketing_yesterday_tasks';
        EXECUTE 'DROP POLICY IF EXISTS "Users can delete their own marketing yesterday tasks" ON marketing_yesterday_tasks';
        EXECUTE 'CREATE POLICY "Users can view their own marketing yesterday tasks" ON marketing_yesterday_tasks ' ||
                'FOR SELECT USING (auth.uid() = user_id)';
        EXECUTE 'CREATE POLICY "Users can insert their own marketing yesterday tasks" ON marketing_yesterday_tasks ' ||
                'FOR INSERT WITH CHECK (auth.uid() = user_id)';
        EXECUTE 'CREATE POLICY "Users can delete their own marketing yesterday tasks" ON marketing_yesterday_tasks ' ||
                'FOR DELETE USING (auth.uid() = user_id)';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'marketing_planned_tasks'
    ) THEN
        EXECUTE 'DROP POLICY IF EXISTS "Users can view their own marketing planned tasks" ON marketing_planned_tasks';
        EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own marketing planned tasks" ON marketing_planned_tasks';
        EXECUTE 'DROP POLICY IF EXISTS "Users can delete their own marketing planned tasks" ON marketing_planned_tasks';
        EXECUTE 'CREATE POLICY "Users can view their own marketing planned tasks" ON marketing_planned_tasks ' ||
                'FOR SELECT USING (auth.uid() = user_id)';
        EXECUTE 'CREATE POLICY "Users can insert their own marketing planned tasks" ON marketing_planned_tasks ' ||
                'FOR INSERT WITH CHECK (auth.uid() = user_id)';
        EXECUTE 'CREATE POLICY "Users can delete their own marketing planned tasks" ON marketing_planned_tasks ' ||
                'FOR DELETE USING (auth.uid() = user_id)';
    END IF;
END
$marketing_policies$;

-- =====================================================
-- CUSTOMERS TABLES RLS
-- =====================================================

-- Enable RLS on customers tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
DO $crm_rls$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'crm_customers'
    ) THEN
        EXECUTE 'ALTER TABLE crm_customers ENABLE ROW LEVEL SECURITY';
    END IF;
END
$crm_rls$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own customers" ON customers;
DROP POLICY IF EXISTS "Users can insert their own customers" ON customers;
DROP POLICY IF EXISTS "Users can update their own customers" ON customers;
DROP POLICY IF EXISTS "Users can delete their own customers" ON customers;

-- Customers policies
CREATE POLICY "Users can view their own customers" ON customers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own customers" ON customers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customers" ON customers
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own customers" ON customers
    FOR DELETE USING (auth.uid() = user_id);

DO $crm_policies$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'crm_customers'
    ) THEN
        EXECUTE 'DROP POLICY IF EXISTS "Users can view their CRM customers" ON crm_customers';
        EXECUTE 'DROP POLICY IF EXISTS "Users can insert their CRM customers" ON crm_customers';
        EXECUTE 'DROP POLICY IF EXISTS "Users can update their CRM customers" ON crm_customers';
        EXECUTE 'DROP POLICY IF EXISTS "Users can delete their CRM customers" ON crm_customers';
        EXECUTE 'CREATE POLICY "Users can view their CRM customers" ON crm_customers ' ||
                'FOR SELECT USING (auth.uid() = user_id)';
        EXECUTE 'CREATE POLICY "Users can insert their CRM customers" ON crm_customers ' ||
                'FOR INSERT WITH CHECK (auth.uid() = user_id)';
        EXECUTE 'CREATE POLICY "Users can update their CRM customers" ON crm_customers ' ||
                'FOR UPDATE USING (auth.uid() = user_id)';
        EXECUTE 'CREATE POLICY "Users can delete their CRM customers" ON crm_customers ' ||
                'FOR DELETE USING (auth.uid() = user_id)';
    END IF;
END
$crm_policies$;

-- =====================================================
-- SUPPLIERS TABLES RLS
-- =====================================================

-- Enable RLS on suppliers tables
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_documents ENABLE ROW LEVEL SECURITY;

-- Suppliers policies
DROP POLICY IF EXISTS "Users can view their own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can insert their own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can update their own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can delete their own suppliers" ON suppliers;

CREATE POLICY "Users can view their own suppliers" ON suppliers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own suppliers" ON suppliers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own suppliers" ON suppliers
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own suppliers" ON suppliers
    FOR DELETE USING (auth.uid() = user_id);

-- Supplier documents policies
DROP POLICY IF EXISTS "Users can view documents of their suppliers" ON supplier_documents;
DROP POLICY IF EXISTS "Users can insert documents for their suppliers" ON supplier_documents;
DROP POLICY IF EXISTS "Users can update documents of their suppliers" ON supplier_documents;
DROP POLICY IF EXISTS "Users can delete documents of their suppliers" ON supplier_documents;

CREATE POLICY "Users can view documents of their suppliers" ON supplier_documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM suppliers 
            WHERE suppliers.id = supplier_documents.supplier_id 
            AND suppliers.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert documents for their suppliers" ON supplier_documents
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM suppliers 
            WHERE suppliers.id = supplier_documents.supplier_id 
            AND suppliers.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update documents of their suppliers" ON supplier_documents
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM suppliers 
            WHERE suppliers.id = supplier_documents.supplier_id 
            AND suppliers.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete documents of their suppliers" ON supplier_documents
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM suppliers 
            WHERE suppliers.id = supplier_documents.supplier_id 
            AND suppliers.user_id = auth.uid()
        )
    );

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant permissions on all tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
