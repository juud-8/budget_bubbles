import os
import requests
from dotenv import load_dotenv

load_dotenv()

def create_tables_via_rest():
    """Create tables using Supabase REST API"""
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")
    
    if not url or not key:
        print("Error: Missing Supabase credentials")
        return False
    
    # SQL to create tables
    sql_commands = """
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
"""
    
    try:
        # Use the REST API to execute SQL
        headers = {
            'apikey': key,
            'Authorization': f'Bearer {key}',
            'Content-Type': 'application/json'
        }
        
        # Execute SQL via REST API
        response = requests.post(
            f"{url}/rest/v1/rpc/exec_sql",
            headers=headers,
            json={"sql": sql_commands}
        )
        
        if response.status_code == 200:
            print("✅ Tables created successfully via REST API!")
            return True
        else:
            print(f"❌ Error creating tables: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    create_tables_via_rest()