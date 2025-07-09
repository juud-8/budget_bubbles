import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/backend/.env')

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise Exception("Supabase credentials not configured")

# Headers for Supabase requests
def get_headers():
    return {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json'
    }

# Read the SQL file
with open('/app/create_schema.sql', 'r') as f:
    sql = f.read()

# Execute the SQL using Supabase's SQL API
url = f"{SUPABASE_URL}/rest/v1/rpc/execute_sql"
payload = {
    "query": sql
}

print(f"Connecting to Supabase at: {SUPABASE_URL}")
print("Executing SQL to create tables...")

response = requests.post(url, headers=get_headers(), json=payload)

if response.status_code == 200:
    print("✅ Tables created successfully!")
    print(response.json())
else:
    print(f"❌ Error creating tables: {response.status_code}")
    print(response.text)