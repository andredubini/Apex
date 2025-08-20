import React from "react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
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
            Privacy Policy
          </h1>
          <p className="text-xl text-slate-300 mb-4">
            Your privacy and data security are our top priorities
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
            
            {/* Introduction */}
            <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-4">Introduction</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Apex Capital Management ("we," "our," or "us") is committed to protecting your privacy and personal information. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our 
                website or use our investment services.
              </p>
              <p className="text-slate-300 leading-relaxed">
                By accessing our website or using our services, you agree to the terms of this Privacy Policy. 
                If you do not agree with these terms, please do not use our website or services.
              </p>
            </div>

            {/* Information Collection */}
            <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-6">Information We Collect</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-3">Personal Information</h3>
                  <ul className="text-slate-300 space-y-2 ml-4">
                    <li>• Full name, address, phone number, and email address</li>
                    <li>• Date of birth and Social Security number</li>
                    <li>• Financial information including income, net worth, and investment experience</li>
                    <li>• Bank account details for investment transactions</li>
                    <li>• Government-issued identification documents</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-3">Technical Information</h3>
                  <ul className="text-slate-300 space-y-2 ml-4">
                    <li>• IP address, browser type, and operating system</li>
                    <li>• Website usage patterns and preferences</li>
                    <li>• Device information and unique identifiers</li>
                    <li>• Cookies and similar tracking technologies</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-3">Investment Information</h3>
                  <ul className="text-slate-300 space-y-2 ml-4">
                    <li>• Investment objectives and risk tolerance</li>
                    <li>• Trading history and portfolio performance</li>
                    <li>• Communication preferences and contact history</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Information Use */}
            <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-6">How We Use Your Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-green-400 mb-3">Service Provision</h3>
                  <ul className="text-slate-300 space-y-2 text-sm">
                    <li>• Managing your investment account</li>
                    <li>• Processing transactions and payments</li>
                    <li>• Providing investment reports and updates</li>
                    <li>• Customer support and communication</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-green-400 mb-3">Legal Compliance</h3>
                  <ul className="text-slate-300 space-y-2 text-sm">
                    <li>• KYC (Know Your Customer) verification</li>
                    <li>• Anti-money laundering compliance</li>
                    <li>• Regulatory reporting requirements</li>
                    <li>• Tax reporting and documentation</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Data Protection */}
            <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-6">Data Protection & Security</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">256-bit SSL Encryption</h3>
                  <p className="text-slate-300 text-sm">All data transmission is encrypted using industry-standard protocols</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.7-2.3L21 7.6M3 21l1.3-1.3" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Secure Storage</h3>
                  <p className="text-slate-300 text-sm">Data stored in encrypted databases with restricted access controls</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Regular Audits</h3>
                  <p className="text-slate-300 text-sm">Third-party security audits and compliance assessments</p>
                </div>
              </div>

              <div className="bg-slate-900/50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-orange-400 mb-3">Additional Security Measures</h3>
                <ul className="text-slate-300 space-y-2 text-sm">
                  <li>• Multi-factor authentication for account access</li>
                  <li>• Regular security training for all employees</li>
                  <li>• Incident response and data breach protocols</li>
                  <li>• Compliance with SOX and other regulatory standards</li>
                </ul>
              </div>
            </div>

            {/* GDPR Rights */}
            <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-6">Your Privacy Rights (GDPR)</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-4">Data Subject Rights</h3>
                  <ul className="text-slate-300 space-y-3">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span><strong>Right to Access:</strong> Request copies of your personal data</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span><strong>Right to Rectification:</strong> Request correction of inaccurate data</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span><strong>Right to Erasure:</strong> Request deletion of your data</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span><strong>Right to Portability:</strong> Receive data in a portable format</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-4">How to Exercise Your Rights</h3>
                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <p className="text-slate-300 text-sm mb-3">
                      To exercise any of your privacy rights, contact our Data Protection Officer:
                    </p>
                    <ul className="text-slate-300 text-sm space-y-1">
                      <li><strong>Email:</strong> privacy@apexcapital.com</li>
                      <li><strong>Phone:</strong> +1 (555) 123-4567 ext. 101</li>
                      <li><strong>Mail:</strong> 1234 Financial District, Wilmington, DE 19801</li>
                    </ul>
                    <p className="text-slate-400 text-xs mt-3">
                      We will respond to your request within 30 days as required by GDPR.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cookies */}
            <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-6">Cookies and Tracking</h2>
              
              <div className="space-y-6">
                <p className="text-slate-300 leading-relaxed">
                  We use cookies and similar tracking technologies to enhance your experience on our website. 
                  Cookies help us remember your preferences, analyze website traffic, and improve our services.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-400 mb-2">Essential Cookies</h3>
                    <p className="text-slate-300 text-sm">Required for website functionality and security</p>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-400 mb-2">Analytics Cookies</h3>
                    <p className="text-slate-300 text-sm">Help us understand how you use our website</p>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-purple-400 mb-2">Marketing Cookies</h3>
                    <p className="text-slate-300 text-sm">Enable personalized content and advertisements</p>
                  </div>
                </div>
                
                <p className="text-slate-300 text-sm">
                  You can manage cookie preferences through your browser settings. Note that disabling certain cookies 
                  may affect website functionality.
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-6">Contact Us</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-4">Privacy Questions</h3>
                  <div className="space-y-2 text-slate-300">
                    <p><strong>Email:</strong> privacy@apexcapital.com</p>
                    <p><strong>Phone:</strong> +1 (555) 123-4567 ext. 101</p>
                    <p><strong>Response Time:</strong> Within 24 hours</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-4">General Contact</h3>
                  <div className="space-y-2 text-slate-300">
                    <p><strong>Main Office:</strong> support@apexcapital.com</p>
                    <p><strong>Address:</strong> 1234 Financial District<br />Wilmington, DE 19801</p>
                    <p><strong>Business Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM EST</p>
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
              <Link to="/privacy" className="text-blue-400 font-medium">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Use</Link>
              <Link to="/faq" className="hover:text-white transition-colors">FAQ</Link>
              <span>Delaware Registration: HF-2024-001</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;