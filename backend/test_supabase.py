import os
import requests
from dotenv import load_dotenv

load_dotenv()

def test_supabase_connection():
    """Test Supabase connection and create tables if needed"""
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")
    
    if not url or not key:
        print("Error: Missing Supabase credentials")
        return False
    
    headers = {
        'apikey': key,
        'Authorization': f'Bearer {key}',
        'Content-Type': 'application/json'
    }
    
    try:
        # Test connection by querying existing tables
        response = requests.get(f"{url}/rest/v1/budget_categories?select=*&limit=1", headers=headers)
        
        if response.status_code == 200:
            print("✅ budget_categories table exists and is accessible")
        else:
            print(f"⚠️  budget_categories table might not exist: {response.status_code}")
            
        # Test transactions table
        response = requests.get(f"{url}/rest/v1/transactions?select=*&limit=1", headers=headers)
        
        if response.status_code == 200:
            print("✅ transactions table exists and is accessible")
        else:
            print(f"⚠️  transactions table might not exist: {response.status_code}")
            
        # Test inserting a sample category to ensure write access
        sample_category = {
            "name": "Test Category",
            "budget_amount": 100.00,
            "color": "#3B82F6"
        }
        
        response = requests.post(f"{url}/rest/v1/budget_categories", headers=headers, json=sample_category)
        
        if response.status_code == 201:
            print("✅ Successfully created test category - write access confirmed")
            # Get the ID of the created category to clean it up
            created_category = response.json()
            if created_category:
                category_id = created_category[0]['id']
                # Clean up test category
                requests.delete(f"{url}/rest/v1/budget_categories?id=eq.{category_id}", headers=headers)
                print("✅ Test category cleaned up")
        else:
            print(f"❌ Error creating test category: {response.status_code} - {response.text}")
            return False
            
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    test_supabase_connection()