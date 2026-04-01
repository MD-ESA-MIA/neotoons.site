import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  Shield, 
  Zap,
  Server,
  Database,
  Globe,
  Cpu,
  ArrowRight,
  History,
  AlertTriangle,
  Loader2,
  Wrench
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { SystemIssue, DiagnosticReport, IssueSeverity } from '../../socialTypes';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

const SystemDiagnostics: React.FC = () => {
  const [issues, setIssues] = useState<SystemIssue[]>([]);
  const [latestReport, setLatestReport] = useState<DiagnosticReport | null>(null);
  const [history, setHistory] = useState<DiagnosticReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [fixing, setFixing] = useState<string | null>(null);

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const fetchDiagnostics = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDiagnostics();
      setIssues(data.issues);
      setLatestReport(data.latestReport);
      setHistory(data.history);
    } catch (error) {
      console.error('Error fetching diagnostics:', error);
      toast.error('Failed to load diagnostics');
    } finally {
      setLoading(false);
    }
  };

  const handleRunDiagnostics = async () => {
    try {
      setRunning(true);
      const report = await adminService.runDiagnostics();
      setLatestReport(report);
      // Refresh issues too
      const data = await adminService.getDiagnostics();
      setIssues(data.issues);
      toast.success('System scan complete');
    } catch (error) {
      console.error('Error running diagnostics:', error);
      toast.error('Failed to run system scan');
    } finally {
      setRunning(false);
    }
  };

  const handleApplyFix = async (issueId: string) => {
    try {
      setFixing(issueId);
      await adminService.applyFix(issueId);
      toast.success('Fix applied successfully');
      fetchDiagnostics();
    } catch (error) {
      console.error('Error applying fix:', error);
      toast.error('Failed to apply fix');
    } finally {
      setFixing(null);
    }
  };

  const getSeverityColor = (severity: IssueSeverity) => {
    switch (severity) {
      case IssueSeverity.CRITICAL: return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case IssueSeverity.WARNING: return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case IssueSeverity.INFO: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'fail': return <AlertCircle className="w-4 h-4 text-rose-500" />;
      case 'warn': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default: return <Clock className="w-4 h-4 text-white/20" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-white tracking-tight">System Diagnostics</h1>
          <p className="text-white/40">Monitor platform health, detect issues, and apply automated fixes.</p>
        </div>
        <button 
          onClick={handleRunDiagnostics}
          disabled={running}
          className="flex items-center gap-2 px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
        >
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {running ? 'Scanning...' : 'Run Full Scan'}
        </button>
      </div>

      {/* Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0A0A0B] border border-white/5 p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
              <Shield className="w-5 h-5" />
            </div>
            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
              latestReport?.status === 'healthy' ? 'bg-emerald-500/10 text-emerald-500' : 
              latestReport?.status === 'degraded' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
            }`}>
              {latestReport?.status || 'Unknown'}
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest">System Status</p>
            <h3 className="text-2xl font-bold text-white mt-1">
              {latestReport?.status === 'healthy' ? 'All Systems Go' : 
               latestReport?.status === 'degraded' ? 'Performance Degraded' : 'Critical Issues Detected'}
            </h3>
          </div>
        </div>

        <div className="bg-[#0A0A0B] border border-white/5 p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500">
              <AlertCircle className="w-5 h-5" />
            </div>
            <span className="text-white/40 text-xs font-bold">{issues.filter(i => !i.isPredictive).length} Active</span>
          </div>
          <div>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Active Issues</p>
            <h3 className="text-2xl font-bold text-white mt-1">
              {issues.filter(i => !i.isPredictive).length === 0 ? 'No Issues' : `${issues.filter(i => !i.isPredictive).length} Issues Found`}
            </h3>
          </div>
        </div>

        <div className="bg-[#0A0A0B] border border-white/5 p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-white/40 text-xs font-bold">{issues.filter(i => i.isPredictive).length} Detected</span>
          </div>
          <div>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Predictive Risks</p>
            <h3 className="text-2xl font-bold text-white mt-1">
              {issues.filter(i => i.isPredictive).length} Risks Identified
            </h3>
          </div>
        </div>
      </div>

      {/* Advanced Health Score */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.entries(latestReport?.scores || { performance: 100, security: 100, ai: 100, database: 100, payments: 100 }).map(([key, score]) => (
          <div key={key} className="bg-[#0A0A0B] border border-white/5 p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{key}</p>
              <span className={`text-xs font-bold ${score > 90 ? 'text-emerald-500' : score > 70 ? 'text-amber-500' : 'text-rose-500'}`}>
                {score}%
              </span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                className={`h-full ${score > 90 ? 'bg-emerald-500' : score > 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Smart Insights & Predictive Risks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0A0A0B] border border-white/5 p-6 rounded-3xl space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Smart Insights
          </h3>
          <div className="space-y-3">
            {latestReport?.insights?.map((insight, idx) => (
              <div key={idx} className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{insight.type}</span>
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{insight.impact}</span>
                </div>
                <p className="text-sm text-white/80">{insight.description}</p>
                {insight.action && (
                  <button className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest flex items-center gap-1">
                    {insight.actionLabel} <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
            {(!latestReport?.insights || latestReport.insights.length === 0) && (
              <div className="p-8 text-center text-white/20 text-sm">
                No new insights available.
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#0A0A0B] border border-white/5 p-6 rounded-3xl space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            Risk Analysis
          </h3>
          <div className="space-y-3">
            {issues.filter(i => i.isPredictive).map((risk) => (
              <div key={risk.id} className="p-4 bg-rose-500/5 rounded-2xl border border-rose-500/10 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">{risk.title}</h4>
                  <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Predictive</span>
                </div>
                <p className="text-xs text-white/60">{risk.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Impact: {risk.impact}</span>
                </div>
              </div>
            ))}
            {issues.filter(i => i.isPredictive).length === 0 && (
              <div className="p-8 text-center text-white/20 text-sm">
                No upcoming risks detected.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Issues List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              Active Issues
            </h2>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {issues.filter(i => !i.isPredictive).length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 border border-dashed border-white/10 p-12 rounded-3xl text-center space-y-4"
                >
                  <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-white font-bold">System is Healthy</h3>
                    <p className="text-sm text-white/40">No active issues detected at this time.</p>
                  </div>
                </motion.div>
              ) : (
                issues.filter(i => !i.isPredictive).map((issue) => (
                  <motion.div
                    key={issue.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-[#0A0A0B] border border-white/5 p-6 rounded-3xl space-y-4 relative overflow-hidden group"
                  >
                    <div className={`absolute top-0 left-0 w-1 h-full ${
                      issue.severity === IssueSeverity.CRITICAL ? 'bg-rose-500' : 
                      issue.severity === IssueSeverity.WARNING ? 'bg-orange-500' : 'bg-amber-500'
                    }`} />
                    
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${getSeverityColor(issue.severity)}`}>
                            {issue.severity}
                          </span>
                          <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{issue.category}</span>
                        </div>
                        <h3 className="text-lg font-bold text-white">{issue.title}</h3>
                        <p className="text-sm text-white/60 leading-relaxed">{issue.description}</p>
                      </div>
                      <div className="text-right text-[10px] text-white/20 font-bold uppercase tracking-widest">
                        {new Date(issue.detectedAt).toLocaleTimeString()}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Location</p>
                        <p className="text-xs text-white/80 font-mono">{issue.location}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Impact</p>
                        <p className="text-xs text-white/80">{issue.impact}</p>
                      </div>
                    </div>

                    {issue.suggestedFix && (
                      <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl space-y-3">
                        <div className="flex items-center gap-2 text-indigo-400">
                          <Wrench className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-widest">Suggested Fix</span>
                        </div>
                        <p className="text-sm text-white/80">{issue.suggestedFix}</p>
                        {issue.fixAction && (
                          <button 
                            onClick={() => handleApplyFix(issue.id)}
                            disabled={fixing === issue.id}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                          >
                            {fixing === issue.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                            Apply One-Click Fix
                          </button>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Diagnostic History & Checks */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              Latest Checks
            </h2>
            <div className="bg-[#0A0A0B] border border-white/5 rounded-3xl overflow-hidden">
              {latestReport?.checks.map((check, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(check.status)}
                    <div>
                      <p className="text-sm font-bold text-white">{check.name}</p>
                      <p className="text-[10px] text-white/40">{check.message}</p>
                    </div>
                  </div>
                  {check.latency && (
                    <span className="text-[10px] font-mono text-white/20">{check.latency}ms</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-white/40" />
              Scan History
            </h2>
            <div className="space-y-3">
              {history.map((report, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      report.status === 'healthy' ? 'bg-emerald-500' : 
                      report.status === 'degraded' ? 'bg-amber-500' : 'bg-rose-500'
                    }`} />
                    <span className="text-xs text-white/60">{new Date(report.timestamp).toLocaleString()}</span>
                  </div>
                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{report.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemDiagnostics;
