import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Zap, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  MousePointer2,
  Clock
} from 'lucide-react';

const data = [
  { name: 'Mon', users: 4000, visits: 2400, usage: 2400 },
  { name: 'Tue', users: 3000, visits: 1398, usage: 2210 },
  { name: 'Wed', users: 2000, visits: 9800, usage: 2290 },
  { name: 'Thu', users: 2780, visits: 3908, usage: 2000 },
  { name: 'Fri', users: 1890, visits: 4800, usage: 2181 },
  { name: 'Sat', users: 2390, visits: 3800, usage: 2500 },
  { name: 'Sun', users: 3490, visits: 4300, usage: 2100 },
];

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e'];

const AnalyticsDashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-white tracking-tight">Analytics Dashboard</h1>
        <p className="text-white/40">Real-time platform performance, user engagement, and tool usage metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: '12,482', change: '+12%', icon: Users, color: 'text-indigo-500' },
          { label: 'Website Visits', value: '45.2k', change: '+8%', icon: MousePointer2, color: 'text-purple-500' },
          { label: 'Tool Usage', value: '89.4k', change: '+24%', icon: Zap, color: 'text-emerald-500' },
          { label: 'Active Users', value: '1,204', change: '-2%', icon: Activity, color: 'text-rose-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#0A0A0B] border border-white/5 p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest ${stat.change.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                {stat.change.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#0A0A0B] border border-white/5 p-8 rounded-[32px] space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Engagement Overview</h3>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-[10px] text-white/40 font-bold uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div> Users
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-white/40 font-bold uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div> Visits
              </span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#ffffff20', fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#ffffff20', fontSize: 10, fontWeight: 700 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111112', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                <Area type="monotone" dataKey="visits" stroke="#a855f7" strokeWidth={3} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0A0A0B] border border-white/5 p-8 rounded-[32px] space-y-8">
          <h3 className="text-lg font-bold text-white">Tool Usage Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Story Gen', value: 400 },
                      { name: 'Hooks', value: 300 },
                      { name: 'Rewriter', value: 300 },
                      { name: 'Prompts', value: 200 },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Story Generator', value: '35%', color: 'bg-indigo-500' },
                { label: 'Viral Hooks', value: '25%', color: 'bg-purple-500' },
                { label: 'Script Rewriter', value: '25%', color: 'bg-pink-500' },
                { label: 'AI Prompts', value: '15%', color: 'bg-rose-500' },
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-white/40">{item.label}</span>
                    <span className="text-white">{item.value}</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: item.value }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
