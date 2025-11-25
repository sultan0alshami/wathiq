-- =====================================================
-- SAFE BUSINESS DATA TABLES CREATION
-- This script checks for existing tables before creating them
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- LEGACY TABLE RENAMES / COLUMN FIXES
-- These blocks make the script idempotent even if old table
-- names/columns still exist from earlier versions.
-- =====================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'sales_meetings'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'sales_entries'
    ) THEN
        EXECUTE 'ALTER TABLE sales_meetings RENAME TO sales_entries';
    END IF;
END$$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'sales_entries'
        AND column_name = 'date'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'sales_entries'
        AND column_name = 'meeting_date'
    ) THEN
        EXECUTE 'ALTER TABLE sales_entries RENAME COLUMN date TO meeting_date';
    END IF;
END$$;

-- =====================================================
-- FINANCE TABLES
-- =====================================================

-- Finance entries table
CREATE TABLE IF NOT EXISTS finance_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'deposit')),
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    attachment_url TEXT,
    payment_method VARCHAR(50),
    reference_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Finance categories table
CREATE TABLE IF NOT EXISTS finance_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS finance_liquidity (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    value DECIMAL(15,2) NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SALES TABLES
-- =====================================================

-- Sales entries table
CREATE TABLE IF NOT EXISTS sales_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    phone_number TEXT,
    meeting_date DATE NOT NULL,
    meeting_time TEXT,
    outcome VARCHAR(20) NOT NULL CHECK (outcome IN ('positive', 'negative', 'pending')),
    notes TEXT,
    attachments TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- OPERATIONS TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS operations_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    task TEXT NOT NULL,
    owner TEXT NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('completed', 'in-progress', 'pending')),
    priority VARCHAR(10) NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS operations_expectations (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    expected_next_day INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- MARKETING TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS marketing_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('planned', 'in_progress', 'completed')),
    priority VARCHAR(10) NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
    assignee VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS marketing_yesterday_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    task_title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS marketing_planned_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    task_title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CUSTOMERS TABLES
-- =====================================================

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    arrival_date DATE NOT NULL,
    notes TEXT,
    source TEXT,
    contacted BOOLEAN NOT NULL DEFAULT false,
    came_back BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm_customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(30),
    company TEXT,
    status VARCHAR(20) NOT NULL CHECK (status IN ('new', 'contacted', 'interested', 'converted', 'inactive')),
    source VARCHAR(20) NOT NULL CHECK (source IN ('website', 'referral', 'social_media', 'direct', 'other')),
    registration_date DATE NOT NULL,
    last_contact_date DATE,
    notes TEXT,
    estimated_value DECIMAL(15,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SUPPLIERS TABLES
-- =====================================================

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(200) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    address TEXT,
    category VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'inactive')),
    estimated_value DECIMAL(15,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Supplier documents table
CREATE TABLE IF NOT EXISTS supplier_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL,
    file_url TEXT,
    file_size INTEGER,
    description TEXT,
    upload_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE (CREATE IF NOT EXISTS)
-- =====================================================

-- Finance indexes
CREATE INDEX IF NOT EXISTS idx_finance_entries_user_date ON finance_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_finance_entries_type ON finance_entries(type);
CREATE INDEX IF NOT EXISTS idx_finance_entries_title ON finance_entries(user_id, title);
CREATE INDEX IF NOT EXISTS idx_finance_categories_user ON finance_categories(user_id);

-- Sales indexes
CREATE INDEX IF NOT EXISTS idx_sales_entries_user_date ON sales_entries(user_id, meeting_date);
CREATE INDEX IF NOT EXISTS idx_sales_entries_outcome ON sales_entries(outcome);

CREATE INDEX IF NOT EXISTS idx_operations_entries_user_date ON operations_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_operations_entries_status ON operations_entries(status);

-- Marketing indexes
CREATE INDEX IF NOT EXISTS idx_marketing_tasks_user_date ON marketing_tasks(user_id, date);
CREATE INDEX IF NOT EXISTS idx_marketing_tasks_due_date ON marketing_tasks(due_date);

-- Customers indexes
CREATE INDEX IF NOT EXISTS idx_customers_user_arrival ON customers(user_id, arrival_date);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_crm_customers_user ON crm_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_crm_customers_status ON crm_customers(status);
CREATE INDEX IF NOT EXISTS idx_crm_customers_source ON crm_customers(source);

-- Suppliers indexes
CREATE INDEX IF NOT EXISTS idx_suppliers_user_date ON suppliers(user_id, date);
CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers(status);
CREATE INDEX IF NOT EXISTS idx_supplier_documents_supplier ON supplier_documents(supplier_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT (CREATE IF NOT EXISTS)
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at (DROP IF EXISTS first)
DROP TRIGGER IF EXISTS update_finance_entries_updated_at ON finance_entries;
DROP TRIGGER IF EXISTS update_finance_liquidity_updated_at ON finance_liquidity;
DROP TRIGGER IF EXISTS update_sales_entries_updated_at ON sales_entries;
DROP TRIGGER IF EXISTS update_operations_entries_updated_at ON operations_entries;
DROP TRIGGER IF EXISTS update_operations_expectations_updated_at ON operations_expectations;
DROP TRIGGER IF EXISTS update_marketing_tasks_updated_at ON marketing_tasks;
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
DROP TRIGGER IF EXISTS update_crm_customers_updated_at ON crm_customers;
DROP TRIGGER IF EXISTS update_suppliers_updated_at ON suppliers;

-- Create triggers
CREATE TRIGGER update_finance_entries_updated_at BEFORE UPDATE ON finance_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_finance_liquidity_updated_at BEFORE UPDATE ON finance_liquidity FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_entries_updated_at BEFORE UPDATE ON sales_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_operations_entries_updated_at BEFORE UPDATE ON operations_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_operations_expectations_updated_at BEFORE UPDATE ON operations_expectations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marketing_tasks_updated_at BEFORE UPDATE ON marketing_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crm_customers_updated_at BEFORE UPDATE ON crm_customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
