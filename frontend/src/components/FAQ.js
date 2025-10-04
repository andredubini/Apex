import React, { useState } from "react";
import { Link } from "react-router-dom";

const FAQ = () => {
  const [openItem, setOpenItem] = useState(null);

  const toggleItem = (index) => {
    setOpenItem(openItem === index ? null : index);
  };

  const faqData = [
    {
      category: "Investment Basics",
      questions: [
        {
          q: "What is the minimum investment amount?",
          a: "The minimum investment amount is $100. Initial lock-up period is 1 month. Dividends (profit distributions) can be withdrawn weekly."
        },
        {
          q: "How does your profit-sharing structure work?",
          a: "Profit-sharing is based on invested amount: up to $99,999 → 50/50; $100,000–$999,999 → 60/40; $1,000,000+ → 70/30. Calculations are performed automatically in your personal dashboard and reflected in reports."
        },
        {
          q: "Are there any management fees?",
          a: "No, we charge zero management fees. We only profit when you profit through our performance-based fee structure, ensuring our interests are perfectly aligned with yours."
        },
        {
          q: "How often will I receive reports?",
          a: "You will receive detailed weekly reports showing your portfolio performance, trades executed, risk metrics, and profit/loss statements. Monthly summaries provide comprehensive overviews."
        }
      ]
    },
    {
      category: "Risk Management",
      questions: [
        {
          q: "How do you manage investment risk?",
          a: "We employ a multi-level risk management system where investors can select weekly risk within 0.5%–5% (0.5%-5%) per trading period, diversified portfolio allocation, automated stop-losses, and continuous market monitoring. Our Chief Risk Officer oversees all risk protocols."
        },
        {
          q: "What happens if there are losses?",
          a: "Losses are carried forward to subsequent months, and distributions only occur when cumulative results are positive. This ensures transparency and protects against distributing profits during overall negative performance periods."
        },
        {
          q: "Is my investment insured?",
          a: "Yes, all investments are SIPC insured up to $500,000. Additionally, we trade through regulated platforms like TD Ameritrade, providing additional security layers."
        },
        {
          q: "Can I withdraw my investment?",
          a: "Yes. Profit distributions (dividends) can be requested weekly. Full capital withdrawal can be made once per month."
        }
      ]
    },
    {
      category: "Trading Strategy",
      questions: [
        {
          q: "What is your primary trading strategy?",
          a: "We specialize in US stock market intraday trading, focusing on short-term market movements while minimizing overnight exposure. Our strategies combine technical analysis, algorithmic trading, and market sentiment evaluation."
        },
        {
          q: "Which markets do you trade?",
          a: "We exclusively trade US stock markets, including NYSE and NASDAQ. This focus allows us to leverage deep market knowledge and maintain compliance with US regulations."
        },
        {
          q: "How do you use technology in trading?",
          a: "We employ advanced algorithmic trading systems, real-time market analysis tools, and automated risk management protocols. Our proprietary technology stack enables rapid decision-making and execution."
        },
        {
          q: "What makes your strategy different?",
          a: "Our combination of experienced human judgment and advanced technology, flexible weekly risk selection (0.5%–5%), and transparent weekly reporting sets us apart. We focus on consistent returns rather than high-risk, high-reward strategies."
        }
      ]
    },
    {
      category: "Legal & Compliance",
      questions: [
        {
          q: "Are you registered and regulated?",
          a: "Yes, we are Delaware-registered (HF-2024-001) and comply with all applicable securities regulations. Our operations are regularly audited, and we maintain full regulatory compliance."
        },
        {
          q: "Who oversees your operations?",
          a: "Our advisory board includes former SEC commissioners and FINRA executives. We undergo annual third-party audits and maintain transparent reporting to all stakeholders."
        },
        {
          q: "How is my personal data protected?",
          a: "We use 256-bit SSL encryption, comply with GDPR regulations, and maintain strict data security protocols. Personal information is never shared with third parties without explicit consent."
        },
        {
          q: "What legal protections do investors have?",
          a: "All investors receive comprehensive investment agreements detailing rights, responsibilities, and legal protections. Our Delaware registration provides additional legal framework and investor safeguards."
        }
      ]
    },
    {
      category: "Getting Started",
      questions: [
        {
          q: "How do I begin investing?",
          a: "Start with our online application, schedule a consultation call, complete due diligence documentation, sign the investment agreement, and receive your personal dashboard access within 48 hours."
        },
        {
          q: "What documentation do I need?",
          a: "You'll need government-issued ID, proof of address, bank statements, and completed investor questionnaire. Our team guides you through each requirement during the onboarding process."
        },
        {
          q: "How long does the approval process take?",
          a: "Typically 3-5 business days from completed documentation submission. We prioritize thorough due diligence while maintaining efficient processing times."
        },
        {
          q: "When will trading begin with my capital?",
          a: "Capital deployment begins within 48 hours of account funding. You'll receive immediate dashboard access and your first weekly report within 7 days of trading commencement."
        }
      ]
    }
  ];

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
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Find answers to common questions about our hedge fund, investment strategies, and services
          </p>
          <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700">
            <p className="text-slate-300 text-sm">
              Can't find what you're looking for? 
              <button 
                onClick={() => alert('Live chat support would be available here')}
                className="text-blue-400 hover:text-blue-300 ml-2 font-medium"
              >
                Contact our support team
              </button>
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {faqData.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-12">
              <h2 className="text-3xl font-bold text-white mb-8 pb-4 border-b border-slate-700">
                {category.category}
              </h2>
              <div className="space-y-4">
                {category.questions.map((item, itemIndex) => {
                  const globalIndex = categoryIndex * 100 + itemIndex;
                  return (
                    <div key={itemIndex} className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700 overflow-hidden">
                      <button
                        onClick={() => toggleItem(globalIndex)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-700/30 transition-colors"
                      >
                        <span className="text-lg font-semibold text-white pr-4">
                          {item.q}
                        </span>
                        <svg
                          className={`w-6 h-6 text-blue-400 transform transition-transform ${
                            openItem === globalIndex ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {openItem === globalIndex && (
                        <div className="px-6 pb-4">
                          <p className="text-slate-300 leading-relaxed">{item.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Still Have Questions?</h2>
          <p className="text-xl text-slate-300 mb-8">
            Our team is here to help you understand our investment approach and get started
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => alert('Live chat support would be available here')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              Start Live Chat
            </button>
            <Link
              to="/#contact"
              className="bg-transparent border-2 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              Schedule Consultation
            </Link>
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
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Use</Link>
              <span>Delaware Registration: HF-2024-001</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FAQ;