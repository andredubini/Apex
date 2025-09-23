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
  
  for (let i = 0; i < 52; i++) {
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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center"&gt;
        <div className="text-white text-xl"&gt;Loading...</div&gt;
      </div&gt;
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, sampleTradingData, completeOtpLogin }}&gt;
      <ThemeContext.Provider value={{ theme, toggleTheme }}&gt;
        <Router&gt;
          <Routes&gt;
            <Route path="/" element={<LandingPage /&gt;} /&gt;
            <Route 
              path="/login" 
              element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /&gt; : <LoginPage /&gt;} 
            /&gt;
            <Route 
              path="/register" 
              element={user ? <Navigate to="/dashboard" /&gt; : <RegisterPage /&gt;} 
            /&gt;
            <Route 
              path="/dashboard" 
              element={user &amp;&amp; user.role === 'investor' ? <InvestorDashboard /&gt; : <Navigate to="/login" /&gt;} 
            /&gt;
            <Route 
              path="/admin" 
              element={user &amp;&amp; user.role === 'admin' ? <AdminDashboard /&gt; : <Navigate to="/login" /&gt;} 
            /&gt;
            <Route path="/faq" element={<FAQ /&gt;} /&gt;
            <Route path="/privacy" element={<PrivacyPolicy /&gt;} /&gt;
            <Route path="/terms" element={<TermsOfUse /&gt;} /&gt;
            <Route path="/blog" element={<Blog /&gt;} /&gt;
          </Routes&gt;
        </Router&gt;
      </ThemeContext.Provider&gt;
    </AuthContext.Provider&gt;
  );
}

export { AuthContext, ThemeContext };
export default App;