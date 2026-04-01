import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Cpu, 
  AlertCircle, 
  Search,
  Filter,
  Download,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AIUsageLog {
  id: string;
  userId: string;
  modelId: string;
  prompt: string;
  response: string;
  tokensUsed: number;
  cost: number;
  status: 'success' | 'error';
  error?: string;
  createdAt: string;
}

export default function AIAnalytics() {
  const [logs, setLogs] = useState<AIUsageLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'error'>('all');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('/api/owner/ai-usage-logs', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setLogs(data);
        }
      } catch (error) {
        console.error("Failed to fetch AI usage logs:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.prompt.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         log.modelId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalRequests: logs.length,
    successRate: logs.length > 0 ? (logs.filter(l => l.status === 'success').length / logs.length * 100).toFixed(1) : 0,
    totalTokens: logs.reduce((acc, l) => acc + l.tokensUsed, 0),
    totalCost: logs.reduce((acc, l) => acc + l.cost, 0),
    totalRevenue: 0, // Will be fetched from owner stats
    profit: 0,
    profitMargin: 0
  };

  const [ownerStats, setOwnerStats] = useState<any>(null);

  useEffect(() => {
    const fetchOwnerStats = async () => {
      try {
        const response = await fetch('/api/owner/stats', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setOwnerStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch owner stats:", error);
      }
    };
    fetchOwnerStats();
  }, []);

  const financialStats = ownerStats || {
    totalRevenue: 0,
    totalCost: stats.totalCost,
    profit: -stats.totalCost,
    profitMargin: 0
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">AI Analytics & Logs</h1>
          <p className="text-text-muted mt-1">Monitor model performance, costs, and usage across the platform.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-sm font-medium text-text-primary hover:bg-white/5 transition-colors">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Requests', value: stats.totalRequests, icon: BarChart3, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Success Rate', value: `${stats.successRate}%`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Total Tokens', value: stats.totalTokens.toLocaleString(), icon: Cpu, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { label: 'Total AI Cost', value: `$${Number(stats.totalCost).toFixed(4)}`, icon: DollarSign, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border border-border rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2 rounded-lg", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
            </div>
            <div className="text-2xl font-bold text-text-primary">{stat.value}</div>
            <div className="text-xs font-medium text-text-muted uppercase tracking-wider mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-3xl p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Estimated Revenue</h3>
            <div className="p-2 bg-emerald-500/20 rounded-xl">
              <DollarSign className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <div className="text-4xl font-bold text-white">${financialStats.totalRevenue.toLocaleString()}</div>
          <p className="text-sm text-emerald-500/60 font-medium">From active subscriptions</p>
        </div>

        <div className="bg-gradient-to-br from-rose-500/10 to-rose-500/5 border border-rose-500/20 rounded-3xl p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Total AI Cost</h3>
            <div className="p-2 bg-rose-500/20 rounded-xl">
              <Cpu className="w-5 h-5 text-rose-500" />
            </div>
          </div>
          <div className="text-4xl font-bold text-white">${financialStats.totalCost ? Number(financialStats.totalCost).toFixed(2) : '0.00'}</div>
          <p className="text-sm text-rose-500/60 font-medium">Based on token usage</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border border-indigo-500/20 rounded-3xl p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Net Profit</h3>
            <div className="p-2 bg-indigo-500/20 rounded-xl">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
            </div>
          </div>
          <div className="text-4xl font-bold text-white">${(financialStats.totalRevenue - (financialStats.totalCost || 0)).toLocaleString()}</div>
          <p className="text-sm text-indigo-500/60 font-medium">{financialStats.profitMargin.toFixed(1)}% Profit Margin</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-card border border-border rounded-2xl p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search logs by prompt or model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-bg border border-border rounded-xl py-2 pl-10 pr-4 text-sm text-text-primary focus:border-accent outline-hidden transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-text-muted" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-bg border border-border rounded-xl py-2 px-4 text-sm text-text-primary focus:border-accent outline-hidden transition-all"
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg/50 border-bottom border-border">
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Timestamp</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Model</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Prompt</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Tokens</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Cost</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                      Loading logs...
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                    No logs found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-text-primary">
                        <Clock className="w-3.5 h-3.5 text-text-muted" />
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-bg border border-border rounded-md text-xs font-mono text-text-primary">
                        {log.modelId}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-text-primary max-w-xs truncate" title={log.prompt}>
                        {log.prompt}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-primary">
                      {log.tokensUsed.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-amber-500">
                      ${log.cost.toFixed(4)}
                    </td>
                    <td className="px-6 py-4">
                      {log.status === 'success' ? (
                        <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-bold uppercase tracking-wider">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Success
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-rose-500 text-xs font-bold uppercase tracking-wider" title={log.error}>
                          <XCircle className="w-3.5 h-3.5" />
                          Error
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
