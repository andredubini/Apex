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

(Testing agent will fill this section)

