from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
import os
import json
from typing import List, Optional
from pydantic import BaseModel
import uuid
import requests
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Budget Bubbles API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase configuration
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

# Pydantic models
class BudgetCategory(BaseModel):
    id: Optional[str] = None
    name: str
    budget_amount: float
    color: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class Transaction(BaseModel):
    id: Optional[str] = None
    category_id: str
    amount: float
    description: str
    date: datetime
    created_at: Optional[datetime] = None

class CategoryWithSpending(BaseModel):
    id: str
    name: str
    budget_amount: float
    color: str
    total_spent: float
    remaining_budget: float
    percentage_used: float
    created_at: datetime
    updated_at: datetime

# Helper functions for Supabase HTTP requests
def supabase_get(table: str, params: dict = None):
    """Make GET request to Supabase table"""
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    if params:
        url += "?" + "&".join([f"{k}={v}" for k, v in params.items()])
    
    response = requests.get(url, headers=get_headers())
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)
    return response.json()

def supabase_post(table: str, data: dict):
    """Make POST request to Supabase table"""
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    response = requests.post(url, headers=get_headers(), json=data)
    if response.status_code not in [200, 201]:
        raise HTTPException(status_code=response.status_code, detail=f"Supabase error: {response.text}")
    
    # Supabase might return empty response for successful inserts
    if response.text.strip():
        return response.json()
    else:
        return {"success": True}

def supabase_patch(table: str, filters: dict, data: dict):
    """Make PATCH request to Supabase table"""
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    filter_params = "&".join([f"{k}=eq.{v}" for k, v in filters.items()])
    url += f"?{filter_params}"
    
    # Add Prefer header for returning data
    headers = get_headers()
    headers["Prefer"] = "return=representation"
    
    print(f"PATCH request to URL: {url}")
    print(f"PATCH request headers: {headers}")
    print(f"PATCH request data: {data}")
    
    response = requests.patch(url, headers=headers, json=data)
    print(f"PATCH response status: {response.status_code}")
    print(f"PATCH response text: {response.text}")
    
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=f"Supabase error: {response.text}")
    
    # Supabase might return empty response for successful updates
    if response.text.strip():
        try:
            return response.json()
        except:
            return {"success": True, "message": "Update successful"}
    else:
        return {"success": True, "message": "Update successful"}

def supabase_delete(table: str, filters: dict):
    """Make DELETE request to Supabase table"""
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    filter_params = "&".join([f"{k}=eq.{v}" for k, v in filters.items()])
    url += f"?{filter_params}"
    
    # Add Prefer header for returning data
    headers = get_headers()
    headers["Prefer"] = "return=representation"
    
    print(f"DELETE request to URL: {url}")
    print(f"DELETE request headers: {headers}")
    
    response = requests.delete(url, headers=headers)
    print(f"DELETE response status: {response.status_code}")
    print(f"DELETE response text: {response.text}")
    
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=f"Supabase error: {response.text}")
    
    # Supabase might return empty response for successful deletes
    if response.text.strip():
        try:
            return response.json()
        except:
            return {"success": True, "message": "Delete successful"}
    else:
        return {"success": True, "message": "Delete successful"}

# Health check endpoint
@app.get("/")
async def health_check():
    return {"status": "healthy", "service": "Budget Bubbles API"}

