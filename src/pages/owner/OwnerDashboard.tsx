import React from 'react';
import { 
  Users, 
  UserCheck, 
  Briefcase, 
  UserPlus, 
  DollarSign, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  AlertCircle,
  Zap,
  ShieldCheck,
  Plug,
  Clock
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { motion } from 'motion/react';
import { cn } from '../../utils/cn';
import RetryPanel from '../../components/ui/RetryPanel';

import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, change, icon: Icon, color }: any) => {
  const colorMap: Record<string, string> = {
    indigo: 'from-indigo-500/20 to-indigo-500/0 text-indigo-400 border-indigo-500/20',
    emerald: 'from-emerald-500/20 to-emerald-500/0 text-emerald-400 border-emerald-500/20',
    amber: 'from-amber-500/20 to-amber-500/0 text-amber-400 border-amber-500/20',
    purple: 'from-purple-500/20 to-purple-500/0 text-purple-400 border-purple-500/20',
    cyan: 'from-cyan-500/20 to-cyan-500/0 text-cyan-400 border-cyan-500/20',
  };

  const iconBgMap: Record<string, string> = {
    indigo: 'bg-indigo-500/10 text-indigo-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    amber: 'bg-amber-500/10 text-amber-400',
    purple: 'bg-purple-500/10 text-purple-400',
    cyan: 'bg-cyan-500/10 text-cyan-400',
  };

  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-card/40 backdrop-blur-xl border border-white/5 p-6 rounded-3xl relative overflow-hidden group transition-all duration-300 hover:border-white/10 hover:shadow-2xl hover:shadow-black/20"
    >
      <div className={cn(
        "absolute top-0 right-0 w-32 h-32 bg-linear-to-br blur-3xl rounded-full -mr-16 -mt-16 opacity-20 group-hover:opacity-40 transition-opacity duration-500",
        colorMap[color] || colorMap.indigo
      )}></div>
      
      <div className="relative z-10 flex flex-col h-full justify-between gap-6">
        <div className="flex items-start justify-between">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner",
            iconBgMap[color] || iconBgMap.indigo
          )}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/5">
            {change > 0 ? (
              <span className="flex items-center text-emerald-400 text-[10px] font-bold">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> +{change}%
              </span>
            ) : (
              <span className="flex items-center text-rose-400 text-[10px] font-bold">
                <ArrowDownRight className="w-3 h-3 mr-0.5" /> {change}%
              </span>
            )}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
          </div>
          <p className="text-[10px] text-text-muted/40 font-medium mt-2">vs last 30 days</p>
        </div>
      </div>
    </motion.div>
  );
};

