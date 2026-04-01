import React, { useEffect, useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight,
  Download,
  Calendar,
  Filter,
  Loader2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { adminService } from '../../services/adminService';
import { format } from 'date-fns';

const Revenue: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchRevenue();
  }, []);

  const fetchRevenue = async () => {
    try {
      const result = await adminService.getRevenue();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch revenue:', error);
    } finally {
      setLoading(false);
    }
  };

  const safeFormatDate = (dateStr: string | undefined, formatStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return format(date, formatStr);
    } catch (e) {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const chartData = data?.transactions?.reduce((acc: any[], tx: any) => {
    const month = safeFormatDate(tx.createdAt, 'MMM');
    const existing = acc.find(item => item.name === month);
    if (existing) {
      existing.revenue += tx.amount;
    } else {
      acc.push({ name: month, revenue: tx.amount });
    }
    return acc;
  }, []) || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-white tracking-tight">Revenue & Billing</h1>
          <p className="text-white/40">Track your platform's financial performance and subscription growth.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all border border-white/5">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20">
            <Calendar className="w-4 h-4" /> Last 30 Days
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Revenue', value: `$${data?.stats?.totalRevenue.toLocaleString()}`, change: `+${data?.stats?.growth}%`, icon: DollarSign, color: 'text-emerald-500' },
          { label: 'Monthly Recurring', value: `$${data?.stats?.monthlyRecurring.toLocaleString()}`, change: '+8.4%', icon: TrendingUp, color: 'text-indigo-500' },
          { label: 'Avg. Order Value', value: `$${data?.stats?.avgOrderValue.toFixed(2)}`, change: '-2.1%', icon: CreditCard, color: 'text-rose-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#0A0A0B] border border-white/5 p-8 rounded-[32px] space-y-4">
            <div className="flex items-center justify-between">
              <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest ${stat.change.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                {stat.change.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#0A0A0B] border border-white/5 p-8 rounded-[32px] space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Revenue Growth</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Revenue</span>
            </div>
          </div>
        </div>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
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
              <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#0A0A0B] border border-white/5 rounded-[32px] overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
          <button className="text-xs font-bold text-indigo-500 hover:text-indigo-400 transition-colors">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-8 py-6 text-[10px] font-bold text-white/20 uppercase tracking-widest">Customer</th>
                <th className="px-8 py-6 text-[10px] font-bold text-white/20 uppercase tracking-widest">Plan</th>
                <th className="px-8 py-6 text-[10px] font-bold text-white/20 uppercase tracking-widest">Amount</th>
                <th className="px-8 py-6 text-[10px] font-bold text-white/20 uppercase tracking-widest">Date</th>
                <th className="px-8 py-6 text-[10px] font-bold text-white/20 uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data?.transactions?.map((tx: any, i: number) => (
                <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">{tx.userName}</span>
                      <span className="text-[10px] text-white/20">{tx.userEmail}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs text-white/60">{tx.plan}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-bold text-white">${tx.amount.toFixed(2)}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs text-white/40">{safeFormatDate(tx.createdAt, 'MMM dd, yyyy')}</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      tx.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Revenue;
