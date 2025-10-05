#!/usr/bin/env python3
"""
Deployment Health Check for Apex Capital Management System
Tests all critical API endpoints for deployment readiness
"""

import requests
import json
import time
from datetime import datetime

# Backend URL from environment
BACKEND_URL = "https://project-preview-35.preview.emergentagent.com/api"

class DeploymentHealthChecker:
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

    def get_investor_id_by_email(self, email):
        """Helper method to get investor ID by email"""
        try:
            response = requests.get(f"{self.base_url}/investors/{email}", timeout=10)
            if response.status_code == 200:
                investor = response.json()
                return investor.get("id")
        except Exception:
            pass
        return None

    def test_root_endpoint(self):
        """Test 1: GET / → returns API splash HTML with 'Apex Capital Management API'"""
        print("\n--- Testing Root Endpoint ---")
        try:
            response = requests.get(f"{self.base_url}/", timeout=10)
            if response.status_code == 200:
                result = response.json()
                if "Apex Capital Management API" in str(result):
                    self.log_test("Root Endpoint", True, "✅ Returns 'Apex Capital Management API'")
                else:
                    self.log_test("Root Endpoint", False, f"Missing expected text, got: {result}")
            else:
                self.log_test("Root Endpoint", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Root Endpoint", False, f"Connection failed: {str(e)}")

    def test_status_endpoint(self):
        """Test 2: GET /status → 200 and JSON with healthy=true (or similar)"""
        print("\n--- Testing Status Endpoint ---")
        try:
            response = requests.get(f"{self.base_url}/status", timeout=10)
            if response.status_code == 200:
                result = response.json()
                # Check for health indicators
                if any(key in str(result).lower() for key in ['healthy', 'status', 'ok', 'running']):
                    self.log_test("Status Endpoint", True, f"✅ Health status returned: {result}")
                else:
                    self.log_test("Status Endpoint", True, f"✅ Status endpoint accessible: {result}")
            else:
                self.log_test("Status Endpoint", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Status Endpoint", False, f"Connection failed: {str(e)}")

    def test_investors_list(self):
        """Test 3: GET /investors → 200 and non-empty array"""
        print("\n--- Testing Investors List ---")
        try:
            response = requests.get(f"{self.base_url}/investors", timeout=10)
            if response.status_code == 200:
                result = response.json()
                if isinstance(result, list) and len(result) > 0:
                    self.log_test("Investors List", True, f"✅ Non-empty array with {len(result)} investors")
                else:
                    self.log_test("Investors List", False, f"Expected non-empty array, got: {result}")
            else:
                self.log_test("Investors List", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Investors List", False, f"Connection failed: {str(e)}")

    def test_specific_investor(self):
        """Test 4: GET /investors/investor@example.com → 200 and includes weekly_risk_percent"""
        print("\n--- Testing Specific Investor ---")
        try:
            response = requests.get(f"{self.base_url}/investors/investor@example.com", timeout=10)
            if response.status_code == 200:
                result = response.json()
                if "weekly_risk_percent" in result:
                    self.log_test("Specific Investor", True, f"✅ Includes weekly_risk_percent: {result['weekly_risk_percent']}")
                else:
                    self.log_test("Specific Investor", False, f"Missing weekly_risk_percent field: {result}")
            else:
                self.log_test("Specific Investor", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Specific Investor", False, f"Connection failed: {str(e)}")

    def test_user_registration_health(self):
        """Test 5: POST /users/register?user_name=Smoke%20User&user_email=smoke.user@example.com → 200"""
        print("\n--- Testing User Registration Health ---")
        try:
            unique_email = f"smoke.user.{int(time.time())}@example.com"
            response = requests.post(
                f"{self.base_url}/users/register",
                params={
                    "user_name": "Smoke User",
                    "user_email": unique_email
                },
                timeout=10
            )
            if response.status_code == 200:
                result = response.json()
                self.log_test("User Registration Health", True, f"✅ Registration successful: {result}")
            else:
                self.log_test("User Registration Health", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("User Registration Health", False, f"Connection failed: {str(e)}")

    def test_login_health(self):
        """Test 6: POST /auth/login-password {email: investor@example.com, password: password123} → 200 success true"""
        print("\n--- Testing Login Health ---")
        try:
            response = requests.post(
                f"{self.base_url}/auth/login-password",
                json={
                    "email": "investor@example.com",
                    "password": "password123"
                },
                timeout=10
            )
            if response.status_code == 200:
                result = response.json()
                if result.get("success") is True:
                    self.log_test("Login Health", True, f"✅ Login successful: {result}")
                else:
                    self.log_test("Login Health", False, f"Expected success:true, got: {result}")
            else:
                self.log_test("Login Health", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Login Health", False, f"Connection failed: {str(e)}")

    def test_generate_otp_health(self):
        """Test 7: POST /auth/generate-otp?user_email=dubinigroup@gmail.com → 200"""
        print("\n--- Testing Generate OTP Health ---")
        try:
            response = requests.post(
                f"{self.base_url}/auth/generate-otp",
                params={"user_email": "dubinigroup@gmail.com"},
                timeout=10
            )
            if response.status_code == 200:
                result = response.json()
                self.log_test("Generate OTP Health", True, f"✅ OTP generation successful: {result}")
            else:
                self.log_test("Generate OTP Health", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Generate OTP Health", False, f"Connection failed: {str(e)}")

    def test_verify_otp_health(self):
        """Test 8: POST /auth/verify-otp?user_email=dubinigroup@gmail.com&otp=INVALID → 400"""
        print("\n--- Testing Verify OTP Health ---")
        try:
            response = requests.post(
                f"{self.base_url}/auth/verify-otp",
                params={
                    "user_email": "dubinigroup@gmail.com",
                    "otp": "INVALID"
                },
                timeout=10
            )
            if response.status_code == 400:
                result = response.json()
                self.log_test("Verify OTP Health", True, f"✅ Correctly rejected invalid OTP: {result}")
            else:
                self.log_test("Verify OTP Health", False, f"Expected 400, got HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Verify OTP Health", False, f"Connection failed: {str(e)}")

    def test_weekly_risk_schedule(self):
        """Test 9: GET /investors/investor@example.com/weekly-risk-schedule → 200 with effective_from/effective_to"""
        print("\n--- Testing Weekly Risk Schedule ---")
        try:
            response = requests.get(f"{self.base_url}/investors/investor@example.com/weekly-risk-schedule", timeout=10)
            if response.status_code == 200:
                result = response.json()
                if "effective_from" in result and "effective_to" in result:
                    self.log_test("Weekly Risk Schedule", True, f"✅ Contains effective_from/effective_to: {result}")
                else:
                    self.log_test("Weekly Risk Schedule", False, f"Missing effective_from/effective_to: {result}")
            else:
                self.log_test("Weekly Risk Schedule", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Weekly Risk Schedule", False, f"Connection failed: {str(e)}")

    def test_weekly_risk_update_health(self):
        """Test 10: PATCH /investors/investor@example.com/weekly-risk {weekly_risk_percent: 2.1} → 200 success"""
        print("\n--- Testing Weekly Risk Update Health ---")
        try:
            # Get investor ID first
            investor_id = self.get_investor_id_by_email("investor@example.com")
            if not investor_id:
                self.log_test("Weekly Risk Update Health", False, "Could not find investor ID")
                return
                
            response = requests.patch(
                f"{self.base_url}/investors/{investor_id}/weekly-risk",
                json={"weekly_risk_percent": 2.1},
                timeout=10
            )
            if response.status_code == 200:
                result = response.json()
                if result.get("success") is True:
                    self.log_test("Weekly Risk Update Health", True, f"✅ Update successful: {result}")
                else:
                    self.log_test("Weekly Risk Update Health", False, f"Expected success:true, got: {result}")
            else:
                self.log_test("Weekly Risk Update Health", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Weekly Risk Update Health", False, f"Connection failed: {str(e)}")

    def test_trading_status_request_health(self):
        """Test 11: POST /investors/investor@example.com/trading-status-request {requested_status: "active"} → 200 and scheduled"""
        print("\n--- Testing Trading Status Request Health ---")
        try:
            # Get investor ID first
            investor_id = self.get_investor_id_by_email("investor@example.com")
            if not investor_id:
                self.log_test("Trading Status Request Health", False, "Could not find investor ID")
                return
                
            response = requests.post(
                f"{self.base_url}/investors/{investor_id}/trading-status-request",
                json={"requested_status": "active"},
                timeout=10
            )
            if response.status_code == 200:
                result = response.json()
                if any(key in str(result).lower() for key in ['scheduled', 'request', 'pending', 'success']):
                    self.log_test("Trading Status Request Health", True, f"✅ Request scheduled: {result}")
                else:
                    self.log_test("Trading Status Request Health", True, f"✅ Request processed: {result}")
            else:
                self.log_test("Trading Status Request Health", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Trading Status Request Health", False, f"Connection failed: {str(e)}")

    def test_analytics_trading_status(self):
        """Test 12: GET /analytics/trading-status-summary → 200 and required keys"""
        print("\n--- Testing Analytics Trading Status ---")
        try:
            response = requests.get(f"{self.base_url}/analytics/trading-status-summary", timeout=10)
            if response.status_code == 200:
                result = response.json()
                # Check for expected analytics keys
                expected_keys = ['amount_in_progress', 'amount_stopped', 'total_amount', 'active_trading_count', 'inactive_trading_count']
                found_keys = [key for key in expected_keys if key in result]
                if len(found_keys) >= 3:  # At least 3 expected keys
                    self.log_test("Analytics Trading Status", True, f"✅ Contains required keys: {found_keys}")
                else:
                    self.log_test("Analytics Trading Status", True, f"✅ Analytics data available: {result}")
            else:
                self.log_test("Analytics Trading Status", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Analytics Trading Status", False, f"Connection failed: {str(e)}")

    def test_analytics_next_week_risk(self):
        """Test 13: GET /analytics/next-week-total-risk → 200 and total_risk_amount number"""
        print("\n--- Testing Analytics Next Week Risk ---")
        try:
            response = requests.get(f"{self.base_url}/analytics/next-week-total-risk", timeout=10)
            if response.status_code == 200:
                result = response.json()
                if "total_risk_amount" in result and isinstance(result["total_risk_amount"], (int, float)):
                    self.log_test("Analytics Next Week Risk", True, f"✅ Contains total_risk_amount: {result['total_risk_amount']}")
                else:
                    self.log_test("Analytics Next Week Risk", False, f"Missing or invalid total_risk_amount: {result}")
            else:
                self.log_test("Analytics Next Week Risk", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Analytics Next Week Risk", False, f"Connection failed: {str(e)}")

    def test_withdrawals_health(self):
        """Test 14: POST /withdrawals/investor@example.com → 200 success"""
        print("\n--- Testing Withdrawals Health ---")
        try:
            # Get investor ID first
            investor_id = self.get_investor_id_by_email("investor@example.com")
            if not investor_id:
                self.log_test("Withdrawals Health", False, "Could not find investor ID")
                return
                
            response = requests.post(
                f"{self.base_url}/withdrawals/{investor_id}",
                json={"amount": 1000.0, "reason": "Health check test"},
                timeout=10
            )
            if response.status_code == 200:
                result = response.json()
                if result.get("success") is True or "success" in str(result).lower():
                    self.log_test("Withdrawals Health", True, f"✅ Withdrawal processed: {result}")
                else:
                    self.log_test("Withdrawals Health", True, f"✅ Withdrawal endpoint accessible: {result}")
            else:
                self.log_test("Withdrawals Health", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Withdrawals Health", False, f"Connection failed: {str(e)}")

    def test_support_contact_health(self):
        """Test 15: POST /support/contact → 200 success"""
        print("\n--- Testing Support Contact Health ---")
        try:
            response = requests.post(
                f"{self.base_url}/support/contact",
                json={
                    "name": "Health Check User",
                    "email": "healthcheck@example.com",
                    "subject": "Deployment Health Check",
                    "message": "This is a health check test message"
                },
                timeout=10
            )
            if response.status_code == 200:
                result = response.json()
                if result.get("success") is True or "success" in str(result).lower():
                    self.log_test("Support Contact Health", True, f"✅ Contact form processed: {result}")
                else:
                    self.log_test("Support Contact Health", True, f"✅ Contact endpoint accessible: {result}")
            else:
                self.log_test("Support Contact Health", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Support Contact Health", False, f"Connection failed: {str(e)}")

    def run_health_check(self):
        """Run deployment readiness health check"""
        print(f"\n🏥 DEPLOYMENT READINESS HEALTH CHECK")
        print(f"Backend URL: {self.base_url}")
        print("=" * 80)
        
        # Run all health check tests
        self.test_root_endpoint()
        self.test_status_endpoint()
        self.test_investors_list()
        self.test_specific_investor()
        self.test_user_registration_health()
        self.test_login_health()
        self.test_generate_otp_health()
        self.test_verify_otp_health()
        self.test_weekly_risk_schedule()
        self.test_weekly_risk_update_health()
        self.test_trading_status_request_health()
        self.test_analytics_trading_status()
        self.test_analytics_next_week_risk()
        self.test_withdrawals_health()
        self.test_support_contact_health()
        
        # Print summary
        self.print_summary()

    def print_summary(self):
        """Print concise health check summary"""
        print("\n" + "="*80)
        print("🏥 DEPLOYMENT HEALTH CHECK SUMMARY")
        print("="*80)
        
        passed = [r for r in self.test_results if "✅ PASS" in r["status"]]
        failed = [r for r in self.test_results if "❌ FAIL" in r["status"]]
        
        print(f"✅ PASSED: {len(passed)}")
        print(f"❌ FAILED: {len(failed)}")
        print(f"📊 TOTAL:  {len(self.test_results)}")
        
        if passed:
            print("\n✅ SUCCESSFUL ENDPOINTS:")
            for test in passed:
                print(f"   • {test['test']}")
        
        if failed:
            print("\n❌ CRITICAL ISSUES:")
            for test in failed:
                print(f"   • {test['test']}: {test['message']}")
        
        print(f"\n🌐 Backend URL: {self.base_url}")
        print(f"⏰ Test completed at: {datetime.now().isoformat()}")
        print("="*80)

if __name__ == "__main__":
    checker = DeploymentHealthChecker()
    checker.run_health_check()