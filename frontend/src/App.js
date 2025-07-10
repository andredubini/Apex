import React, { useState, useEffect } from "react";
import "./App.css";

const HedgeFundWebsite = () => {
  const [activeNavItem, setActiveNavItem] = useState("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Smooth scroll to section
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveNavItem(sectionId);
      setIsMenuOpen(false);
    }
  };

  // Handle scroll for active nav highlighting
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "about", "strategy", "advantages", "investors", "contact"];
      const scrollPosition = window.scrollY + 100;

      sections.forEach((section) => {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;
          
          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveNavItem(section);
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl font-bold text-white">
                  <span className="text-blue-400">Apex</span>Capital
                </div>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                {[
                  { id: "home", label: "Home" },
                  { id: "about", label: "About" },
                  { id: "strategy", label: "Strategy" },
                  { id: "advantages", label: "Advantages" },
                  { id: "investors", label: "Investors" },
                  { id: "contact", label: "Contact" }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      activeNavItem === item.id
                        ? "text-blue-400 bg-slate-800"
                        : "text-slate-300 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="bg-slate-800 p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-slate-900/95 backdrop-blur-md border-t border-slate-800">
              {[
                { id: "home", label: "Home" },
                { id: "about", label: "About" },
                { id: "strategy", label: "Strategy" },
                { id: "advantages", label: "Advantages" },
                { id: "investors", label: "Investors" },
                { id: "contact", label: "Contact" }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    activeNavItem === item.id
                      ? "text-blue-400 bg-slate-800"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1613652451199-8ccb19d9d43e')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-blue-900/80"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            <span className="text-blue-400">Premium</span> Capital
            <br />
            <span className="text-4xl md:text-6xl">Management</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Delaware-registered hedge fund specializing in US stock market intraday trading. 
            Maximize your returns with our proven strategies and risk management expertise.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => scrollToSection("investors")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
            >
              Start Investing
            </button>
            <button
              onClick={() => scrollToSection("strategy")}
              className="bg-transparent border-2 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Learn More
            </button>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">About Our Fund</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              A professionally managed hedge fund with a proven track record in US stock market operations
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="bg-slate-900/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700">
                <h3 className="text-2xl font-bold text-white mb-4">Delaware Registration</h3>
                <p className="text-slate-300 leading-relaxed">
                  Our fund is officially registered in Delaware, providing you with the security and legal protection 
                  of one of the most business-friendly jurisdictions in the United States.
                </p>
              </div>
              
              <div className="bg-slate-900/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700">
                <h3 className="text-2xl font-bold text-white mb-4">US Stock Market Focus</h3>
                <p className="text-slate-300 leading-relaxed">
                  We exclusively trade on the US stock market, leveraging our deep understanding of American 
                  market dynamics and regulatory environment to maximize returns.
                </p>
              </div>
              
              <div className="bg-slate-900/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700">
                <h3 className="text-2xl font-bold text-white mb-4">Ameritrade Platform</h3>
                <p className="text-slate-300 leading-relaxed">
                  All trading operations are conducted through the trusted Ameritrade platform, ensuring 
                  transparency, security, and professional-grade execution.
                </p>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1660020619062-70b16c44bf0f" 
                alt="Financial dashboard" 
                className="w-full h-auto rounded-2xl shadow-2xl border border-slate-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Strategy Section */}
      <section id="strategy" className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Strategy & Risk Management</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Our sophisticated approach to intraday trading combines advanced analytics with prudent risk management
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/9169180/pexels-photo-9169180.jpeg" 
                alt="Trading interface" 
                className="w-full h-auto rounded-2xl shadow-2xl border border-slate-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent rounded-2xl"></div>
            </div>
            
            <div className="space-y-8">
              <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700">
                <h3 className="text-2xl font-bold text-white mb-4">Intraday Trading Strategy</h3>
                <p className="text-slate-300 leading-relaxed mb-4">
                  Our core strategy focuses on intraday trading opportunities, capitalizing on short-term market 
                  movements while minimizing overnight exposure risks.
                </p>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-blue-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Real-time market analysis
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-blue-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Advanced algorithmic trading
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-blue-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Market sentiment analysis
                  </li>
                </ul>
              </div>
              
              <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700">
                <h3 className="text-2xl font-bold text-white mb-4">Risk Management</h3>
                <p className="text-slate-300 leading-relaxed mb-4">
                  Our robust risk management framework ensures capital preservation while pursuing growth opportunities.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">20%</div>
                    <div className="text-sm text-slate-300">Maximum Risk Exposure</div>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">20+</div>
                    <div className="text-sm text-slate-300">Portfolio Diversification</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section id="advantages" className="py-20 bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Investment Advantages</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Unique benefits that set our fund apart from traditional investment options
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-slate-900/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700 hover:border-blue-400 transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">No Management Fees</h3>
              <p className="text-slate-300 leading-relaxed">
                Unlike traditional funds, we charge zero management fees. Your capital works harder for you 
                without the burden of ongoing administrative costs.
              </p>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700 hover:border-blue-400 transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Profit-Based Fees Only</h3>
              <p className="text-slate-300 leading-relaxed">
                Our fees are solely based on the profits we generate for you. This aligns our interests 
                with yours, ensuring we're motivated to maximize your returns.
              </p>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700 hover:border-blue-400 transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4M8 7h8m-8 0H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2m-8 0V3a1 1 0 011-1h6a1 1 0 011 1v4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Flexible Withdrawals</h3>
              <p className="text-slate-300 leading-relaxed">
                Access your dividends monthly or request capital withdrawal within three months. 
                Full capital withdrawal is available with a simple three-month notice period.
              </p>
            </div>
          </div>

          <div className="mt-16 relative">
            <img 
              src="https://images.pexels.com/photos/787630/pexels-photo-787630.jpeg" 
              alt="City skyline" 
              className="w-full h-64 object-cover rounded-2xl shadow-2xl border border-slate-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-blue-900/60 rounded-2xl flex items-center justify-center">
              <div className="text-center text-white">
                <h3 className="text-3xl font-bold mb-4">Ready to Grow Your Wealth?</h3>
                <p className="text-xl mb-6">Join successful investors who trust our proven strategies</p>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  Get Started Today
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Investors Section */}
      <section id="investors" className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">For Investors</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Transparent investment terms and comprehensive reporting for your peace of mind
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700">
                <h3 className="text-2xl font-bold text-white mb-6">Investment Terms</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-600 pb-3">
                    <span className="text-slate-300">Minimum Investment</span>
                    <span className="text-white font-semibold">$50,000</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-600 pb-3">
                    <span className="text-slate-300">Lock-up Period</span>
                    <span className="text-white font-semibold">12 months</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-600 pb-3">
                    <span className="text-slate-300">Management Fee</span>
                    <span className="text-white font-semibold">0%</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-600 pb-3">
                    <span className="text-slate-300">Performance Fee</span>
                    <span className="text-white font-semibold">20% of profits</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Reporting Frequency</span>
                    <span className="text-white font-semibold">Monthly</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700">
                <h3 className="text-2xl font-bold text-white mb-6">Transparency & Reporting</h3>
                <ul className="space-y-3 text-slate-300">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Monthly performance reports with detailed breakdown
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Real-time portfolio access through secure portal
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Quarterly strategy updates and market outlook
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Annual audited financial statements
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Direct access to fund managers for inquiries
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700">
              <h3 className="text-2xl font-bold text-white mb-6">Investment Process</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4 mt-1">1</div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Initial Consultation</h4>
                    <p className="text-slate-300 text-sm">
                      Schedule a personal consultation to discuss your investment goals and risk tolerance.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4 mt-1">2</div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Due Diligence</h4>
                    <p className="text-slate-300 text-sm">
                      Complete our comprehensive investor questionnaire and provide necessary documentation.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4 mt-1">3</div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Investment Agreement</h4>
                    <p className="text-slate-300 text-sm">
                      Review and sign the investment agreement with full legal protection and transparency.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4 mt-1">4</div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Capital Deployment</h4>
                    <p className="text-slate-300 text-sm">
                      Your capital is deployed according to our proven strategy within 48 hours.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4 mt-1">5</div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Ongoing Management</h4>
                    <p className="text-slate-300 text-sm">
                      Receive regular reports and maintain access to your investment performance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Contact Us</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Ready to start your investment journey? Get in touch with our team of experts
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="bg-slate-900/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700">
                <h3 className="text-2xl font-bold text-white mb-6">Get In Touch</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-blue-400 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <div className="text-white font-semibold">Email</div>
                      <div className="text-slate-300">contact@apexcapital.com</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-blue-400 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div>
                      <div className="text-white font-semibold">Phone</div>
                      <div className="text-slate-300">+1 (555) 123-4567</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-blue-400 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <div className="text-white font-semibold">Address</div>
                      <div className="text-slate-300">1234 Financial District<br />Wilmington, DE 19801</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <img 
                  src="https://images.pexels.com/photos/2881232/pexels-photo-2881232.jpeg" 
                  alt="Professional office" 
                  className="w-full h-64 object-cover rounded-2xl shadow-2xl border border-slate-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent rounded-2xl"></div>
              </div>
            </div>
            
            <div className="bg-slate-900/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700">
              <h3 className="text-2xl font-bold text-white mb-6">Send Us a Message</h3>
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    placeholder="Your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Investment Amount
                  </label>
                  <select className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent">
                    <option>$50,000 - $100,000</option>
                    <option>$100,000 - $250,000</option>
                    <option>$250,000 - $500,000</option>
                    <option>$500,000 - $1,000,000</option>
                    <option>$1,000,000+</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    placeholder="Tell us about your investment goals..."
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold text-white mb-4">
                <span className="text-blue-400">Apex</span>Capital
              </div>
              <p className="text-slate-300 text-sm">
                Delaware-registered hedge fund specializing in US stock market intraday trading with proven risk management strategies.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><button onClick={() => scrollToSection("about")} className="hover:text-white transition-colors">About</button></li>
                <li><button onClick={() => scrollToSection("strategy")} className="hover:text-white transition-colors">Strategy</button></li>
                <li><button onClick={() => scrollToSection("advantages")} className="hover:text-white transition-colors">Advantages</button></li>
                <li><button onClick={() => scrollToSection("investors")} className="hover:text-white transition-colors">Investors</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Investment Disclosures</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Regulatory Information</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>contact@apexcapital.com</li>
                <li>+1 (555) 123-4567</li>
                <li>1234 Financial District<br />Wilmington, DE 19801</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400 text-sm">
            <p>&copy; 2025 Apex Capital Management. All rights reserved. | Delaware Registration: HF-2024-001</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return <HedgeFundWebsite />;
}

export default App;