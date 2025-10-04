import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
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
      const sections = ["home", "about", "strategy", "advantages", "investors", "management", "for-traders", "contact"];
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
                  { id: "management", label: "Team" },
                  { id: "for-traders", label: "For Traders" },
                  { id: "contact", label: "Contact" }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      item.id === "for-traders"
                        ? activeNavItem === item.id
                          ? "text-green-300 bg-slate-800 font-medium"
                          : "text-green-400 hover:text-green-300 font-medium"
                        : activeNavItem === item.id
                        ? "text-blue-400 bg-slate-800"
                        : "text-slate-300 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                <Link
                  to="/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Login
                </Link>
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
                { id: "management", label: "Team" },
                { id: "for-traders", label: "For Traders" },
                { id: "contact", label: "Contact" }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    item.id === "for-traders"
                      ? activeNavItem === item.id
                        ? "text-green-300 bg-slate-800 font-medium"
                        : "text-green-400 hover:text-green-300 font-medium"
                      : activeNavItem === item.id
                      ? "text-blue-400 bg-slate-800"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <Link
                to="/login"
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
              >
                Login
              </Link>
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
            Track your capital management progress weekly in your personal dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
            >
              Start Investing
            </Link>
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

              <div className="bg-slate-900/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700">
                <h3 className="text-2xl font-bold text-white mb-4">Weekly Progress Tracking</h3>
                <p className="text-slate-300 leading-relaxed">
                  Monitor your capital management progress in real-time through your personal investor dashboard. 
                  Receive detailed weekly reports, performance analytics, and complete transparency on your investments.
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
                src="https://images.unsplash.com/photo-1643962578875-90e5e275d449?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwxfHx0cmFkaW5nJTIwaW50ZXJmYWNlfGVufDB8fHxibHVlfDE3NTIyNDQzNTF8MA&ixlib=rb-4.1.0&q=85" 
                alt="Professional trading interface" 
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
                <h3 className="text-2xl font-bold text-white mb-4">Multi-Level Risk Management</h3>
                <p className="text-slate-300 leading-relaxed mb-4">
                  We use a sophisticated multi-level risk system that protects your capital at every stage. 
                  Thanks to our advanced risk controls, investors never risk more than their selected weekly risk level (0.5%–5%) during any single trading period.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">0.5%–5%</div>
                    <div className="text-sm text-slate-300">Investor-selected Weekly Risk</div>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">Weekly</div>
                    <div className="text-sm text-slate-300">Transparent Reporting</div>
                  </div>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-white mb-2">Weekly Loss Monitoring</h4>
                  <p className="text-slate-300 text-sm">
                    Through our comprehensive weekly reporting system, you can monitor any losses in real-time 
                    and have the ability to stop capital operations at any time. This ensures complete transparency 
                    and gives you full control over your investment decisions.
                  </p>
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
              <h3 className="text-2xl font-bold text-white mb-4">Tiered Profit Distribution</h3>
              <p className="text-slate-300 leading-relaxed">
                Profit-sharing by invested amount: up to $99,999 → 50/50, $100,000–$999,999 → 60/40, $1,000,000+ → 70/30. Automated calculations in your dashboard.
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
                Dividends can be requested weekly, and full capital withdrawal can be made once per month.
              </p>
            </div>
          </div>

          {/* Profit Distribution Details */}
          <div className="mt-16 bg-slate-900/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Profit Distribution by Investment Amount</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-lg mb-3">
                  <div className="text-2xl font-bold text-white">Up to $99,999</div>
                  <div className="text-sm text-orange-100">Investment Amount</div>
                </div>
                <div className="text-white font-semibold">50/50 Split</div>
                <div className="text-slate-300 text-sm">Investor/Fund</div>
              </div>
              
              <div className="text-center">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg mb-3">
                  <div className="text-2xl font-bold text-white">$100,000 – $999,999</div>
                  <div className="text-sm text-blue-100">Investment Amount</div>
                </div>
                <div className="text-white font-semibold">60/40 Split</div>
                <div className="text-slate-300 text-sm">Investor/Fund</div>
              </div>
              
              <div className="text-center">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg mb-3">
                  <div className="text-2xl font-bold text-white">$1,000,000+</div>
                  <div className="text-sm text-green-100">Investment Amount</div>
                </div>
                <div className="text-white font-semibold">70/30 Split</div>
                <div className="text-slate-300 text-sm">Investor/Fund</div>
              </div>
            </div>
            <p className="text-slate-300 text-center mt-6">
              All profit distributions are calculated automatically in your personal dashboard and processed weekly every Saturday.
              <br />
              <span className="text-xs">Examples: $80,000 at 24% → gross $19,200 → investor $9,600 / fund $9,600. $250,000 at 24% → gross $60,000 → investor $36,000 / fund $24,000. $1,200,000 at 24% → gross $288,000 → investor $201,600 / fund $86,400.</span>
            </p>
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
              Transparent investment terms and comprehensive weekly reporting for your peace of mind
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700">
                <h3 className="text-2xl font-bold text-white mb-6">Investment Terms</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-600 pb-3">
                    <span className="text-slate-300">Minimum Investment</span>
                    <span className="text-white font-semibold">$100</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-600 pb-3">
                    <span className="text-slate-300">Lock-up Period</span>
                    <span className="text-white font-semibold">1 month</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-600 pb-3">
                    <span className="text-slate-300">Management Fee</span>
                    <span className="text-white font-semibold">0%</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-600 pb-3">
                    <span className="text-slate-300">Performance Fee</span>
                    <span className="text-white font-semibold">Tiered Structure</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Reporting Frequency</span>
                    <span className="text-white font-semibold">Weekly</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700">
                <h3 className="text-2xl font-bold text-white mb-6">Personal Dashboard Features</h3>
                <ul className="space-y-3 text-slate-300">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Weekly performance reports with detailed breakdown
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Real-time portfolio tracking with visual charts
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Automated profit distribution calculations
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Banking integration for deposits and withdrawals
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
                    <h4 className="text-lg font-semibold text-white mb-2">Registration & Agreement</h4>
                    <p className="text-slate-300 text-sm">
                      Регистрация на платформе. При регистрации инвестор даёт согласие на условия взаимодействия, указанные в соглашении при регистрации.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4 mt-1">4</div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Personal Dashboard Access</h4>
                    <p className="text-slate-300 text-sm">
                      Receive secure access to your personal dashboard for weekly progress monitoring.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4 mt-1">5</div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Ongoing Management</h4>
                    <p className="text-slate-300 text-sm">
                      Capital deployment begins within 48 hours with weekly reports and real-time tracking.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Management Team Section */}
      <section id="management" className="py-20 bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Management Team</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Experienced professionals with decades of combined expertise in financial markets and risk management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* CEO */}
            <div className="bg-slate-900/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700 text-center">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-white">MJ</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Michael Johnson</h3>
              <p className="text-blue-400 font-semibold mb-4">Chief Executive Officer</p>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                Former Goldman Sachs portfolio manager with 15+ years in institutional trading. 
                MBA from Wharton, CFA charterholder. Led $2B+ in asset management.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-xs">Portfolio Management</span>
                <span className="bg-green-600/20 text-green-400 px-3 py-1 rounded-full text-xs">Risk Assessment</span>
              </div>
            </div>

            {/* CTO */}
            <div className="bg-slate-900/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700 text-center">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-white">SD</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Sarah Davis</h3>
              <p className="text-green-400 font-semibold mb-4">Chief Technology Officer</p>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                Former fintech executive at JPMorgan Chase with expertise in algorithmic trading systems. 
                MS Computer Science from MIT, specialized in quantitative finance.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-xs">Algorithm Development</span>
                <span className="bg-orange-600/20 text-orange-400 px-3 py-1 rounded-full text-xs">Trading Systems</span>
              </div>
            </div>

            {/* Chief Risk Officer */}
            <div className="bg-slate-900/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700 text-center">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-white">RC</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Robert Chen</h3>
              <p className="text-orange-400 font-semibold mb-4">Chief Risk Officer</p>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                20+ years in risk management at major investment banks including Morgan Stanley. 
                PhD in Financial Mathematics, FRM certified risk professional.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="bg-red-600/20 text-red-400 px-3 py-1 rounded-full text-xs">Risk Management</span>
                <span className="bg-yellow-600/20 text-yellow-400 px-3 py-1 rounded-full text-xs">Compliance</span>
              </div>
            </div>
          </div>

          {/* Advisory Board */}
          <div className="mt-20">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-white mb-4">Advisory Board</h3>
              <p className="text-slate-300 max-w-2xl mx-auto">
                Industry veterans providing strategic guidance and regulatory oversight
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-white">DT</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Dr. David Thompson</h4>
                    <p className="text-purple-400 font-semibold">Financial Advisor</p>
                    <p className="text-slate-300 text-sm">Former SEC Commissioner, Harvard Business School Professor</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-white">LW</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Lisa Wang</h4>
                    <p className="text-teal-400 font-semibold">Regulatory Advisor</p>
                    <p className="text-slate-300 text-sm">Former FINRA Executive Director, Securities Law Expert</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Credentials & Certifications */}
          <div className="mt-16 bg-slate-900/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Professional Credentials</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-400 mb-2">50+</div>
                <div className="text-slate-300 text-sm">Combined Years<br />Experience</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-400 mb-2">3</div>
                <div className="text-slate-300 text-sm">CFA<br />Charterholders</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-400 mb-2">2</div>
                <div className="text-slate-300 text-sm">Advanced<br />Degrees (PhD/MBA)</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-400 mb-2">$5B+</div>
                <div className="text-slate-300 text-sm">Assets Previously<br />Managed</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Traders Section */}
      <section id="for-traders" className="py-20 bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-6 py-3 bg-green-600/20 rounded-full border border-green-400/30 mb-6">
              <span className="text-green-400 font-semibold text-lg">For Traders</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Join Our Trading Team
            </h2>
            <p className="text-xl text-slate-300 max-w-4xl mx-auto">
              We invite experienced traders to cooperate and become part of our professional team 
              managing institutional capital with cutting-edge technology and proven strategies.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700">
                <h3 className="text-2xl font-bold text-white mb-6">What We Offer</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-4 mt-1">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">Institutional Capital Access</h4>
                      <p className="text-slate-300">Trade with substantial capital allocation and institutional-grade infrastructure</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-4 mt-1">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">Performance-Based Compensation</h4>
                      <p className="text-slate-300">Competitive profit sharing with transparent performance metrics</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-4 mt-1">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">Advanced Trading Technology</h4>
                      <p className="text-slate-300">Access to premium trading platforms, data feeds, and analytical tools</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-4 mt-1">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">Professional Development</h4>
                      <p className="text-slate-300">Continuous learning and skill enhancement in collaborative environment</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700">
                <h3 className="text-2xl font-bold text-white mb-6">Requirements</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-4"></div>
                    <span className="text-slate-300">Minimum 3+ years of active trading experience</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-4"></div>
                    <span className="text-slate-300">Proven track record of consistent profitability</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-4"></div>
                    <span className="text-slate-300">Strong understanding of risk management</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-4"></div>
                    <span className="text-slate-300">Experience with US equity markets (intraday focus preferred)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-4"></div>
                    <span className="text-slate-300">Ability to work in team-oriented environment</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-2xl border border-green-400/30">
                <h3 className="text-2xl font-bold text-white mb-4">Ready to Apply?</h3>
                <p className="text-slate-300 mb-6">
                  Send us your trading resume, performance history, and a brief cover letter explaining 
                  your trading strategy and experience.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => alert('Please send your application to: careers@apexcapital.com\n\nInclude:\n- Trading resume\n- Performance history\n- Cover letter with strategy overview\n- Contact information')}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Apply Now
                  </button>
                  <button
                    onClick={() => alert('For trader inquiries, contact us at:\n\nPhone: +1 (555) 123-4567\nEmail: careers@apexcapital.com\nWebsite: www.apexcapital.com/careers\n\nOur recruiting team will respond within 24 hours.')}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 border border-slate-600"
                  >
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">Our Trading Philosophy</h3>
              <p className="text-slate-300 text-lg leading-relaxed">
                At Apex Capital, we believe in combining disciplined risk management with innovative trading strategies. 
                Our traders operate within a collaborative framework where individual expertise contributes to collective success. 
                Investors can choose weekly risk within 0.5%–5% range for each trading period, ensuring sustainable long-term growth 
                while providing traders with the freedom to execute their proven strategies within our institutional framework.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">0.5%–5%</div>
                  <div className="text-slate-300 text-sm">Investor-selected Weekly Risk</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">24/7</div>
                  <div className="text-slate-300 text-sm">Market Analysis & Support</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">$5M+</div>
                  <div className="text-slate-300 text-sm">Capital Under Management</div>
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
                    <option>$10,000 - $25,000</option>
                    <option>$25,000 - $50,000</option>
                    <option>$50,000 - $100,000</option>
                    <option>$100,000 - $250,000</option>
                    <option>$250,000+</option>
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
          {/* Security and Trust Indicators */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-6">Security & Compliance</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
              <div className="bg-slate-800/50 p-4 rounded-lg text-center">
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-green-400 font-semibold text-sm">SSL Encrypted</div>
                <div className="text-slate-400 text-xs">256-bit Security</div>
              </div>
              
              <div className="bg-slate-800/50 p-4 rounded-lg text-center">
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.7-2.3L21 7.6M3 21l1.3-1.3" />
                  </svg>
                </div>
                <div className="text-blue-400 font-semibold text-sm">SIPC Insured</div>
                <div className="text-slate-400 text-xs">Up to $500,000</div>
              </div>
              
              <div className="bg-slate-800/50 p-4 rounded-lg text-center">
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                  </svg>
                </div>
                <div className="text-purple-400 font-semibold text-sm">Delaware Registered</div>
                <div className="text-slate-400 text-xs">HF-2024-001</div>
              </div>
              
              <div className="bg-slate-800/50 p-4 rounded-lg text-center">
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-orange-400 font-semibold text-sm">Audited</div>
                <div className="text-slate-400 text-xs">Annual Reports</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold text-white mb-4">
                <span className="text-blue-400">Apex</span>Capital
              </div>
              <p className="text-slate-300 text-sm mb-4">
                Delaware-registered hedge fund specializing in US stock market intraday trading with proven risk management strategies.
              </p>
              <div className="flex items-center space-x-2 text-sm text-slate-400">
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>Secure & Encrypted</span>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li><button onClick={() => scrollToSection('about')}>About Us</button></li>
                <li><button onClick={() => alert('Management team information would be displayed')}>Management Team</button></li>
                <li><button onClick={() => alert('Privacy Policy page would open')}>Privacy Policy</button></li>
                <li><button onClick={() => alert('Terms of Use page would open')}>Terms of Use</button></li>
                <li><button onClick={() => alert('FAQ page would open')}>FAQ</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li><button onClick={() => alert('Blog page would open')}>Market Analysis Blog</button></li>
                <li><button onClick={() => alert('Educational resources page would open')}>Educational Resources</button></li>
                <li><button onClick={() => alert('Financial glossary page would open')}>Financial Glossary</button></li>
                <li><button onClick={() => alert('Audit reports page would open')}>Audit Reports</button></li>
                <li><button onClick={() => alert('Regulatory documents page would open')}>Regulatory Documents</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>support@apexcapital.com</li>
                <li>+1 (555) 123-4567</li>
                <li>1234 Financial District<br />Wilmington, DE 19801</li>
                <li className="pt-2">
                  <button 
                    onClick={() => alert('Live chat support would be available here')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Live Chat Support
                  </button>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="text-center md:text-left text-slate-400 text-sm">
                <p>&copy; 2025 Apex Capital Management. All rights reserved.</p>
                <p className="mt-1">Delaware Registration: HF-2024-001 | SIPC Member</p>
              </div>
              <div className="text-center md:text-right text-slate-400 text-xs">
                <p>Investment involves risk. Past performance does not guarantee future results.</p>
                <p className="mt-1">This website is protected by SSL encryption and complies with GDPR regulations.</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;