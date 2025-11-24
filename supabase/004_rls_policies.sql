-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Secure access control for all business data tables
-- =====================================================

-- =====================================================
-- FINANCE TABLES RLS
-- =====================================================

-- Enable RLS on finance tables
ALTER TABLE finance_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_liquidity ENABLE ROW LEVEL SECURITY;

-- Finance entries policies
CREATE POLICY "Users can view their own finance entries" ON finance_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own finance entries" ON finance_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own finance entries" ON finance_entries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own finance entries" ON finance_entries
    FOR DELETE USING (auth.uid() = user_id);

-- Finance categories policies
CREATE POLICY "Users can view their own finance categories" ON finance_categories
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own finance categories" ON finance_categories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own finance categories" ON finance_categories
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own finance categories" ON finance_categories
    FOR DELETE USING (auth.uid() = user_id);

-- Finance liquidity policies
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
ALTER TABLE sales_meetings ENABLE ROW LEVEL SECURITY;

-- Sales meetings policies
CREATE POLICY "Users can view their own sales meetings" ON sales_meetings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sales meetings" ON sales_meetings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sales meetings" ON sales_meetings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sales meetings" ON sales_meetings
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- OPERATIONS TABLES RLS
-- =====================================================

-- Enable RLS on operations tables
ALTER TABLE operations_entries ENABLE ROW LEVEL SECURITY;

-- Operations entries policies
CREATE POLICY "Users can view their own operations entries" ON operations_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own operations entries" ON operations_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own operations entries" ON operations_entries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own operations entries" ON operations_entries
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- MARKETING TABLES RLS
-- =====================================================

-- Enable RLS on marketing tables
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_customer_interactions ENABLE ROW LEVEL SECURITY;

-- Marketing campaigns policies
CREATE POLICY "Users can view their own marketing campaigns" ON marketing_campaigns
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own marketing campaigns" ON marketing_campaigns
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own marketing campaigns" ON marketing_campaigns
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own marketing campaigns" ON marketing_campaigns
    FOR DELETE USING (auth.uid() = user_id);

-- Marketing tasks policies
CREATE POLICY "Users can view their own marketing tasks" ON marketing_tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own marketing tasks" ON marketing_tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own marketing tasks" ON marketing_tasks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own marketing tasks" ON marketing_tasks
    FOR DELETE USING (auth.uid() = user_id);

-- Marketing customer interactions policies
CREATE POLICY "Users can view their own marketing interactions" ON marketing_customer_interactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own marketing interactions" ON marketing_customer_interactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own marketing interactions" ON marketing_customer_interactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own marketing interactions" ON marketing_customer_interactions
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- CUSTOMERS TABLES RLS
-- =====================================================

-- Enable RLS on customers tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Customers policies
CREATE POLICY "Users can view their own customers" ON customers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own customers" ON customers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customers" ON customers
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own customers" ON customers
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- SUPPLIERS TABLES RLS
-- =====================================================

-- Enable RLS on suppliers tables
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_documents ENABLE ROW LEVEL SECURITY;

-- Suppliers policies
CREATE POLICY "Users can view their own suppliers" ON suppliers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own suppliers" ON suppliers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own suppliers" ON suppliers
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own suppliers" ON suppliers
    FOR DELETE USING (auth.uid() = user_id);

-- Supplier documents policies
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
-- ROLE-BASED ACCESS POLICIES (Optional)
-- =====================================================

-- Function to check user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
    -- This would need to be implemented based on your user roles system
    -- For now, return 'user' as default
    RETURN 'user';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example: Finance role can only access finance data
-- CREATE POLICY "Finance role can only access finance data" ON finance_entries
--     FOR ALL USING (get_user_role(auth.uid()) = 'finance' OR get_user_role(auth.uid()) = 'admin');

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant permissions on all tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
