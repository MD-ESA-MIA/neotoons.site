import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  Settings, 
  Save, 
  RefreshCw, 
  Clock, 
  Calendar,
  Users,
  Zap,
  BarChart3,
  ShieldAlert
} from 'lucide-react';
import { PlatformCostConfig } from '../../types';
import { costControlService } from '../../services/costControlService';
import toast from 'react-hot-toast';

const CostControlManager: React.FC = () => {
  const [config, setConfig] = useState<PlatformCostConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      const data = await costControlService.getConfig();
      setConfig(data);
      setLoading(false);
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setIsSaving(true);
    try {
      await costControlService.saveConfig(config);
      toast.success("Configuration saved successfully!");
    } catch (error) {
      toast.error("Failed to save configuration.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const dailyProgress = (config.currentDailySpend / config.dailyLimit) * 100;
  const monthlyProgress = (config.currentMonthlySpend / config.monthlyLimit) * 100;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Cost Control & Limits</h1>
          <p className="text-text-muted">Manage platform-wide AI spending and user request limits.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary py-3 px-8 flex items-center gap-2 self-start disabled:opacity-50"
        >
          {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save Configuration
        </button>
      </div>

      {/* Spending Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Daily Spend */}
        <div className="bg-card border border-border rounded-3xl p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Daily Spending</h3>
                <p className="text-xs text-text-muted uppercase tracking-widest font-bold">Resets at midnight</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-white">{config.currentDailySpend.toFixed(2)}</p>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Credits Used</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-text-muted uppercase tracking-widest">
              <span>Progress</span>
              <span>{dailyProgress.toFixed(1)}%</span>
            </div>
            <div className="h-3 w-full bg-bg border border-border rounded-full overflow-hidden">
              <motion.div 
                className={`h-full ${dailyProgress > 90 ? 'bg-rose-500' : dailyProgress > 70 ? 'bg-amber-500' : 'bg-accent'}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(dailyProgress, 100)}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Daily Limit (Credits)</label>
            <div className="mt-2 relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input 
                type="number"
                value={config.dailyLimit}
                onChange={(e) => setConfig({...config, dailyLimit: parseFloat(e.target.value)})}
                className="w-full bg-bg border border-border rounded-xl py-3 pl-10 pr-4 text-sm text-text-primary focus:border-accent outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Monthly Spend */}
        <div className="bg-card border border-border rounded-3xl p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Monthly Spending</h3>
                <p className="text-xs text-text-muted uppercase tracking-widest font-bold">Resets 1st of month</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-white">{config.currentMonthlySpend.toFixed(2)}</p>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Credits Used</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-text-muted uppercase tracking-widest">
              <span>Progress</span>
              <span>{monthlyProgress.toFixed(1)}%</span>
            </div>
            <div className="h-3 w-full bg-bg border border-border rounded-full overflow-hidden">
              <motion.div 
                className={`h-full ${monthlyProgress > 90 ? 'bg-rose-500' : monthlyProgress > 70 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(monthlyProgress, 100)}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Monthly Limit (Credits)</label>
            <div className="mt-2 relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input 
                type="number"
                value={config.monthlyLimit}
                onChange={(e) => setConfig({...config, monthlyLimit: parseFloat(e.target.value)})}
                className="w-full bg-bg border border-border rounded-xl py-3 pl-10 pr-4 text-sm text-text-primary focus:border-accent outline-hidden"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Limits */}
      <div className="bg-card border border-border rounded-3xl p-8 shadow-xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Usage & Safety Limits</h3>
            <p className="text-sm text-text-muted">Prevent abuse and control individual user consumption.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-accent" />
                <span className="text-sm font-bold text-white">Max Tokens Per Request</span>
              </div>
              <input 
                type="number"
                value={config.maxTokensPerRequest}
                onChange={(e) => setConfig({...config, maxTokensPerRequest: parseInt(e.target.value)})}
                className="w-24 bg-bg border border-border rounded-xl py-2 px-3 text-sm text-text-primary text-center focus:border-accent outline-hidden"
              />
            </div>
            <p className="text-xs text-text-muted">Limits the size of AI responses to prevent excessive token consumption.</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-indigo-500" />
                <span className="text-sm font-bold text-white">Max Requests Per User / Day</span>
              </div>
              <input 
                type="number"
                value={config.maxRequestsPerUser}
                onChange={(e) => setConfig({...config, maxRequestsPerUser: parseInt(e.target.value)})}
                className="w-24 bg-bg border border-border rounded-xl py-2 px-3 text-sm text-text-primary text-center focus:border-accent outline-hidden"
              />
            </div>
            <p className="text-xs text-text-muted">Prevents individual users from overwhelming the platform with requests.</p>
          </div>
        </div>

        <div className="mt-10 p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
          <div>
            <h4 className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-1">Auto-Fallback Logic</h4>
            <p className="text-sm text-text-muted leading-relaxed">
              When the platform spending exceeds <strong>90%</strong> of the daily or monthly limit, the AI Router will automatically switch all tools to <strong>Free Models</strong> only. If the limit is <strong>100%</strong> reached, all AI generation will be disabled until the next reset.
            </p>
          </div>
        </div>
      </div>

      {/* Usage Analytics Placeholder */}
      <div className="bg-card border border-border rounded-3xl p-8 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Usage Analytics</h3>
              <p className="text-sm text-text-muted">Real-time tracking of AI costs and performance.</p>
            </div>
          </div>
          <button className="text-xs font-bold text-accent uppercase tracking-widest hover:underline">View Full Report</button>
        </div>

        <div className="h-48 flex items-center justify-center border border-dashed border-border rounded-2xl bg-white/5">
          <div className="text-center">
            <TrendingUp className="w-10 h-10 text-text-muted mx-auto mb-2 opacity-20" />
            <p className="text-sm text-text-muted">Usage charts and detailed analytics will appear here as data is collected.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostControlManager;
