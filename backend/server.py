from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
import os
import json
from typing import List, Optional
from pydantic import BaseModel
import uuid
from supabase import create_client, Client
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

# Supabase connection
def get_supabase() -> Client:
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")
    if not url or not key:
        raise HTTPException(status_code=500, detail="Supabase credentials not configured")
    return create_client(url, key)

# Initialize Supabase client
supabase = get_supabase()

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

# Helper function to create tables if they don't exist
async def ensure_tables_exist():
    """Ensure the required tables exist in Supabase"""
    try:
        # Test if tables exist by querying them
        supabase.table('budget_categories').select('*').limit(1).execute()
        supabase.table('transactions').select('*').limit(1).execute()
        print("✅ Tables already exist")
    except Exception as e:
        print(f"⚠️  Tables might not exist: {str(e)}")
        print("Please create the tables manually in Supabase SQL Editor using the create_schema.sql file")

# Health check endpoint
@app.get("/")
async def health_check():
    return {"status": "healthy", "service": "Budget Bubbles API"}

# Budget Categories endpoints
@app.get("/api/categories", response_model=List[CategoryWithSpending])
async def get_categories():
    try:
        # Get categories
        categories_response = supabase.table('budget_categories').select('*').execute()
        categories = categories_response.data
        
        result = []
        for category in categories:
            # Calculate total spent for this category
            transactions_response = supabase.table('transactions').select('amount').eq('category_id', category['id']).execute()
            
            total_spent = sum(transaction['amount'] for transaction in transactions_response.data)
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
        
        result = supabase.table('budget_categories').insert(category_data).execute()
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
        
        result = supabase.table('budget_categories').update(category_data).eq('id', category_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Category not found")
        
        return {"message": "Category updated successfully"}
    except Exception as e:
        if "Category not found" in str(e):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/categories/{category_id}")
async def delete_category(category_id: str):
    try:
        # Delete all transactions for this category first
        supabase.table('transactions').delete().eq('category_id', category_id).execute()
        
        # Delete the category
        result = supabase.table('budget_categories').delete().eq('id', category_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Category not found")
        
        return {"message": "Category deleted successfully"}
    except Exception as e:
        if "Category not found" in str(e):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

# Transactions endpoints
@app.get("/api/transactions", response_model=List[Transaction])
async def get_transactions(category_id: Optional[str] = None):
    try:
        query = supabase.table('transactions').select('*').order('date', desc=True)
        
        if category_id:
            query = query.eq('category_id', category_id)
        
        transactions_response = query.execute()
        transactions = transactions_response.data
        
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
        
        result = supabase.table('transactions').insert(transaction_data).execute()
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
        
        result = supabase.table('transactions').update(transaction_data).eq('id', transaction_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        return {"message": "Transaction updated successfully"}
    except Exception as e:
        if "Transaction not found" in str(e):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/transactions/{transaction_id}")
async def delete_transaction(transaction_id: str):
    try:
        result = supabase.table('transactions').delete().eq('id', transaction_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
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
        categories_response = supabase.table('budget_categories').select('*').execute()
        categories = categories_response.data
        
        total_budget = sum(cat['budget_amount'] for cat in categories)
        
        # Get all transactions
        transactions_response = supabase.table('transactions').select('*').execute()
        transactions = transactions_response.data
        
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
    await ensure_tables_exist()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)