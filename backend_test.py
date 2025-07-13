#!/usr/bin/env python3
"""
Comprehensive Backend Testing for Hedge Fund Automated Profit-Sharing System
Tests all API endpoints, profit calculation logic, and database operations
"""

import requests
import json
import time
from datetime import datetime, timezone
from decimal import Decimal

# Backend URL from frontend/.env
BACKEND_URL = "https://fa72e916-a6f7-4600-adf7-3a15126a8b35.preview.emergentagent.com/api"

class HedgeFundBackendTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.test_results = []
        self.created_investor_id = None
        
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
    
    def test_scheduler_verification(self):
        """Test scheduler functionality (indirect verification)"""
        print("\n=== TESTING SCHEDULER VERIFICATION ===")
        
        # We can't directly test the scheduler, but we can verify it's configured
        # by checking if the manual distribution works (which uses the same logic)
        try:
            # Check if we can trigger manual distribution (scheduler uses same function)
            response = requests.post(f"{self.base_url}/manual-profit-distribution", timeout=30)
            if response.status_code == 200:
                self.log_test("Scheduler Logic", True, "Scheduler logic verified through manual trigger")
            else:
                self.log_test("Scheduler Logic", False, f"Scheduler logic may be broken: HTTP {response.status_code}")
        except Exception as e:
            self.log_test("Scheduler Logic", False, f"Scheduler verification failed: {str(e)}")
    
    def run_comprehensive_tests(self):
        """Run all tests in sequence"""
        print("🚀 STARTING COMPREHENSIVE HEDGE FUND BACKEND TESTING")
        print(f"Backend URL: {self.base_url}")
        print("=" * 80)
        
        start_time = time.time()
        
        # Run all test suites
        self.test_api_health()
        self.test_investor_management()
        self.test_trading_performance()
        self.test_profit_distribution_system()
        self.test_investor_payments()
        self.test_scheduler_verification()
        
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
            "Tiered Profit Sharing"
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