-- Create budget categories table
CREATE TABLE IF NOT EXISTS budget_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR NOT NULL,
    budget_amount DECIMAL(10,2) NOT NULL,
    color VARCHAR(7) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID REFERENCES budget_categories(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_categories_name ON budget_categories(name);

-- Create a view for category spending summary
CREATE OR REPLACE VIEW category_spending_summary AS
SELECT 
    c.id,
    c.name,
    c.budget_amount,
    c.color,
    c.created_at,
    c.updated_at,
    COALESCE(SUM(t.amount), 0) as total_spent,
    c.budget_amount - COALESCE(SUM(t.amount), 0) as remaining_budget,
    CASE 
        WHEN c.budget_amount > 0 THEN (COALESCE(SUM(t.amount), 0) / c.budget_amount) * 100
        ELSE 0
    END as percentage_used
FROM budget_categories c
LEFT JOIN transactions t ON c.id = t.category_id
GROUP BY c.id, c.name, c.budget_amount, c.color, c.created_at, c.updated_at;