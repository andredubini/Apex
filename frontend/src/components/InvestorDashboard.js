import React, { useState, useContext, useEffect, useRef, useCallback } from "react";
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
  Moon,
  Target
} from "lucide-react";

const InvestorDashboard = () => {
  const { user, logout, sampleTradingData } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState("overview");
  const [showBalance, setShowBalance] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState("3M");
  const [compareWithMarket, setCompareWithMarket] = useState(true);
  const [alertSettings, setAlertSettings] = useState({
    performanceAlerts: true,
    depositAlerts: true,
    riskAlerts: true,
    weeklyReports: true,
    pushNotifications: true,
    smsAlerts: false,
    emailDigests: true
  });
  const [benchmarkComparison, setBenchmarkComparison] = useState("SP500");
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
  const [notifications, setNotifications] = useState([]);
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    categories: {
      profit: true,
      deposit: true,
      withdrawal: true,
      alert: true,
      security: true,
      report: true,
      system: true,
      trade: true,
      risk: true,
      performance: true
    },
    prioritySettings: {
      low: true,
      medium: true,
      high: true,
      critical: true
    },
    quietHours: {
      enabled: false,
      startTime: "22:00",
      endTime: "08:00",
      timezone: "UTC"
    },
    frequencyLimits: {
      dailyLimit: 50,
      hourlyLimit: 10
    }
  });
  
  const websocketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected"); // "connected", "connecting", "disconnected"
  const [unreadCount, setUnreadCount] = useState(0);
  
  // WebSocket connection management
  const connectWebSocket = useCallback(() => {
    if (!user?.email) return;
    
    setConnectionStatus("connecting");
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
    const wsUrl = backendUrl.replace('http', 'ws').replace('https', 'wss');
    
    try {
      websocketRef.current = new WebSocket(`${wsUrl}/ws/${user.email}`);
      
      websocketRef.current.onopen = () => {
        console.log('WebSocket connected');
        setConnectionStatus("connected");
        
        // Clear any existing reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };
      
      websocketRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'new_notification') {
            const newNotification = message.data;
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Show browser notification if enabled and permission granted
            if (notificationSettings.pushNotifications && 'Notification' in window && Notification.permission === 'granted') {
              new Notification(newNotification.title, {
                body: newNotification.message,
                icon: '/favicon.ico',
                badge: '/favicon.ico'
              });
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      websocketRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setConnectionStatus("disconnected");
        
        // Attempt to reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 5000);
      };
      
      websocketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus("disconnected");
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionStatus("disconnected");
      
      // Retry connection after 5 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connectWebSocket();
      }, 5000);
    }
  }, [user?.email, notificationSettings.pushNotifications]);
  
  // Load notifications from API
  const loadNotifications = async () => {
    if (!user?.email) return;
    
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const response = await fetch(`${backendUrl}/api/notifications/${user.email}`);
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        
        // Count unread notifications
        const unreadNotifications = data.filter(n => n.status === 'unread');
        setUnreadCount(unreadNotifications.length);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };
  
  // Load notification settings from API
  const loadNotificationSettings = async () => {
    if (!user?.email) return;
    
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const response = await fetch(`${backendUrl}/api/notification-settings/${user.email}`);
      
      if (response.ok) {
        const data = await response.json();
        setNotificationSettings(prev => ({...prev, ...data}));
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };
  
  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const response = await fetch(`${backendUrl}/api/notifications/${notificationId}/read`, {
        method: 'PATCH'
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId 
              ? { ...n, status: 'read', read_at: new Date().toISOString() }
              : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    if (!user?.email) return;
    
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const response = await fetch(`${backendUrl}/api/notifications/${user.email}/mark-all-read`, {
        method: 'PATCH'
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, status: 'read', read_at: new Date().toISOString() }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  // Update notification settings
  const updateNotificationSettings = async (newSettings) => {
    if (!user?.email) return;
    
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const response = await fetch(`${backendUrl}/api/notification-settings/${user.email}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSettings)
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotificationSettings(prev => ({...prev, ...data}));
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  };
  
  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  };

  // Sample bank details
  const [bankDetails, setBankDetails] = useState({
    bankName: "Chase Bank",
    accountNumber: "****1234",
    routingNumber: "021000021",
    accountType: "Checking"
  });

  const [showAddBank, setShowAddBank] = useState(false);

  // Initialize WebSocket connection and load data
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

    // Initialize notifications
    loadNotifications();
    loadNotificationSettings();
    
    // Request notification permission
    requestNotificationPermission();
    
    // Connect to WebSocket
    connectWebSocket();
    
    // Cleanup on unmount
    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connectWebSocket]);
  
  // Reconnect WebSocket when user changes
  useEffect(() => {
    if (user?.email) {
      connectWebSocket();
    }
  }, [user?.email, connectWebSocket]);

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

  // Enhanced market comparison data
  const marketComparison = {
    SP500: [
      { week: "Week 1", ourFund: 2.1, market: 1.2, alpha: 0.9 },
      { week: "Week 2", ourFund: -0.8, market: -1.5, alpha: 0.7 },
      { week: "Week 3", ourFund: 3.2, market: 2.1, alpha: 1.1 },
      { week: "Week 4", ourFund: 1.5, market: 0.8, alpha: 0.7 },
      { week: "Week 5", ourFund: 2.8, market: 1.9, alpha: 0.9 },
      { week: "Week 6", ourFund: -1.1, market: -2.2, alpha: 1.1 },
      { week: "Week 7", ourFund: 4.1, market: 2.8, alpha: 1.3 },
      { week: "Week 8", ourFund: 0.9, market: 0.5, alpha: 0.4 },
      { week: "Week 9", ourFund: 2.7, market: 1.6, alpha: 1.1 },
      { week: "Week 10", ourFund: 1.8, market: 1.1, alpha: 0.7 },
      { week: "Week 11", ourFund: 3.4, market: 2.3, alpha: 1.1 },
      { week: "Week 12", ourFund: 2.2, market: 1.4, alpha: 0.8 }
    ],
    NASDAQ: [
      { week: "Week 1", ourFund: 2.1, market: 1.8, alpha: 0.3 },
      { week: "Week 2", ourFund: -0.8, market: -2.1, alpha: 1.3 },
      { week: "Week 3", ourFund: 3.2, market: 2.9, alpha: 0.3 },
      { week: "Week 4", ourFund: 1.5, market: 1.2, alpha: 0.3 },
      { week: "Week 5", ourFund: 2.8, market: 2.4, alpha: 0.4 },
      { week: "Week 6", ourFund: -1.1, market: -2.8, alpha: 1.7 },
      { week: "Week 7", ourFund: 4.1, market: 3.5, alpha: 0.6 },
      { week: "Week 8", ourFund: 0.9, market: 0.3, alpha: 0.6 },
      { week: "Week 9", ourFund: 2.7, market: 2.1, alpha: 0.6 },
      { week: "Week 10", ourFund: 1.8, market: 1.3, alpha: 0.5 },
      { week: "Week 11", ourFund: 3.4, market: 2.9, alpha: 0.5 },
      { week: "Week 12", ourFund: 2.2, market: 1.7, alpha: 0.5 }
    ]
  };

  // Risk-adjusted performance metrics
  const riskMetrics = {
    sharpeRatio: 1.85,
    sortinoRatio: 2.12,
    calmarRatio: 1.67,
    maxDrawdown: -2.1,
    volatility: 8.2,
    beta: 0.78,
    alpha: 8.7,
    informationRatio: 1.34,
    trackingError: 5.2
  };

  // Enhanced sector allocation with values
  const enhancedPortfolioData = [
    { sector: "Technology", percentage: 28, value: 42000, color: "#3B82F6", change: "+2.4%" },
    { sector: "Healthcare", percentage: 22, value: 33000, color: "#10B981", change: "+1.8%" },
    { sector: "Financial", percentage: 18, value: 27000, color: "#F59E0B", change: "-0.5%" },
    { sector: "Consumer Discretionary", percentage: 15, value: 22500, color: "#EF4444", change: "+0.9%" },
    { sector: "Industrial", percentage: 10, value: 15000, color: "#8B5CF6", change: "+1.2%" },
    { sector: "Energy", percentage: 4, value: 6000, color: "#F97316", change: "-1.1%" },
    { sector: "Real Estate", percentage: 3, value: 4500, color: "#06B6D4", change: "+0.3%" }
  ];

  // Strategy performance breakdown
  const strategyPerformance = [
    { strategy: "Momentum Trading", contribution: 35, return: 12.4, trades: 156, winRate: 68, color: "#3B82F6" },
    { strategy: "Mean Reversion", contribution: 28, return: 9.8, trades: 98, winRate: 72, color: "#10B981" },
    { strategy: "Breakout Trading", contribution: 20, return: 8.2, trades: 74, winRate: 65, color: "#F59E0B" },
    { strategy: "Scalping", contribution: 17, return: 6.1, trades: 283, winRate: 58, color: "#EF4444" }
  ];

  // Predictive analytics data
  const predictiveAnalytics = {
    projectedReturn: 47.2,
    confidence: 78,
    riskAdjustedTarget: 41.8,
    volatilityForecast: 7.8,
    nextMonthProbability: {
      positive: 72,
      negative: 28
    },
    marketCorrelation: 0.65
  };

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
    { id: 'notifications', label: 'Activity', icon: Bell, badge: unreadCount > 0 ? unreadCount : null },
    { id: 'settings', label: 'Settings', icon: Settings }
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
      {/* Main Balance Card with Enhanced Features */}
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
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <ArrowUpRight className="w-4 h-4 text-green-200" />
            <span className="text-sm text-blue-100">+{totalReturn.toFixed(2)}% Total Return</span>
          </div>
          <div className="text-sm text-blue-100">
            Since {user.joinDate || "Jan 2024"}
          </div>
        </div>

        {/* Market Comparison Selector */}
        <div className="border-t border-blue-500 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Benchmark Comparison</p>
              <select
                value={benchmarkComparison}
                onChange={(e) => setBenchmarkComparison(e.target.value)}
                className="bg-blue-800 text-white text-sm px-3 py-1 rounded border border-blue-500 focus:outline-none focus:border-blue-300"
              >
                <option value="SP500">vs S&P 500</option>
                <option value="NASDAQ">vs NASDAQ</option>
                <option value="none">No Comparison</option>
              </select>
            </div>
            {benchmarkComparison !== 'none' && (
              <div className="text-right">
                <div className="text-sm text-blue-100">
                  Outperforming {benchmarkComparison} by
                </div>
                <div className="text-lg font-bold text-green-200">
                  +{benchmarkComparison === 'SP500' ? '6.41%' : '3.91%'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={handleDepositRequest}
          className={`${cardBgClass} rounded-xl p-4 shadow-sm border ${borderClass} hover:shadow-md transition-all hover:scale-105`}
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
          className={`${cardBgClass} rounded-xl p-4 shadow-sm border ${borderClass} hover:shadow-md transition-all hover:scale-105`}
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

        <button
          onClick={() => alert('Advanced analytics dashboard with interactive charts, risk metrics, and performance attribution')}
          className={`${cardBgClass} rounded-xl p-4 shadow-sm border ${borderClass} hover:shadow-md transition-all hover:scale-105`}
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className={`${textSecondaryClass} text-sm`}>Analytics</p>
              <p className={`${textClass} font-semibold`}>Deep Dive</p>
            </div>
            <div className="bg-purple-100 p-2 rounded-full">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </button>

        <button
          onClick={() => alert('AI-powered portfolio optimization suggestions and risk management recommendations')}
          className={`${cardBgClass} rounded-xl p-4 shadow-sm border ${borderClass} hover:shadow-md transition-all hover:scale-105`}
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className={`${textSecondaryClass} text-sm`}>AI Insights</p>
              <p className={`${textClass} font-semibold`}>Optimize</p>
            </div>
            <div className="bg-indigo-100 p-2 rounded-full">
              <Target className="w-5 h-5 text-indigo-600" />
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

      {/* Risk-Adjusted Performance Metrics */}
      <div className={`${cardBgClass} rounded-xl p-6 shadow-sm border ${borderClass}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${textClass}`}>Risk-Adjusted Performance</h3>
          <button 
            onClick={() => alert('Detailed risk analysis with correlation matrices, VaR calculations, and stress test scenarios')}
            className="text-blue-500 hover:text-blue-600 text-sm font-medium"
          >
            View Details →
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-lg font-bold text-blue-600 mb-1">{riskMetrics.sharpeRatio}</div>
            <div className={`text-xs ${textSecondaryClass}`}>Sharpe Ratio</div>
            <div className="text-xs text-green-500 mt-1">Excellent</div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-lg font-bold text-green-600 mb-1">{riskMetrics.sortinoRatio}</div>
            <div className={`text-xs ${textSecondaryClass}`}>Sortino Ratio</div>
            <div className="text-xs text-green-500 mt-1">Superior</div>
          </div>
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-lg font-bold text-purple-600 mb-1">{riskMetrics.alpha}%</div>
            <div className={`text-xs ${textSecondaryClass}`}>Alpha</div>
            <div className="text-xs text-green-500 mt-1">Outperforming</div>
          </div>
          <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-lg font-bold text-orange-600 mb-1">{riskMetrics.beta}</div>
            <div className={`text-xs ${textSecondaryClass}`}>Beta</div>
            <div className="text-xs text-blue-500 mt-1">Low Risk</div>
          </div>
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-lg font-bold text-red-600 mb-1">{riskMetrics.maxDrawdown}%</div>
            <div className={`text-xs ${textSecondaryClass}`}>Max Drawdown</div>
            <div className="text-xs text-green-500 mt-1">Minimal</div>
          </div>
        </div>
      </div>

      {/* AI Predictive Analytics */}
      <div className={`${cardBgClass} rounded-xl p-6 shadow-sm border ${borderClass} bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <h3 className={`text-lg font-semibold ${textClass}`}>AI-Powered Predictions</h3>
          </div>
          <div className="text-xs bg-indigo-600 text-white px-2 py-1 rounded-full">
            Beta
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className={`font-medium ${textClass} mb-3`}>12-Month Forecast</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={textSecondaryClass}>Projected Return:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500 font-semibold">+{predictiveAnalytics.projectedReturn}%</span>
                  <div className="w-12 h-2 bg-gray-200 dark:bg-slate-700 rounded-full">
                    <div className="w-10 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={textSecondaryClass}>Confidence Level:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-500 font-semibold">{predictiveAnalytics.confidence}%</span>
                  <div className="w-12 h-2 bg-gray-200 dark:bg-slate-700 rounded-full">
                    <div 
                      className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                      style={{width: `${(predictiveAnalytics.confidence / 100) * 48}px`}}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={textSecondaryClass}>Risk-Adjusted Target:</span>
                <span className="text-purple-500 font-semibold">+{predictiveAnalytics.riskAdjustedTarget}%</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className={`font-medium ${textClass} mb-3`}>Next Month Probability</h4>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className={textSecondaryClass}>Positive Return</span>
                  <span className="text-green-500 font-semibold">{predictiveAnalytics.nextMonthProbability.positive}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                    style={{width: `${predictiveAnalytics.nextMonthProbability.positive}%`}}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className={textSecondaryClass}>Negative Return</span>
                  <span className="text-red-500 font-semibold">{predictiveAnalytics.nextMonthProbability.negative}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-500" 
                    style={{width: `${predictiveAnalytics.nextMonthProbability.negative}%`}}
                  ></div>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-3 p-2 bg-gray-100 dark:bg-slate-800 rounded">
                <span className="font-medium">Model Accuracy:</span> 87.3% over last 24 months
              </div>
            </div>
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

  const renderNotifications = () => {
    const [selectedPriority, setSelectedPriority] = useState("all");
    const [selectedCategory, setSelectedCategory] = useState("all");
    
    // Filter notifications based on priority and category
    const filteredNotifications = notifications.filter(notification => {
      const priorityMatch = selectedPriority === "all" || notification.priority === selectedPriority;
      const categoryMatch = selectedCategory === "all" || notification.type === selectedCategory;
      return priorityMatch && categoryMatch;
    });

    const getPriorityColor = (priority) => {
      switch (priority) {
        case 'critical': return 'text-red-500 bg-red-100 border-red-200';
        case 'high': return 'text-orange-500 bg-orange-100 border-orange-200';
        case 'medium': return 'text-blue-500 bg-blue-100 border-blue-200';
        case 'low': return 'text-gray-500 bg-gray-100 border-gray-200';
        default: return 'text-gray-500 bg-gray-100 border-gray-200';
      }
    };

    const getTypeColor = (type) => {
      switch (type) {
        case 'profit': return 'text-green-600 bg-green-100';
        case 'deposit': return 'text-blue-600 bg-blue-100';
        case 'withdrawal': return 'text-orange-600 bg-orange-100';
        case 'alert': return 'text-red-600 bg-red-100';
        case 'security': return 'text-purple-600 bg-purple-100';
        case 'report': return 'text-indigo-600 bg-indigo-100';
        case 'system': return 'text-gray-600 bg-gray-100';
        case 'trade': return 'text-emerald-600 bg-emerald-100';
        case 'risk': return 'text-yellow-600 bg-yellow-100';
        case 'performance': return 'text-cyan-600 bg-cyan-100';
        default: return 'text-gray-600 bg-gray-100';
      }
    };

    const formatTimeAgo = (dateString) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    };

    return (
      <div className="space-y-4 pb-20 md:pb-6">
        {/* Connection Status Indicator */}
        <div className={`${cardBgClass} rounded-xl p-4 shadow-sm border ${borderClass}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' : 
                connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 
                'bg-red-500'
              }`}></div>
              <span className={`text-sm ${textSecondaryClass}`}>
                Real-time notifications: {
                  connectionStatus === 'connected' ? 'Connected' : 
                  connectionStatus === 'connecting' ? 'Connecting...' : 
                  'Disconnected'
                }
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={markAllNotificationsAsRead}
                disabled={unreadCount === 0}
                className={`text-sm px-3 py-1 rounded-lg ${
                  unreadCount > 0 
                    ? 'text-blue-600 bg-blue-100 hover:bg-blue-200' 
                    : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                }`}
              >
                Mark All Read
              </button>
              <span className={`text-sm ${textSecondaryClass}`}>
                {unreadCount} unread
              </span>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className={`${cardBgClass} rounded-xl p-4 shadow-sm border ${borderClass}`}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className={`block text-sm font-medium ${textSecondaryClass} mb-2`}>
                Filter by Priority
              </label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className={`w-full px-3 py-2 border ${borderClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-white text-gray-900'}`}
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="flex-1">
              <label className={`block text-sm font-medium ${textSecondaryClass} mb-2`}>
                Filter by Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`w-full px-3 py-2 border ${borderClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-white text-gray-900'}`}
              >
                <option value="all">All Categories</option>
                <option value="profit">Profits</option>
                <option value="deposit">Deposits</option>
                <option value="withdrawal">Withdrawals</option>
                <option value="alert">Alerts</option>
                <option value="security">Security</option>
                <option value="report">Reports</option>
                <option value="system">System</option>
                <option value="trade">Trading</option>
                <option value="risk">Risk</option>
                <option value="performance">Performance</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className={`${cardBgClass} rounded-xl p-6 shadow-sm border ${borderClass}`}>
          <h3 className={`text-lg font-semibold ${textClass} mb-4`}>
            Activity Feed ({filteredNotifications.length} notifications)
          </h3>
          
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className={`w-12 h-12 mx-auto ${textSecondaryClass} mb-4`} />
              <p className={`${textSecondaryClass}`}>No notifications found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                    notification.status === 'unread' 
                      ? 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700' 
                      : `${borderClass} ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'}`
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {/* Priority Indicator */}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(notification.priority)}`}>
                          {notification.priority?.toUpperCase() || 'MEDIUM'}
                        </span>
                        
                        {/* Category Badge */}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                          {notification.type?.toUpperCase() || 'SYSTEM'}
                        </span>
                        
                        {/* Unread Indicator */}
                        {notification.status === 'unread' && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      
                      <h4 className={`font-semibold ${textClass} mb-1`}>
                        {notification.title || notification.message}
                      </h4>
                      
                      {notification.title && notification.title !== notification.message && (
                        <p className={`${textSecondaryClass} text-sm mb-2`}>
                          {notification.message}
                        </p>
                      )}
                      
                      <p className={`text-xs ${textSecondaryClass}`}>
                        {formatTimeAgo(notification.created_at)}
                      </p>
                      
                      {/* Metadata Display */}
                      {notification.metadata && Object.keys(notification.metadata).length > 0 && (
                        <div className="mt-2 p-2 rounded bg-gray-100 dark:bg-slate-800">
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {notification.metadata.amount && `Amount: $${notification.metadata.amount.toLocaleString()}`}
                            {notification.metadata.period && ` • Period: ${notification.metadata.period}`}
                            {notification.metadata.payment_reference && ` • Ref: ${notification.metadata.payment_reference}`}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      {notification.status === 'unread' && (
                        <button
                          onClick={() => markNotificationAsRead(notification.id)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Profile Settings */}
      <div className={`${cardBgClass} rounded-xl p-6 shadow-sm border ${borderClass}`}>
        <h3 className={`text-lg font-semibold ${textClass} mb-6`}>Profile Information</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${textSecondaryClass} mb-2`}>
                Full Name
              </label>
              <input
                type="text"
                value={userProfile.name}
                onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                className={`w-full px-4 py-3 border ${borderClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-white text-gray-900'}`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${textSecondaryClass} mb-2`}>
                Email Address
              </label>
              <input
                type="email"
                value={userProfile.email}
                onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                className={`w-full px-4 py-3 border ${borderClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-white text-gray-900'}`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${textSecondaryClass} mb-2`}>
                Phone Number
              </label>
              <input
                type="tel"
                value={userProfile.phone}
                onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
                className={`w-full px-4 py-3 border ${borderClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-white text-gray-900'}`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${textSecondaryClass} mb-2`}>
                Date of Birth
              </label>
              <input
                type="date"
                value={userProfile.dateOfBirth}
                onChange={(e) => setUserProfile({...userProfile, dateOfBirth: e.target.value})}
                className={`w-full px-4 py-3 border ${borderClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-white text-gray-900'}`}
              />
            </div>
          </div>
          
          <div>
            <label className={`block text-sm font-medium ${textSecondaryClass} mb-2`}>
              Address
            </label>
            <textarea
              rows={3}
              value={userProfile.address}
              onChange={(e) => setUserProfile({...userProfile, address: e.target.value})}
              className={`w-full px-4 py-3 border ${borderClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-white text-gray-900'}`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${textSecondaryClass} mb-2`}>
              Tax ID
            </label>
            <input
              type="text"
              value={userProfile.taxId}
              onChange={(e) => setUserProfile({...userProfile, taxId: e.target.value})}
              className={`w-full px-4 py-3 border ${borderClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-white text-gray-900'}`}
            />
          </div>
          
          <button
            onClick={() => alert('Profile updated successfully!')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Update Profile
          </button>
        </div>
      </div>

      {/* Investment Preferences */}
      <div className={`${cardBgClass} rounded-xl p-6 shadow-sm border ${borderClass}`}>
        <h3 className={`text-lg font-semibold ${textClass} mb-6`}>Investment Preferences</h3>
        
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${textSecondaryClass} mb-2`}>
              Risk Tolerance
            </label>
            <select
              value={userProfile.riskTolerance}
              onChange={(e) => setUserProfile({...userProfile, riskTolerance: e.target.value})}
              className={`w-full px-4 py-3 border ${borderClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-white text-gray-900'}`}
            >
              <option value="conservative">Conservative - Lower risk, steady returns</option>
              <option value="moderate">Moderate - Balanced risk and returns</option>
              <option value="aggressive">Aggressive - Higher risk, higher potential returns</option>
            </select>
          </div>
          
          <div>
            <label className={`block text-sm font-medium ${textSecondaryClass} mb-2`}>
              Investment Goals
            </label>
            <select
              value={userProfile.investmentGoals}
              onChange={(e) => setUserProfile({...userProfile, investmentGoals: e.target.value})}
              className={`w-full px-4 py-3 border ${borderClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-white text-gray-900'}`}
            >
              <option value="short-term">Short-term Growth (1-2 years)</option>
              <option value="medium-term">Medium-term Growth (3-5 years)</option>
              <option value="long-term-growth">Long-term Growth (5+ years)</option>
              <option value="retirement">Retirement Planning</option>
              <option value="income">Income Generation</option>
            </select>
          </div>

          <div className={`p-4 ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-blue-50'} rounded-lg`}>
            <h4 className={`font-medium ${textClass} mb-2`}>Current Risk Settings</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className={textSecondaryClass}>Maximum Risk per Trade:</span>
                <span className="text-blue-600 font-medium">1%</span>
              </div>
              <div className="flex justify-between">
                <span className={textSecondaryClass}>Portfolio Diversification:</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
              <div className="flex justify-between">
                <span className={textSecondaryClass}>Stop-loss Protection:</span>
                <span className="text-green-600 font-medium">Enabled</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => alert('Investment preferences updated!')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Update Preferences
          </button>
        </div>
      </div>

      {/* Enhanced Notification Preferences */}
      <div className={`${cardBgClass} rounded-xl p-6 shadow-sm border ${borderClass}`}>
        <h3 className={`text-lg font-semibold ${textClass} mb-4`}>
          Notification Preferences
        </h3>
        
        {/* Notification Delivery Methods */}
        <div className="space-y-4 mb-6">
          <h4 className={`font-medium ${textClass} mb-3`}>Delivery Methods</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.emailNotifications}
                onChange={(e) => {
                  const newSettings = {
                    ...notificationSettings,
                    emailNotifications: e.target.checked
                  };
                  setNotificationSettings(newSettings);
                  updateNotificationSettings({emailNotifications: e.target.checked});
                }}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className={`${textClass} text-sm`}>Email Notifications</span>
            </label>
            
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.pushNotifications}
                onChange={(e) => {
                  const newSettings = {
                    ...notificationSettings,
                    pushNotifications: e.target.checked
                  };
                  setNotificationSettings(newSettings);
                  updateNotificationSettings({pushNotifications: e.target.checked});
                  
                  // Request permission if enabling push notifications
                  if (e.target.checked) {
                    requestNotificationPermission();
                  }
                }}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className={`${textClass} text-sm`}>Push Notifications</span>
            </label>
            
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.smsNotifications}
                onChange={(e) => {
                  const newSettings = {
                    ...notificationSettings,
                    smsNotifications: e.target.checked
                  };
                  setNotificationSettings(newSettings);
                  updateNotificationSettings({smsNotifications: e.target.checked});
                }}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className={`${textClass} text-sm`}>SMS Notifications</span>
            </label>
          </div>
        </div>
        
        {/* Notification Categories */}
        <div className="space-y-4 mb-6">
          <h4 className={`font-medium ${textClass} mb-3`}>Notification Categories</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(notificationSettings.categories).map(([category, enabled]) => (
              <label key={category} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => {
                    const newCategories = {
                      ...notificationSettings.categories,
                      [category]: e.target.checked
                    };
                    const newSettings = {
                      ...notificationSettings,
                      categories: newCategories
                    };
                    setNotificationSettings(newSettings);
                    updateNotificationSettings({categories: newCategories});
                  }}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className={`${textClass} text-sm capitalize`}>
                  {category.replace('_', ' ')} Notifications
                </span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Priority Settings */}
        <div className="space-y-4 mb-6">
          <h4 className={`font-medium ${textClass} mb-3`}>Priority Levels</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(notificationSettings.prioritySettings).map(([priority, enabled]) => (
              <label key={priority} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => {
                    const newPrioritySettings = {
                      ...notificationSettings.prioritySettings,
                      [priority]: e.target.checked
                    };
                    const newSettings = {
                      ...notificationSettings,
                      prioritySettings: newPrioritySettings
                    };
                    setNotificationSettings(newSettings);
                    updateNotificationSettings({prioritySettings: newPrioritySettings});
                  }}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className={`${textClass} text-sm capitalize flex items-center space-x-2`}>
                  <span className={`w-2 h-2 rounded-full ${
                    priority === 'critical' ? 'bg-red-500' :
                    priority === 'high' ? 'bg-orange-500' :
                    priority === 'medium' ? 'bg-blue-500' :
                    'bg-gray-500'
                  }`}></span>
                  <span>{priority} Priority</span>
                </span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Quiet Hours */}
        <div className="space-y-4 mb-6">
          <h4 className={`font-medium ${textClass} mb-3`}>Quiet Hours</h4>
          <label className="flex items-center space-x-3 cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={notificationSettings.quietHours.enabled}
              onChange={(e) => {
                const newQuietHours = {
                  ...notificationSettings.quietHours,
                  enabled: e.target.checked
                };
                const newSettings = {
                  ...notificationSettings,
                  quietHours: newQuietHours
                };
                setNotificationSettings(newSettings);
                updateNotificationSettings({quietHours: newQuietHours});
              }}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className={`${textClass} text-sm`}>Enable Quiet Hours</span>
          </label>
          
          {notificationSettings.quietHours.enabled && (
            <div className="grid grid-cols-2 gap-4 ml-7">
              <div>
                <label className={`block text-sm font-medium ${textSecondaryClass} mb-2`}>
                  Start Time
                </label>
                <input
                  type="time"
                  value={notificationSettings.quietHours.startTime}
                  onChange={(e) => {
                    const newQuietHours = {
                      ...notificationSettings.quietHours,
                      startTime: e.target.value
                    };
                    const newSettings = {
                      ...notificationSettings,
                      quietHours: newQuietHours
                    };
                    setNotificationSettings(newSettings);
                    updateNotificationSettings({quietHours: newQuietHours});
                  }}
                  className={`w-full px-3 py-2 border ${borderClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-white text-gray-900'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${textSecondaryClass} mb-2`}>
                  End Time
                </label>
                <input
                  type="time"
                  value={notificationSettings.quietHours.endTime}
                  onChange={(e) => {
                    const newQuietHours = {
                      ...notificationSettings.quietHours,
                      endTime: e.target.value
                    };
                    const newSettings = {
                      ...notificationSettings,
                      quietHours: newQuietHours
                    };
                    setNotificationSettings(newSettings);
                    updateNotificationSettings({quietHours: newQuietHours});
                  }}
                  className={`w-full px-3 py-2 border ${borderClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-white text-gray-900'}`}
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Frequency Limits */}
        <div className="space-y-4">
          <h4 className={`font-medium ${textClass} mb-3`}>Frequency Limits</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${textSecondaryClass} mb-2`}>
                Daily Limit
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={notificationSettings.frequencyLimits.dailyLimit}
                onChange={(e) => {
                  const newFrequencyLimits = {
                    ...notificationSettings.frequencyLimits,
                    dailyLimit: parseInt(e.target.value) || 50
                  };
                  const newSettings = {
                    ...notificationSettings,
                    frequencyLimits: newFrequencyLimits
                  };
                  setNotificationSettings(newSettings);
                  updateNotificationSettings({frequencyLimits: newFrequencyLimits});
                }}
                className={`w-full px-3 py-2 border ${borderClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-white text-gray-900'}`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${textSecondaryClass} mb-2`}>
                Hourly Limit
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={notificationSettings.frequencyLimits.hourlyLimit}
                onChange={(e) => {
                  const newFrequencyLimits = {
                    ...notificationSettings.frequencyLimits,
                    hourlyLimit: parseInt(e.target.value) || 10
                  };
                  const newSettings = {
                    ...notificationSettings,
                    frequencyLimits: newFrequencyLimits
                  };
                  setNotificationSettings(newSettings);
                  updateNotificationSettings({frequencyLimits: newFrequencyLimits});
                }}
                className={`w-full px-3 py-2 border ${borderClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-white text-gray-900'}`}
              />
            </div>
          </div>
          <p className={`text-xs ${textSecondaryClass}`}>
            Limit the number of notifications you receive to avoid overwhelming your inbox
          </p>
        </div>
      </div>

      {/* Profit Sharing History */}
      <div className={`${cardBgClass} rounded-xl p-6 shadow-sm border ${borderClass}`}>
        <h3 className={`text-lg font-semibold ${textClass} mb-4`}>Monthly Profit Distributions</h3>
        
        <div className="space-y-4">
          {/* Sample data - in real app this would come from API */}
          {[
            { month: "January 2024", amount: 1250.50, status: "Paid", date: "2024-02-01", reference: "PROFIT-202401-ABC123" },
            { month: "February 2024", amount: 2100.75, status: "Paid", date: "2024-03-01", reference: "PROFIT-202402-ABC123" },
            { month: "March 2024", amount: 0, status: "No Distribution", date: "2024-04-01", reference: "N/A", note: "Loss carried forward" },
            { month: "April 2024", amount: 3250.25, status: "Paid", date: "2024-05-01", reference: "PROFIT-202404-ABC123" },
          ].map((distribution, index) => (
            <div key={index} className={`p-4 rounded-lg border ${borderClass} ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className={`font-medium ${textClass}`}>{distribution.month}</h4>
                  <p className={`text-sm ${textSecondaryClass}`}>
                    Processed: {distribution.date}
                    {distribution.reference !== "N/A" && (
                      <span className="ml-2">• Ref: {distribution.reference}</span>
                    )}
                  </p>
                  {distribution.note && (
                    <p className={`text-sm text-orange-500 mt-1`}>{distribution.note}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    distribution.amount > 0 ? 'text-green-500' : 
                    distribution.status === 'No Distribution' ? 'text-orange-500' : 'text-gray-500'
                  }`}>
                    {distribution.amount > 0 ? `+$${distribution.amount.toLocaleString()}` : 
                     distribution.status === 'No Distribution' ? 'No Distribution' : '$0.00'}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    distribution.status === 'Paid' ? 'bg-green-100 text-green-800' :
                    distribution.status === 'No Distribution' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {distribution.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className={`mt-6 p-4 ${theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'} rounded-lg`}>
          <h4 className={`font-medium ${textClass} mb-2`}>How Profit Sharing Works</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className={textSecondaryClass}>0-4% Annual Return:</span>
              <span className="text-green-600 font-medium">You get 80%</span>
            </div>
            <div className="flex justify-between">
              <span className={textSecondaryClass}>4-8% Annual Return:</span>
              <span className="text-green-600 font-medium">You get 70%</span>
            </div>
            <div className="flex justify-between">
              <span className={textSecondaryClass}>8-12% Annual Return:</span>
              <span className="text-green-600 font-medium">You get 60%</span>
            </div>
            <div className="flex justify-between">
              <span className={textSecondaryClass}>12%+ Annual Return:</span>
              <span className="text-green-600 font-medium">You get 50%</span>
            </div>
          </div>
          <p className={`text-xs ${textSecondaryClass} mt-3`}>
            * Profit distributions are processed automatically at 9:00 AM on the 1st of each month. 
            Losses are carried forward to subsequent months.
          </p>
        </div>
      </div>
      <div className={`${cardBgClass} rounded-xl p-6 shadow-sm border ${borderClass}`}>
        <h3 className={`text-lg font-semibold ${textClass} mb-6`}>Account Actions</h3>
        
        <div className="space-y-4">
          <button
            onClick={() => alert('Statement generated and sent to your email')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Download Account Statement</span>
          </button>
          
          <button
            onClick={() => alert('Tax documents will be emailed to you')}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <FileText className="w-5 h-5" />
            <span>Request Tax Documents</span>
          </button>
          
          <button
            onClick={() => alert('Support team will contact you within 24 hours')}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <User className="w-5 h-5" />
            <span>Contact Support</span>
          </button>
          
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                if (confirm('Are you sure you want to close your account? This action cannot be undone.')) {
                  alert('Account closure request submitted. You will be contacted for verification.');
                }
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Close Account
            </button>
            <p className={`text-xs ${textSecondaryClass} mt-2 text-center`}>
              Account closure requires identity verification and may take 3-5 business days
            </p>
          </div>
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
        {activeTab === 'settings' && renderSettings()}
      </main>

      {/* Bottom Navigation - Mobile */}
      <nav className={`fixed bottom-0 left-0 right-0 ${cardBgClass} border-t ${borderClass} md:hidden`}>
        <div className="grid grid-cols-5 py-2">
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