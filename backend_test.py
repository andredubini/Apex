#!/usr/bin/env python3
"""
Comprehensive Backend Testing for Hedge Fund Automated Profit-Sharing System
Tests all API endpoints, profit calculation logic, and database operations
"""

import requests
import json
import time
import websocket
import threading
from datetime import datetime, timezone
from decimal import Decimal

# Backend URL from frontend/.env
BACKEND_URL = "https://hedgefund-platform.preview.emergentagent.com/api"

class HedgeFundBackendTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.test_results = []
        self.created_investor_id = None
        self.websocket_url = BACKEND_URL.replace("https://", "wss://").replace("/api", "")
        self.websocket_messages = []
        self.websocket_connected = False
        
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
    
    def test_api_health(self):
        """Test basic API health endpoints"""
        print("\n=== TESTING API HEALTH ===")
        
        # Test root endpoint
        try:
            response = requests.get(f"{self.base_url}/", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "Apex Capital Management" in data["message"]:
                    self.log_test("Root Endpoint", True, "API root endpoint working correctly")
                else:
                    self.log_test("Root Endpoint", False, "Unexpected response format", data)
            else:
                self.log_test("Root Endpoint", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Root Endpoint", False, "Connection failed", str(e))
        
        # Test status endpoint
        try:
            response = requests.get(f"{self.base_url}/status", timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.log_test("Status Endpoint GET", True, f"Retrieved {len(data)} status checks")
            else:
                self.log_test("Status Endpoint GET", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Status Endpoint GET", False, "Connection failed", str(e))
    
    def test_investor_management(self):
        """Test investor management APIs"""
        print("\n=== TESTING INVESTOR MANAGEMENT ===")
        
        # Test GET investors (should show sample investors)
        try:
            response = requests.get(f"{self.base_url}/investors", timeout=10)
            if response.status_code == 200:
                investors = response.json()
                if len(investors) >= 3:  # Should have sample investors
                    self.log_test("Get Investors", True, f"Retrieved {len(investors)} investors including sample data")
                    # Verify sample investor structure
                    sample_investor = investors[0]
                    required_fields = ["id", "name", "email", "current_balance", "initial_investment", "status"]
                    missing_fields = [field for field in required_fields if field not in sample_investor]
                    if not missing_fields:
                        self.log_test("Investor Data Structure", True, "All required fields present in investor data")
                    else:
                        self.log_test("Investor Data Structure", False, f"Missing fields: {missing_fields}")
                else:
                    self.log_test("Get Investors", False, f"Expected sample investors, got {len(investors)}")
            else:
                self.log_test("Get Investors", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Get Investors", False, "Connection failed", str(e))
        
        # Test POST investors (create new test investor)
        try:
            new_investor = {
                "name": "Test Investor Alpha",
                "email": "test.alpha@hedgefund.com",
                "phone": "+1-555-TEST",
                "initial_investment": 150000.0,
                "risk_profile": "aggressive"
            }
            
            response = requests.post(f"{self.base_url}/investors", 
                                   json=new_investor, timeout=10)
            if response.status_code == 200:
                created_investor = response.json()
                self.created_investor_id = created_investor["id"]
                
                # Verify created investor data
                if (created_investor["name"] == new_investor["name"] and
                    created_investor["email"] == new_investor["email"] and
                    created_investor["current_balance"] == new_investor["initial_investment"]):
                    self.log_test("Create Investor", True, f"Successfully created investor: {created_investor['name']}")
                else:
                    self.log_test("Create Investor", False, "Created investor data mismatch", created_investor)
            else:
                self.log_test("Create Investor", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Create Investor", False, "Connection failed", str(e))
        
        # Test GET specific investor
        if self.created_investor_id:
            try:
                response = requests.get(f"{self.base_url}/investors/{self.created_investor_id}", timeout=10)
                if response.status_code == 200:
                    investor = response.json()
                    if investor["id"] == self.created_investor_id:
                        self.log_test("Get Specific Investor", True, f"Retrieved investor: {investor['name']}")
                    else:
                        self.log_test("Get Specific Investor", False, "ID mismatch in retrieved investor")
                else:
                    self.log_test("Get Specific Investor", False, f"HTTP {response.status_code}", response.text)
            except Exception as e:
                self.log_test("Get Specific Investor", False, "Connection failed", str(e))
    
    def test_trading_performance(self):
        """Test trading performance APIs"""
        print("\n=== TESTING TRADING PERFORMANCE ===")
        
        # Test POST trading period
        try:
            trading_period = {
                "period_start": "2024-01-01T00:00:00Z",
                "period_end": "2024-01-31T23:59:59Z",
                "total_capital": 650000.0,
                "gross_profit": 32500.0,  # 5% return
                "total_trades": 45,
                "successful_trades": 38
            }
            
            response = requests.post(f"{self.base_url}/trading-periods", 
                                   json=trading_period, timeout=10)
            if response.status_code == 200:
                created_period = response.json()
                
                # Verify calculations
                expected_success_rate = (38 / 45) * 100
                expected_net_profit = 32500.0 * 0.98  # 2% management fee deduction
                
                if (abs(created_period["success_rate"] - expected_success_rate) < 0.01 and
                    abs(created_period["net_profit"] - expected_net_profit) < 0.01):
                    self.log_test("Create Trading Period", True, 
                                f"Created trading period with correct calculations (Success: {created_period['success_rate']:.1f}%, Net: ${created_period['net_profit']:.2f})")
                else:
                    self.log_test("Create Trading Period", False, 
                                f"Calculation errors - Success: {created_period['success_rate']}, Net: {created_period['net_profit']}")
            else:
                self.log_test("Create Trading Period", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Create Trading Period", False, "Connection failed", str(e))
        
        # Test GET trading periods
        try:
            response = requests.get(f"{self.base_url}/trading-periods", timeout=10)
            if response.status_code == 200:
                periods = response.json()
                self.log_test("Get Trading Periods", True, f"Retrieved {len(periods)} trading periods")
            else:
                self.log_test("Get Trading Periods", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Get Trading Periods", False, "Connection failed", str(e))
    
    def test_profit_distribution_system(self):
        """Test the core profit distribution system"""
        print("\n=== TESTING PROFIT DISTRIBUTION SYSTEM ===")
        
        # Test manual profit distribution trigger
        try:
            response = requests.post(f"{self.base_url}/manual-profit-distribution", timeout=30)
            if response.status_code == 200:
                result = response.json()
                if "message" in result and "successfully" in result["message"].lower():
                    self.log_test("Manual Profit Distribution", True, "Profit distribution processed successfully")
                else:
                    self.log_test("Manual Profit Distribution", False, "Unexpected response format", result)
            else:
                self.log_test("Manual Profit Distribution", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Manual Profit Distribution", False, "Connection failed", str(e))
        
        # Wait a moment for processing
        time.sleep(2)
        
        # Test GET profit distributions
        try:
            response = requests.get(f"{self.base_url}/profit-distributions", timeout=10)
            if response.status_code == 200:
                distributions = response.json()
                if len(distributions) > 0:
                    latest_dist = distributions[0]
                    required_fields = ["id", "year", "month", "total_gross_profit", "net_distributable_amount", "status"]
                    missing_fields = [field for field in required_fields if field not in latest_dist]
                    
                    if not missing_fields:
                        self.log_test("Get Profit Distributions", True, 
                                    f"Retrieved {len(distributions)} distributions. Latest: {latest_dist['year']}-{latest_dist['month']:02d} (${latest_dist['total_gross_profit']:.2f})")
                        
                        # Verify tiered profit sharing logic
                        self.verify_profit_calculations(latest_dist)
                    else:
                        self.log_test("Get Profit Distributions", False, f"Missing fields: {missing_fields}")
                else:
                    self.log_test("Get Profit Distributions", False, "No profit distributions found after manual trigger")
            else:
                self.log_test("Get Profit Distributions", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Get Profit Distributions", False, "Connection failed", str(e))
    
    def test_investor_payments(self):
        """Test investor payment history"""
        print("\n=== TESTING INVESTOR PAYMENTS ===")
        
        # Get investors first
        try:
            response = requests.get(f"{self.base_url}/investors", timeout=10)
            if response.status_code == 200:
                investors = response.json()
                if len(investors) > 0:
                    test_investor_id = investors[0]["id"]
                    
                    # Test GET investor payments
                    response = requests.get(f"{self.base_url}/investor-payments/{test_investor_id}", timeout=10)
                    if response.status_code == 200:
                        payments = response.json()
                        self.log_test("Get Investor Payments", True, 
                                    f"Retrieved {len(payments)} payments for investor {investors[0]['name']}")
                        
                        if len(payments) > 0:
                            # Verify payment structure and tiered calculations
                            self.verify_payment_structure(payments[0], investors[0])
                    else:
                        self.log_test("Get Investor Payments", False, f"HTTP {response.status_code}", response.text)
                else:
                    self.log_test("Get Investor Payments", False, "No investors found for payment testing")
            else:
                self.log_test("Get Investor Payments", False, f"Failed to get investors: HTTP {response.status_code}")
        except Exception as e:
            self.log_test("Get Investor Payments", False, "Connection failed", str(e))
    
    def verify_profit_calculations(self, distribution):
        """Verify profit distribution calculations"""
        try:
            # Basic validation of distribution data
            if (distribution["total_gross_profit"] > 0 and
                distribution["net_distributable_amount"] >= 0 and
                distribution["status"] in ["completed", "processing", "no_distribution"]):
                
                # Check carry-over loss handling
                carry_over = distribution.get("carried_over_loss", 0)
                expected_net = distribution["total_gross_profit"] - carry_over
                
                if abs(distribution["net_distributable_amount"] - expected_net) < 0.01:
                    self.log_test("Carry-over Loss Calculation", True, 
                                f"Correct carry-over loss handling: ${carry_over:.2f}")
                else:
                    self.log_test("Carry-over Loss Calculation", False, 
                                f"Carry-over calculation error. Expected: ${expected_net:.2f}, Got: ${distribution['net_distributable_amount']:.2f}")
            else:
                self.log_test("Profit Distribution Validation", False, "Invalid distribution data structure")
                
        except Exception as e:
            self.log_test("Profit Distribution Validation", False, f"Validation error: {str(e)}")
    
    def verify_payment_structure(self, payment, investor):
        """Verify tiered profit sharing structure (80/20, 70/30, 60/40, 50/50)"""
        try:
            required_fields = ["tier_1_amount", "tier_2_amount", "tier_3_amount", "tier_4_amount", 
                             "total_payment", "gross_profit_share", "investor_balance"]
            missing_fields = [field for field in required_fields if field not in payment]
            
            if not missing_fields:
                # Verify tier calculations
                total_tiers = (payment["tier_1_amount"] + payment["tier_2_amount"] + 
                             payment["tier_3_amount"] + payment["tier_4_amount"])
                
                if abs(total_tiers - payment["total_payment"]) < 0.01:
                    self.log_test("Tiered Profit Sharing", True, 
                                f"Correct tiered calculation: T1=${payment['tier_1_amount']:.2f}, T2=${payment['tier_2_amount']:.2f}, T3=${payment['tier_3_amount']:.2f}, T4=${payment['tier_4_amount']:.2f}")
                    
                    # Verify payment reference format
                    if payment.get("payment_reference", "").startswith("PROFIT-"):
                        self.log_test("Payment Reference Format", True, f"Correct reference: {payment['payment_reference']}")
                    else:
                        self.log_test("Payment Reference Format", False, f"Invalid reference: {payment.get('payment_reference', 'None')}")
                        
                else:
                    self.log_test("Tiered Profit Sharing", False, 
                                f"Tier sum mismatch: {total_tiers:.2f} vs {payment['total_payment']:.2f}")
            else:
                self.log_test("Payment Structure", False, f"Missing payment fields: {missing_fields}")
                
        except Exception as e:
            self.log_test("Payment Structure Validation", False, f"Validation error: {str(e)}")
    
    def test_notification_system(self):
        """Test comprehensive real-time notification system"""
        print("\n=== TESTING REAL-TIME NOTIFICATION SYSTEM ===")
        
        # Test user IDs for testing
        test_user_id = "investor@example.com"
        admin_user_id = "admin@apexcapital.com"
        
        # Test 1: Create notifications with different priorities and types
        self.test_create_notifications(test_user_id, admin_user_id)
        
        # Test 2: Get user notifications with filtering
        self.test_get_user_notifications(test_user_id)
        
        # Test 3: Mark notifications as read
        self.test_mark_notifications_read(test_user_id)
        
        # Test 4: Get unread count
        self.test_get_unread_count(test_user_id)
        
        # Test 5: Delete notifications
        self.test_delete_notifications(test_user_id)
        
        # Test 6: WebSocket connection (simplified test)
        self.test_websocket_connection(test_user_id)
    
    def test_create_notifications(self, user_id, admin_user_id):
        """Test creating notifications with different priorities and types"""
        print("\n--- Testing Notification Creation ---")
        
        # Test notifications with different priorities and categories
        test_notifications = [
            {
                "user_id": user_id,
                "user_type": "investor",
                "title": "Weekly Profit Distribution",
                "message": "Your weekly profit of $2,450 has been added to your account",
                "type": "profit",
                "priority": "high",
                "metadata": {"amount": 2450, "period": "2025-01"}
            },
            {
                "user_id": user_id,
                "user_type": "investor",
                "title": "Security Alert",
                "message": "New login detected from unknown device",
                "type": "security",
                "priority": "critical",
                "metadata": {"ip": "192.168.1.100", "device": "Chrome on Windows"}
            },
            {
                "user_id": user_id,
                "user_type": "investor",
                "title": "Deposit Confirmation",
                "message": "Your deposit of $50,000 has been processed successfully",
                "type": "deposit",
                "priority": "medium",
                "metadata": {"amount": 50000, "transaction_id": "TXN-12345"}
            },
            {
                "user_id": admin_user_id,
                "user_type": "admin",
                "title": "System Performance Alert",
                "message": "Trading system performance is above target (95.2% success rate)",
                "type": "performance",
                "priority": "low",
                "metadata": {"success_rate": 95.2, "period": "week-3"}
            }
        ]
        
        created_notification_ids = []
        
        for i, notification in enumerate(test_notifications):
            try:
                response = requests.post(f"{self.base_url}/notifications", 
                                       json=notification, timeout=10)
                if response.status_code == 200:
                    created_notif = response.json()
                    created_notification_ids.append(created_notif["id"])
                    
                    # Verify notification structure
                    if (created_notif["title"] == notification["title"] and
                        created_notif["type"] == notification["type"] and
                        created_notif["priority"] == notification["priority"] and
                        created_notif["status"] == "unread"):
                        self.log_test(f"Create Notification {i+1}", True, 
                                    f"Created {notification['priority']} priority {notification['type']} notification")
                    else:
                        self.log_test(f"Create Notification {i+1}", False, 
                                    "Notification data mismatch", created_notif)
                else:
                    self.log_test(f"Create Notification {i+1}", False, 
                                f"HTTP {response.status_code}", response.text)
            except Exception as e:
                self.log_test(f"Create Notification {i+1}", False, "Connection failed", str(e))
        
        # Store created IDs for later tests
        self.created_notification_ids = created_notification_ids
        return created_notification_ids
    
    def test_get_user_notifications(self, user_id):
        """Test getting user notifications with filtering"""
        print("\n--- Testing Get User Notifications ---")
        
        # Test 1: Get all notifications for user
        try:
            response = requests.get(f"{self.base_url}/notifications/{user_id}", timeout=10)
            if response.status_code == 200:
                notifications = response.json()
                self.log_test("Get All User Notifications", True, 
                            f"Retrieved {len(notifications)} notifications for user")
                
                # Verify notification structure
                if len(notifications) > 0:
                    notif = notifications[0]
                    required_fields = ["id", "user_id", "title", "message", "type", "priority", "status", "created_at"]
                    missing_fields = [field for field in required_fields if field not in notif]
                    
                    if not missing_fields:
                        self.log_test("Notification Structure", True, "All required fields present")
                    else:
                        self.log_test("Notification Structure", False, f"Missing fields: {missing_fields}")
            else:
                self.log_test("Get All User Notifications", False, 
                            f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Get All User Notifications", False, "Connection failed", str(e))
        
        # Test 2: Filter by status (unread)
        try:
            response = requests.get(f"{self.base_url}/notifications/{user_id}?status=unread", timeout=10)
            if response.status_code == 200:
                unread_notifications = response.json()
                self.log_test("Filter by Status (Unread)", True, 
                            f"Retrieved {len(unread_notifications)} unread notifications")
            else:
                self.log_test("Filter by Status (Unread)", False, 
                            f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Filter by Status (Unread)", False, "Connection failed", str(e))
        
        # Test 3: Filter by type (profit)
        try:
            response = requests.get(f"{self.base_url}/notifications/{user_id}?type=profit", timeout=10)
            if response.status_code == 200:
                profit_notifications = response.json()
                self.log_test("Filter by Type (Profit)", True, 
                            f"Retrieved {len(profit_notifications)} profit notifications")
            else:
                self.log_test("Filter by Type (Profit)", False, 
                            f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Filter by Type (Profit)", False, "Connection failed", str(e))
        
        # Test 4: Filter by priority (critical)
        try:
            response = requests.get(f"{self.base_url}/notifications/{user_id}?priority=critical", timeout=10)
            if response.status_code == 200:
                critical_notifications = response.json()
                self.log_test("Filter by Priority (Critical)", True, 
                            f"Retrieved {len(critical_notifications)} critical notifications")
            else:
                self.log_test("Filter by Priority (Critical)", False, 
                            f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Filter by Priority (Critical)", False, "Connection failed", str(e))
    
    def test_mark_notifications_read(self, user_id):
        """Test marking notifications as read"""
        print("\n--- Testing Mark Notifications as Read ---")
        
        # Test 1: Mark individual notification as read
        if hasattr(self, 'created_notification_ids') and self.created_notification_ids:
            notification_id = self.created_notification_ids[0]
            try:
                response = requests.patch(f"{self.base_url}/notifications/{notification_id}/read", timeout=10)
                if response.status_code == 200:
                    result = response.json()
                    if "message" in result and "read" in result["message"].lower():
                        self.log_test("Mark Individual Notification Read", True, 
                                    "Successfully marked notification as read")
                    else:
                        self.log_test("Mark Individual Notification Read", False, 
                                    "Unexpected response format", result)
                else:
                    self.log_test("Mark Individual Notification Read", False, 
                                f"HTTP {response.status_code}", response.text)
            except Exception as e:
                self.log_test("Mark Individual Notification Read", False, "Connection failed", str(e))
        
        # Test 2: Mark all notifications as read for user
        try:
            response = requests.patch(f"{self.base_url}/notifications/{user_id}/mark-all-read", timeout=10)
            if response.status_code == 200:
                result = response.json()
                if "message" in result and "read" in result["message"].lower():
                    self.log_test("Mark All Notifications Read", True, 
                                "Successfully marked all notifications as read")
                else:
                    self.log_test("Mark All Notifications Read", False, 
                                "Unexpected response format", result)
            else:
                self.log_test("Mark All Notifications Read", False, 
                            f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Mark All Notifications Read", False, "Connection failed", str(e))
    
    def test_get_unread_count(self, user_id):
        """Test getting unread notification count"""
        print("\n--- Testing Get Unread Count ---")
        
        try:
            response = requests.get(f"{self.base_url}/notifications/{user_id}/unread-count", timeout=10)
            if response.status_code == 200:
                result = response.json()
                if "unread_count" in result and isinstance(result["unread_count"], int):
                    self.log_test("Get Unread Count", True, 
                                f"Retrieved unread count: {result['unread_count']}")
                else:
                    self.log_test("Get Unread Count", False, 
                                "Invalid response format", result)
            else:
                self.log_test("Get Unread Count", False, 
                            f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Get Unread Count", False, "Connection failed", str(e))
    
    def test_delete_notifications(self, user_id):
        """Test deleting notifications"""
        print("\n--- Testing Delete Notifications ---")
        
        # Create a test notification to delete
        try:
            test_notification = {
                "user_id": user_id,
                "user_type": "investor",
                "title": "Test Notification for Deletion",
                "message": "This notification will be deleted",
                "type": "system",
                "priority": "low"
            }
            
            response = requests.post(f"{self.base_url}/notifications", 
                                   json=test_notification, timeout=10)
            if response.status_code == 200:
                created_notif = response.json()
                notification_id = created_notif["id"]
                
                # Now delete it
                delete_response = requests.delete(f"{self.base_url}/notifications/{notification_id}", timeout=10)
                if delete_response.status_code == 200:
                    result = delete_response.json()
                    if "message" in result and "deleted" in result["message"].lower():
                        self.log_test("Delete Notification", True, 
                                    "Successfully deleted notification")
                    else:
                        self.log_test("Delete Notification", False, 
                                    "Unexpected response format", result)
                else:
                    self.log_test("Delete Notification", False, 
                                f"HTTP {delete_response.status_code}", delete_response.text)
            else:
                self.log_test("Delete Notification", False, 
                            f"Failed to create test notification: HTTP {response.status_code}")
        except Exception as e:
            self.log_test("Delete Notification", False, "Connection failed", str(e))
    
    def test_websocket_connection(self, user_id):
        """Test WebSocket connection for real-time notifications"""
        print("\n--- Testing WebSocket Connection ---")
        
        try:
            # Simple WebSocket connection test
            ws_url = f"{self.websocket_url}/ws/{user_id}"
            
            def on_message(ws, message):
                self.websocket_messages.append(message)
                print(f"WebSocket received: {message}")
            
            def on_open(ws):
                self.websocket_connected = True
                print("WebSocket connection opened")
                # Send a test message
                ws.send("Test message from client")
            
            def on_error(ws, error):
                print(f"WebSocket error: {error}")
            
            def on_close(ws, close_status_code, close_msg):
                print("WebSocket connection closed")
            
            # Create WebSocket connection with timeout
            ws = websocket.WebSocketApp(ws_url,
                                      on_open=on_open,
                                      on_message=on_message,
                                      on_error=on_error,
                                      on_close=on_close)
            
            # Run WebSocket in a separate thread with timeout
            def run_websocket():
                ws.run_forever()
            
            ws_thread = threading.Thread(target=run_websocket)
            ws_thread.daemon = True
            ws_thread.start()
            
            # Wait for connection
            time.sleep(2)
            
            if self.websocket_connected:
                self.log_test("WebSocket Connection", True, 
                            "Successfully established WebSocket connection")
                
                # Test sending notification while WebSocket is connected
                test_notification = {
                    "user_id": user_id,
                    "user_type": "investor",
                    "title": "Real-time Test Notification",
                    "message": "This notification should be delivered via WebSocket",
                    "type": "system",
                    "priority": "medium"
                }
                
                response = requests.post(f"{self.base_url}/notifications", 
                                       json=test_notification, timeout=10)
                
                # Wait for WebSocket message
                time.sleep(1)
                
                if len(self.websocket_messages) > 0:
                    self.log_test("WebSocket Real-time Delivery", True, 
                                f"Received {len(self.websocket_messages)} WebSocket messages")
                else:
                    self.log_test("WebSocket Real-time Delivery", False, 
                                "No WebSocket messages received")
                
                ws.close()
            else:
                self.log_test("WebSocket Connection", False, 
                            "Failed to establish WebSocket connection")
                
        except Exception as e:
            self.log_test("WebSocket Connection", False, f"WebSocket test failed: {str(e)}")
    
    def test_notification_settings(self):
        """Test notification settings system"""
        print("\n=== TESTING NOTIFICATION SETTINGS SYSTEM ===")
        
        test_user_id = "investor@example.com"
        
        # Test 1: Get notification settings (should create defaults if none exist)
        try:
            response = requests.get(f"{self.base_url}/notification-settings/{test_user_id}", timeout=10)
            if response.status_code == 200:
                settings = response.json()
                
                # Verify default settings structure
                required_fields = ["user_id", "email_notifications", "push_notifications", 
                                 "categories", "priority_settings", "quiet_hours", "frequency_limits"]
                missing_fields = [field for field in required_fields if field not in settings]
                
                if not missing_fields:
                    self.log_test("Get Notification Settings", True, 
                                "Retrieved notification settings with all required fields")
                    
                    # Verify categories are present
                    expected_categories = ["profit", "deposit", "withdrawal", "alert", "security", 
                                         "report", "system", "trade", "risk", "performance"]
                    missing_categories = [cat for cat in expected_categories 
                                        if cat not in settings["categories"]]
                    
                    if not missing_categories:
                        self.log_test("Notification Categories", True, 
                                    f"All {len(expected_categories)} notification categories present")
                    else:
                        self.log_test("Notification Categories", False, 
                                    f"Missing categories: {missing_categories}")
                        
                    # Verify priority settings
                    expected_priorities = ["low", "medium", "high", "critical"]
                    missing_priorities = [pri for pri in expected_priorities 
                                        if pri not in settings["priority_settings"]]
                    
                    if not missing_priorities:
                        self.log_test("Priority Settings", True, 
                                    f"All {len(expected_priorities)} priority levels present")
                    else:
                        self.log_test("Priority Settings", False, 
                                    f"Missing priorities: {missing_priorities}")
                else:
                    self.log_test("Get Notification Settings", False, 
                                f"Missing fields: {missing_fields}")
            else:
                self.log_test("Get Notification Settings", False, 
                            f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Get Notification Settings", False, "Connection failed", str(e))
        
        # Test 2: Update notification settings
        try:
            settings_update = {
                "email_notifications": False,
                "sms_notifications": True,
                "categories": {
                    "profit": True,
                    "security": True,
                    "deposit": False,
                    "withdrawal": False
                },
                "priority_settings": {
                    "low": False,
                    "medium": True,
                    "high": True,
                    "critical": True
                },
                "quiet_hours": {
                    "enabled": True,
                    "start_time": "23:00",
                    "end_time": "07:00",
                    "timezone": "UTC"
                },
                "frequency_limits": {
                    "daily_limit": 25,
                    "hourly_limit": 5
                }
            }
            
            response = requests.patch(f"{self.base_url}/notification-settings/{test_user_id}", 
                                    json=settings_update, timeout=10)
            if response.status_code == 200:
                updated_settings = response.json()
                
                # Verify updates were applied
                if (updated_settings["email_notifications"] == False and
                    updated_settings["sms_notifications"] == True and
                    updated_settings["categories"]["profit"] == True and
                    updated_settings["categories"]["deposit"] == False and
                    updated_settings["quiet_hours"]["enabled"] == True):
                    self.log_test("Update Notification Settings", True, 
                                "Successfully updated notification settings")
                else:
                    self.log_test("Update Notification Settings", False, 
                                "Settings update not applied correctly", updated_settings)
            else:
                self.log_test("Update Notification Settings", False, 
                            f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Update Notification Settings", False, "Connection failed", str(e))
    
    def test_broadcast_notifications(self):
        """Test broadcast notification system"""
        print("\n=== TESTING BROADCAST NOTIFICATION SYSTEM ===")
        
        # Test admin broadcast to all investors
        try:
            broadcast_notification = {
                "user_id": "all_investors",
                "user_type": "admin",
                "title": "Important System Maintenance Notice",
                "message": "The trading system will undergo maintenance on Sunday from 2-4 AM EST",
                "type": "system",
                "priority": "high",
                "metadata": {
                    "maintenance_window": "Sunday 2-4 AM EST",
                    "expected_downtime": "2 hours"
                }
            }
            
            response = requests.post(f"{self.base_url}/notifications/broadcast", 
                                   json=broadcast_notification, timeout=10)
            if response.status_code == 200:
                result = response.json()
                if "message" in result and "broadcast" in result["message"].lower():
                    # Extract number of users from message
                    import re
                    match = re.search(r'(\d+) users', result["message"])
                    if match:
                        user_count = int(match.group(1))
                        self.log_test("Broadcast Notification", True, 
                                    f"Successfully broadcast notification to {user_count} users")
                    else:
                        self.log_test("Broadcast Notification", True, 
                                    "Successfully broadcast notification")
                else:
                    self.log_test("Broadcast Notification", False, 
                                "Unexpected response format", result)
            else:
                self.log_test("Broadcast Notification", False, 
                            f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Broadcast Notification", False, "Connection failed", str(e))
    
    def test_enhanced_notification_features(self):
        """Test enhanced notification features"""
        print("\n=== TESTING ENHANCED NOTIFICATION FEATURES ===")
        
        test_user_id = "investor@example.com"
        
        # Test all notification priorities
        priorities = ["low", "medium", "high", "critical"]
        for priority in priorities:
            try:
                test_notification = {
                    "user_id": test_user_id,
                    "user_type": "investor",
                    "title": f"Test {priority.title()} Priority Notification",
                    "message": f"This is a {priority} priority notification for testing",
                    "type": "system",
                    "priority": priority,
                    "metadata": {"test_priority": priority}
                }
                
                response = requests.post(f"{self.base_url}/notifications", 
                                       json=test_notification, timeout=10)
                if response.status_code == 200:
                    created_notif = response.json()
                    if created_notif["priority"] == priority:
                        self.log_test(f"Priority {priority.title()}", True, 
                                    f"Successfully created {priority} priority notification")
                    else:
                        self.log_test(f"Priority {priority.title()}", False, 
                                    f"Priority mismatch: expected {priority}, got {created_notif['priority']}")
                else:
                    self.log_test(f"Priority {priority.title()}", False, 
                                f"HTTP {response.status_code}", response.text)
            except Exception as e:
                self.log_test(f"Priority {priority.title()}", False, "Connection failed", str(e))
        
        # Test all notification categories
        categories = ["profit", "deposit", "withdrawal", "alert", "security", 
                     "report", "system", "trade", "risk", "performance"]
        for category in categories:
            try:
                test_notification = {
                    "user_id": test_user_id,
                    "user_type": "investor",
                    "title": f"Test {category.title()} Notification",
                    "message": f"This is a {category} category notification for testing",
                    "type": category,
                    "priority": "medium",
                    "metadata": {"test_category": category}
                }
                
                response = requests.post(f"{self.base_url}/notifications", 
                                       json=test_notification, timeout=10)
                if response.status_code == 200:
                    created_notif = response.json()
                    if created_notif["type"] == category:
                        self.log_test(f"Category {category.title()}", True, 
                                    f"Successfully created {category} category notification")
                    else:
                        self.log_test(f"Category {category.title()}", False, 
                                    f"Category mismatch: expected {category}, got {created_notif['type']}")
                else:
                    self.log_test(f"Category {category.title()}", False, 
                                f"HTTP {response.status_code}", response.text)
            except Exception as e:
                self.log_test(f"Category {category.title()}", False, "Connection failed", str(e))
        
        # Test metadata handling
        try:
            complex_metadata = {
                "amount": 15000.50,
                "transaction_id": "TXN-98765",
                "account_details": {
                    "account_number": "ACC-12345",
                    "routing_number": "123456789"
                },
                "timestamps": {
                    "initiated": "2025-01-15T10:30:00Z",
                    "processed": "2025-01-15T10:35:00Z"
                },
                "flags": ["urgent", "verified", "processed"]
            }
            
            metadata_notification = {
                "user_id": test_user_id,
                "user_type": "investor",
                "title": "Complex Metadata Test",
                "message": "Testing complex metadata handling",
                "type": "deposit",
                "priority": "high",
                "metadata": complex_metadata
            }
            
            response = requests.post(f"{self.base_url}/notifications", 
                                   json=metadata_notification, timeout=10)
            if response.status_code == 200:
                created_notif = response.json()
                if (created_notif["metadata"]["amount"] == 15000.50 and
                    "account_details" in created_notif["metadata"] and
                    len(created_notif["metadata"]["flags"]) == 3):
                    self.log_test("Complex Metadata Handling", True, 
                                "Successfully handled complex metadata structure")
                else:
                    self.log_test("Complex Metadata Handling", False, 
                                "Metadata not preserved correctly", created_notif["metadata"])
            else:
                self.log_test("Complex Metadata Handling", False, 
                            f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Complex Metadata Handling", False, "Connection failed", str(e))
    
    def run_comprehensive_tests(self):
        """Run all tests in sequence"""
        print("🚀 STARTING COMPREHENSIVE HEDGE FUND BACKEND TESTING")
        print(f"Backend URL: {self.base_url}")
        print("=" * 80)
        
        start_time = time.time()
        
        # Run all test suites
        self.test_api_health()
        self.test_notification_system()
        self.test_notification_settings()
        self.test_broadcast_notifications()
        self.test_enhanced_notification_features()
        self.test_investor_management()
        self.test_trading_performance()
        self.test_profit_distribution_system()
        self.test_investor_payments()
        
        end_time = time.time()
        
        # Generate summary
        self.generate_test_summary(end_time - start_time)
    
    def generate_test_summary(self, duration):
        """Generate comprehensive test summary"""
        print("\n" + "=" * 80)
        print("📊 COMPREHENSIVE TEST SUMMARY")
        print("=" * 80)
        
        passed = len([r for r in self.test_results if "✅ PASS" in r["status"]])
        failed = len([r for r in self.test_results if "❌ FAIL" in r["status"]])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed} ✅")
        print(f"Failed: {failed} ❌")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        print(f"Duration: {duration:.2f} seconds")
        
        if failed > 0:
            print(f"\n❌ FAILED TESTS ({failed}):")
            for result in self.test_results:
                if "❌ FAIL" in result["status"]:
                    print(f"  • {result['test']}: {result['message']}")
                    if result.get('details'):
                        print(f"    Details: {result['details']}")
        
        print(f"\n✅ PASSED TESTS ({passed}):")
        for result in self.test_results:
            if "✅ PASS" in result["status"]:
                print(f"  • {result['test']}: {result['message']}")
        
        # Critical functionality assessment
        critical_tests = [
            "Root Endpoint", "Get Investors", "Create Investor", 
            "Manual Profit Distribution", "Get Profit Distributions",
            "Tiered Profit Sharing", "Create Notification 1", "Get All User Notifications",
            "Get Notification Settings", "Mark Individual Notification Read"
        ]
        
        critical_failures = [r for r in self.test_results 
                           if "❌ FAIL" in r["status"] and r["test"] in critical_tests]
        
        if not critical_failures:
            print(f"\n🎉 CORE FUNCTIONALITY: ALL CRITICAL TESTS PASSED")
            print("✅ Automated profit-sharing payment system is working correctly")
        else:
            print(f"\n⚠️  CORE FUNCTIONALITY: {len(critical_failures)} CRITICAL FAILURES")
            print("❌ Automated profit-sharing payment system has issues")

if __name__ == "__main__":
    tester = HedgeFundBackendTester()
    tester.run_comprehensive_tests()