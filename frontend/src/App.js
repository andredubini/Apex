import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

// Import components
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import InvestorDashboard from "./components/InvestorDashboard";
import AdminDashboard from "./components/AdminDashboard";
import FAQ from "./components/FAQ";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsOfUse from "./components/TermsOfUse";
import Blog from "./components/Blog";

// Authentication context
const AuthContext = React.createContext();

// Theme context
const ThemeContext = React.createContext();

// Sample data for demonstration
const sampleUsers = [
  {
    id: 1,
    email: "investor@example.com",
    password: "password123",
    name: "John Investor",
    role: "investor",
    accountBalance: 150000,
    totalInvested: 100000,
    totalProfits: 12500,
    joinDate: "2024-01-15",
    bankDetails: {
      bankName: "Chase Bank",
      accountNumber: "****1234",
      routingNumber: "021000021"
    }
  },
  {
    id: 2,
    email: "dubinigroup@gmail.com",
    password: "admin123",
    name: "Admin User",
    role: "admin"
  }
];

// Generate sample trading data for the past year
const generateSampleData = () => {
  const data = [];
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);
  
  let currentBalance = 100000;
  let weeklyReturns = [];
  
  for (let i = 0; i &lt; 52; i++) {
    const weekStart = new Date(startDate);
    weekStart.setDate(startDate.getDate() + (i * 7));
    
    // Generate realistic weekly returns (0.5-0.8% per week, averaging 2-3% monthly)
    const weeklyReturn = (Math.random() * 0.8 + 0.3) / 100;
    const profit = currentBalance * weeklyReturn;
    currentBalance += profit;
    
    const weekData = {
      id: i + 1,
      week: `Week ${i + 1}`,
      date: weekStart.toISOString().split('T')[0],
      startBalance: currentBalance - profit,
      endBalance: currentBalance,
      profit: profit,
      returnPercentage: weeklyReturn * 100,
      trades: Math.floor(Math.random() * 20) + 15,
      successRate: Math.random() * 20 + 75 // 75-95% success rate
    };
    
    weeklyReturns.push(weekData);
  }
  
  return weeklyReturns;
};

const sampleTradingData = generateSampleData();

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('apexUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    // Check for saved theme
    const savedTheme = localStorage.getItem('apexTheme') || 'light';
    setTheme(savedTheme);
    
    setIsLoading(false);
  }, []);

  // Legacy demo login (kept for compatibility, not used in OTP flow)
  const login = (email, password) => {
    const foundUser = sampleUsers.find(u => u.email === email &amp;&amp; u.password === password);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('apexUser', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const register = (userData) => {
    const newUser = {
      ...userData,
      id: Date.now(),
      role: "investor",
      accountBalance: 0,
      totalInvested: 0,
      totalProfits: 0,
      joinDate: new Date().toISOString().split('T')[0]
    };
    
    setUser(newUser);
    localStorage.setItem('apexUser', JSON.stringify(newUser));
    return true;
  };

  // New: finalize session after successful OTP verification
  const completeOtpLogin = (email) => {
    const isAdmin = email.toLowerCase() === 'dubinigroup@gmail.com';
    const sessionUser = isAdmin
      ? { id: email, email, name: 'Admin', role: 'admin' }
      : { id: email, email, name: email.split('@')[0], role: 'investor', accountBalance: 0, totalInvested: 0, totalProfits: 0, joinDate: new Date().toISOString().split('T')[0] };
    setUser(sessionUser);
    localStorage.setItem('apexUser', JSON.stringify(sessionUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('apexUser');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('apexTheme', newTheme);
  };

  if (isLoading) {
    return (
      &lt;div className="min-h-screen bg-slate-900 flex items-center justify-center"&gt;
        &lt;div className="text-white text-xl"&gt;Loading...&lt;/div&gt;
      &lt;/div&gt;
    );
  }

  return (
    &lt;AuthContext.Provider value={{ user, login, register, logout, sampleTradingData, completeOtpLogin }}&gt;
      &lt;ThemeContext.Provider value={{ theme, toggleTheme }}&gt;
        &lt;Router&gt;
          &lt;Routes&gt;
            &lt;Route path="/" element={&lt;LandingPage /&gt;} /&gt;
            &lt;Route 
              path="/login" 
              element={user ? &lt;Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /&gt; : &lt;LoginPage /&gt;} 
            /&gt;
            &lt;Route 
              path="/register" 
              element={user ? &lt;Navigate to="/dashboard" /&gt; : &lt;RegisterPage /&gt;} 
            /&gt;
            &lt;Route 
              path="/dashboard" 
              element={user &amp;&amp; user.role === 'investor' ? &lt;InvestorDashboard /&gt; : &lt;Navigate to="/login" /&gt;} 
            /&gt;
            &lt;Route 
              path="/admin" 
              element={user &amp;&amp; user.role === 'admin' ? &lt;AdminDashboard /&gt; : &lt;Navigate to="/login" /&gt;} 
            /&gt;
            &lt;Route path="/faq" element={&lt;FAQ /&gt;} /&gt;
            &lt;Route path="/privacy" element={&lt;PrivacyPolicy /&gt;} /&gt;
            &lt;Route path="/terms" element={&lt;TermsOfUse /&gt;} /&gt;
            &lt;Route path="/blog" element={&lt;Blog /&gt;} /&gt;
          &lt;/Routes&gt;
        &lt;/Router&gt;
      &lt;/ThemeContext.Provider&gt;
    &lt;/AuthContext.Provider&gt;
  );
}

export { AuthContext, ThemeContext };
export default App;