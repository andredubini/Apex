#!/usr/bin/env python3
"""
Comprehensive Integration Testing for Admin Panel and Investor Cabinet
Tests the integration between admin notification system and investor personal cabinet
Focus on trading status management, notification flow, and data consistency
"""

import requests
import json
import time
from datetime import datetime, timezone

# Backend URL configuration
try:
    import os
    # Try to get from environment variable first
    backend_url = os.environ.get('REACT_APP_BACKEND_URL')
    if backend_url and backend_url != 'https://None.preview.emergentagent.com':
        BACKEND_URL = f"{backend_url}/api"
    else:
        # Fallback to hostname-based URL
        hostname = os.environ.get('HOSTNAME', 'agent-env-2028b814-2835-4f1c-b676-f5848bc305b9')
        BACKEND_URL = f"https://{hostname}.preview.emergentagent.com/api"
except:
    BACKEND_URL = "https://agent-env-2028b814-2835-4f1c-b676-f5848bc305b9.preview.emergentagent.com/api"

class AdminInvestorIntegrationTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.test_results = []
        self.admin_email = "admin@apexcapital.com"
        self.investor_email = "investor@example.com"
        self.investor_id = None
        
    def log_test(self, test_name, success, message, details=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = {
            "test": test_name,
            "status": status,
            "message": message,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def run_comprehensive_integration_test(self):
        """Run comprehensive integration test between admin panel and investor cabinet"""
        print("🔔 STARTING COMPREHENSIVE ADMIN-INVESTOR INTEGRATION TEST")
        print("=" * 80)
        
        # Setup phase
        self.setup_test_environment()
        
        # Test 1: Admin notification system
        self.test_admin_notification_system()
        
        # Test 2: Trading status integration
        self.test_trading_status_integration()
        
        # Test 3: Notification relationships and metadata
        self.test_notification_relationships()
        
        # Test 4: Data consistency checks
        self.test_data_consistency()
        
        # Test 5: End-to-end integration flow
        self.test_end_to_end_integration()
        
        # Generate final report
        self.generate_final_report()
    
    def setup_test_environment(self):
        """Setup test environment and find test investor"""
        print("\n=== SETUP TEST ENVIRONMENT ===")
        
        # Find test investor
        try:
            response = requests.get(f"{self.base_url}/investors", timeout=10)
            if response.status_code == 200:
                investors = response.json()
                for investor in investors:
                    if investor["email"] == self.investor_email:
                        self.investor_id = investor["id"]
                        break
                
                if self.investor_id:
                    self.log_test("Find Test Investor", True, 
                                f"Found test investor: {self.investor_id}")
                else:
                    self.log_test("Find Test Investor", False, 
                                f"Could not find investor with email {self.investor_email}")
                    return False
            else:
                self.log_test("Find Test Investor", False, 
                            f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Find Test Investor", False, "Connection failed", str(e))
            return False
        
        return True
    
    def test_admin_notification_system(self):
        """Test admin notification system with filtering"""
        print("\n=== TESTING ADMIN NOTIFICATION SYSTEM ===")
        
        # Test 1: Get admin notifications
        try:
            response = requests.get(f"{self.base_url}/notifications/{self.admin_email}", timeout=10)
            if response.status_code == 200:
                admin_notifications = response.json()
                self.log_test("Get Admin Notifications", True, 
                            f"Retrieved {len(admin_notifications)} admin notifications")
                
                # Check notification structure
                if admin_notifications:
                    notif = admin_notifications[0]
                    required_fields = ["id", "user_id", "title", "message", "type", "priority", "status"]
                    missing_fields = [field for field in required_fields if field not in notif]
                    
                    if not missing_fields:
                        self.log_test("Admin Notification Structure", True, 
                                    "All required fields present in admin notifications")
                    else:
                        self.log_test("Admin Notification Structure", False, 
                                    f"Missing fields: {missing_fields}")
            else:
                self.log_test("Get Admin Notifications", False, 
                            f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Get Admin Notifications", False, "Connection failed", str(e))
        
        # Test 2: Filter admin notifications by priority
        priorities = ["HIGH", "MEDIUM", "LOW", "CRITICAL"]
        for priority in priorities:
            try:
                response = requests.get(f"{self.base_url}/notifications/{self.admin_email}?priority={priority.lower()}", timeout=10)
                if response.status_code == 200:
                    filtered_notifications = response.json()
                    self.log_test(f"Filter Admin Notifications by {priority}", True, 
                                f"Retrieved {len(filtered_notifications)} {priority} priority notifications")
                    
                    # Verify all notifications have correct priority
                    if filtered_notifications:
                        correct_priority = all(n["priority"].upper() == priority for n in filtered_notifications)
                        if correct_priority:
                            self.log_test(f"Verify {priority} Priority Filter", True, 
                                        f"All notifications have {priority} priority")
                        else:
                            self.log_test(f"Verify {priority} Priority Filter", False, 
                                        "Some notifications have incorrect priority")
                else:
                    self.log_test(f"Filter Admin Notifications by {priority}", False, 
                                f"HTTP {response.status_code}", response.text)
            except Exception as e:
                self.log_test(f"Filter Admin Notifications by {priority}", False, "Connection failed", str(e))
        
        # Test 3: Filter by SYSTEM type for trading requests
        try:
            response = requests.get(f"{self.base_url}/notifications/{self.admin_email}?type=system", timeout=10)
            if response.status_code == 200:
                system_notifications = response.json()
                self.log_test("Filter Admin SYSTEM Notifications", True, 
                            f"Retrieved {len(system_notifications)} SYSTEM notifications")
                
                # Look for trading request notifications
                trading_requests = [n for n in system_notifications if "trading" in n["title"].lower() or "trading" in n["message"].lower()]
                if trading_requests:
                    self.log_test("Admin Trading Request Notifications", True, 
                                f"Found {len(trading_requests)} trading request notifications")
                else:
                    self.log_test("Admin Trading Request Notifications", False, 
                                "No trading request notifications found")
            else:
                self.log_test("Filter Admin SYSTEM Notifications", False, 
                            f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Filter Admin SYSTEM Notifications", False, "Connection failed", str(e))
        
        # Test 4: Get unread count for admin
        try:
            response = requests.get(f"{self.base_url}/notifications/{self.admin_email}/unread-count", timeout=10)
            if response.status_code == 200:
                result = response.json()
                if "unread_count" in result:
                    self.log_test("Admin Unread Count", True, 
                                f"Admin has {result['unread_count']} unread notifications")
                else:
                    self.log_test("Admin Unread Count", False, "Invalid response format", result)
            else:
                self.log_test("Admin Unread Count", False, 
                            f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Admin Unread Count", False, "Connection failed", str(e))
    
    def test_trading_status_integration(self):
        """Test trading status integration between investor and admin"""
        print("\n=== TESTING TRADING STATUS INTEGRATION ===")
        
        if not self.investor_id:
            self.log_test("Trading Status Integration", False, "No investor ID available")
            return
        
        # Test 1: Get current investor trading status
        try:
            response = requests.get(f"{self.base_url}/investors/{self.investor_id}/trading-status", timeout=10)
            if response.status_code == 200:
                status_data = response.json()
                current_status = status_data.get("trading_status", "unknown")
                self.log_test("Get Current Trading Status", True, 
                            f"Current trading status: {current_status}")
                
                # Store current status for later tests
                self.current_trading_status = current_status
            else:
                self.log_test("Get Current Trading Status", False, 
                            f"HTTP {response.status_code}", response.text)
                return
        except Exception as e:
            self.log_test("Get Current Trading Status", False, "Connection failed", str(e))
            return
        
        # Test 2: Investor creates trading status request
        requested_status = "active" if self.current_trading_status == "inactive" else "inactive"
        action = "start" if requested_status == "active" else "stop"
        
        try:
            status_request = {
                "requested_status": requested_status,
                "message": f"Please {action} trading for my account. This is an integration test request."
            }
            
            response = requests.post(f"{self.base_url}/investors/{self.investor_id}/trading-status-request", 
                                   json=status_request, timeout=10)
            if response.status_code == 200:
                result = response.json()
                self.log_test("Investor Trading Status Request", True, 
                            f"Successfully submitted request to {action} trading")
                
                # Wait for notifications to be created
                time.sleep(2)
                
                # Test 3: Verify notifications created for BOTH admin and investor
                self.verify_dual_notifications(requested_status, action, status_request["message"])
                
            else:
                self.log_test("Investor Trading Status Request", False, 
                            f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Investor Trading Status Request", False, "Connection failed", str(e))
        
        # Test 4: Admin updates trading status
        try:
            time.sleep(1)  # Brief pause
            status_update = {"trading_status": requested_status}
            response = requests.patch(f"{self.base_url}/investors/{self.investor_id}/trading-status", 
                                    json=status_update, timeout=10)
            if response.status_code == 200:
                result = response.json()
                self.log_test("Admin Update Trading Status", True, 
                            f"Admin successfully updated status to {requested_status}")
                
                # Wait for notification to be created
                time.sleep(2)
                
                # Test 5: Verify investor received notification about change
                self.verify_investor_status_change_notification(requested_status)
                
            else:
                self.log_test("Admin Update Trading Status", False, 
                            f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Admin Update Trading Status", False, "Connection failed", str(e))
    
    def verify_dual_notifications(self, requested_status, action, message):
        """Verify that both admin and investor received notifications"""
        print("\n--- Verifying Dual Notification Creation ---")
        
        # Check admin notifications
        try:
            response = requests.get(f"{self.base_url}/notifications/{self.admin_email}?type=system", timeout=10)
            if response.status_code == 200:
                admin_notifications = response.json()
                
                # Look for recent trading request notifications
                recent_requests = [n for n in admin_notifications 
                                 if "trading status request" in n["title"].lower() 
                                 and requested_status in n["message"].lower()]
                
                if recent_requests:
                    self.log_test("Admin Received Trading Request Notification", True, 
                                f"Admin received notification about {action} trading request")
                    
                    # Check priority is HIGH for admin
                    admin_notif = recent_requests[0]
                    if admin_notif["priority"] == "high":
                        self.log_test("Admin Notification Priority", True, 
                                    "Admin notification has HIGH priority")
                    else:
                        self.log_test("Admin Notification Priority", False, 
                                    f"Expected HIGH, got {admin_notif['priority']}")
                    
                    # Check metadata contains investor details
                    metadata = admin_notif.get("metadata", {})
                    if (metadata.get("investor_id") == self.investor_id and 
                        metadata.get("requested_status") == requested_status and
                        metadata.get("request_message") == message):
                        self.log_test("Admin Notification Metadata", True, 
                                    "Admin notification contains complete investor data")
                    else:
                        self.log_test("Admin Notification Metadata", False, 
                                    "Admin notification missing proper metadata", metadata)
                else:
                    self.log_test("Admin Received Trading Request Notification", False, 
                                "No recent trading request notifications found for admin")
            else:
                self.log_test("Admin Received Trading Request Notification", False, 
                            f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Admin Received Trading Request Notification", False, "Connection failed", str(e))
        
        # Check investor notifications
        try:
            response = requests.get(f"{self.base_url}/notifications/{self.investor_email}?type=system", timeout=10)
            if response.status_code == 200:
                investor_notifications = response.json()
                
                # Look for recent request confirmation notifications
                recent_confirmations = [n for n in investor_notifications 
                                      if "request submitted" in n["message"].lower() 
                                      and action in n["message"].lower()]
                
                if recent_confirmations:
                    self.log_test("Investor Received Confirmation Notification", True, 
                                f"Investor received confirmation of {action} trading request")
                    
                    # Check priority is MEDIUM for investor
                    investor_notif = recent_confirmations[0]
                    if investor_notif["priority"] == "medium":
                        self.log_test("Investor Notification Priority", True, 
                                    "Investor notification has MEDIUM priority")
                    else:
                        self.log_test("Investor Notification Priority", False, 
                                    f"Expected MEDIUM, got {investor_notif['priority']}")
                else:
                    self.log_test("Investor Received Confirmation Notification", False, 
                                "No recent confirmation notifications found for investor")
            else:
                self.log_test("Investor Received Confirmation Notification", False, 
                            f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Investor Received Confirmation Notification", False, "Connection failed", str(e))
    
    def verify_investor_status_change_notification(self, new_status):
        """Verify investor received notification about status change"""
        print("\n--- Verifying Investor Status Change Notification ---")
        
        try:
            response = requests.get(f"{self.base_url}/notifications/{self.investor_email}?type=system", timeout=10)
            if response.status_code == 200:
                investor_notifications = response.json()
                
                # Look for status change notifications
                status_word = "enabled" if new_status == "active" else "disabled"
                status_changes = [n for n in investor_notifications 
                                if "trading status" in n["title"].lower() 
                                and status_word in n["message"].lower()]
                
                if status_changes:
                    self.log_test("Investor Status Change Notification", True, 
                                f"Investor received notification about trading status being {status_word}")
                    
                    # Check metadata indicates admin action
                    status_notif = status_changes[0]
                    metadata = status_notif.get("metadata", {})
                    if metadata.get("changed_by") == "admin":
                        self.log_test("Status Change Metadata", True, 
                                    "Notification correctly indicates admin action")
                    else:
                        self.log_test("Status Change Metadata", False, 
                                    "Notification missing admin action indicator")
                else:
                    self.log_test("Investor Status Change Notification", False, 
                                f"No status change notifications found for {status_word}")
            else:
                self.log_test("Investor Status Change Notification", False, 
                            f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Investor Status Change Notification", False, "Connection failed", str(e))
    
    def test_notification_relationships(self):
        """Test notification relationships and metadata consistency"""
        print("\n=== TESTING NOTIFICATION RELATIONSHIPS ===")
        
        # Test 1: Compare notification metadata with investor data
        try:
            # Get investor data
            investor_response = requests.get(f"{self.base_url}/investors/{self.investor_id}", timeout=10)
            if investor_response.status_code != 200:
                self.log_test("Get Investor Data for Comparison", False, 
                            f"HTTP {investor_response.status_code}")
                return
            
            investor_data = investor_response.json()
            
            # Get admin notifications with metadata
            admin_response = requests.get(f"{self.base_url}/notifications/{self.admin_email}?type=system", timeout=10)
            if admin_response.status_code == 200:
                admin_notifications = admin_response.json()
                
                # Find notifications with investor metadata
                investor_related = [n for n in admin_notifications 
                                  if n.get("metadata", {}).get("investor_id") == self.investor_id]
                
                if investor_related:
                    self.log_test("Find Investor-Related Admin Notifications", True, 
                                f"Found {len(investor_related)} notifications related to test investor")
                    
                    # Verify metadata consistency
                    notif = investor_related[0]
                    metadata = notif.get("metadata", {})
                    
                    consistency_checks = [
                        (metadata.get("investor_email") == investor_data["email"], "email"),
                        (metadata.get("investor_name") == investor_data["name"], "name"),
                        (metadata.get("investor_id") == investor_data["id"], "id")
                    ]
                    
                    passed_checks = sum(1 for check, _ in consistency_checks if check)
                    total_checks = len(consistency_checks)
                    
                    if passed_checks == total_checks:
                        self.log_test("Notification Metadata Consistency", True, 
                                    "All investor data consistent between notifications and investor record")
                    else:
                        failed_fields = [field for check, field in consistency_checks if not check]
                        self.log_test("Notification Metadata Consistency", False, 
                                    f"Inconsistent fields: {failed_fields}")
                else:
                    self.log_test("Find Investor-Related Admin Notifications", False, 
                                "No investor-related notifications found in admin notifications")
            else:
                self.log_test("Get Admin Notifications for Metadata Check", False, 
                            f"HTTP {admin_response.status_code}")
        except Exception as e:
            self.log_test("Notification Metadata Consistency Check", False, "Connection failed", str(e))
        
        # Test 2: Verify priority distribution (admin HIGH, investor MEDIUM)
        try:
            # Check admin notification priorities
            admin_response = requests.get(f"{self.base_url}/notifications/{self.admin_email}?type=system", timeout=10)
            investor_response = requests.get(f"{self.base_url}/notifications/{self.investor_email}?type=system", timeout=10)
            
            if admin_response.status_code == 200 and investor_response.status_code == 200:
                admin_notifications = admin_response.json()
                investor_notifications = investor_response.json()
                
                # Check admin notifications for HIGH priority
                admin_high_priority = [n for n in admin_notifications if n["priority"] == "high"]
                investor_medium_priority = [n for n in investor_notifications if n["priority"] == "medium"]
                
                if admin_high_priority:
                    self.log_test("Admin HIGH Priority Notifications", True, 
                                f"Admin has {len(admin_high_priority)} HIGH priority notifications")
                else:
                    self.log_test("Admin HIGH Priority Notifications", False, 
                                "Admin has no HIGH priority notifications")
                
                if investor_medium_priority:
                    self.log_test("Investor MEDIUM Priority Notifications", True, 
                                f"Investor has {len(investor_medium_priority)} MEDIUM priority notifications")
                else:
                    self.log_test("Investor MEDIUM Priority Notifications", False, 
                                "Investor has no MEDIUM priority notifications")
            else:
                self.log_test("Priority Distribution Check", False, 
                            "Failed to retrieve notifications for priority check")
        except Exception as e:
            self.log_test("Priority Distribution Check", False, "Connection failed", str(e))
    
    def test_data_consistency(self):
        """Test data consistency across different endpoints"""
        print("\n=== TESTING DATA CONSISTENCY ===")
        
        # Test 1: Compare investor data between /investors and notification metadata
        try:
            # Get investor from main endpoint
            investor_response = requests.get(f"{self.base_url}/investors/{self.investor_id}", timeout=10)
            if investor_response.status_code != 200:
                self.log_test("Get Investor for Consistency Check", False, 
                            f"HTTP {investor_response.status_code}")
                return
            
            investor_data = investor_response.json()
            
            # Get investor list to verify consistency
            investors_response = requests.get(f"{self.base_url}/investors", timeout=10)
            if investors_response.status_code == 200:
                investors_list = investors_response.json()
                matching_investor = next((inv for inv in investors_list if inv["id"] == self.investor_id), None)
                
                if matching_investor:
                    # Compare key fields
                    consistency_fields = ["name", "email", "trading_status", "current_balance"]
                    consistent = all(investor_data.get(field) == matching_investor.get(field) for field in consistency_fields)
                    
                    if consistent:
                        self.log_test("Investor Data Consistency", True, 
                                    "Investor data consistent between individual and list endpoints")
                    else:
                        differences = {field: (investor_data.get(field), matching_investor.get(field)) 
                                     for field in consistency_fields 
                                     if investor_data.get(field) != matching_investor.get(field)}
                        self.log_test("Investor Data Consistency", False, 
                                    f"Data inconsistencies found: {differences}")
                else:
                    self.log_test("Investor Data Consistency", False, 
                                "Investor not found in investors list")
            else:
                self.log_test("Investor Data Consistency", False, 
                            f"Failed to get investors list: HTTP {investors_response.status_code}")
        except Exception as e:
            self.log_test("Investor Data Consistency", False, "Connection failed", str(e))
        
        # Test 2: Verify trading_status is correctly updated in database
        try:
            # Get current status from trading-status endpoint
            status_response = requests.get(f"{self.base_url}/investors/{self.investor_id}/trading-status", timeout=10)
            if status_response.status_code == 200:
                status_data = status_response.json()
                trading_status_endpoint = status_data.get("trading_status")
                
                # Get status from main investor endpoint
                investor_response = requests.get(f"{self.base_url}/investors/{self.investor_id}", timeout=10)
                if investor_response.status_code == 200:
                    investor_data = investor_response.json()
                    main_endpoint_status = investor_data.get("trading_status")
                    
                    if trading_status_endpoint == main_endpoint_status:
                        self.log_test("Trading Status Consistency", True, 
                                    f"Trading status consistent across endpoints: {trading_status_endpoint}")
                    else:
                        self.log_test("Trading Status Consistency", False, 
                                    f"Status mismatch - Trading endpoint: {trading_status_endpoint}, Main endpoint: {main_endpoint_status}")
                else:
                    self.log_test("Trading Status Consistency", False, 
                                f"Failed to get investor data: HTTP {investor_response.status_code}")
            else:
                self.log_test("Trading Status Consistency", False, 
                            f"Failed to get trading status: HTTP {status_response.status_code}")
        except Exception as e:
            self.log_test("Trading Status Consistency", False, "Connection failed", str(e))
        
        # Test 3: Verify notification metadata contains correct investor IDs
        try:
            admin_response = requests.get(f"{self.base_url}/notifications/{self.admin_email}", timeout=10)
            if admin_response.status_code == 200:
                admin_notifications = admin_response.json()
                
                # Check notifications with investor metadata
                notifications_with_investor_id = [n for n in admin_notifications 
                                                if n.get("metadata", {}).get("investor_id")]
                
                if notifications_with_investor_id:
                    # Verify all investor IDs in metadata are valid
                    valid_investor_ids = []
                    for notif in notifications_with_investor_id:
                        investor_id = notif["metadata"]["investor_id"]
                        # Check if this investor exists
                        check_response = requests.get(f"{self.base_url}/investors/{investor_id}", timeout=5)
                        if check_response.status_code == 200:
                            valid_investor_ids.append(investor_id)
                    
                    if len(valid_investor_ids) == len(notifications_with_investor_id):
                        self.log_test("Notification Investor ID Validity", True, 
                                    f"All {len(valid_investor_ids)} investor IDs in notifications are valid")
                    else:
                        invalid_count = len(notifications_with_investor_id) - len(valid_investor_ids)
                        self.log_test("Notification Investor ID Validity", False, 
                                    f"{invalid_count} invalid investor IDs found in notifications")
                else:
                    self.log_test("Notification Investor ID Validity", True, 
                                "No notifications with investor IDs found (acceptable)")
            else:
                self.log_test("Notification Investor ID Validity", False, 
                            f"Failed to get admin notifications: HTTP {admin_response.status_code}")
        except Exception as e:
            self.log_test("Notification Investor ID Validity", False, "Connection failed", str(e))
    
    def test_end_to_end_integration(self):
        """Test complete end-to-end integration flow"""
        print("\n=== TESTING END-TO-END INTEGRATION FLOW ===")
        
        if not self.investor_id:
            self.log_test("E2E Integration Test", False, "No investor ID available")
            return
        
        print("🔄 Starting complete integration cycle...")
        
        # Step 1: Set initial state (inactive)
        try:
            initial_status = {"trading_status": "inactive"}
            response = requests.patch(f"{self.base_url}/investors/{self.investor_id}/trading-status", 
                                    json=initial_status, timeout=10)
            if response.status_code == 200:
                self.log_test("E2E Step 1 - Set Initial State", True, 
                            "Set investor to inactive status")
            else:
                self.log_test("E2E Step 1 - Set Initial State", False, 
                            f"HTTP {response.status_code}")
                return
        except Exception as e:
            self.log_test("E2E Step 1 - Set Initial State", False, "Connection failed", str(e))
            return
        
        # Step 2: Investor requests status change
        try:
            time.sleep(1)
            status_request = {
                "requested_status": "active",
                "message": "End-to-end integration test: Please enable trading for comprehensive testing."
            }
            
            response = requests.post(f"{self.base_url}/investors/{self.investor_id}/trading-status-request", 
                                   json=status_request, timeout=10)
            if response.status_code == 200:
                self.log_test("E2E Step 2 - Investor Request", True, 
                            "Investor successfully submitted trading request")
                time.sleep(2)  # Wait for notifications
            else:
                self.log_test("E2E Step 2 - Investor Request", False, 
                            f"HTTP {response.status_code}")
                return
        except Exception as e:
            self.log_test("E2E Step 2 - Investor Request", False, "Connection failed", str(e))
            return
        
        # Step 3: Verify admin received notification
        try:
            admin_response = requests.get(f"{self.base_url}/notifications/{self.admin_email}?type=system", timeout=10)
            if admin_response.status_code == 200:
                admin_notifications = admin_response.json()
                recent_requests = [n for n in admin_notifications 
                                 if "trading status request" in n["title"].lower() 
                                 and "integration test" in n["message"]]
                
                if recent_requests:
                    self.log_test("E2E Step 3 - Admin Notification", True, 
                                "Admin received trading status request notification")
                    
                    # Verify notification contains full investor information
                    notif = recent_requests[0]
                    metadata = notif.get("metadata", {})
                    required_metadata = ["investor_id", "investor_name", "investor_email", "requested_status"]
                    missing_metadata = [field for field in required_metadata if not metadata.get(field)]
                    
                    if not missing_metadata:
                        self.log_test("E2E Step 3 - Notification Completeness", True, 
                                    "Admin notification contains complete investor information")
                    else:
                        self.log_test("E2E Step 3 - Notification Completeness", False, 
                                    f"Missing metadata: {missing_metadata}")
                else:
                    self.log_test("E2E Step 3 - Admin Notification", False, 
                                "Admin did not receive integration test notification")
                    return
            else:
                self.log_test("E2E Step 3 - Admin Notification", False, 
                            f"HTTP {admin_response.status_code}")
                return
        except Exception as e:
            self.log_test("E2E Step 3 - Admin Notification", False, "Connection failed", str(e))
            return
        
        # Step 4: Admin approves request
        try:
            time.sleep(1)
            status_update = {"trading_status": "active"}
            response = requests.patch(f"{self.base_url}/investors/{self.investor_id}/trading-status", 
                                    json=status_update, timeout=10)
            if response.status_code == 200:
                self.log_test("E2E Step 4 - Admin Approval", True, 
                            "Admin successfully approved trading status change")
                time.sleep(2)  # Wait for notifications
            else:
                self.log_test("E2E Step 4 - Admin Approval", False, 
                            f"HTTP {response.status_code}")
                return
        except Exception as e:
            self.log_test("E2E Step 4 - Admin Approval", False, "Connection failed", str(e))
            return
        
        # Step 5: Verify investor received confirmation
        try:
            investor_response = requests.get(f"{self.base_url}/notifications/{self.investor_email}?type=system", timeout=10)
            if investor_response.status_code == 200:
                investor_notifications = investor_response.json()
                status_confirmations = [n for n in investor_notifications 
                                      if "trading status" in n["title"].lower() 
                                      and "enabled" in n["message"].lower()]
                
                if status_confirmations:
                    self.log_test("E2E Step 5 - Investor Confirmation", True, 
                                "Investor received trading status enabled confirmation")
                else:
                    self.log_test("E2E Step 5 - Investor Confirmation", False, 
                                "Investor did not receive status confirmation")
            else:
                self.log_test("E2E Step 5 - Investor Confirmation", False, 
                            f"HTTP {investor_response.status_code}")
        except Exception as e:
            self.log_test("E2E Step 5 - Investor Confirmation", False, "Connection failed", str(e))
        
        # Step 6: Verify final state consistency
        try:
            final_status_response = requests.get(f"{self.base_url}/investors/{self.investor_id}/trading-status", timeout=10)
            if final_status_response.status_code == 200:
                final_status = final_status_response.json()
                if final_status.get("trading_status") == "active":
                    self.log_test("E2E Step 6 - Final State Verification", True, 
                                "Trading status successfully changed to active - E2E flow complete")
                else:
                    self.log_test("E2E Step 6 - Final State Verification", False, 
                                f"Expected active status, got {final_status.get('trading_status')}")
            else:
                self.log_test("E2E Step 6 - Final State Verification", False, 
                            f"HTTP {final_status_response.status_code}")
        except Exception as e:
            self.log_test("E2E Step 6 - Final State Verification", False, "Connection failed", str(e))
        
        print("🎯 End-to-end integration cycle completed")
    
    def generate_final_report(self):
        """Generate comprehensive final report"""
        print("\n" + "=" * 80)
        print("📊 COMPREHENSIVE ADMIN-INVESTOR INTEGRATION TEST REPORT")
        print("=" * 80)
        
        # Count results
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if "✅ PASS" in result["status"])
        failed_tests = total_tests - passed_tests
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        print(f"\n📈 OVERALL RESULTS:")
        print(f"   Total Tests: {total_tests}")
        print(f"   Passed: {passed_tests} ✅")
        print(f"   Failed: {failed_tests} ❌")
        print(f"   Success Rate: {success_rate:.1f}%")
        
        # Categorize results
        categories = {
            "Admin Notification System": [],
            "Trading Status Integration": [],
            "Notification Relationships": [],
            "Data Consistency": [],
            "End-to-End Integration": [],
            "Setup and Configuration": []
        }
        
        for result in self.test_results:
            test_name = result["test"]
            if "Admin" in test_name and ("Notification" in test_name or "Unread" in test_name):
                categories["Admin Notification System"].append(result)
            elif "Trading Status" in test_name or "Investor Request" in test_name or "Status Change" in test_name:
                categories["Trading Status Integration"].append(result)
            elif "Notification" in test_name and ("Metadata" in test_name or "Priority" in test_name or "Relationship" in test_name):
                categories["Notification Relationships"].append(result)
            elif "Consistency" in test_name or "Validity" in test_name:
                categories["Data Consistency"].append(result)
            elif "E2E" in test_name:
                categories["End-to-End Integration"].append(result)
            else:
                categories["Setup and Configuration"].append(result)
        
        print(f"\n📋 DETAILED RESULTS BY CATEGORY:")
        for category, results in categories.items():
            if results:
                passed = sum(1 for r in results if "✅ PASS" in r["status"])
                total = len(results)
                print(f"\n   {category}: {passed}/{total} passed")
                for result in results:
                    print(f"      {result['status']}: {result['test']}")
        
        # Critical issues
        critical_failures = [r for r in self.test_results if "❌ FAIL" in r["status"] and 
                           any(keyword in r["test"].lower() for keyword in ["e2e", "integration", "notification", "trading status"])]
        
        if critical_failures:
            print(f"\n🚨 CRITICAL ISSUES FOUND:")
            for failure in critical_failures:
                print(f"   ❌ {failure['test']}: {failure['message']}")
        
        # Success highlights
        key_successes = [r for r in self.test_results if "✅ PASS" in r["status"] and 
                        any(keyword in r["test"].lower() for keyword in ["e2e", "integration", "dual notification", "admin approval"])]
        
        if key_successes:
            print(f"\n🎉 KEY INTEGRATION SUCCESSES:")
            for success in key_successes:
                print(f"   ✅ {success['test']}: {success['message']}")
        
        # Final assessment
        print(f"\n🏆 FINAL ASSESSMENT:")
        if success_rate >= 90:
            print("   EXCELLENT: Admin-Investor integration is working exceptionally well")
        elif success_rate >= 80:
            print("   GOOD: Admin-Investor integration is working well with minor issues")
        elif success_rate >= 70:
            print("   ACCEPTABLE: Admin-Investor integration is functional but needs improvements")
        else:
            print("   NEEDS ATTENTION: Admin-Investor integration has significant issues")
        
        print(f"\n📝 INTEGRATION SUMMARY:")
        print(f"   • Admin notification system: {'✅ Operational' if any('Admin' in r['test'] and '✅ PASS' in r['status'] for r in self.test_results) else '❌ Issues found'}")
        print(f"   • Trading status workflow: {'✅ Operational' if any('Trading Status' in r['test'] and '✅ PASS' in r['status'] for r in self.test_results) else '❌ Issues found'}")
        print(f"   • Notification integration: {'✅ Operational' if any('Notification' in r['test'] and '✅ PASS' in r['status'] for r in self.test_results) else '❌ Issues found'}")
        print(f"   • Data consistency: {'✅ Operational' if any('Consistency' in r['test'] and '✅ PASS' in r['status'] for r in self.test_results) else '❌ Issues found'}")
        print(f"   • End-to-end flow: {'✅ Operational' if any('E2E' in r['test'] and '✅ PASS' in r['status'] for r in self.test_results) else '❌ Issues found'}")
        
        print("\n" + "=" * 80)

def main():
    """Main function to run the comprehensive integration test"""
    tester = AdminInvestorIntegrationTester()
    tester.run_comprehensive_integration_test()

if __name__ == "__main__":
    main()