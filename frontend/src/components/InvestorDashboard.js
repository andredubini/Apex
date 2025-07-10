import React, { useState, useContext } from "react";
import { AuthContext } from "../App";
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
  EyeOff
} from "lucide-react";

const InvestorDashboard = () => {
  const { user, logout, sampleTradingData } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("overview");
  const [showBalance, setShowBalance] = useState(true);
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

  // Calculate performance metrics
  const totalWeeks = sampleTradingData.length;
  const latestWeek = sampleTradingData[totalWeeks - 1];
  const firstWeek = sampleTradingData[0];
  const totalReturn = ((latestWeek.endBalance - firstWeek.startBalance) / firstWeek.startBalance) * 100;
  const avgWeeklyReturn = totalReturn / totalWeeks;

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

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-sm">Account Balance</p>
              <p className="text-2xl font-bold text-white">
                {showBalance ? `$${user.accountBalance?.toLocaleString() || "150,000"}` : "****"}
              </p>
            </div>
            <div className="bg-blue-600 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-green-400">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span className="text-sm">+{totalReturn.toFixed(2)}% Total Return</span>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-sm">Total Invested</p>
              <p className="text-2xl font-bold text-white">
                ${user.totalInvested?.toLocaleString() || "100,000"}
              </p>
            </div>
            <div className="bg-purple-600 p-3 rounded-full">
              <PieChartIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-blue-400">
            <Activity className="w-4 h-4 mr-1" />
            <span className="text-sm">Since {user.joinDate || "Jan 2024"}</span>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-sm">Total Profits</p>
              <p className="text-2xl font-bold text-white">
                ${(latestWeek.endBalance - firstWeek.startBalance).toLocaleString()}
              </p>
            </div>
            <div className="bg-green-600 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-green-400">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span className="text-sm">+{avgWeeklyReturn.toFixed(2)}% Avg Weekly</span>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-sm">This Week</p>
              <p className="text-2xl font-bold text-white">
                +${latestWeek.profit.toLocaleString()}
              </p>
            </div>
            <div className="bg-orange-600 p-3 rounded-full">
              <Activity className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-green-400">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span className="text-sm">+{latestWeek.returnPercentage.toFixed(2)}% Return</span>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-xl border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-4">Account Performance (Last 12 Weeks)</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={recentPerformance}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="week" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F3F4F6'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="balance" 
              stroke="#3B82F6" 
              strokeWidth={3}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Portfolio Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-xl border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-4">Portfolio Allocation</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={portfolioData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {portfolioData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-xl border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-4">Recent Weekly Returns</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={recentPerformance.slice(-6)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="week" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }}
              />
              <Bar dataKey="return" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-xl border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-4">Weekly Trading Reports</h3>
        <div className="space-y-4">
          {sampleTradingData.slice(-10).reverse().map((week) => (
            <div key={week.id} className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white">{week.week} - {week.date}</h4>
                  <p className="text-slate-300 text-sm">
                    {week.trades} trades executed • {week.successRate.toFixed(1)}% success rate
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-semibold">
                    +${week.profit.toLocaleString()} ({week.returnPercentage.toFixed(2)}%)
                  </p>
                  <p className="text-slate-300 text-sm">
                    Balance: ${week.endBalance.toLocaleString()}
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
    <div className="space-y-6">
      <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-xl border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Banking & Withdrawals</h3>
          <div className="flex space-x-2">
            <button
              onClick={handleDepositRequest}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Request Deposit
            </button>
            <button
              onClick={handleWithdrawRequest}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Request Withdrawal
            </button>
          </div>
        </div>

        {/* Bank Details */}
        <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-white">Bank Details</h4>
            <button
              onClick={() => setShowAddBank(!showAddBank)}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              {showAddBank ? "Cancel" : "Edit"}
            </button>
          </div>
          
          {!showAddBank ? (
            <div className="space-y-2">
              <p className="text-slate-300">
                <span className="font-medium">Bank:</span> {bankDetails.bankName}
              </p>
              <p className="text-slate-300">
                <span className="font-medium">Account:</span> {bankDetails.accountNumber}
              </p>
              <p className="text-slate-300">
                <span className="font-medium">Routing:</span> {bankDetails.routingNumber}
              </p>
              <p className="text-slate-300">
                <span className="font-medium">Type:</span> {bankDetails.accountType}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Bank Name</label>
                <input
                  type="text"
                  value={bankDetails.bankName}
                  onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Account Number</label>
                <input
                  type="text"
                  value={bankDetails.accountNumber}
                  onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Routing Number</label>
                <input
                  type="text"
                  value={bankDetails.routingNumber}
                  onChange={(e) => setBankDetails({...bankDetails, routingNumber: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
                />
              </div>
              <button
                onClick={() => setShowAddBank(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Transaction History */}
        <div>
          <h4 className="font-semibold text-white mb-4">Recent Transactions</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                <div>
                  <p className="text-white font-medium">Weekly Profit</p>
                  <p className="text-slate-300 text-sm">Jan 15, 2025</p>
                </div>
              </div>
              <p className="text-green-400 font-semibold">+$2,450</p>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                <div>
                  <p className="text-white font-medium">Deposit</p>
                  <p className="text-slate-300 text-sm">Jan 10, 2025</p>
                </div>
              </div>
              <p className="text-blue-400 font-semibold">+$50,000</p>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
                <div>
                  <p className="text-white font-medium">Dividend Withdrawal</p>
                  <p className="text-slate-300 text-sm">Jan 1, 2025</p>
                </div>
              </div>
              <p className="text-orange-400 font-semibold">-$5,000</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-xl border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-4">Notifications</h3>
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div key={notification.id} className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                    notification.type === 'profit' ? 'bg-green-400' :
                    notification.type === 'deposit' ? 'bg-blue-400' : 'bg-orange-400'
                  }`}></div>
                  <div>
                    <p className="text-white">{notification.message}</p>
                    <p className="text-slate-300 text-sm mt-1">{notification.time}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-white">
                <span className="text-blue-400">Apex</span>Capital
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="text-slate-300 hover:text-white transition-colors"
              >
                {showBalance ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
              <Bell className="w-5 h-5 text-slate-300" />
              <div className="text-slate-300">
                <span className="text-sm">Welcome, {user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-slate-300 hover:text-red-400 transition-colors"
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
              { id: 'reports', label: 'Reports', icon: Activity },
              { id: 'transactions', label: 'Banking', icon: CreditCard },
              { id: 'notifications', label: 'Notifications', icon: Bell }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
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
        {activeTab === 'transactions' && renderTransactions()}
        {activeTab === 'notifications' && renderNotifications()}
      </div>
    </div>
  );
};

export default InvestorDashboard;