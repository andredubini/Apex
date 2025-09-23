#!/usr/bin/env python3
"""
Backend Smoke Test for Apex Capital Management System
Non-destructive GET-only smoke test as requested
"""

import requests
import json
import time
from datetime import datetime

# Backend URL configuration
HOSTNAME = "agent-env-3e23e700-a99f-4c53-9b5a-ba85259b09ef"
BACKEND_URL = f"https://project-preview-35.preview.emergentagent.com/api"

class SmokeTestRunner:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.test_results = []
        
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
    
    def check_cors_headers(self, response):
        """Check if CORS headers are present"""
        cors_headers = [
            'Access-Control-Allow-Origin',
            'Access-Control-Allow-Methods',
            'Access-Control-Allow-Headers'
        ]
        present_headers = []
        for header in cors_headers:
            if header in response.headers:
                present_headers.append(f"{header}: {response.headers[header]}")
        return present_headers
    
    def test_root_endpoint(self):
        """Test 1: GET {REACT_APP_BACKEND_URL}/api/ → returns identifying message"""
        print("\n--- Testing Root Endpoint ---")
        try:
            response = requests.get(f"{self.base_url}/", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "Apex Capital" in data["message"]:
                    self.log_test("Root Endpoint", True, 
                                f"Returns correct identifying message: {data['message']}")
                else:
                    self.log_test("Root Endpoint", False, 
                                f"Unexpected response format: {data}")
                
                # Check CORS headers
                cors_headers = self.check_cors_headers(response)
                if cors_headers:
                    self.log_test("Root Endpoint CORS", True, 
                                f"CORS headers present: {', '.join(cors_headers)}")
                else:
                    self.log_test("Root Endpoint CORS", False, 
                                "No CORS headers found")
            else:
                self.log_test("Root Endpoint", False, 
                            f"HTTP {response.status_code}", response.text[:200])
        except Exception as e:
            self.log_test("Root Endpoint", False, "Connection failed", str(e))
    
    def test_status_endpoint(self):
        """Test 2: GET {REACT_APP_BACKEND_URL}/api/status → 200 and sane JSON"""
        print("\n--- Testing Status Endpoint ---")
        try:
            response = requests.get(f"{self.base_url}/status", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Status Endpoint", True, 
                                f"Returns valid JSON array with {len(data)} status checks")
                else:
                    self.log_test("Status Endpoint", False, 
                                f"Expected array, got: {type(data)}")
                
                # Check CORS headers
                cors_headers = self.check_cors_headers(response)
                if cors_headers:
                    self.log_test("Status Endpoint CORS", True, 
                                f"CORS headers present: {', '.join(cors_headers)}")
                else:
                    self.log_test("Status Endpoint CORS", False, 
                                "No CORS headers found")
            else:
                self.log_test("Status Endpoint", False, 
                            f"HTTP {response.status_code}", response.text[:200])
        except Exception as e:
            self.log_test("Status Endpoint", False, "Connection failed", str(e))
    
    def test_investors_endpoint(self):
        """Test 3: GET {REACT_APP_BACKEND_URL}/api/investors → 200 and array with at least one investor"""
        print("\n--- Testing Investors Endpoint ---")
        try:
            response = requests.get(f"{self.base_url}/investors", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    if len(data) >= 1:
                        self.log_test("Investors Endpoint", True, 
                                    f"Returns array with {len(data)} investors")
                        
                        # Check structure of first investor
                        if data:
                            investor = data[0]
                            required_fields = ['id', 'name', 'email', 'current_balance']
                            missing_fields = [field for field in required_fields if field not in investor]
                            if not missing_fields:
                                self.log_test("Investor Data Structure", True, 
                                            "First investor has required fields")
                            else:
                                self.log_test("Investor Data Structure", False, 
                                            f"Missing fields: {missing_fields}")
                    else:
                        self.log_test("Investors Endpoint", False, 
                                    "Array is empty, expected at least one investor")
                else:
                    self.log_test("Investors Endpoint", False, 
                                f"Expected array, got: {type(data)}")
                
                # Check CORS headers
                cors_headers = self.check_cors_headers(response)
                if cors_headers:
                    self.log_test("Investors Endpoint CORS", True, 
                                f"CORS headers present: {', '.join(cors_headers)}")
                else:
                    self.log_test("Investors Endpoint CORS", False, 
                                "No CORS headers found")
            else:
                self.log_test("Investors Endpoint", False, 
                            f"HTTP {response.status_code}", response.text[:200])
        except Exception as e:
            self.log_test("Investors Endpoint", False, "Connection failed", str(e))
    
    def test_notifications_unread_count(self):
        """Test 4: GET {REACT_APP_BACKEND_URL}/api/notifications/admin@apexcapital.com/unread-count → 200 and integer count"""
        print("\n--- Testing Notifications Unread Count Endpoint ---")
        try:
            response = requests.get(f"{self.base_url}/notifications/admin@apexcapital.com/unread-count", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "unread_count" in data and isinstance(data["unread_count"], int):
                    self.log_test("Notifications Unread Count", True, 
                                f"Returns valid integer count: {data['unread_count']}")
                else:
                    self.log_test("Notifications Unread Count", False, 
                                f"Expected integer unread_count, got: {data}")
                
                # Check CORS headers
                cors_headers = self.check_cors_headers(response)
                if cors_headers:
                    self.log_test("Notifications Unread Count CORS", True, 
                                f"CORS headers present: {', '.join(cors_headers)}")
                else:
                    self.log_test("Notifications Unread Count CORS", False, 
                                "No CORS headers found")
            else:
                self.log_test("Notifications Unread Count", False, 
                            f"HTTP {response.status_code}", response.text[:200])
        except Exception as e:
            self.log_test("Notifications Unread Count", False, "Connection failed", str(e))
    
    def test_analytics_trading_status_summary(self):
        """Test 5: GET {REACT_APP_BACKEND_URL}/api/analytics/trading-status-summary → 200 and JSON with required fields"""
        print("\n--- Testing Analytics Trading Status Summary Endpoint ---")
        try:
            response = requests.get(f"{self.base_url}/analytics/trading-status-summary", timeout=10)
            if response.status_code == 200:
                data = response.json()
                required_fields = [
                    "amount_in_progress", "amount_stopped", "total_amount",
                    "active_trading_count", "inactive_trading_count", "total_investors",
                    "active_percentage", "inactive_percentage"
                ]
                
                missing_fields = [field for field in required_fields if field not in data]
                if not missing_fields:
                    self.log_test("Analytics Trading Status Summary", True, 
                                f"Returns JSON with all required fields")
                    
                    # Verify field types
                    numeric_fields = required_fields  # All fields should be numeric
                    invalid_types = []
                    for field in numeric_fields:
                        if not isinstance(data[field], (int, float)):
                            invalid_types.append(field)
                    
                    if not invalid_types:
                        self.log_test("Analytics Trading Status Summary Types", True, 
                                    "All fields have correct numeric types")
                        
                        # Log sample values
                        self.log_test("Analytics Trading Status Summary Values", True, 
                                    f"Sample values - Amount in progress: ${data['amount_in_progress']:,.2f}, "
                                    f"Active traders: {data['active_trading_count']}, "
                                    f"Total investors: {data['total_investors']}")
                    else:
                        self.log_test("Analytics Trading Status Summary Types", False, 
                                    f"Fields with invalid types: {invalid_types}")
                else:
                    self.log_test("Analytics Trading Status Summary", False, 
                                f"Missing required fields: {missing_fields}")
                
                # Check CORS headers
                cors_headers = self.check_cors_headers(response)
                if cors_headers:
                    self.log_test("Analytics Trading Status Summary CORS", True, 
                                f"CORS headers present: {', '.join(cors_headers)}")
                else:
                    self.log_test("Analytics Trading Status Summary CORS", False, 
                                "No CORS headers found")
            else:
                self.log_test("Analytics Trading Status Summary", False, 
                            f"HTTP {response.status_code}", response.text[:200])
        except Exception as e:
            self.log_test("Analytics Trading Status Summary", False, "Connection failed", str(e))
    
    def test_analytics_trading_activity_trends(self):
        """Test 6: GET {REACT_APP_BACKEND_URL}/api/analytics/trading-activity-trends → 200 and JSON with required fields"""
        print("\n--- Testing Analytics Trading Activity Trends Endpoint ---")
        try:
            response = requests.get(f"{self.base_url}/analytics/trading-activity-trends", timeout=10)
            if response.status_code == 200:
                data = response.json()
                required_fields = [
                    "trading_requests_today", "trading_approvals_today", "total_recent_activity"
                ]
                
                missing_fields = [field for field in required_fields if field not in data]
                if not missing_fields:
                    self.log_test("Analytics Trading Activity Trends", True, 
                                f"Returns JSON with all required fields")
                    
                    # Verify field types (should be integers)
                    invalid_types = []
                    for field in required_fields:
                        if not isinstance(data[field], int):
                            invalid_types.append(field)
                    
                    if not invalid_types:
                        self.log_test("Analytics Trading Activity Trends Types", True, 
                                    "All fields have correct integer types")
                        
                        # Log sample values
                        self.log_test("Analytics Trading Activity Trends Values", True, 
                                    f"Sample values - Requests today: {data['trading_requests_today']}, "
                                    f"Approvals today: {data['trading_approvals_today']}, "
                                    f"Total recent activity: {data['total_recent_activity']}")
                    else:
                        self.log_test("Analytics Trading Activity Trends Types", False, 
                                    f"Fields with invalid types: {invalid_types}")
                else:
                    self.log_test("Analytics Trading Activity Trends", False, 
                                f"Missing required fields: {missing_fields}")
                
                # Check CORS headers
                cors_headers = self.check_cors_headers(response)
                if cors_headers:
                    self.log_test("Analytics Trading Activity Trends CORS", True, 
                                f"CORS headers present: {', '.join(cors_headers)}")
                else:
                    self.log_test("Analytics Trading Activity Trends CORS", False, 
                                "No CORS headers found")
            else:
                self.log_test("Analytics Trading Activity Trends", False, 
                            f"HTTP {response.status_code}", response.text[:200])
        except Exception as e:
            self.log_test("Analytics Trading Activity Trends", False, "Connection failed", str(e))
    
    def run_smoke_tests(self):
        """Run all smoke tests"""
        print("🚀 STARTING BACKEND SMOKE TEST FOR APEX CAPITAL MANAGEMENT")
        print(f"Backend URL: {self.base_url}")
        print("=" * 80)
        
        # Run all smoke tests
        self.test_root_endpoint()
        self.test_status_endpoint()
        self.test_investors_endpoint()
        self.test_notifications_unread_count()
        self.test_analytics_trading_status_summary()
        self.test_analytics_trading_activity_trends()
        
        # Generate test report
        self.generate_smoke_test_report()
    
    def generate_smoke_test_report(self):
        """Generate smoke test report"""
        print("\n" + "=" * 80)
        print("📊 BACKEND SMOKE TEST RESULTS SUMMARY")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if "✅ PASS" in r["status"]])
        failed_tests = len([r for r in self.test_results if "❌ FAIL" in r["status"]])
        
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        print(f"📈 OVERALL SUCCESS RATE: {success_rate:.1f}% ({passed_tests}/{total_tests} tests passed)")
        print(f"✅ PASSED: {passed_tests}")
        print(f"❌ FAILED: {failed_tests}")
        
        # Show failed tests
        failed_tests_list = [r for r in self.test_results if "❌ FAIL" in r["status"]]
        if failed_tests_list:
            print(f"\n🚨 FAILED TESTS ({len(failed_tests_list)}):")
            for failure in failed_tests_list:
                print(f"  ❌ {failure['test']}: {failure['message']}")
                if failure.get('details'):
                    print(f"     Details: {failure['details']}")
        
        # Show CORS status
        cors_tests = [r for r in self.test_results if "CORS" in r["test"]]
        cors_passed = len([r for r in cors_tests if "✅ PASS" in r["status"]])
        print(f"\n🌐 CORS HEADERS STATUS: {cors_passed}/{len(cors_tests)} endpoints have CORS headers")
        
        print(f"\n🏁 SMOKE TEST COMPLETED at {datetime.now().isoformat()}")
        print("=" * 80)

if __name__ == "__main__":
    tester = SmokeTestRunner()
    tester.run_smoke_tests()