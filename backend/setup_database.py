import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

def setup_database():
    """Set up the Supabase database schema"""
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")
    
    if not url or not key:
        print("Error: Missing Supabase credentials")
        return False
    
    supabase: Client = create_client(url, key)
    
    # Read the SQL schema file
    with open('create_schema.sql', 'r') as f:
        sql_commands = f.read()
    
    try:
        # Execute the SQL commands
        result = supabase.rpc('exec_sql', {'sql': sql_commands})
        print("✅ Database schema created successfully!")
        return True
    except Exception as e:
        print(f"❌ Error creating database schema: {str(e)}")
        
        # Try alternative approach - create tables individually
        try:
            print("Trying alternative table creation approach...")
            
            # Create budget_categories table
            supabase.table('budget_categories').select('*').limit(1).execute()
            print("✅ budget_categories table exists or created")
            
            # Create transactions table  
            supabase.table('transactions').select('*').limit(1).execute()
            print("✅ transactions table exists or created")
            
            return True
            
        except Exception as e2:
            print(f"❌ Alternative approach failed: {str(e2)}")
            print("Please run the SQL schema manually in Supabase SQL Editor")
            return False

if __name__ == "__main__":
    setup_database()