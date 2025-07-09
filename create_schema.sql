-- Create budget_categories table
CREATE TABLE IF NOT EXISTS budget_categories (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    budget_amount DECIMAL(10, 2) NOT NULL,
    color TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY,
    category_id UUID NOT NULL REFERENCES budget_categories(id),
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);