# Budget Categories endpoints
@app.get("/api/categories", response_model=List[CategoryWithSpending])
async def get_categories():
    try:
        # Get categories
        categories = supabase_get('budget_categories', {'select': '*', 'order': 'created_at.asc'})
        
        result = []
        for category in categories:
            # Calculate total spent for this category
            transactions = supabase_get('transactions', {
                'select': 'amount',
                'category_id': f'eq.{category["id"]}'
            })
            
            total_spent = sum(transaction['amount'] for transaction in transactions)
            budget_amount = category['budget_amount']
            remaining_budget = budget_amount - total_spent
            percentage_used = (total_spent / budget_amount * 100) if budget_amount > 0 else 0
            
            result.append({
                "id": category['id'],
                "name": category['name'],
                "budget_amount": budget_amount,
                "color": category['color'],
                "total_spent": total_spent,
                "remaining_budget": remaining_budget,
                "percentage_used": percentage_used,
                "created_at": category['created_at'],
                "updated_at": category['updated_at']
            })
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/categories", response_model=dict)
async def create_category(category: BudgetCategory):
    try:
        category_data = {
            "id": str(uuid.uuid4()),
            "name": category.name,
            "budget_amount": category.budget_amount,
            "color": category.color,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        result = supabase_post('budget_categories', category_data)
        return {"id": category_data['id'], "message": "Category created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/categories/{category_id}", response_model=dict)
async def update_category(category_id: str, category: BudgetCategory):
    try:
        category_data = {
            "name": category.name,
            "budget_amount": category.budget_amount,
            "color": category.color,
            "updated_at": datetime.now().isoformat()
        }
        
        result = supabase_patch('budget_categories', {'id': category_id}, category_data)
        
        return {"message": "Category updated successfully"}
    except Exception as e:
        if "Category not found" in str(e):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/categories/{category_id}")
async def delete_category(category_id: str):
    try:
        # Delete all transactions for this category first
        supabase_delete('transactions', {'category_id': category_id})
        
        # Delete the category
        result = supabase_delete('budget_categories', {'id': category_id})
        
        return {"message": "Category deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Transactions endpoints
@app.get("/api/transactions", response_model=List[Transaction])
async def get_transactions(category_id: Optional[str] = None):
    try:
        params = {'select': '*', 'order': 'date.desc'}
        if category_id:
            params['category_id'] = f'eq.{category_id}'
        
        transactions = supabase_get('transactions', params)
        
        result = []
        for transaction in transactions:
            result.append({
                "id": transaction['id'],
                "category_id": transaction['category_id'],
                "amount": transaction['amount'],
                "description": transaction['description'],
                "date": transaction['date'],
                "created_at": transaction['created_at']
            })
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/transactions", response_model=dict)
async def create_transaction(transaction: Transaction):
    try:
        transaction_data = {
            "id": str(uuid.uuid4()),
            "category_id": transaction.category_id,
            "amount": transaction.amount,
            "description": transaction.description,
            "date": transaction.date.isoformat(),
            "created_at": datetime.now().isoformat()
        }
        
        result = supabase_post('transactions', transaction_data)
        return {"id": transaction_data['id'], "message": "Transaction created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/transactions/{transaction_id}", response_model=dict)
async def update_transaction(transaction_id: str, transaction: Transaction):
    try:
        transaction_data = {
            "category_id": transaction.category_id,
            "amount": transaction.amount,
            "description": transaction.description,
            "date": transaction.date.isoformat()
        }
        
        result = supabase_patch('transactions', {'id': transaction_id}, transaction_data)
        
        return {"message": "Transaction updated successfully"}
    except Exception as e:
        if "Transaction not found" in str(e):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/transactions/{transaction_id}")
async def delete_transaction(transaction_id: str):
    try:
        result = supabase_delete('transactions', {'id': transaction_id})
        
        return {"message": "Transaction deleted successfully"}
    except Exception as e:
        if "Transaction not found" in str(e):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

# Dashboard summary endpoint
@app.get("/api/dashboard")
async def get_dashboard():
    try:
        # Get all categories
        categories = supabase_get('budget_categories', {'select': '*'})
        
        total_budget = sum(cat['budget_amount'] for cat in categories)
        
        # Get all transactions
        transactions = supabase_get('transactions', {'select': '*'})
        
        total_spent = sum(transaction['amount'] for transaction in transactions)
        remaining_budget = total_budget - total_spent
        categories_count = len(categories)
        transactions_count = len(transactions)
        
        return {
            "total_budget": total_budget,
            "total_spent": total_spent,
            "remaining_budget": remaining_budget,
            "categories_count": categories_count,
            "transactions_count": transactions_count,
            "percentage_used": (total_spent / total_budget * 100) if total_budget > 0 else 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.on_event("startup")
async def startup_event():
    print("🚀 Budget Bubbles API starting up...")
    print(f"📊 Connected to Supabase at: {SUPABASE_URL}")
    # Test connection
    try:
        # Try to access the categories table
        supabase_get('budget_categories', {'select': '*', 'limit': '1'})
        print("✅ Successfully connected to budget_categories table")
    except Exception as e:
        print(f"⚠️  Could not access budget_categories table: {str(e)}")
        print("💡 Please create the tables manually in Supabase SQL Editor")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)