const OwnerDashboard: React.FC = () => {
  const [stats, setStats] = React.useState<any>(null);
  const [recentUsers, setRecentUsers] = React.useState<any[]>([]);
  const [recentActivity, setRecentActivity] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [growthType, setGrowthType] = React.useState<'users' | 'revenue'>('revenue');
  const [loadWarning, setLoadWarning] = React.useState<string | null>(null);
  const [fatalError, setFatalError] = React.useState<string | null>(null);
  const hasShownLoadError = React.useRef(false);

  const safeArray = (value: unknown): any[] => (Array.isArray(value) ? value : []);
  const defaultStats = {
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    totalGenerations: 0,
    avgCostPerRequest: 0,
    profitMargin: 0,
    growth: 0,
    growthData: [],
    activityData: [],
    revenueData: [],
  };

  const fetchDashboardData = React.useCallback(async () => {
    const isInitialLoad = loading && !stats;
    if (!isInitialLoad) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setLoadWarning(null);
    setFatalError(null);

    const [statsResult, usersResult, activityResult] = await Promise.allSettled([
      adminService.getStats(),
      adminService.getUsers(),
      adminService.getActivity(),
    ]);

    const failedRequests = [statsResult, usersResult, activityResult].filter((result) => result.status === 'rejected').length;

    if (statsResult.status === 'fulfilled' && statsResult.value && typeof statsResult.value === 'object') {
      setStats({ ...defaultStats, ...statsResult.value });
    } else {
      setStats(defaultStats);
    }

    setRecentUsers(usersResult.status === 'fulfilled' ? safeArray(usersResult.value).slice(0, 5) : []);
    setRecentActivity(activityResult.status === 'fulfilled' ? safeArray(activityResult.value).slice(0, 5) : []);

    if (failedRequests > 0) {
      const warning = failedRequests === 3
        ? 'Dashboard APIs are currently unavailable. Verify owner session and try again.'
        : 'Some dashboard sections are unavailable right now.';
      setLoadWarning(warning);
      if (failedRequests === 3) {
        setFatalError('Failed to load all dashboard endpoints.');
      }

      if (!hasShownLoadError.current) {
        toast.error(warning, { id: 'owner-dashboard-load-error' });
        hasShownLoadError.current = true;
      }
    } else {
      hasShownLoadError.current = false;
    }

    setLoading(false);
    setRefreshing(false);
  }, [loading, stats]);

  React.useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="space-y-10 animate-pulse">
        <div className="flex flex-col gap-3">
          <div className="h-10 bg-white/5 rounded-2xl w-64"></div>
          <div className="h-4 bg-white/5 rounded-xl w-96"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 bg-white/5 rounded-3xl border border-white/5"></div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-[450px] bg-white/5 rounded-[32px] border border-white/5"></div>
          <div className="h-[450px] bg-white/5 rounded-[32px] border border-white/5"></div>
        </div>
      </div>
    );
  }

  const growthData = stats?.growthData || [];
  const activityData = stats?.activityData || [];
  const revenueData = stats?.revenueData || [];

  const chartData = growthType === 'users' ? growthData : revenueData;
  const chartKey = growthType === 'users' ? 'users' : 'revenue';
  const chartColor = growthType === 'users' ? '#8b5cf6' : '#6366f1';

  const statCards = [
    { title: "Total Users", value: (stats?.totalUsers || 0).toLocaleString(), change: stats?.growth || 0, icon: Users, color: "indigo" },
    { title: "Active Users", value: (stats?.activeUsers || 0).toLocaleString(), change: 12, icon: UserCheck, color: "emerald" },
    { title: "Total Revenue", value: `$${(stats?.totalRevenue || 0).toLocaleString()}`, change: 8, icon: DollarSign, color: "amber" },
    { title: "AI Generations", value: (stats?.totalGenerations || 0).toLocaleString(), change: 24, icon: Zap, color: "purple" },
    { title: "Avg. Cost/Req", value: `$${(stats?.avgCostPerRequest || 0).toFixed(4)}`, change: -5, icon: Activity, color: "cyan" },
    { title: "Profit Margin", value: `${(stats?.profitMargin || 0).toFixed(1)}%`, change: 2, icon: ShieldCheck, color: "emerald" },
  ];

  const hasChartData = chartData.some((d: any) => d[chartKey] > 0);
  const hasActivityData = activityData.some((d: any) => d.activity > 0);

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-bold text-white tracking-tight">System Overview</h1>
        <p className="text-text-muted max-w-2xl leading-relaxed">
          Welcome back, Owner. Here's a comprehensive look at your platform's performance and user activity today.
        </p>
        {fatalError && (
          <RetryPanel
            title="Dashboard Load Error"
            message={fatalError}
            onRetry={fetchDashboardData}
            isRetrying={refreshing}
          />
        )}
        {loadWarning && (
          <div className="inline-flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
            <AlertCircle className="h-4 w-4" />
            <span>{loadWarning}</span>
            <button
              type="button"
              onClick={fetchDashboardData}
              disabled={refreshing}
              className="ml-2 rounded-lg border border-amber-300/30 bg-amber-400/10 px-2 py-1 text-[11px] font-semibold text-amber-100 transition hover:bg-amber-400/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {refreshing ? 'Retrying...' : 'Retry'}
            </button>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {statCards.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Growth Chart */}
        <div className="bg-card/40 backdrop-blur-xl border border-white/5 p-8 rounded-[32px] space-y-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] rounded-full -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Platform Growth</h3>
              <p className="text-xs text-text-muted mt-1">Real-time user and revenue tracking</p>
            </div>
            <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5">
              <button 
                onClick={() => setGrowthType('users')}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300",
                  growthType === 'users' ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-text-muted hover:text-white"
                )}
              >
                Users
              </button>
              <button 
                onClick={() => setGrowthType('revenue')}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300",
                  growthType === 'revenue' ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-text-muted hover:text-white"
                )}
              >
                Revenue
              </button>
            </div>
          </div>
          
          <div className="h-[350px] w-full flex items-center justify-center relative z-10">
            {hasChartData ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColor} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#ffffff20" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={10}
                  />
                  <YAxis 
                    stroke="#ffffff20" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => growthType === 'revenue' ? `$${value}` : value}
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(10, 10, 11, 0.9)', 
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '16px',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                    }}
                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                    labelStyle={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey={chartKey} 
                    stroke={chartColor} 
                    fillOpacity={1} 
                    fill="url(#colorGrowth)" 
                    strokeWidth={3}
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-text-muted/20 mx-auto">
                  <Activity className="w-8 h-8" />
                </div>
                <p className="text-sm text-text-muted">No growth data available yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Activity Chart */}
        <div className="bg-card/40 backdrop-blur-xl border border-white/5 p-8 rounded-[32px] space-y-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Active Sessions</h3>
              <p className="text-xs text-text-muted mt-1">User engagement across the platform</p>
            </div>
            <button className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5">
              <MoreHorizontal className="w-5 h-5 text-text-muted" />
            </button>
          </div>
          
          <div className="h-[350px] w-full flex items-center justify-center relative z-10">
            {hasActivityData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#ffffff20" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={10}
                  />
                  <YAxis 
                    stroke="#ffffff20" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                    dx={-10}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 8 }}
                    contentStyle={{ 
                      backgroundColor: 'rgba(10, 10, 11, 0.9)', 
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '16px',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                    }}
                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                    labelStyle={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  />
                  <Bar 
                    dataKey="activity" 
                    fill="#8b5cf6" 
                    radius={[6, 6, 0, 0]} 
                    barSize={32}
                    animationDuration={2000}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-text-muted/20 mx-auto">
                  <Zap className="w-8 h-8" />
                </div>
                <p className="text-sm text-text-muted">No activity data available yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Registrations */}
        <div className="xl:col-span-2 bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] overflow-hidden group">
          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/2">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Recent Registrations</h3>
              <p className="text-xs text-text-muted mt-1">Latest users who joined the platform</p>
            </div>
            <button className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all border border-white/5">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold text-text-muted uppercase tracking-widest border-b border-white/5">
                  <th className="px-8 py-5">User</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5">Plan</th>
                  <th className="px-8 py-5">Joined</th>
                  <th className="px-8 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentUsers.map((user) => (
                  <tr key={user.id} className="group/row hover:bg-white/[0.03] transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img 
                            src={user.avatar} 
                            alt={user.name}
                            className="w-10 h-10 rounded-xl object-cover border border-white/10 shadow-lg"
                            referrerPolicy="no-referrer"
                          />
                          {user.isOnline && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-[#0A0A0B] rounded-full"></span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white group-hover/row:text-accent transition-colors">{user.name}</p>
                          <p className="text-[11px] text-text-muted">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5",
                        user.isOnline ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-text-muted border border-white/10'
                      )}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", user.isOnline ? "bg-emerald-400 animate-pulse" : "bg-text-muted")}></span>
                        {user.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-wider">
                        {user.plan} Plan
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs text-text-muted font-medium">{new Date(user.joinedAt).toLocaleDateString()}</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="p-2 hover:bg-white/10 rounded-xl transition-all text-text-muted hover:text-white">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Activity */}
        <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] flex flex-col group">
          <div className="p-8 border-b border-white/5 bg-white/2">
            <h3 className="text-xl font-bold text-white tracking-tight">System Activity</h3>
            <p className="text-xs text-text-muted mt-1">Live feed of platform events</p>
          </div>
          <div className="flex-1 p-8 space-y-8 overflow-y-auto custom-scrollbar max-h-[500px]">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex gap-5 relative group/item">
                {i !== recentActivity.length - 1 && (
                  <div className="absolute left-4 top-10 bottom-[-32px] w-px bg-white/5"></div>
                )}
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 relative z-10 transition-transform duration-300 group-hover/item:scale-110 shadow-lg",
                  i % 2 === 0 ? "bg-accent/10 text-accent" : "bg-indigo-500/10 text-indigo-400"
                )}>
                  <Activity className="w-4 h-4" />
                </div>
                <div className="space-y-1.5 pt-1">
                  <p className="text-sm font-bold text-white group-hover/item:text-accent transition-colors">{item.userName}</p>
                  <p className="text-xs text-text-muted leading-relaxed">{item.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="w-3 h-3 text-text-muted/40" />
                    <p className="text-[10px] text-text-muted/40 font-bold uppercase tracking-widest">
                      {new Date(item.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-8 border-t border-white/5 bg-white/2">
            <button className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-bold transition-all border border-white/5 hover:border-white/10 flex items-center justify-center gap-2 group/btn">
              View All Logs
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
