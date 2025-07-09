from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import os
import json
from typing import List, Optional
from pydantic import BaseModel
import uuid

app = FastAPI(title="Budget Bubbles API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')
client = MongoClient(MONGO_URL)
db = client.budget_bubbles

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

# Health check endpoint
@app.get("/")
async def health_check():
    return {"status": "healthy", "service": "Budget Bubbles API"}

# Budget Categories endpoints
@app.get("/api/categories", response_model=List[CategoryWithSpending])
async def get_categories():
    try:
        categories = list(db.categories.find())
        result = []
        
        for category in categories:
            # Calculate total spent for this category
            total_spent = sum(
                transaction.get('amount', 0) 
                for transaction in db.transactions.find({"category_id": str(category['_id'])})
            )
            
            budget_amount = category.get('budget_amount', 0)
            remaining_budget = budget_amount - total_spent
            percentage_used = (total_spent / budget_amount * 100) if budget_amount > 0 else 0
            
            result.append({
                "id": str(category['_id']),
                "name": category['name'],
                "budget_amount": budget_amount,
                "color": category['color'],
                "total_spent": total_spent,
                "remaining_budget": remaining_budget,
                "percentage_used": percentage_used,
                "created_at": category.get('created_at', datetime.now()),
                "updated_at": category.get('updated_at', datetime.now())
            })
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/categories", response_model=dict)
async def create_category(category: BudgetCategory):
    try:
        category_data = category.dict()
        category_data['_id'] = str(uuid.uuid4())
        category_data['created_at'] = datetime.now()
        category_data['updated_at'] = datetime.now()
        
        result = db.categories.insert_one(category_data)
        return {"id": category_data['_id'], "message": "Category created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/categories/{category_id}", response_model=dict)
async def update_category(category_id: str, category: BudgetCategory):
    try:
        # Remove id from the update data if present
        category_data = category.dict(exclude_unset=True)
        if 'id' in category_data:
            del category_data['id']
        
        category_data['updated_at'] = datetime.now()
        
        result = db.categories.update_one(
            {"_id": category_id},
            {"$set": category_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Category not found")
        
        return {"message": "Category updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/categories/{category_id}")
async def delete_category(category_id: str):
    try:
        # Delete all transactions for this category first
        db.transactions.delete_many({"category_id": category_id})
        
        result = db.categories.delete_one({"_id": category_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Category not found")
        
        return {"message": "Category deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Transactions endpoints
@app.get("/api/transactions", response_model=List[Transaction])
async def get_transactions(category_id: Optional[str] = None):
    try:
        query = {}
        if category_id:
            query["category_id"] = category_id
        
        transactions = list(db.transactions.find(query).sort("date", -1))
        
        result = []
        for transaction in transactions:
            result.append({
                "id": str(transaction['_id']),
                "category_id": transaction['category_id'],
                "amount": transaction['amount'],
                "description": transaction['description'],
                "date": transaction['date'],
                "created_at": transaction.get('created_at', datetime.now())
            })
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/transactions", response_model=dict)
async def create_transaction(transaction: Transaction):
    try:
        transaction_data = transaction.dict()
        transaction_data['_id'] = str(uuid.uuid4())
        transaction_data['created_at'] = datetime.now()
        
        result = db.transactions.insert_one(transaction_data)
        return {"id": transaction_data['_id'], "message": "Transaction created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/transactions/{transaction_id}", response_model=dict)
async def update_transaction(transaction_id: str, transaction: Transaction):
    try:
        transaction_data = transaction.dict()
        
        result = db.transactions.update_one(
            {"_id": transaction_id},
            {"$set": transaction_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        return {"message": "Transaction updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/transactions/{transaction_id}")
async def delete_transaction(transaction_id: str):
    try:
        result = db.transactions.delete_one({"_id": transaction_id})
        
        if result.deleted_count == 0:
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
        categories = list(db.categories.find())
        total_budget = sum(cat.get('budget_amount', 0) for cat in categories)
        
        total_spent = 0
        for category in categories:
            category_spent = sum(
                transaction.get('amount', 0) 
                for transaction in db.transactions.find({"category_id": str(category['_id'])})
            )
            total_spent += category_spent
        
        remaining_budget = total_budget - total_spent
        categories_count = len(categories)
        transactions_count = db.transactions.count_documents({})
        
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)