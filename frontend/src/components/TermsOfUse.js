import React from "react";
import { Link } from "react-router-dom";

const TermsOfUse = () => {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-2xl font-bold text-white">
              <span className="text-blue-400">Apex</span>Capital
            </Link>
            <div className="flex items-center space-x-6">
              <Link to="/" className="text-slate-300 hover:text-white transition-colors">
                Home
              </Link>
              <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Terms of Use
          </h1>
          <p className="text-xl text-slate-300 mb-4">
            Legal terms and conditions for using our services and website
          </p>
          <p className="text-sm text-slate-400">
            Effective Date: January 1, 2025 | Last Updated: January 1, 2025
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            
            {/* Acceptance */}
            <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-4">Acceptance of Terms</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                By accessing and using the Apex Capital Management website and services, you accept and agree to be bound by the 
                terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
              <div className="bg-blue-900/20 border border-blue-400/30 p-4 rounded-lg">
                <p className="text-blue-300 text-sm">
                  <strong>Important:</strong> These terms constitute a legally binding agreement between you and Apex Capital Management. 
                  Please read them carefully before proceeding.
                </p>
              </div>
            </div>

            {/* Investment Services */}
            <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-6">Investment Services Agreement</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-3">Service Description</h3>
                  <p className="text-slate-300 leading-relaxed mb-3">
                    Apex Capital Management provides professional investment management services specializing in US stock market intraday trading. 
                    Our services include portfolio management, risk assessment, and regular performance reporting.
                  </p>
                  <ul className="text-slate-300 space-y-2 ml-4">
                    <li>• Professional investment management and trading services</li>
                    <li>• Risk management and portfolio optimization</li>
                    <li>• Weekly performance reporting and analysis</li>
                    <li>• Customer support and consultation services</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-3">Investment Terms</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 p-4 rounded-lg">
                      <h4 className="font-semibold text-white mb-2">Minimum Investment</h4>
                      <p className="text-slate-300 text-sm">$100 minimum initial investment required for account opening</p>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-lg">
                      <h4 className="font-semibold text-white mb-2">Lock-up Period</h4>
                      <p className="text-slate-300 text-sm">1-month initial commitment period from first investment</p>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-lg">
                      <h4 className="font-semibold text-white mb-2">Fee Structure</h4>
                      <p className="text-slate-300 text-sm">Performance-based fees only, no management fees charged</p>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-lg">
                      <h4 className="font-semibold text-white mb-2">Withdrawal Terms</h4>
                      <p className="text-slate-300 text-sm">Dividends can be requested weekly. Full capital withdrawal can be made once per month.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-3">Profit Distribution</h3>
                  <ul className="text-slate-300 space-y-2 ml-4">
                    <li>• Up to $99,999 — 50/50 (Investor/Fund)</li>
                    <li>• $100,000 – $999,999 — 60/40 (Investor/Fund)</li>
                    <li>• $1,000,000+ — 70/30 (Investor/Fund)</li>
                  </ul>
                </div>

              </div>
            </div>

            {/* Risk Disclosure */}
            <div className="bg-red-900/20 backdrop-blur-md p-8 rounded-2xl border border-red-400/30">
              <h2 className="text-2xl font-bold text-red-400 mb-6">Risk Disclosure</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-red-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-semibold text-red-300 mb-2">Investment Risk Warning</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      All investments carry inherent risk of loss. Past performance does not guarantee future results. 
                      You may lose some or all of your invested capital. Only invest money you can afford to lose.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-orange-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-semibold text-orange-300 mb-2">Market Volatility</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Stock markets are subject to volatility and may experience significant fluctuations. 
                      Intraday trading strategies may result in increased exposure to market movements.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-300 mb-2">Regulatory Protection</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Our services are SIPC insured up to $500,000. We are Delaware registered and comply with applicable regulations, 
                      but regulatory protection does not eliminate investment risk.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* User Responsibilities */}
            <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-6">User Responsibilities</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-green-400 mb-4">Account Security</h3>
                  <ul className="text-slate-300 space-y-2 text-sm">
                    <li>• Maintain confidentiality of login credentials</li>
                    <li>• Report unauthorized access immediately</li>
                    <li>• Use strong, unique passwords</li>
                    <li>• Enable two-factor authentication when available</li>
                    <li>• Log out from shared or public computers</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-green-400 mb-4">Information Accuracy</h3>
                  <ul className="text-slate-300 space-y-2 text-sm">
                    <li>• Provide accurate and complete information</li>
                    <li>• Update personal information promptly</li>
                    <li>• Report changes in financial circumstances</li>
                    <li>• Verify all account statements and reports</li>
                    <li>• Maintain up-to-date contact information</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Prohibited Activities */}
            <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-6">Prohibited Activities</h2>
              
              <div className="space-y-4">
                <p className="text-slate-300 leading-relaxed">
                  The following activities are strictly prohibited when using our services:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-red-900/20 p-4 rounded-lg border border-red-400/30">
                    <h3 className="text-lg font-semibold text-red-300 mb-3">Security Violations</h3>
                    <ul className="text-slate-300 space-y-1 text-sm">
                      <li>• Unauthorized access attempts</li>
                      <li>• Sharing account credentials</li>
                      <li>• Circumventing security measures</li>
                      <li>• Data mining or scraping</li>
                    </ul>
                  </div>
                  
                  <div className="bg-red-900/20 p-4 rounded-lg border border-red-400/30">
                    <h3 className="text-lg font-semibold text-red-300 mb-3">Fraudulent Activities</h3>
                    <ul className="text-slate-300 space-y-1 text-sm">
                      <li>• Providing false information</li>
                      <li>• Money laundering activities</li>
                      <li>• Identity theft or impersonation</li>
                      <li>• Market manipulation schemes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Intellectual Property */}
            <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-6">Intellectual Property</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-3">Our Rights</h3>
                  <p className="text-slate-300 leading-relaxed mb-4">
                    All content on this website, including text, graphics, logos, images, software, and trading algorithms, 
                    is the property of Apex Capital Management and is protected by copyright, trademark, and other intellectual property laws.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-3">Limited License</h3>
                  <p className="text-slate-300 leading-relaxed mb-4">
                    We grant you a limited, non-exclusive, non-transferable license to access and use our website and services 
                    for their intended purpose. You may not reproduce, distribute, or create derivative works without written permission.
                  </p>
                </div>
                
                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Trademark Notice</h4>
                  <p className="text-slate-300 text-sm">
                    "Apex Capital," the Apex Capital logo, and other marks used on this site are trademarks of Apex Capital Management. 
                    Third-party trademarks mentioned are the property of their respective owners.
                  </p>
                </div>
              </div>
            </div>

            {/* Limitation of Liability */}
            <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-6">Limitation of Liability</h2>
              
              <div className="space-y-4">
                <p className="text-slate-300 leading-relaxed">
                  To the fullest extent permitted by law, Apex Capital Management shall not be liable for any indirect, 
                  incidental, special, consequential, or punitive damages, including but not limited to loss of profits, 
                  data, or business opportunities.
                </p>
                
                <div className="bg-yellow-900/20 border border-yellow-400/30 p-4 rounded-lg">
                  <p className="text-yellow-300 text-sm">
                    <strong>Maximum Liability:</strong> Our total liability to you for any claims arising from or relating to 
                    these terms or our services shall not exceed the amount of fees paid by you to us in the twelve months 
                    preceding the claim.
                  </p>
                </div>
              </div>
            </div>

            {/* Termination */}
            <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-6">Termination</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-3">Your Rights</h3>
                  <ul className="text-slate-300 space-y-2 text-sm">
                    <li>• Request account closure at any time</li>
                    <li>• 3-month notice period for capital withdrawals</li>
                    <li>• Right to final account statement</li>
                    <li>• Data portability upon request</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-3">Our Rights</h3>
                  <ul className="text-slate-300 space-y-2 text-sm">
                    <li>• Terminate for breach of terms</li>
                    <li>• Suspend accounts for investigation</li>
                    <li>• Refuse service to any individual</li>
                    <li>• Comply with regulatory requirements</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Governing Law */}
            <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-6">Governing Law</h2>
              
              <div className="space-y-4">
                <p className="text-slate-300 leading-relaxed">
                  These terms are governed by and construed in accordance with the laws of the State of Delaware, 
                  without regard to its conflict of law principles. Any disputes shall be resolved in the courts 
                  of Delaware.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Jurisdiction</h4>
                    <p className="text-slate-300 text-sm">Delaware State and Federal Courts</p>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Arbitration</h4>
                    <p className="text-slate-300 text-sm">FINRA arbitration for investment disputes</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-6">Contact Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-4">Legal Questions</h3>
                  <div className="space-y-2 text-slate-300">
                    <p><strong>Email:</strong> legal@apexcapital.com</p>
                    <p><strong>Phone:</strong> +1 (555) 123-4567 ext. 102</p>
                    <p><strong>Response Time:</strong> Within 48 hours</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-4">Business Address</h3>
                  <div className="space-y-2 text-slate-300">
                    <p><strong>Apex Capital Management LLC</strong></p>
                    <p>1234 Financial District<br />Wilmington, DE 19801</p>
                    <p><strong>Delaware Registration:</strong> HF-2024-001</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Link to="/" className="text-2xl font-bold text-white mb-4 inline-block">
              <span className="text-blue-400">Apex</span>Capital
            </Link>
            <p className="text-slate-400 text-sm mb-4">
              Delaware-registered hedge fund specializing in US stock market intraday trading
            </p>
            <div className="flex justify-center space-x-6 text-sm text-slate-300">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-blue-400 font-medium">Terms of Use</Link>
              <Link to="/faq" className="hover:text-white transition-colors">FAQ</Link>
              <span>Delaware Registration: HF-2024-001</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TermsOfUse;