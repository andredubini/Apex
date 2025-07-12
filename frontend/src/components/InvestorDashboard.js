import React, { useState, useContext, useEffect } from "react";
import { AuthContext, ThemeContext } from "../App";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";
import { 
  TrendingUp, 
  DollarSign, 
  PieChart as PieChartIcon, 
  Activity,
  Bell,
  Settings,
  LogOut,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  Menu,
  X,
  Home,
  FileText,
  Send,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  BarChart3,
  User,
  Sun,
  Moon
} from "lucide-react";

const InvestorDashboard = () => {
  const { user, logout, sampleTradingData } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState("overview");
  const [showBalance, setShowBalance] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: user.name || "John Investor",
    email: user.email || "investor@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Investment Ave, New York, NY 10001",
    dateOfBirth: "1985-06-15",
    taxId: "***-**-1234",
    riskTolerance: "moderate",
    investmentGoals: "long-term-growth"
  });
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: true,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    weeklyReports: true,
    monthlyStatements: true
  });
  const [notifications, setNotifications] = useState([
    { id: 1, type: "profit", message: "Weekly profit of $2,450 added to your account", time: "2 hours ago" },
    { id: 2, type: "deposit", message: "Deposit of $50,000 processed successfully", time: "1 day ago" },
    { id: 3, type: "report", message: "New weekly trading report available", time: "3 days ago" },
  ]);

  // Sample bank details
  const [bankDetails, setBankDetails] = useState({
    bankName: "Chase Bank",
    accountNumber: "****1234",
    routingNumber: "021000021",
    accountType: "Checking"
  });

  const [showAddBank, setShowAddBank] = useState(false);

  // Hide the Emergent badge on mount
  useEffect(() => {
    const emergentBadge = document.getElementById('emergent-badge');
    if (emergentBadge) {
      emergentBadge.style.display = 'none';
    }
    
    // Also hide any badge with similar text
    const badges = document.querySelectorAll('a[href*="emergent"]');
    badges.forEach(badge => {
      badge.style.display = 'none';
    });
  }, []);

  // Calculate performance metrics
  const totalWeeks = sampleTradingData.length;
  const latestWeek = sampleTradingData[totalWeeks - 1];
  const firstWeek = sampleTradingData[0];
  const totalReturn = ((latestWeek.endBalance - firstWeek.startBalance) / firstWeek.startBalance) * 100;
  const avgWeeklyReturn = totalReturn / totalWeeks;

  // Calculate profit distribution based on annual return
  const calculateProfitDistribution = (totalProfit, initialInvestment) => {
    const annualReturn = (totalProfit / initialInvestment) * 100;
    let investorShare = 0;
    let fundShare = 0;
    
    if (annualReturn <= 4) {
      // 0-4%: 80/20 split
      investorShare = totalProfit * 0.8;
      fundShare = totalProfit * 0.2;
    } else if (annualReturn <= 8) {
      // First 4% at 80/20, next 4% at 70/30
      const first4Percent = initialInvestment * 0.04;
      const remainder = totalProfit - first4Percent;
      investorShare = (first4Percent * 0.8) + (remainder * 0.7);
      fundShare = (first4Percent * 0.2) + (remainder * 0.3);
    } else if (annualReturn <= 12) {
      // First 4% at 80/20, second 4% at 70/30, next 4% at 60/40
      const first4Percent = initialInvestment * 0.04;
      const second4Percent = initialInvestment * 0.04;
      const remainder = totalProfit - first4Percent - second4Percent;
      investorShare = (first4Percent * 0.8) + (second4Percent * 0.7) + (remainder * 0.6);
      fundShare = (first4Percent * 0.2) + (second4Percent * 0.3) + (remainder * 0.4);
    } else {
      // First 4% at 80/20, second 4% at 70/30, third 4% at 60/40, rest at 50/50
      const first4Percent = initialInvestment * 0.04;
      const second4Percent = initialInvestment * 0.04;
      const third4Percent = initialInvestment * 0.04;
      const remainder = totalProfit - first4Percent - second4Percent - third4Percent;
      investorShare = (first4Percent * 0.8) + (second4Percent * 0.7) + (third4Percent * 0.6) + (remainder * 0.5);
      fundShare = (first4Percent * 0.2) + (second4Percent * 0.3) + (third4Percent * 0.4) + (remainder * 0.5);
    }
    
    return { investorShare, fundShare, annualReturn };
  };

  const initialInvestment = user.totalInvested || 100000;
  const totalProfit = latestWeek.endBalance - firstWeek.startBalance;
  const profitDistribution = calculateProfitDistribution(totalProfit, initialInvestment);

  // Portfolio allocation data
  const portfolioData = [
    { name: "Technology", value: 35, color: "#3B82F6" },
    { name: "Healthcare", value: 25, color: "#10B981" },
    { name: "Financial", value: 20, color: "#F59E0B" },
    { name: "Consumer", value: 15, color: "#EF4444" },
    { name: "Energy", value: 5, color: "#8B5CF6" }
  ];

  // Recent performance data (last 12 weeks)
  const recentPerformance = sampleTradingData.slice(-12).map(week => ({
    week: week.week.replace("Week ", "W"),
    balance: week.endBalance,
    profit: week.profit,
    return: week.returnPercentage
  }));

  const handleLogout = () => {
    logout();
  };

  const handleWithdrawRequest = () => {
    alert("Withdrawal request submitted. You will be contacted within 24 hours.");
  };

  const handleDepositRequest = () => {
    alert("Deposit request submitted. Please follow the instructions sent to your email.");
  };

  const navItems = [
    { id: 'overview', label: 'Home', icon: Home },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'transactions', label: 'Transfer', icon: Send },
    { id: 'notifications', label: 'Activity', icon: Bell }
  ];

  // Theme classes
  const bgClass = theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50';
  const cardBgClass = theme === 'dark' ? 'bg-slate-800/50' : 'bg-white';
  const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondaryClass = theme === 'dark' ? 'text-slate-300' : 'text-gray-600';
  const borderClass = theme === 'dark' ? 'border-slate-700' : 'border-gray-200';
  const headerBgClass = theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200';

  const renderOverview = () => (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Main Balance Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-blue-100 text-sm font-medium">Total Balance</p>
            <div className="flex items-center space-x-3">
              <p className="text-3xl font-bold">
                {showBalance ? `$${user.accountBalance?.toLocaleString() || "150,000"}` : "••••••"}
              </p>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="text-blue-200 hover:text-white transition-colors"
              >
                {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-sm">Monthly Gain</p>
            <p className="text-xl font-semibold text-green-200">+${latestWeek.profit.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ArrowUpRight className="w-4 h-4 text-green-200" />
            <span className="text-sm text-blue-100">+{totalReturn.toFixed(2)}% Total Return</span>
          </div>
          <div className="text-sm text-blue-100">
            Since {user.joinDate || "Jan 2024"}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleDepositRequest}
          className={`${cardBgClass} rounded-xl p-4 shadow-sm border ${borderClass} hover:shadow-md transition-shadow`}
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className={`${textSecondaryClass} text-sm`}>Add Money</p>
              <p className={`${textClass} font-semibold`}>Deposit</p>
            </div>
            <div className="bg-green-100 p-2 rounded-full">
              <Plus className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </button>
        
        <button
          onClick={handleWithdrawRequest}
          className={`${cardBgClass} rounded-xl p-4 shadow-sm border ${borderClass} hover:shadow-md transition-shadow`}
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className={`${textSecondaryClass} text-sm`}>Withdraw</p>
              <p className={`${textClass} font-semibold`}>Transfer</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-full">
              <Send className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </button>
      </div>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${cardBgClass} rounded-xl p-4 shadow-sm border ${borderClass}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${textSecondaryClass} text-sm`}>Invested</p>
              <p className={`text-xl font-bold ${textClass}`}>${user.totalInvested?.toLocaleString() || "100,000"}</p>
            </div>
            <div className="bg-purple-100 p-2 rounded-full">
              <Wallet className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className={`${cardBgClass} rounded-xl p-4 shadow-sm border ${borderClass}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${textSecondaryClass} text-sm`}>Your Profit Share</p>
              <p className="text-xl font-bold text-green-600">${profitDistribution.investorShare.toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-2 rounded-full">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className={`text-xs ${textSecondaryClass} mt-1`}>Tiered Distribution</p>
        </div>

        <div className={`${cardBgClass} rounded-xl p-4 shadow-sm border ${borderClass}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${textSecondaryClass} text-sm`}>Annual Return</p>
              <p className="text-xl font-bold text-blue-600">{profitDistribution.annualReturn.toFixed(2)}%</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-full">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Profit Distribution Breakdown */}
      <div className={`${cardBgClass} rounded-xl p-6 shadow-sm border ${borderClass}`}>
        <h3 className={`text-lg font-semibold ${textClass} mb-4`}>Profit Distribution</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-green-600">${profitDistribution.investorShare.toLocaleString()}</p>
              <p className={`text-sm ${textSecondaryClass}`}>Your Share</p>
            </div>
          </div>
          <div className="text-center">
            <div className={theme === 'dark' ? 'bg-slate-700 p-4 rounded-lg' : 'bg-gray-50 p-4 rounded-lg'}>
              <p className={`text-2xl font-bold ${textSecondaryClass}`}>${profitDistribution.fundShare.toLocaleString()}</p>
              <p className={`text-sm ${textSecondaryClass}`}>Fund Share</p>
            </div>
          </div>
        </div>
        <p className={`text-xs ${textSecondaryClass} text-center`}>
          Distribution: 0-4% (80/20), 4-8% (70/30), 8-12% (60/40), 12%+ (50/50)
        </p>
      </div>

      {/* Performance Chart */}
      <div className={`${cardBgClass} rounded-xl p-6 shadow-sm border ${borderClass}`}>
        <h3 className={`text-lg font-semibold ${textClass} mb-4`}>Performance (12 Weeks)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={recentPerformance}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#F3F4F6'} />
            <XAxis dataKey="week" stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} fontSize={12} />
            <YAxis stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: theme === 'dark' ? '#1F2937' : 'white', 
                border: `1px solid ${theme === 'dark' ? '#374151' : '#E5E7EB'}`,
                borderRadius: '8px',
                color: theme === 'dark' ? '#F3F4F6' : '#111827',
                fontSize: '12px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="balance" 
              stroke="#3B82F6" 
              strokeWidth={2}
              dot={{ fill: '#3B82F6', strokeWidth: 0, r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Portfolio Allocation */}
      <div className={`${cardBgClass} rounded-xl p-6 shadow-sm border ${borderClass}`}>
        <h3 className={`text-lg font-semibold ${textClass} mb-4`}>Portfolio Allocation</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={portfolioData}
                cx="50%"
                cy="50%"
                outerRadius={60}
                fill="#8884d8"
                dataKey="value"
              >
                {portfolioData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2">
            {portfolioData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className={`text-sm ${textSecondaryClass}`}>{item.name}</span>
                </div>
                <span className={`text-sm font-medium ${textClass}`}>{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-4 pb-20 md:pb-6">
      <div className={`${cardBgClass} rounded-xl p-6 shadow-sm border ${borderClass}`}>
        <h3 className={`text-lg font-semibold ${textClass} mb-4`}>Weekly Reports</h3>
        <div className="space-y-3">
          {sampleTradingData.slice(-8).reverse().map((week) => (
            <div key={week.id} className={theme === 'dark' ? 'bg-slate-700/50 rounded-lg p-4' : 'bg-gray-50 rounded-lg p-4'}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className={`font-medium ${textClass}`}>{week.week}</h4>
                  <p className={`text-sm ${textSecondaryClass}`}>
                    {week.trades} trades • {week.successRate.toFixed(1)}% success
                  </p>
                  <p className={`text-xs ${textSecondaryClass}`}>{week.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-green-600">
                    +${week.profit.toLocaleString()}
                  </p>
                  <p className={`text-sm ${textSecondaryClass}`}>
                    {week.returnPercentage.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTransactions = () => (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Transfer Options */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleDepositRequest}
          className="bg-blue-600 text-white rounded-xl p-6 hover:bg-blue-700 transition-colors"
        >
          <div className="text-center">
            <ArrowDownLeft className="w-8 h-8 mx-auto mb-2" />
            <p className="font-semibold">Deposit</p>
            <p className="text-sm text-blue-100">Add funds</p>
          </div>
        </button>
        
        <button
          onClick={handleWithdrawRequest}
          className="bg-green-600 text-white rounded-xl p-6 hover:bg-green-700 transition-colors"
        >
          <div className="text-center">
            <ArrowUpRight className="w-8 h-8 mx-auto mb-2" />
            <p className="font-semibold">Withdraw</p>
            <p className="text-sm text-green-100">Transfer out</p>
          </div>
        </button>
      </div>

      {/* Bank Details */}
      <div className={`${cardBgClass} rounded-xl p-6 shadow-sm border ${borderClass}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${textClass}`}>Bank Account</h3>
          <button
            onClick={() => setShowAddBank(!showAddBank)}
            className="text-blue-600 text-sm font-medium"
          >
            {showAddBank ? "Cancel" : "Edit"}
          </button>
        </div>
        
        {!showAddBank ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={textSecondaryClass}>Bank</span>
              <span className={`font-medium ${textClass}`}>{bankDetails.bankName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={textSecondaryClass}>Account</span>
              <span className={`font-medium ${textClass}`}>{bankDetails.accountNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={textSecondaryClass}>Type</span>
              <span className={`font-medium ${textClass}`}>{bankDetails.accountType}</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Bank Name"
              value={bankDetails.bankName}
              onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
              className={`w-full px-4 py-3 border ${borderClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-white text-gray-900'}`}
            />
            <input
              type="text"
              placeholder="Account Number"
              value={bankDetails.accountNumber}
              onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
              className={`w-full px-4 py-3 border ${borderClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-white text-gray-900'}`}
            />
            <button
              onClick={() => setShowAddBank(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className={`${cardBgClass} rounded-xl p-6 shadow-sm border ${borderClass}`}>
        <h3 className={`text-lg font-semibold ${textClass} mb-4`}>Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="bg-green-200 p-2 rounded-full">
                <TrendingUp className="w-4 h-4 text-green-700" />
              </div>
              <div>
                <p className={`font-medium ${textClass}`}>Weekly Profit</p>
                <p className={`text-sm ${textSecondaryClass}`}>Jan 15, 2025</p>
              </div>
            </div>
            <p className="font-semibold text-green-600">+$2,450</p>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-200 p-2 rounded-full">
                <ArrowDownLeft className="w-4 h-4 text-blue-700" />
              </div>
              <div>
                <p className={`font-medium ${textClass}`}>Deposit</p>
                <p className={`text-sm ${textSecondaryClass}`}>Jan 10, 2025</p>
              </div>
            </div>
            <p className="font-semibold text-blue-600">+$50,000</p>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-200 p-2 rounded-full">
                <ArrowUpRight className="w-4 h-4 text-orange-700" />
              </div>
              <div>
                <p className={`font-medium ${textClass}`}>Withdrawal</p>
                <p className={`text-sm ${textSecondaryClass}`}>Jan 1, 2025</p>
              </div>
            </div>
            <p className="font-semibold text-orange-600">-$5,000</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-4 pb-20 md:pb-6">
      <div className={`${cardBgClass} rounded-xl p-6 shadow-sm border ${borderClass}`}>
        <h3 className={`text-lg font-semibold ${textClass} mb-4`}>Activity</h3>
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div key={notification.id} className={theme === 'dark' ? 'bg-slate-700/50 rounded-lg p-4' : 'bg-gray-50 rounded-lg p-4'}>
              <div className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  notification.type === 'profit' ? 'bg-green-500' :
                  notification.type === 'deposit' ? 'bg-blue-500' : 'bg-orange-500'
                }`}></div>
                <div className="flex-1">
                  <p className={`${textClass} font-medium`}>{notification.message}</p>
                  <p className={`text-sm ${textSecondaryClass} mt-1`}>{notification.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${bgClass}`}>
      {/* Header */}
      <header className={`${headerBgClass} border-b sticky top-0 z-40`}>
        <div className="max-w-md mx-auto px-4 py-4 md:max-w-7xl md:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-full">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className={`text-sm ${textSecondaryClass}`}>Welcome back</p>
                <p className={`font-semibold ${textClass}`}>{user.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={toggleTheme}
                className={`p-2 ${textSecondaryClass} hover:${textClass} transition-colors`}
              >
                {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
              </button>
              <button className={`p-2 ${textSecondaryClass} hover:${textClass} transition-colors`}>
                <Bell className="w-6 h-6" />
              </button>
              <button
                onClick={handleLogout}
                className={`p-2 ${textSecondaryClass} hover:text-red-600 transition-colors`}
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6 md:max-w-7xl md:px-6 lg:px-8">
        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'reports' && renderReports()}
        {activeTab === 'transactions' && renderTransactions()}
        {activeTab === 'notifications' && renderNotifications()}
      </main>

      {/* Bottom Navigation - Mobile */}
      <nav className={`fixed bottom-0 left-0 right-0 ${cardBgClass} border-t ${borderClass} md:hidden`}>
        <div className="grid grid-cols-4 py-2">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex flex-col items-center py-2 px-1 transition-colors ${
                activeTab === id 
                  ? 'text-blue-600' 
                  : textSecondaryClass
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Desktop Sidebar Navigation */}
      <aside className={`hidden md:block fixed left-6 top-24 bottom-6 w-64 ${cardBgClass} rounded-xl shadow-sm border ${borderClass} p-6`}>
        <nav className="space-y-2">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === id 
                  ? 'bg-blue-600 text-white' 
                  : `${textSecondaryClass} hover:${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'}`
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </nav>
        
        <div className={`mt-8 pt-8 border-t ${borderClass}`}>
          <div className="flex items-center space-x-3 px-4 py-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Settings className="w-4 h-4 text-blue-600" />
            </div>
            <span className={`${textSecondaryClass} font-medium`}>Settings</span>
          </div>
        </div>
      </aside>

      {/* Desktop Content Adjustment */}
      <style jsx>{`
        @media (min-width: 768px) {
          main {
            margin-left: 280px;
            max-width: calc(100% - 280px);
          }
        }
      `}</style>
    </div>
  );
};

export default InvestorDashboard;