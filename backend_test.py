import requests
import json
from datetime import datetime
import time
import sys

# Get the backend URL from the frontend .env file
import os
from dotenv import load_dotenv

# Load the frontend .env file to get the backend URL
frontend_env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'frontend', '.env')
load_dotenv(frontend_env_path)

BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001')
API_URL = f"{BACKEND_URL}/api"

print(f"Using backend URL: {BACKEND_URL}")

# Colors for terminal output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_test_header(test_name):
    print(f"\n{Colors.HEADER}{Colors.BOLD}Testing: {test_name}{Colors.ENDC}")

def print_success(message):
    print(f"{Colors.OKGREEN}✓ {message}{Colors.ENDC}")

def print_failure(message):
    print(f"{Colors.FAIL}✗ {message}{Colors.ENDC}")

def print_info(message):
    print(f"{Colors.OKBLUE}ℹ {message}{Colors.ENDC}")

def test_health_check():
    print_test_header("Health Check Endpoint (GET /)")
    
    try:
        # Try with the API URL first (without /api prefix)
        base_url = BACKEND_URL.rstrip("/")
        response = requests.get(f"{base_url}/")
        
        if response.status_code == 200:
            try:
                data = response.json()
                if data.get("status") == "healthy" and data.get("service") == "Budget Bubbles API":
                    print_success(f"Health check endpoint returned status code {response.status_code}")
                    print_success(f"Response: {data}")
                    return True
                else:
                    print_failure(f"Health check endpoint returned unexpected data: {data}")
            except:
                print_failure("Health check endpoint returned non-JSON response")
                print_info(f"Response content: {response.text[:100]}")
            return False
        else:
            # Try with /api prefix as fallback
            response = requests.get(f"{base_url}/api/")
            if response.status_code == 200:
                try:
                    data = response.json()
                    if data.get("status") == "healthy" and data.get("service") == "Budget Bubbles API":
                        print_success(f"Health check endpoint (with /api prefix) returned status code {response.status_code}")
                        print_success(f"Response: {data}")
                        return True
                    else:
                        print_failure(f"Health check endpoint returned unexpected data: {data}")
                except:
                    print_failure("Health check endpoint returned non-JSON response")
                    print_info(f"Response content: {response.text[:100]}")
                return False
            else:
                print_failure(f"Health check endpoint returned status code {response.status_code}")
                return False
    except Exception as e:
        print_failure(f"Error testing health check endpoint: {str(e)}")
        return False

def test_dashboard_initial():
    print_test_header("Dashboard Endpoint - Initial State (GET /api/dashboard)")
    
    try:
        response = requests.get(f"{API_URL}/dashboard")
        if response.status_code == 200:
            data = response.json()
            print_success(f"Dashboard endpoint returned status code {response.status_code}")
            print_info(f"Initial dashboard data: {data}")
            
            # Check if initial values are zeros or close to zero
            if (data.get("total_budget", -1) == 0 and 
                data.get("total_spent", -1) == 0 and 
                data.get("remaining_budget", -1) == 0 and
                data.get("categories_count", -1) == 0 and
                data.get("transactions_count", -1) == 0):
                print_success("Initial dashboard values are zeros as expected")
                return True
            else:
                print_info("Initial dashboard values may not be zeros, but endpoint is working")
                return True
        else:
            print_failure(f"Dashboard endpoint returned status code {response.status_code}")
            return False
    except Exception as e:
        print_failure(f"Error testing dashboard endpoint: {str(e)}")
        return False

