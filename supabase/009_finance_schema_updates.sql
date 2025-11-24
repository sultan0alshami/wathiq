-- =====================================================
-- Finance schema adjustments for Supabase persistence
-- =====================================================

-- 1) Ensure finance_entries supports title/attachment/deposit type
ALTER TABLE finance_entries
    ADD COLUMN IF NOT EXISTS title TEXT;

UPDATE finance_entries
SET title = COALESCE(title, description, '')
WHERE title IS NULL;

ALTER TABLE finance_entries
    ALTER COLUMN title SET NOT NULL;

ALTER TABLE finance_entries
    ADD COLUMN IF NOT EXISTS attachment_url TEXT;

ALTER TABLE finance_entries
    DROP CONSTRAINT IF EXISTS finance_entries_type_check;

ALTER TABLE finance_entries
    ADD CONSTRAINT finance_entries_type_check
        CHECK (type IN ('income', 'expense', 'deposit'));

-- 2) Create finance_liquidity table if missing
CREATE TABLE IF NOT EXISTS finance_liquidity (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    value DECIMAL(15,2) NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3) Indexes and triggers
CREATE INDEX IF NOT EXISTS idx_finance_entries_title ON finance_entries(user_id, title);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'update_finance_entries_updated_at'
    ) THEN
        CREATE TRIGGER update_finance_entries_updated_at
            BEFORE UPDATE ON finance_entries
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'update_finance_liquidity_updated_at'
    ) THEN
        CREATE TRIGGER update_finance_liquidity_updated_at
            BEFORE UPDATE ON finance_liquidity
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- 4) RLS and policies for finance_liquidity
ALTER TABLE finance_liquidity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own finance liquidity" ON finance_liquidity;
DROP POLICY IF EXISTS "Users can upsert their finance liquidity" ON finance_liquidity;
DROP POLICY IF EXISTS "Users can update their finance liquidity" ON finance_liquidity;

CREATE POLICY "Users can view their own finance liquidity" ON finance_liquidity
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert their finance liquidity" ON finance_liquidity
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their finance liquidity" ON finance_liquidity
    FOR UPDATE USING (auth.uid() = user_id);

