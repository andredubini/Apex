#===================================================
#                     TESTING PROTOCOL               
#===================================================
# READ CAREFULLY BEFORE INVOKING ANY TESTING AGENT
#
# This file serves as the communication bridge between
# the main agent and testing agents. Follow these rules:
#
# 1. BEFORE invoking testing agent:
#    - Document what you want tested in "Task for Testing Agent"
#    - List specific endpoints or UI flows to test
#
# 2. AFTER testing agent completes:
#    - Review the results in "Testing Results" section  
#    - Check for any FAILED tests
#    - Address critical failures before proceeding
#
# 3. DO NOT modify the Testing Protocol section
#===================================================

#============================================
#           Task for Testing Agent         
#============================================

## Test the Investor Dashboard functionality:

### Backend API Tests:
1. POST /api/deposits/{investor_id} - Create deposit request with amount and payment method
2. GET /api/deposits/{investor_id} - Get investor deposits
3. GET /api/statements/{investor_id} - Generate account statement  
4. GET /api/tax-documents/{investor_id} - Get tax documents
5. PATCH /api/investors/{investor_id}/profile - Update investor profile
6. POST /api/support/ticket - Create support ticket
7. POST /api/investors/{investor_id}/close-account - Request account closure

### Test credentials:
- Investor: investor@example.com / password123
- Admin: admin@apexcapital.com / admin123

### Expected behavior:
- All endpoints should return proper JSON responses
- Deposits should return bank_info with reference code
- Statements should return account_summary with balances
- Support tickets should be created and notifications sent


#============================================
#              Testing Results              
#============================================

## Investor Dashboard API Testing Results (2026-01-22)

### ✅ WORKING ENDPOINTS (5/7):
1. **POST /api/deposits/investor@example.com** - ✅ WORKING
   - Successfully creates deposit requests
   - Returns bank_info with reference code (field: "reference")
   - Status: pending, includes deposit_id

2. **GET /api/statements/investor@example.com** - ✅ WORKING  
   - Returns account_summary with all required fields
   - Fields: current_balance, total_invested, net_return_percent
   - Properly formatted response

3. **GET /api/tax-documents/investor@example.com** - ✅ WORKING
   - Returns 1099-DIV document with quarterly_breakdown
   - Includes proper tax year and investor details
   - Status indicates "no_data" for new accounts (expected)

4. **POST /api/support/ticket?investor_id=investor@example.com** - ✅ WORKING
   - Successfully creates support tickets
   - Returns ticket_id and success confirmation
   - Proper JSON response format

5. **POST /api/investors/investor@example.com/close-account** - ✅ WORKING
   - Successfully processes account closure requests
   - Returns request_id and confirmation message
   - Includes proper business day timeline

### ❌ FAILING ENDPOINTS (2/7):
1. **GET /api/deposits/investor@example.com** - ❌ FAILING
   - Returns HTTP 520 Internal Server Error
   - Backend logs show ObjectId serialization issues
   - Error: "ObjectId object is not iterable"

2. **PATCH /api/investors/investor@example.com/profile** - ❌ FAILING
   - Returns HTTP 520 Internal Server Error  
   - Same ObjectId serialization issue
   - Prevents profile updates

### 🔧 ISSUES IDENTIFIED:
1. **ObjectId Serialization Problem**: Backend endpoints using MongoDB ObjectId are failing JSON serialization
2. **Minor**: Deposit API uses "reference" field instead of "reference_code" (acceptable)
3. **Minor**: Tax documents show quarterly_breakdown correctly but test initially failed due to nested structure

### 📊 OVERALL RESULTS:
- **Success Rate**: 69.2% (9/13 individual test cases passed)
- **Critical Issues**: 2 endpoints failing due to ObjectId serialization
- **Working Core Features**: Deposits creation, statements, tax docs, support, account closure
- **Needs Fix**: GET deposits list, profile updates

### 🎯 NEXT ACTIONS:
1. Fix ObjectId serialization in GET /api/deposits and PATCH /api/investors/.../profile endpoints
2. Ensure all MongoDB ObjectId fields are properly converted to strings before JSON response
3. Test the fixed endpoints to verify 100% functionality

