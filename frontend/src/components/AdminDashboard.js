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
      <div className={`${cardBgClass} backdrop-blur-md p-6 rounded-xl border ${borderClass} shadow-sm`}>
        <h3 className={`text-xl font-semibold ${textClass} mb-6`}>Investor Management</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${borderClass}`}>
                <th className={`text-left py-3 px-4 ${textSecondaryClass} font-medium`}>Investor</th>
                <th className={`text-left py-3 px-4 ${textSecondaryClass} font-medium`}>Current Balance</th>
                <th className={`text-left py-3 px-4 ${textSecondaryClass} font-medium`}>Total Invested</th>
                <th className={`text-left py-3 px-4 ${textSecondaryClass} font-medium`}>Total Return</th>
                <th className={`text-left py-3 px-4 ${textSecondaryClass} font-medium`}>Join Date</th>
                <th className={`text-left py-3 px-4 ${textSecondaryClass} font-medium`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {investors.map((investor) => {
                const totalReturn = ((investor.balance - investor.invested) / investor.invested) * 100;
                return (
                  <tr key={investor.id} className={`border-b ${borderClass} hover:${theme === 'dark' ? 'bg-slate-700/25' : 'bg-gray-50/50'}`}>
                    <td className="py-4 px-4">
                      <div>
                        <p className={`${textClass} font-medium`}>{investor.name}</p>
                        <p className={`${textSecondaryClass} text-sm`}>{investor.email}</p>
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
                    <td className={`py-4 px-4 ${textSecondaryClass}`}>
                      {new Date(investor.joinDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <button className="text-blue-400 hover:text-blue-300 text-sm">
                          View Details
                        </button>
                        <button className="text-green-400 hover:text-green-300 text-sm">
                          Send Report
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

      {/* Investor Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className={`${cardBgClass} backdrop-blur-md p-6 rounded-xl border ${borderClass} shadow-sm`}>
          <h4 className={`font-semibold ${textClass} mb-4`}>New Investors This Month</h4>
          <div className="text-3xl font-bold text-blue-400 mb-2">3</div>
          <div className={`${textSecondaryClass} text-sm`}>+50% from last month</div>
        </div>
        
        <div className={`${cardBgClass} backdrop-blur-md p-6 rounded-xl border ${borderClass} shadow-sm`}>
          <h4 className={`font-semibold ${textClass} mb-4`}>Average Account Size</h4>
          <div className="text-3xl font-bold text-green-400 mb-2">
            ${(totalAssets / totalInvestors).toLocaleString()}
          </div>
          <div className={`${textSecondaryClass} text-sm`}>Across {totalInvestors} investors</div>
        </div>
        
        <div className={`${cardBgClass} backdrop-blur-md p-6 rounded-xl border ${borderClass} shadow-sm`}>
          <h4 className={`font-semibold ${textClass} mb-4`}>Retention Rate</h4>
          <div className="text-3xl font-bold text-purple-400 mb-2">98%</div>
          <div className={`${textSecondaryClass} text-sm`}>12-month retention</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${bgClass}`}>
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
              <button className={`p-2 ${textSecondaryClass} hover:${textClass} transition-colors`}>
                <Bell className="w-5 h-5" />
              </button>
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              <div className={textSecondaryClass}>
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
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'reports', label: 'Manage Reports', icon: Activity },
              { id: 'investors', label: 'Investors', icon: Users }
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
      </div>
    </div>
  );
};

export default AdminDashboard;