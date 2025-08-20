import React, { useState } from "react";
import { Link } from "react-router-dom";

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const blogPosts = [
    {
      id: 1,
      title: "Understanding Intraday Trading: A Comprehensive Guide",
      excerpt: "Learn the fundamentals of intraday trading, including key strategies, risk management techniques, and market analysis methods used by professional traders.",
      category: "Trading Strategies",
      author: "Michael Johnson, CEO",
      date: "December 15, 2024",
      readTime: "8 min read",
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop",
      featured: true,
      tags: ["Intraday", "Trading", "Strategy", "Risk Management"]
    },
    {
      id: 2,
      title: "Risk Management in Hedge Funds: The 1% Rule Explained",
      excerpt: "Discover how our multi-level risk management system protects investor capital through strict position sizing and automated stop-loss mechanisms.",
      category: "Risk Management",
      author: "Robert Chen, CRO",
      date: "December 10, 2024",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1590479773265-7464e5d48118?w=400&h=250&fit=crop",
      featured: true,
      tags: ["Risk", "Management", "Protection", "Capital"]
    },
    {
      id: 3,
      title: "Market Volatility: Opportunity or Threat?",
      excerpt: "Explore how professional hedge funds navigate market volatility and turn uncertain conditions into profitable trading opportunities.",
      category: "Market Analysis",
      author: "Sarah Davis, CTO",
      date: "December 5, 2024",
      readTime: "7 min read",
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop",
      featured: false,
      tags: ["Volatility", "Opportunity", "Analysis", "Markets"]
    },
    {
      id: 4,
      title: "Algorithmic Trading: The Future of Investment Management",
      excerpt: "How artificial intelligence and machine learning are revolutionizing investment strategies and improving risk-adjusted returns for institutional investors.",
      category: "Technology",
      author: "Sarah Davis, CTO",
      date: "November 28, 2024",
      readTime: "10 min read",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
      featured: false,
      tags: ["Algorithm", "AI", "Technology", "Future"]
    },
    {
      id: 5,
      title: "Portfolio Diversification in a Digital Age",
      excerpt: "Modern approaches to portfolio diversification, including sector rotation strategies and correlation analysis in today's interconnected markets.",
      category: "Portfolio Management",
      author: "Michael Johnson, CEO",
      date: "November 20, 2024",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=250&fit=crop",
      featured: false,
      tags: ["Diversification", "Portfolio", "Strategy", "Modern"]
    },
    {
      id: 6,
      title: "Understanding Profit-Sharing Models in Hedge Funds",
      excerpt: "A detailed breakdown of how our tiered profit-sharing structure aligns fund manager incentives with investor returns and promotes long-term success.",
      category: "Investment Education",
      author: "Michael Johnson, CEO",
      date: "November 15, 2024",
      readTime: "9 min read",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=250&fit=crop",
      featured: false,
      tags: ["Profit-Sharing", "Education", "Returns", "Structure"]
    }
  ];

  const categories = ["all", "Trading Strategies", "Risk Management", "Market Analysis", "Technology", "Portfolio Management", "Investment Education"];

  const filteredPosts = selectedCategory === "all" 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  const featuredPosts = blogPosts.filter(post => post.featured);

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
              <Link to="/faq" className="text-slate-300 hover:text-white transition-colors">
                FAQ
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Market Analysis & Insights
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Professional insights, trading strategies, and educational content from our expert team of traders and analysts
            </p>
          </div>

          {/* Featured Posts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {featuredPosts.map((post) => (
              <div key={post.id} className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700 overflow-hidden group hover:border-blue-500/50 transition-all duration-300">
                <div className="aspect-w-16 aspect-h-9">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                      Featured
                    </span>
                    <span className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-sm">
                      {post.category}
                    </span>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                    {post.title}
                  </h2>
                  
                  <p className="text-slate-300 mb-4 leading-relaxed">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="text-sm font-medium text-white">{post.author}</p>
                        <div className="flex items-center space-x-2 text-xs text-slate-400">
                          <span>{post.date}</span>
                          <span>•</span>
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => alert(`Full article for "${post.title}" would open here`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Read More
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-8 bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                }`}
              >
                {category === "all" ? "All Articles" : category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <article key={post.id} className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700 overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
                <div className="aspect-w-16 aspect-h-9">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs">
                      {post.category}
                    </span>
                    {post.featured && (
                      <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-xs font-medium">
                        Featured
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.tags.map((tag, index) => (
                      <span key={index} className="bg-slate-900/50 text-slate-400 px-2 py-1 rounded text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-300">{post.author}</p>
                      <div className="flex items-center space-x-2 text-xs text-slate-400">
                        <span>{post.date}</span>
                        <span>•</span>
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => alert(`Full article for "${post.title}" would open here`)}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                    >
                      Read →
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Stay Informed</h2>
          <p className="text-xl text-slate-300 mb-8">
            Subscribe to our weekly newsletter for the latest market insights and trading strategies
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <button 
              onClick={() => alert('Newsletter signup functionality would be implemented here')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Subscribe
            </button>
          </div>
          <p className="text-slate-400 text-sm mt-4">
            No spam. Unsubscribe at any time. See our privacy policy for details.
          </p>
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
              Professional insights and educational content for serious investors
            </p>
            <div className="flex justify-center space-x-6 text-sm text-slate-300">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Use</Link>
              <Link to="/faq" className="hover:text-white transition-colors">FAQ</Link>
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Blog;