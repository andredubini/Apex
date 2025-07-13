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
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity,
  Plus,
  Edit3,
  Save,
  LogOut,
  Calendar,
  Target,
  AlertTriangle,
  Sun,
  Moon,
  Bell,
  Menu,
  X,
  Home,
  FileText,
  UserCheck,
  BarChart3,
  Settings,
  Shield,
  MessageSquare,
  Database,
  PieChart as PieChartIcon,
  Filter,
  Download,
  Upload,
  Send,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Search,
  Globe,
  Clock,
  TrendingDown
} from "lucide-react";

const AdminDashboard = () => {
  const { user, logout, sampleTradingData } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAddingReport, setIsAddingReport] = useState(false);
  const [selectedInvestor, setSelectedInvestor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [fundSettings, setFundSettings] = useState({
    minimumInvestment: 10000,
    managementFee: 0,
    performanceFee: 20,
    riskLimit: 1,
    tradingHours: "09:30-16:00",
    autoRebalance: true,
    weeklyReporting: true
  });
  const [newReport, setNewReport] = useState({
    week: "",
    startBalance: "",
    endBalance: "",
    trades: "",
    successRate: "",
    notes: ""
  });

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

    // Initialize notifications
    setNotifications([
      { id: 1, type: 'deposit', message: 'New deposit of $50,000 from John Investor', time: '2 hours ago', read: false },
      { id: 2, type: 'alert', message: 'Weekly report generation completed', time: '1 day ago', read: false },
      { id: 3, type: 'system', message: 'System backup completed successfully', time: '2 days ago', read: true },
      { id: 4, type: 'withdrawal', message: 'Withdrawal request from Sarah Miller - $25,000', time: '3 days ago', read: false }
    ]);
  }, []);

  // Mock investor data - updated minimum investment references
  const investors = [
    { id: 1, name: "John Investor", email: "investor@example.com", balance: 150000, invested: 100000, joinDate: "2024-01-15", phone: "+1-555-0123", status: "active", riskProfile: "moderate" },
    { id: 2, name: "Sarah Miller", email: "sarah@example.com", balance: 275000, invested: 200000, joinDate: "2023-11-20", phone: "+1-555-0124", status: "active", riskProfile: "aggressive" },
    { id: 3, name: "Robert Chen", email: "robert@example.com", balance: 425000, invested: 350000, joinDate: "2023-08-10", phone: "+1-555-0125", status: "active", riskProfile: "conservative" },
    { id: 4, name: "Emily Davis", email: "emily@example.com", balance: 185000, invested: 150000, joinDate: "2024-02-05", phone: "+1-555-0126", status: "pending", riskProfile: "moderate" },
    { id: 5, name: "Michael Johnson", email: "michael@example.com", balance: 15000, invested: 10000, joinDate: "2024-03-01", phone: "+1-555-0127", status: "active", riskProfile: "moderate" },
    { id: 6, name: "Lisa Park", email: "lisa@example.com", balance: 320000, invested: 250000, joinDate: "2023-12-15", phone: "+1-555-0128", status: "active", riskProfile: "aggressive" },
    { id: 7, name: "David Wilson", email: "david@example.com", balance: 95000, invested: 80000, joinDate: "2024-01-28", phone: "+1-555-0129", status: "inactive", riskProfile: "conservative" }
  ];

  // Filter investors based on search
  const filteredInvestors = investors.filter(investor => 
    investor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    investor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate admin metrics
  const totalInvestors = investors.length;
  const totalAssets = investors.reduce((sum, inv) => sum + inv.balance, 0);
  const totalInvested = investors.reduce((sum, inv) => sum + inv.invested, 0);
  const totalProfits = totalAssets - totalInvested;
  const avgReturn = ((totalProfits / totalInvested) * 100);

  // Recent performance data
  const recentPerformance = sampleTradingData.slice(-12).map(week => ({
    week: week.week.replace("Week ", "W"),
    profit: week.profit,
    trades: week.trades,
    successRate: week.successRate,
    return: week.returnPercentage
  }));

  const handleLogout = () => {
    logout();
  };

  // Theme classes
  const bgClass = theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50';
  const cardBgClass = theme === 'dark' ? 'bg-slate-800/50' : 'bg-white';
  const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondaryClass = theme === 'dark' ? 'text-slate-300' : 'text-gray-600';
  const borderClass = theme === 'dark' ? 'border-slate-700' : 'border-gray-200';
  const headerBgClass = theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200';

  const handleAddReport = () => {
    if (newReport.week && newReport.startBalance && newReport.endBalance) {
      const profit = parseFloat(newReport.endBalance) - parseFloat(newReport.startBalance);
      const returnPercentage = (profit / parseFloat(newReport.startBalance)) * 100;
      
      alert(`Weekly report added successfully!\nProfit: $${profit.toLocaleString()}\nReturn: ${returnPercentage.toFixed(2)}%`);
      
      setNewReport({
        week: "",
        startBalance: "",
        endBalance: "",
        trades: "",
        successRate: "",
        notes: ""
      });
      setIsAddingReport(false);
    } else {
      alert("Please fill in all required fields");
    }
  };

  const handleUpdateFundSettings = (newSettings) => {
    setFundSettings(newSettings);
    alert('Fund settings updated successfully!');
  };

  const handleSendNotification = (investorId, message) => {
    alert(`Notification sent to investor ${investorId}: ${message}`);
  };

  const handleExportData = (dataType) => {
    alert(`Exporting ${dataType} data...`);
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Risk Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${cardBgClass} backdrop-blur-md p-6 rounded-xl border ${borderClass} shadow-sm`}>
          <h3 className={`text-xl font-semibold ${textClass} mb-4`}>Risk Profile Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={riskAnalysisData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {riskAnalysisData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className={`${cardBgClass} backdrop-blur-md p-6 rounded-xl border ${borderClass} shadow-sm`}>
          <h3 className={`text-xl font-semibold ${textClass} mb-4`}>Performance vs Benchmarks</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#F3F4F6'} />
              <XAxis dataKey="week" stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
              <YAxis stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: theme === 'dark' ? '#1F2937' : 'white', 
                  border: `1px solid ${theme === 'dark' ? '#374151' : '#E5E7EB'}`,
                  borderRadius: '8px',
                  color: theme === 'dark' ? '#F3F4F6' : '#111827'
                }}
              />
              <Line type="monotone" dataKey="ourFund" stroke="#3B82F6" strokeWidth={3} name="Our Fund" />
              <Line type="monotone" dataKey="sp500" stroke="#10B981" strokeWidth={2} name="S&P 500" />
              <Line type="monotone" dataKey="benchmark" stroke="#F59E0B" strokeWidth={2} name="Benchmark" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Advanced Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`${cardBgClass} backdrop-blur-md p-6 rounded-xl border ${borderClass} shadow-sm`}>
          <h4 className={`font-semibold ${textClass} mb-4`}>Sharpe Ratio</h4>
          <div className="text-3xl font-bold text-blue-400 mb-2">1.85</div>
          <div className={`${textSecondaryClass} text-sm`}>Risk-adjusted return</div>
        </div>
        
        <div className={`${cardBgClass} backdrop-blur-md p-6 rounded-xl border ${borderClass} shadow-sm`}>
          <h4 className={`font-semibold ${textClass} mb-4`}>Max Drawdown</h4>
          <div className="text-3xl font-bold text-red-400 mb-2">-2.1%</div>
          <div className={`${textSecondaryClass} text-sm`}>Historical maximum loss</div>
        </div>
        
        <div className={`${cardBgClass} backdrop-blur-md p-6 rounded-xl border ${borderClass} shadow-sm`}>
          <h4 className={`font-semibold ${textClass} mb-4`}>Volatility</h4>
          <div className="text-3xl font-bold text-orange-400 mb-2">8.2%</div>
          <div className={`${textSecondaryClass} text-sm`}>Annual volatility</div>
        </div>

        <div className={`${cardBgClass} backdrop-blur-md p-6 rounded-xl border ${borderClass} shadow-sm`}>
          <h4 className={`font-semibold ${textClass} mb-4`}>Alpha</h4>
          <div className="text-3xl font-bold text-green-400 mb-2">+3.2%</div>
          <div className={`${textSecondaryClass} text-sm`}>Excess return vs benchmark</div>
        </div>
      </div>

      {/* Detailed Performance Area Chart */}
      <div className={`${cardBgClass} backdrop-blur-md p-6 rounded-xl border ${borderClass} shadow-sm`}>
        <h3 className={`text-xl font-semibold ${textClass} mb-4`}>Cumulative Performance</h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={recentPerformance}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#F3F4F6'} />
            <XAxis dataKey="week" stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
            <YAxis stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: theme === 'dark' ? '#1F2937' : 'white', 
                border: `1px solid ${theme === 'dark' ? '#374151' : '#E5E7EB'}`,
                borderRadius: '8px',
                color: theme === 'dark' ? '#F3F4F6' : '#111827'
              }}
            />
            <Area
              type="monotone"
              dataKey="profit"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.3}
              name="Weekly Profit"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      {/* Fund Settings */}
      <div className={`${cardBgClass} backdrop-blur-md p-6 rounded-xl border ${borderClass} shadow-sm`}>
        <h3 className={`text-xl font-semibold ${textClass} mb-6`}>Fund Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block text-sm font-medium ${textSecondaryClass} mb-2`}>
              Minimum Investment ($)
            </label>
            <input
              type="number"
              value={fundSettings.minimumInvestment}
              onChange={(e) => setFundSettings({...fundSettings, minimumInvestment: parseInt(e.target.value)})}
              className={`w-full px-3 py-2 border ${borderClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-slate-600 text-white' : 'bg-white text-gray-900'}`}
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium ${textSecondaryClass} mb-2`}>
              Management Fee (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={fundSettings.managementFee}
              onChange={(e) => setFundSettings({...fundSettings, managementFee: parseFloat(e.target.value)})}
              className={`w-full px-3 py-2 border ${borderClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-slate-600 text-white' : 'bg-white text-gray-900'}`}
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium ${textSecondaryClass} mb-2`}>
              Performance Fee (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={fundSettings.performanceFee}
              onChange={(e) => setFundSettings({...fundSettings, performanceFee: parseFloat(e.target.value)})}
              className={`w-full px-3 py-2 border ${borderClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-slate-600 text-white' : 'bg-white text-gray-900'}`}
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium ${textSecondaryClass} mb-2`}>
              Maximum Risk Per Trade (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={fundSettings.riskLimit}
              onChange={(e) => setFundSettings({...fundSettings, riskLimit: parseFloat(e.target.value)})}
              className={`w-full px-3 py-2 border ${borderClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-slate-600 text-white' : 'bg-white text-gray-900'}`}
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium ${textSecondaryClass} mb-2`}>
              Trading Hours
            </label>
            <input
              type="text"
              value={fundSettings.tradingHours}
              onChange={(e) => setFundSettings({...fundSettings, tradingHours: e.target.value})}
              className={`w-full px-3 py-2 border ${borderClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-slate-600 text-white' : 'bg-white text-gray-900'}`}
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="autoRebalance"
              checked={fundSettings.autoRebalance}
              onChange={(e) => setFundSettings({...fundSettings, autoRebalance: e.target.checked})}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="autoRebalance" className={`text-sm font-medium ${textSecondaryClass}`}>
              Auto Rebalancing
            </label>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={() => handleUpdateFundSettings(fundSettings)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Update Settings
          </button>
        </div>
      </div>

      {/* Risk Management Settings */}
      <div className={`${cardBgClass} backdrop-blur-md p-6 rounded-xl border ${borderClass} shadow-sm`}>
        <h3 className={`text-xl font-semibold ${textClass} mb-6`}>Risk Management</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div>
              <h4 className={`font-medium ${textClass}`}>Multi-Level Risk System</h4>
              <p className={`text-sm ${textSecondaryClass}`}>Active monitoring with 1% maximum risk per trade</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span className="text-green-500 font-medium">Active</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div>
              <h4 className={`font-medium ${textClass}`}>Weekly Risk Reports</h4>
              <p className={`text-sm ${textSecondaryClass}`}>Automated loss monitoring and investor notifications</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              <span className="text-blue-500 font-medium">Enabled</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div>
              <h4 className={`font-medium ${textClass}`}>Stop-Loss Automation</h4>
              <p className={`text-sm ${textSecondaryClass}`}>Automatic position closure at predefined levels</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
              <span className="text-orange-500 font-medium">Configured</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profit Distribution Management */}
      <div className={`${cardBgClass} backdrop-blur-md p-6 rounded-xl border ${borderClass} shadow-sm`}>
        <h3 className={`text-xl font-semibold ${textClass} mb-6`}>Automated Profit Distribution</h3>
        
        <div className="space-y-6">
          {/* Next Distribution Info */}
          <div className={`p-4 ${theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'} rounded-lg`}>
            <h4 className={`font-medium ${textClass} mb-2`}>Next Scheduled Distribution</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className={textSecondaryClass}>Date:</span>
                <div className="font-medium text-blue-600">January 1, 2025 at 9:00 AM</div>
              </div>
              <div>
                <span className={textSecondaryClass}>Frequency:</span>
                <div className={`font-medium ${textClass}`}>Monthly (1st of each month)</div>
              </div>
              <div>
                <span className={textSecondaryClass}>Status:</span>
                <div className="font-medium text-green-600">Active & Scheduled</div>
              </div>
            </div>
          </div>

          {/* Distribution History */}
          <div>
            <h4 className={`font-medium ${textClass} mb-4`}>Recent Distributions</h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${borderClass}`}>
                    <th className={`text-left py-2 px-3 ${textSecondaryClass} font-medium`}>Period</th>
                    <th className={`text-left py-2 px-3 ${textSecondaryClass} font-medium`}>Gross Profit</th>
                    <th className={`text-left py-2 px-3 ${textSecondaryClass} font-medium`}>Carry Over</th>
                    <th className={`text-left py-2 px-3 ${textSecondaryClass} font-medium`}>Distributed</th>
                    <th className={`text-left py-2 px-3 ${textSecondaryClass} font-medium`}>Fund Share</th>
                    <th className={`text-left py-2 px-3 ${textSecondaryClass} font-medium`}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { period: "Dec 2024", grossProfit: 45000, carryOver: 0, distributed: 28500, fundShare: 16500, status: "Completed" },
                    { period: "Nov 2024", grossProfit: 32000, carryOver: 0, distributed: 20800, fundShare: 11200, status: "Completed" },
                    { period: "Oct 2024", grossProfit: -15000, carryOver: 15000, distributed: 0, fundShare: 0, status: "No Distribution" },
                    { period: "Sep 2024", grossProfit: 38000, carryOver: 0, distributed: 24700, fundShare: 13300, status: "Completed" },
                  ].map((dist, index) => (
                    <tr key={index} className={`border-b ${borderClass} hover:${theme === 'dark' ? 'bg-slate-700/25' : 'bg-gray-50/50'}`}>
                      <td className={`py-3 px-3 ${textClass} font-medium`}>{dist.period}</td>
                      <td className={`py-3 px-3 ${dist.grossProfit >= 0 ? 'text-green-500' : 'text-red-500'} font-medium`}>
                        ${dist.grossProfit.toLocaleString()}
                      </td>
                      <td className={`py-3 px-3 ${textSecondaryClass}`}>
                        {dist.carryOver > 0 ? `$${dist.carryOver.toLocaleString()}` : '-'}
                      </td>
                      <td className={`py-3 px-3 text-green-500 font-medium`}>
                        ${dist.distributed.toLocaleString()}
                      </td>
                      <td className={`py-3 px-3 text-blue-500 font-medium`}>
                        ${dist.fundShare.toLocaleString()}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          dist.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          dist.status === 'No Distribution' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {dist.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Distribution Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => alert('Manual profit distribution triggered. This will process payments for all active investors based on current month performance.')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <DollarSign className="w-5 h-5 mr-2" />
              Trigger Manual Distribution
            </button>
            
            <button
              onClick={() => alert('Distribution settings and profit-sharing tiers can be configured here.')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <Settings className="w-5 h-5 mr-2" />
              Configure Settings
            </button>
          </div>

          {/* System Status */}
          <div className={`p-4 ${theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'} rounded-lg`}>
            <h4 className={`font-medium ${textClass} mb-2`}>System Status</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className={textSecondaryClass}>Scheduler Status:</span>
                <span className="text-green-600 font-medium flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Running
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={textSecondaryClass}>Next Execution:</span>
                <span className={`font-medium ${textClass}`}>January 1, 2025 09:00 UTC</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={textSecondaryClass}>Profit Sharing Model:</span>
                <span className={`font-medium ${textClass}`}>Multi-tier (80/70/60/50%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={textSecondaryClass}>Carry-over Losses:</span>
                <span className={`font-medium ${textClass}`}>$0 (All cleared)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={`${cardBgClass} backdrop-blur-md p-6 rounded-xl border ${borderClass} shadow-sm`}>
        <h3 className={`text-xl font-semibold ${textClass} mb-6`}>System Health</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">99.9%</div>
            <div className={`text-sm ${textSecondaryClass}`}>Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">1.2s</div>
            <div className={`text-sm ${textSecondaryClass}`}>Avg Response Time</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">256-bit</div>
            <div className={`text-sm ${textSecondaryClass}`}>SSL Encryption</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCommunications = () => (
    <div className="space-y-6">
      {/* Notifications Panel */}
      <div className={`${cardBgClass} backdrop-blur-md p-6 rounded-xl border ${borderClass} shadow-sm`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl font-semibold ${textClass}`}>Notifications</h3>
          <button className="text-blue-400 hover:text-blue-300 text-sm">
            Mark All Read
          </button>
        </div>
        
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div key={notification.id} className={`p-4 rounded-lg border ${borderClass} ${notification.read ? 'opacity-60' : ''} ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${
                      notification.type === 'deposit' ? 'bg-green-400' :
                      notification.type === 'withdrawal' ? 'bg-red-400' :
                      notification.type === 'alert' ? 'bg-yellow-400' :
                      'bg-blue-400'
                    }`}></span>
                    <span className={`text-sm font-medium ${textClass}`}>
                      {notification.type.toUpperCase()}
                    </span>
                  </div>
                  <p className={`${textSecondaryClass} text-sm`}>{notification.message}</p>
                  <p className={`${textSecondaryClass} text-xs mt-1`}>{notification.time}</p>
                </div>
                <button
                  onClick={() => markNotificationAsRead(notification.id)}
                  className="text-blue-400 hover:text-blue-300 text-sm ml-4"
                >
                  {notification.read ? 'Read' : 'Mark Read'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message Center */}
      <div className={`${cardBgClass} backdrop-blur-md p-6 rounded-xl border ${borderClass} shadow-sm`}>
        <h3 className={`text-xl font-semibold ${textClass} mb-6`}>Message Center</h3>
        
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${textSecondaryClass} mb-2`}>
              Send to
            </label>
            <select className={`w-full px-3 py-2 border ${borderClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-slate-600 text-white' : 'bg-white text-gray-900'}`}>
              <option>All Investors</option>
              <option>Active Investors Only</option>
              <option>Specific Investor</option>
            </select>
          </div>
          
          <div>
            <label className={`block text-sm font-medium ${textSecondaryClass} mb-2`}>
              Message Type
            </label>
            <select className={`w-full px-3 py-2 border ${borderClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-slate-600 text-white' : 'bg-white text-gray-900'}`}>
              <option>Weekly Report</option>
              <option>Performance Update</option>
              <option>Important Notice</option>
              <option>Custom Message</option>
            </select>
          </div>
          
          <div>
            <label className={`block text-sm font-medium ${textSecondaryClass} mb-2`}>
              Message
            </label>
            <textarea
              rows={4}
              className={`w-full px-3 py-2 border ${borderClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-slate-600 text-white placeholder-slate-400' : 'bg-white text-gray-900 placeholder-gray-400'}`}
              placeholder="Enter your message..."
            ></textarea>
          </div>
          
          <div className="flex space-x-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center">
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </button>
            <button className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center">
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Risk analysis data
  const riskAnalysisData = [
    { name: 'Conservative', value: 2, color: '#10B981' },
    { name: 'Moderate', value: 3, color: '#F59E0B' },
    { name: 'Aggressive', value: 2, color: '#EF4444' }
  ];

  // Performance comparison data
  const performanceData = sampleTradingData.slice(-12).map(week => ({
    week: week.week.replace("Week ", "W"),
    ourFund: week.returnPercentage,
    sp500: (Math.random() * 1.5 + 0.2), // Mock S&P 500 data
    benchmark: (Math.random() * 1.2 + 0.3) // Mock benchmark data
  }));

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Admin Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`${cardBgClass} backdrop-blur-md p-6 rounded-xl border ${borderClass} shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${textSecondaryClass} text-sm`}>Total Investors</p>
              <p className={`text-2xl font-bold ${textClass}`}>{totalInvestors}</p>
            </div>
            <div className="bg-blue-600 p-3 rounded-full">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-green-400">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span className="text-sm">+2 this month</span>
          </div>
        </div>

        <div className={`${cardBgClass} backdrop-blur-md p-6 rounded-xl border ${borderClass} shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${textSecondaryClass} text-sm`}>Assets Under Management</p>
              <p className={`text-2xl font-bold ${textClass}`}>${totalAssets.toLocaleString()}</p>
            </div>
            <div className="bg-green-600 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-green-400">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span className="text-sm">+{avgReturn.toFixed(1)}% Total Return</span>
          </div>
        </div>

        <div className={`${cardBgClass} backdrop-blur-md p-6 rounded-xl border ${borderClass} shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${textSecondaryClass} text-sm`}>Total Profits Generated</p>
              <p className={`text-2xl font-bold ${textClass}`}>${totalProfits.toLocaleString()}</p>
            </div>
            <div className="bg-purple-600 p-3 rounded-full">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-green-400">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span className="text-sm">This Year</span>
          </div>
        </div>

        <div className={`${cardBgClass} backdrop-blur-md p-6 rounded-xl border ${borderClass} shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${textSecondaryClass} text-sm`}>Avg Weekly Return</p>
              <p className={`text-2xl font-bold ${textClass}`}>
                {(recentPerformance.reduce((sum, week) => sum + week.return, 0) / recentPerformance.length).toFixed(2)}%
              </p>
            </div>
            <div className="bg-orange-600 p-3 rounded-full">
              <Activity className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-green-400">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span className="text-sm">Last 12 weeks</span>
          </div>
        </div>
      </div>

      {/* Performance Overview Chart */}
      <div className={`${cardBgClass} backdrop-blur-md p-6 rounded-xl border ${borderClass} shadow-sm`}>
        <h3 className={`text-xl font-semibold ${textClass} mb-4`}>Fund Performance Overview</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={recentPerformance}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#F3F4F6'} />
            <XAxis dataKey="week" stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
            <YAxis stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: theme === 'dark' ? '#1F2937' : 'white', 
                border: `1px solid ${theme === 'dark' ? '#374151' : '#E5E7EB'}`,
                borderRadius: '8px',
                color: theme === 'dark' ? '#F3F4F6' : '#111827'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="return" 
              stroke="#3B82F6" 
              strokeWidth={3}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              name="Weekly Return %"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Investor Summary */}
      <div className={`${cardBgClass} backdrop-blur-md p-6 rounded-xl border ${borderClass} shadow-sm`}>
        <h3 className={`text-xl font-semibold ${textClass} mb-4`}>Recent Investor Activity</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={theme === 'dark' ? 'bg-slate-700/50 p-4 rounded-lg' : 'bg-gray-50 p-4 rounded-lg'}>
              <h4 className={`font-semibold ${textClass} mb-2`}>Top Performing Accounts</h4>
              <div className="space-y-2">
                {investors.slice(0, 3).map((investor) => (
                  <div key={investor.id} className="flex justify-between text-sm">
                    <span className={textSecondaryClass}>{investor.name}</span>
                    <span className="text-green-400">
                      +{(((investor.balance - investor.invested) / investor.invested) * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className={theme === 'dark' ? 'bg-slate-700/50 p-4 rounded-lg' : 'bg-gray-50 p-4 rounded-lg'}>
              <h4 className={`font-semibold ${textClass} mb-2`}>Recent Deposits</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={textSecondaryClass}>John Investor</span>
                  <span className="text-blue-400">+$50,000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={textSecondaryClass}>Sarah Miller</span>
                  <span className="text-blue-400">+$25,000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={textSecondaryClass}>Michael Johnson</span>
                  <span className="text-blue-400">+$10,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div className={`${cardBgClass} backdrop-blur-md p-6 rounded-xl border ${borderClass} shadow-sm`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl font-semibold ${textClass}`}>Weekly Trading Reports Management</h3>
          <button
            onClick={() => setIsAddingReport(!isAddingReport)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Weekly Report
          </button>
        </div>

        {/* Add Report Form */}
        {isAddingReport && (
          <div className={`${theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'} p-6 rounded-lg border ${borderClass} mb-6`}>
            <h4 className={`font-semibold ${textClass} mb-4`}>Add New Weekly Report</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${textSecondaryClass} mb-2`}>Week Period</label>
                <input
                  type="text"
                  value={newReport.week}
                  onChange={(e) => setNewReport({...newReport, week: e.target.value})}
                  placeholder="e.g., Week 53"
                  className={`w-full px-3 py-2 border ${borderClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-slate-600 text-white placeholder-slate-400' : 'bg-white text-gray-900 placeholder-gray-400'}`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${textSecondaryClass} mb-2`}>Start Balance</label>
                <input
                  type="number"
                  value={newReport.startBalance}
                  onChange={(e) => setNewReport({...newReport, startBalance: e.target.value})}
                  placeholder="100000"
                  className={`w-full px-3 py-2 border ${borderClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-slate-600 text-white placeholder-slate-400' : 'bg-white text-gray-900 placeholder-gray-400'}`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${textSecondaryClass} mb-2`}>End Balance</label>
                <input
                  type="number"
                  value={newReport.endBalance}
                  onChange={(e) => setNewReport({...newReport, endBalance: e.target.value})}
                  placeholder="102500"
                  className={`w-full px-3 py-2 border ${borderClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-slate-600 text-white placeholder-slate-400' : 'bg-white text-gray-900 placeholder-gray-400'}`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${textSecondaryClass} mb-2`}>Number of Trades</label>
                <input
                  type="number"
                  value={newReport.trades}
                  onChange={(e) => setNewReport({...newReport, trades: e.target.value})}
                  placeholder="25"
                  className={`w-full px-3 py-2 border ${borderClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-slate-600 text-white placeholder-slate-400' : 'bg-white text-gray-900 placeholder-gray-400'}`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${textSecondaryClass} mb-2`}>Success Rate (%)</label>
                <input
                  type="number"
                  value={newReport.successRate}
                  onChange={(e) => setNewReport({...newReport, successRate: e.target.value})}
                  placeholder="85.5"
                  className={`w-full px-3 py-2 border ${borderClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-slate-600 text-white placeholder-slate-400' : 'bg-white text-gray-900 placeholder-gray-400'}`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${textSecondaryClass} mb-2`}>Notes</label>
                <input
                  type="text"
                  value={newReport.notes}
                  onChange={(e) => setNewReport({...newReport, notes: e.target.value})}
                  placeholder="Market conditions, strategy notes..."
                  className={`w-full px-3 py-2 border ${borderClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-slate-600 text-white placeholder-slate-400' : 'bg-white text-gray-900 placeholder-gray-400'}`}
                />
              </div>
            </div>
            
            <div className="flex space-x-4 mt-4">
              <button
                onClick={handleAddReport}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Report
              </button>
              <button
                onClick={() => setIsAddingReport(false)}
                className={`${theme === 'dark' ? 'bg-slate-600 hover:bg-slate-700' : 'bg-gray-600 hover:bg-gray-700'} text-white px-4 py-2 rounded-lg font-medium transition-colors`}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Reports List */}
        <div className="space-y-4">
          <h4 className={`font-semibold ${textClass}`}>Recent Reports</h4>
          {sampleTradingData.slice(-8).reverse().map((week) => (
            <div key={week.id} className={`${theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'} p-4 rounded-lg border ${borderClass}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h5 className={`font-semibold ${textClass}`}>{week.week} - {week.date}</h5>
                  <p className={`${textSecondaryClass} text-sm`}>
                    Start: ${week.startBalance.toLocaleString()} → End: ${week.endBalance.toLocaleString()}
                  </p>
                  <p className={`${textSecondaryClass} text-sm`}>
                    {week.trades} trades • {week.successRate.toFixed(1)}% success rate
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-semibold text-lg">
                    +${week.profit.toLocaleString()}
                  </p>
                  <p className="text-green-400 text-sm">
                    +{week.returnPercentage.toFixed(2)}% return
                  </p>
                  <button className="text-blue-400 hover:text-blue-300 text-sm mt-1">
                    <Edit3 className="w-4 h-4 inline mr-1" />
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Analytics */}
      <div className={`${cardBgClass} backdrop-blur-md p-6 rounded-xl border ${borderClass} shadow-sm`}>
        <h3 className={`text-xl font-semibold ${textClass} mb-4`}>Trading Performance Analytics</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={recentPerformance.slice(-6)}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#F3F4F6'} />
            <XAxis dataKey="week" stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
            <YAxis stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: theme === 'dark' ? '#1F2937' : 'white', 
                border: `1px solid ${theme === 'dark' ? '#374151' : '#E5E7EB'}`,
                borderRadius: '8px',
                color: theme === 'dark' ? '#F3F4F6' : '#111827'
              }}
            />
            <Bar dataKey="trades" fill="#3B82F6" name="Number of Trades" />
            <Bar dataKey="successRate" fill="#10B981" name="Success Rate %" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderInvestors = () => (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className={`${cardBgClass} backdrop-blur-md p-4 rounded-xl border ${borderClass} shadow-sm`}>
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search investors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border ${borderClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-slate-600 text-white placeholder-slate-400' : 'bg-white text-gray-900 placeholder-gray-400'}`}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleExportData('investors')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Add Investor
            </button>
          </div>
        </div>
      </div>

      <div className={`${cardBgClass} backdrop-blur-md p-6 rounded-xl border ${borderClass} shadow-sm`}>
        <h3 className={`text-xl font-semibold ${textClass} mb-6`}>Investor Management</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${borderClass}`}>
                <th className={`text-left py-3 px-4 ${textSecondaryClass} font-medium`}>Investor</th>
                <th className={`text-left py-3 px-4 ${textSecondaryClass} font-medium`}>Balance</th>
                <th className={`text-left py-3 px-4 ${textSecondaryClass} font-medium`}>Invested</th>
                <th className={`text-left py-3 px-4 ${textSecondaryClass} font-medium`}>Return</th>
                <th className={`text-left py-3 px-4 ${textSecondaryClass} font-medium`}>Risk Profile</th>
                <th className={`text-left py-3 px-4 ${textSecondaryClass} font-medium`}>Status</th>
                <th className={`text-left py-3 px-4 ${textSecondaryClass} font-medium`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvestors.map((investor) => {
                const totalReturn = ((investor.balance - investor.invested) / investor.invested) * 100;
                return (
                  <tr key={investor.id} className={`border-b ${borderClass} hover:${theme === 'dark' ? 'bg-slate-700/25' : 'bg-gray-50/50'}`}>
                    <td className="py-4 px-4">
                      <div>
                        <p className={`${textClass} font-medium`}>{investor.name}</p>
                        <p className={`${textSecondaryClass} text-sm`}>{investor.email}</p>
                        <p className={`${textSecondaryClass} text-sm`}>{investor.phone}</p>
                      </div>
                    </td>
                    <td className={`py-4 px-4 ${textClass} font-semibold`}>
                      ${investor.balance.toLocaleString()}
                    </td>
                    <td className={`py-4 px-4 ${textSecondaryClass}`}>
                      ${investor.invested.toLocaleString()}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`font-semibold ${totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        investor.riskProfile === 'conservative' ? 'bg-green-100 text-green-800' :
                        investor.riskProfile === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {investor.riskProfile}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        investor.status === 'active' ? 'bg-green-100 text-green-800' :
                        investor.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {investor.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => setSelectedInvestor(investor)}
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-green-400 hover:text-green-300 text-sm">
                          <Send className="w-4 h-4" />
                        </button>
                        <button className="text-orange-400 hover:text-orange-300 text-sm">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Investor Details Modal */}
      {selectedInvestor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${cardBgClass} p-6 rounded-xl border ${borderClass} shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-semibold ${textClass}`}>Investor Details</h3>
              <button
                onClick={() => setSelectedInvestor(null)}
                className={`${textSecondaryClass} hover:${textClass}`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${textSecondaryClass} mb-1`}>Name</label>
                  <div className={`${textClass} font-medium`}>{selectedInvestor.name}</div>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${textSecondaryClass} mb-1`}>Email</label>
                  <div className={`${textClass}`}>{selectedInvestor.email}</div>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${textSecondaryClass} mb-1`}>Phone</label>
                  <div className={`${textClass}`}>{selectedInvestor.phone}</div>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${textSecondaryClass} mb-1`}>Join Date</label>
                  <div className={`${textClass}`}>{new Date(selectedInvestor.joinDate).toLocaleDateString()}</div>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${textSecondaryClass} mb-1`}>Current Balance</label>
                  <div className={`${textClass} font-semibold`}>${selectedInvestor.balance.toLocaleString()}</div>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${textSecondaryClass} mb-1`}>Total Invested</label>
                  <div className={`${textClass} font-semibold`}>${selectedInvestor.invested.toLocaleString()}</div>
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => handleSendNotification(selectedInvestor.id, 'Custom message')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </button>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Investor Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`${cardBgClass} backdrop-blur-md p-6 rounded-xl border ${borderClass} shadow-sm`}>
          <h4 className={`font-semibold ${textClass} mb-4`}>New Investors</h4>
          <div className="text-3xl font-bold text-blue-400 mb-2">3</div>
          <div className={`${textSecondaryClass} text-sm`}>This month</div>
        </div>
        
        <div className={`${cardBgClass} backdrop-blur-md p-6 rounded-xl border ${borderClass} shadow-sm`}>
          <h4 className={`font-semibold ${textClass} mb-4`}>Average Account</h4>
          <div className="text-3xl font-bold text-green-400 mb-2">
            ${(totalAssets / totalInvestors).toLocaleString()}
          </div>
          <div className={`${textSecondaryClass} text-sm`}>Per investor</div>
        </div>
        
        <div className={`${cardBgClass} backdrop-blur-md p-6 rounded-xl border ${borderClass} shadow-sm`}>
          <h4 className={`font-semibold ${textClass} mb-4`}>Retention Rate</h4>
          <div className="text-3xl font-bold text-purple-400 mb-2">98%</div>
          <div className={`${textSecondaryClass} text-sm`}>12-month</div>
        </div>

        <div className={`${cardBgClass} backdrop-blur-md p-6 rounded-xl border ${borderClass} shadow-sm`}>
          <h4 className={`font-semibold ${textClass} mb-4`}>Active Investors</h4>
          <div className="text-3xl font-bold text-orange-400 mb-2">
            {investors.filter(inv => inv.status === 'active').length}
          </div>
          <div className={`${textSecondaryClass} text-sm`}>Currently active</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${bgClass} pb-20 md:pb-0`}>
      {/* Header */}
      <header className={`${headerBgClass} border-b sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className={`text-2xl font-bold ${textClass}`}>
                <span className="text-blue-400">Apex</span>Capital
                <span className="ml-2 text-sm bg-orange-600 px-2 py-1 rounded text-white">Admin</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={toggleTheme}
                className={`p-2 ${textSecondaryClass} hover:${textClass} transition-colors`}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <div className="relative">
                <button className={`p-2 ${textSecondaryClass} hover:${textClass} transition-colors`}>
                  <Bell className="w-5 h-5" />
                </button>
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </div>
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              <div className={`${textSecondaryClass} hidden md:block`}>
                <span className="text-sm">Admin: {user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className={`${textSecondaryClass} hover:text-red-400 transition-colors`}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Desktop Navigation Tabs */}
        <div className="mb-8 hidden md:block">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'reports', label: 'Manage Reports', icon: Activity },
              { id: 'investors', label: 'Investors', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'settings', label: 'Settings', icon: Settings },
              { id: 'communications', label: 'Communications', icon: MessageSquare }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === id 
                    ? 'bg-blue-600 text-white' 
                    : `${textSecondaryClass} hover:${textClass} hover:${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'}`
                }`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'reports' && renderReports()}
        {activeTab === 'investors' && renderInvestors()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'settings' && renderSettings()}
        {activeTab === 'communications' && renderCommunications()}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 ${headerBgClass} border-t z-50`}>
        <div className="grid grid-cols-6 h-16">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'reports', label: 'Reports', icon: Activity },
            { id: 'investors', label: 'Investors', icon: Users },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'settings', label: 'Settings', icon: Settings },
            { id: 'communications', label: 'Messages', icon: MessageSquare }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex flex-col items-center justify-center px-1 py-2 transition-colors ${
                activeTab === id 
                  ? 'text-blue-400 bg-blue-600/10' 
                  : `${textSecondaryClass} hover:${textClass} hover:${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'}`
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium truncate">{label}</span>
              {id === 'communications' && notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;