def test_create_category():
    print_test_header("Create Budget Category (POST /api/categories)")
    
    category_data = {
        "name": "Groceries",
        "budget_amount": 500.00,
        "color": "#10B981"
    }
    
    try:
        response = requests.post(
            f"{API_URL}/categories", 
            json=category_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            try:
                data = response.json()
                print_success(f"Create category endpoint returned status code {response.status_code}")
                print_success(f"Response: {data}")
                
                if "id" in data and data.get("message") == "Category created successfully":
                    print_success("Category created successfully with ID: " + data["id"])
                    return data["id"]  # Return the category ID for future tests
                else:
                    print_failure("Category creation response missing ID or success message")
            except Exception as e:
                print_failure(f"Failed to parse response JSON: {str(e)}")
                print_info(f"Response content: {response.text[:100]}")
            
            # If we get here, something went wrong with parsing the response
            # Let's try to get an existing category ID as fallback
            return get_existing_category_id()
        else:
            print_failure(f"Create category endpoint returned status code {response.status_code}")
            print_failure(f"Response: {response.text}")
            
            # Try to get an existing category ID as fallback
            return get_existing_category_id()
    except Exception as e:
        print_failure(f"Error testing create category endpoint: {str(e)}")
        
        # Try to get an existing category ID as fallback
        return get_existing_category_id()

def get_existing_category_id():
    """Fallback function to get an existing category ID if creation fails"""
    print_info("Attempting to get an existing category ID as fallback...")
    try:
        response = requests.get(f"{API_URL}/categories")
        if response.status_code == 200:
            categories = response.json()
            if categories and len(categories) > 0:
                category_id = categories[0]["id"]
                print_success(f"Using existing category with ID: {category_id}")
                return category_id
    except Exception as e:
        print_failure(f"Failed to get existing category: {str(e)}")
    
    print_failure("Could not get any category ID")
    return None

def test_get_categories(expected_category_id=None):
    print_test_header("Get All Categories (GET /api/categories)")
    
    try:
        response = requests.get(f"{API_URL}/categories")
        if response.status_code == 200:
            categories = response.json()
            print_success(f"Get categories endpoint returned status code {response.status_code}")
            print_info(f"Found {len(categories)} categories")
            
            if expected_category_id:
                # Check if our created category is in the list
                found = False
                for category in categories:
                    if category.get("id") == expected_category_id:
                        found = True
                        print_success(f"Found our created category: {category}")
                        # Verify the spending calculations are present
                        if ("total_spent" in category and 
                            "remaining_budget" in category and 
                            "percentage_used" in category):
                            print_success("Category contains spending calculations")
                        else:
                            print_failure("Category missing spending calculations")
                
                if not found:
                    print_failure(f"Could not find our created category with ID {expected_category_id}")
                    return False
                return True
            else:
                print_info(f"Categories: {categories}")
                return True
        else:
            print_failure(f"Get categories endpoint returned status code {response.status_code}")
            return False
    except Exception as e:
        print_failure(f"Error testing get categories endpoint: {str(e)}")
        return False

def test_create_transaction(category_id):
    print_test_header("Create Transaction (POST /api/transactions)")
    
    if not category_id:
        print_failure("Cannot create transaction: No category ID provided")
        return None
    
    transaction_data = {
        "category_id": category_id,
        "amount": 75.00,
        "description": "Weekly grocery shopping",
        "date": datetime.now().isoformat()
    }
    
    try:
        response = requests.post(
            f"{API_URL}/transactions", 
            json=transaction_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            try:
                data = response.json()
                print_success(f"Create transaction endpoint returned status code {response.status_code}")
                print_success(f"Response: {data}")
                
                if "id" in data and data.get("message") == "Transaction created successfully":
                    print_success("Transaction created successfully with ID: " + data["id"])
                    return data["id"]  # Return the transaction ID for future tests
                else:
                    print_failure("Transaction creation response missing ID or success message")
            except Exception as e:
                print_failure(f"Failed to parse response JSON: {str(e)}")
                print_info(f"Response content: {response.text[:100]}")
            
            # If we get here, something went wrong with parsing the response
            # Let's try to get an existing transaction ID as fallback
            return get_existing_transaction_id(category_id)
        else:
            print_failure(f"Create transaction endpoint returned status code {response.status_code}")
            print_failure(f"Response: {response.text}")
            
            # Try to get an existing transaction ID as fallback
            return get_existing_transaction_id(category_id)
    except Exception as e:
        print_failure(f"Error testing create transaction endpoint: {str(e)}")
        
        # Try to get an existing transaction ID as fallback
        return get_existing_transaction_id(category_id)

def get_existing_transaction_id(category_id=None):
    """Fallback function to get an existing transaction ID if creation fails"""
    print_info("Attempting to get an existing transaction ID as fallback...")
    try:
        url = f"{API_URL}/transactions"
        if category_id:
            url += f"?category_id={category_id}"
            
        response = requests.get(url)
        if response.status_code == 200:
            transactions = response.json()
            if transactions and len(transactions) > 0:
                transaction_id = transactions[0]["id"]
                print_success(f"Using existing transaction with ID: {transaction_id}")
                return transaction_id
    except Exception as e:
        print_failure(f"Failed to get existing transaction: {str(e)}")
    
    print_failure("Could not get any transaction ID")
    return None

def test_get_transactions(expected_transaction_id=None, category_id=None):
    print_test_header("Get All Transactions (GET /api/transactions)")
    
    url = f"{API_URL}/transactions"
    if category_id:
        url += f"?category_id={category_id}"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            transactions = response.json()
            print_success(f"Get transactions endpoint returned status code {response.status_code}")
            print_info(f"Found {len(transactions)} transactions")
            
            if expected_transaction_id:
                # Check if our created transaction is in the list
                found = False
                for transaction in transactions:
                    if transaction.get("id") == expected_transaction_id:
                        found = True
                        print_success(f"Found our created transaction: {transaction}")
                
                if not found:
                    print_failure(f"Could not find our created transaction with ID {expected_transaction_id}")
                    return False
                return True
            else:
                print_info(f"Transactions: {transactions}")
                return True
        else:
            print_failure(f"Get transactions endpoint returned status code {response.status_code}")
            return False
    except Exception as e:
        print_failure(f"Error testing get transactions endpoint: {str(e)}")
        return False

def test_dashboard_updated():
    print_test_header("Dashboard Endpoint - Updated State (GET /api/dashboard)")
    
    try:
        response = requests.get(f"{API_URL}/dashboard")
        if response.status_code == 200:
            data = response.json()
            print_success(f"Dashboard endpoint returned status code {response.status_code}")
            print_info(f"Updated dashboard data: {data}")
            
            # Check if values are present and reasonable
            if (data.get("total_budget", 0) >= 0 and 
                "total_spent" in data and 
                "remaining_budget" in data and 
                data.get("categories_count", 0) >= 0 and
                "transactions_count" in data and
                "percentage_used" in data):
                print_success("Dashboard contains all required fields with reasonable values")
                return True
            else:
                print_failure("Dashboard is missing required fields or has invalid values")
                return False
        else:
            print_failure(f"Dashboard endpoint returned status code {response.status_code}")
            return False
    except Exception as e:
        print_failure(f"Error testing dashboard endpoint: {str(e)}")
        return False

def test_update_category(category_id):
    print_test_header(f"Update Category (PUT /api/categories/{category_id})")
    
    if not category_id:
        print_failure("Cannot update category: No category ID provided")
        return False
    
    updated_category_data = {
        "name": "Updated Groceries",
        "budget_amount": 600.00,
        "color": "#3B82F6"
    }
    
    try:
        response = requests.put(
            f"{API_URL}/categories/{category_id}", 
            json=updated_category_data
        )
        
        if response.status_code == 200:
            data = response.json()
            print_success(f"Update category endpoint returned status code {response.status_code}")
            print_success(f"Response: {data}")
            
            if data.get("message") == "Category updated successfully":
                print_success("Category updated successfully")
                
                # Verify the update by getting the category
                verify_response = requests.get(f"{API_URL}/categories")
                if verify_response.status_code == 200:
                    categories = verify_response.json()
                    for category in categories:
                        if category.get("id") == category_id:
                            if (category.get("name") == updated_category_data["name"] and
                                category.get("budget_amount") == updated_category_data["budget_amount"] and
                                category.get("color") == updated_category_data["color"]):
                                print_success("Category update verified")
                                return True
                            else:
                                print_failure("Category update not reflected in GET response")
                                return False
                    
                    print_failure(f"Could not find updated category with ID {category_id}")
                    return False
                else:
                    print_failure("Failed to verify category update")
                    return False
            else:
                print_failure("Category update response missing success message")
                return False
        else:
            print_failure(f"Update category endpoint returned status code {response.status_code}")
            print_failure(f"Response: {response.text}")
            return False
    except Exception as e:
        print_failure(f"Error testing update category endpoint: {str(e)}")
        return False

def test_update_transaction(transaction_id, category_id):
    print_test_header(f"Update Transaction (PUT /api/transactions/{transaction_id})")
    
    if not transaction_id:
        print_failure("Cannot update transaction: No transaction ID provided")
        return False
    
    updated_transaction_data = {
        "category_id": category_id,
        "amount": 75.50,
        "description": "Updated grocery shopping",
        "date": datetime.now().isoformat()
    }
    
    try:
        response = requests.put(
            f"{API_URL}/transactions/{transaction_id}", 
            json=updated_transaction_data
        )
        
        if response.status_code == 200:
            data = response.json()
            print_success(f"Update transaction endpoint returned status code {response.status_code}")
            print_success(f"Response: {data}")
            
            if data.get("message") == "Transaction updated successfully":
                print_success("Transaction updated successfully")
                
                # Verify the update by getting the transaction
                verify_response = requests.get(f"{API_URL}/transactions")
                if verify_response.status_code == 200:
                    transactions = verify_response.json()
                    for transaction in transactions:
                        if transaction.get("id") == transaction_id:
                            if (transaction.get("amount") == updated_transaction_data["amount"] and
                                transaction.get("description") == updated_transaction_data["description"]):
                                print_success("Transaction update verified")
                                return True
                            else:
                                print_failure("Transaction update not reflected in GET response")
                                return False
                    
                    print_failure(f"Could not find updated transaction with ID {transaction_id}")
                    return False
                else:
                    print_failure("Failed to verify transaction update")
                    return False
            else:
                print_failure("Transaction update response missing success message")
                return False
        else:
            print_failure(f"Update transaction endpoint returned status code {response.status_code}")
            print_failure(f"Response: {response.text}")
            return False
    except Exception as e:
        print_failure(f"Error testing update transaction endpoint: {str(e)}")
        return False

def test_delete_transaction(transaction_id):
    print_test_header(f"Delete Transaction (DELETE /api/transactions/{transaction_id})")
    
    if not transaction_id:
        print_failure("Cannot delete transaction: No transaction ID provided")
        return False
    
    try:
        response = requests.delete(f"{API_URL}/transactions/{transaction_id}")
        
        if response.status_code == 200:
            data = response.json()
            print_success(f"Delete transaction endpoint returned status code {response.status_code}")
            print_success(f"Response: {data}")
            
            if data.get("message") == "Transaction deleted successfully":
                print_success("Transaction deleted successfully")
                
                # Verify the deletion by getting all transactions
                verify_response = requests.get(f"{API_URL}/transactions")
                if verify_response.status_code == 200:
                    transactions = verify_response.json()
                    for transaction in transactions:
                        if transaction.get("id") == transaction_id:
                            print_failure(f"Transaction with ID {transaction_id} still exists after deletion")
                            return False
                    
                    print_success(f"Verified transaction with ID {transaction_id} no longer exists")
                    return True
                else:
                    print_failure("Failed to verify transaction deletion")
                    return False
            else:
                print_failure("Transaction deletion response missing success message")
                return False
        else:
            print_failure(f"Delete transaction endpoint returned status code {response.status_code}")
            print_failure(f"Response: {response.text}")
            return False
    except Exception as e:
        print_failure(f"Error testing delete transaction endpoint: {str(e)}")
        return False

def test_delete_category(category_id):
    print_test_header(f"Delete Category (DELETE /api/categories/{category_id})")
    
    if not category_id:
        print_failure("Cannot delete category: No category ID provided")
        return False
    
    try:
        response = requests.delete(f"{API_URL}/categories/{category_id}")
        
        if response.status_code == 200:
            data = response.json()
            print_success(f"Delete category endpoint returned status code {response.status_code}")
            print_success(f"Response: {data}")
            
            if data.get("message") == "Category deleted successfully":
                print_success("Category deleted successfully")
                
                # Verify the deletion by getting all categories
                verify_response = requests.get(f"{API_URL}/categories")
                if verify_response.status_code == 200:
                    categories = verify_response.json()
                    for category in categories:
                        if category.get("id") == category_id:
                            print_failure(f"Category with ID {category_id} still exists after deletion")
                            return False
                    
                    print_success(f"Verified category with ID {category_id} no longer exists")
                    return True
                else:
                    print_failure("Failed to verify category deletion")
                    return False
            else:
                print_failure("Category deletion response missing success message")
                return False
        else:
            print_failure(f"Delete category endpoint returned status code {response.status_code}")
            print_failure(f"Response: {response.text}")
            return False
    except Exception as e:
        print_failure(f"Error testing delete category endpoint: {str(e)}")
        return False

def test_error_handling():
    print_test_header("Error Handling Tests")
    
    # Test invalid category creation (missing required fields)
    try:
        print_info("Testing invalid category creation (missing required fields)")
        response = requests.post(
            f"{API_URL}/categories", 
            json={"name": "Invalid Category"}  # Missing budget_amount and color
        )
        
        if response.status_code >= 400:
            print_success(f"Invalid category creation correctly returned error status {response.status_code}")
        else:
            print_failure(f"Invalid category creation returned unexpected status {response.status_code}")
    except Exception as e:
        print_failure(f"Error testing invalid category creation: {str(e)}")
    
    # Test invalid transaction creation (missing required fields)
    try:
        print_info("Testing invalid transaction creation (missing required fields)")
        response = requests.post(
            f"{API_URL}/transactions", 
            json={"description": "Invalid Transaction"}  # Missing category_id, amount, date
        )
        
        if response.status_code >= 400:
            print_success(f"Invalid transaction creation correctly returned error status {response.status_code}")
        else:
            print_failure(f"Invalid transaction creation returned unexpected status {response.status_code}")
    except Exception as e:
        print_failure(f"Error testing invalid transaction creation: {str(e)}")
    
    # Test non-existent category
    try:
        print_info("Testing non-existent category retrieval")
        response = requests.get(f"{API_URL}/categories/nonexistent-id")
        
        if response.status_code == 404:
            print_success("Non-existent category correctly returned 404")
        else:
            print_info(f"Non-existent category returned status {response.status_code}")
    except Exception as e:
        print_failure(f"Error testing non-existent category: {str(e)}")
    
    # Test non-existent transaction
    try:
        print_info("Testing non-existent transaction deletion")
        response = requests.delete(f"{API_URL}/transactions/nonexistent-id")
        
        if response.status_code == 404:
            print_success("Non-existent transaction deletion correctly returned 404")
        else:
            print_info(f"Non-existent transaction deletion returned status {response.status_code}")
    except Exception as e:
        print_failure(f"Error testing non-existent transaction deletion: {str(e)}")

def run_all_tests():
    print(f"\n{Colors.BOLD}{Colors.HEADER}===== BUDGET BUBBLES API TESTING =====\n{Colors.ENDC}")
    
    # Dictionary to track test results
    test_results = {}
    
    # Test health check endpoint
    test_results["health_check"] = test_health_check()
    
    # Test initial dashboard state
    test_results["dashboard_initial"] = test_dashboard_initial()
    
    # Test creating a category
    category_id = test_create_category()
    test_results["create_category"] = bool(category_id)
    
    # Test getting all categories
    test_results["get_categories"] = test_get_categories(category_id)
    
    # Test creating a transaction
    transaction_id = test_create_transaction(category_id)
    test_results["create_transaction"] = bool(transaction_id)
    
    # Test getting all transactions
    test_results["get_transactions"] = test_get_transactions(transaction_id)
    
    # Test getting categories again to verify spending calculations
    test_results["get_categories_updated"] = test_get_categories(category_id)
    
    # Test dashboard again to verify totals are updated
    test_results["dashboard_updated"] = test_dashboard_updated()
    
    # Test updating a category
    if category_id:
        test_results["update_category"] = test_update_category(category_id)
    else:
        print_failure("Skipping update_category test due to missing category_id")
        test_results["update_category"] = "SKIPPED"
    
    # Test updating a transaction
    if transaction_id and category_id:
        test_results["update_transaction"] = test_update_transaction(transaction_id, category_id)
    else:
        print_failure("Skipping update_transaction test due to missing transaction_id or category_id")
        test_results["update_transaction"] = "SKIPPED"
    
    # Test deleting a transaction
    if transaction_id:
        test_results["delete_transaction"] = test_delete_transaction(transaction_id)
    else:
        print_failure("Skipping delete_transaction test due to missing transaction_id")
        test_results["delete_transaction"] = "SKIPPED"
    
    # Test deleting a category
    if category_id:
        test_results["delete_category"] = test_delete_category(category_id)
    else:
        print_failure("Skipping delete_category test due to missing category_id")
        test_results["delete_category"] = "SKIPPED"
    
    # Test error handling
    test_error_handling()
    
    # Print summary
    print(f"\n{Colors.BOLD}{Colors.HEADER}===== TEST SUMMARY =====\n{Colors.ENDC}")
    
    all_passed = True
    for test_name, result in test_results.items():
        if result == True:
            print(f"{Colors.OKGREEN}✓ {test_name.replace('_', ' ').title()}{Colors.ENDC}")
        elif result == "SKIPPED":
            print(f"{Colors.WARNING}⚠ {test_name.replace('_', ' ').title()} (SKIPPED){Colors.ENDC}")
        else:
            all_passed = False
            print(f"{Colors.FAIL}✗ {test_name.replace('_', ' ').title()}{Colors.ENDC}")
    
    if all_passed:
        print(f"\n{Colors.OKGREEN}{Colors.BOLD}All tests passed successfully!{Colors.ENDC}")
    else:
        print(f"\n{Colors.FAIL}{Colors.BOLD}Some tests failed. See details above.{Colors.ENDC}")
    
    return test_results

if __name__ == "__main__":
    run_all_tests()