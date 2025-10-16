-- =====================================================
-- WATHIQ BUSINESS DATA TABLES
-- Complete database schema for all business data types
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- FINANCE TABLES
-- =====================================================

-- Finance entries table
CREATE TABLE finance_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    payment_method VARCHAR(50),
    reference_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Finance categories table
CREATE TABLE finance_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SALES TABLES
-- =====================================================

-- Sales meetings table
CREATE TABLE sales_meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    customer_name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(200) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    meeting_time TIMESTAMP WITH TIME ZONE NOT NULL,
    outcome VARCHAR(20) NOT NULL CHECK (outcome IN ('positive', 'negative', 'pending')),
    notes TEXT,
    follow_up_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- OPERATIONS TABLES
-- =====================================================

-- Operations entries table
CREATE TABLE operations_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('completed', 'in_progress', 'pending')),
    priority VARCHAR(10) NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
    assigned_to VARCHAR(200),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- MARKETING TABLES
-- =====================================================

-- Marketing campaigns table
CREATE TABLE marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL,
    budget DECIMAL(15,2),
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'paused', 'completed')),
    target_audience TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marketing tasks table
CREATE TABLE marketing_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed')),
    priority VARCHAR(10) NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
    assigned_to VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily customer interactions table
CREATE TABLE marketing_customer_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    customer_name VARCHAR(200) NOT NULL,
    interaction_type VARCHAR(50) NOT NULL,
    channel VARCHAR(50),
    outcome VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CUSTOMERS TABLES
-- =====================================================

-- Customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    arrival_date DATE NOT NULL,
    departure_date DATE,
    service_type VARCHAR(100),
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SUPPLIERS TABLES
-- =====================================================

-- Suppliers table
CREATE TABLE suppliers (
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
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Supplier documents table
CREATE TABLE supplier_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL,
    file_url TEXT,
    file_size INTEGER,
    upload_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Finance indexes
CREATE INDEX idx_finance_entries_user_date ON finance_entries(user_id, date);
CREATE INDEX idx_finance_entries_type ON finance_entries(type);
CREATE INDEX idx_finance_categories_user ON finance_categories(user_id);

-- Sales indexes
CREATE INDEX idx_sales_meetings_user_date ON sales_meetings(user_id, date);
CREATE INDEX idx_sales_meetings_outcome ON sales_meetings(outcome);

-- Operations indexes
CREATE INDEX idx_operations_entries_user_date ON operations_entries(user_id, date);
CREATE INDEX idx_operations_entries_status ON operations_entries(status);

-- Marketing indexes
CREATE INDEX idx_marketing_campaigns_user_date ON marketing_campaigns(user_id, date);
CREATE INDEX idx_marketing_tasks_user_date ON marketing_tasks(user_id, date);
CREATE INDEX idx_marketing_tasks_due_date ON marketing_tasks(due_date);
CREATE INDEX idx_marketing_interactions_user_date ON marketing_customer_interactions(user_id, date);

-- Customers indexes
CREATE INDEX idx_customers_user_date ON customers(user_id, date);
CREATE INDEX idx_customers_status ON customers(status);

-- Suppliers indexes
CREATE INDEX idx_suppliers_user_date ON suppliers(user_id, date);
CREATE INDEX idx_suppliers_status ON suppliers(status);
CREATE INDEX idx_supplier_documents_supplier ON supplier_documents(supplier_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_finance_entries_updated_at BEFORE UPDATE ON finance_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_meetings_updated_at BEFORE UPDATE ON sales_meetings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_operations_entries_updated_at BEFORE UPDATE ON operations_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marketing_campaigns_updated_at BEFORE UPDATE ON marketing_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marketing_tasks_updated_at BEFORE UPDATE ON marketing_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
