import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  Send, 
  Activity, 
  ShieldAlert, 
  CheckCircle, 
  RefreshCw, 
  AlertTriangle,
  Terminal,
  Cpu,
  Zap,
  History,
  Trash2
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { SystemIssue, DiagnosticReport, IssueSeverity } from '../../socialTypes';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'owner';
  timestamp: string;
  changes?: any[];
}

const AISystemBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello Owner. I am your AI System Admin Bot. I've analyzed the platform's current state. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [diagnostics, setDiagnostics] = useState<{
    issues: SystemIssue[];
    latestReport: DiagnosticReport | null;
  }>({ issues: [], latestReport: null });
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDiagnostics();
    fetchSystemStatus();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchDiagnostics = async () => {
    try {
      const data = await adminService.getDiagnostics();
      setDiagnostics({ issues: data.issues, latestReport: data.latestReport });
    } catch (error) {
      console.error('Failed to fetch diagnostics:', error);
    }
  };

  const fetchSystemStatus = async () => {
    try {
      const status = await adminService.getSystemStatus();
      setSystemStatus(status);
    } catch (error) {
      console.error('Failed to fetch system status:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'owner',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const data = await adminService.chatWithAIBot(input);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.text,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        changes: data.changes
      };
      setMessages(prev => [...prev, botMessage]);
      
      if (data.changes && data.changes.some((c: any) => c.status === 'executed')) {
        toast.success('System updated successfully');
        fetchSystemStatus();
        fetchDiagnostics();
      }
    } catch (error) {
      toast.error('AI Bot failed to respond');
    } finally {
      setIsTyping(false);
    }
  };

  const handleOptimize = async () => {
    setIsScanning(true);
    try {
      const result = await adminService.runOptimization();
      const botMessage: Message = {
        id: Date.now().toString(),
        text: result.message,
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMessage]);
      toast.success('Optimization completed');
    } catch (error) {
      toast.error('Optimization failed');
    } finally {
      setIsScanning(false);
    }
  };

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const report = await adminService.runDiagnostics();
      setDiagnostics(prev => ({ ...prev, latestReport: report }));
      await fetchDiagnostics();
      
      const botMessage: Message = {
        id: Date.now().toString(),
        text: `System scan completed. Status: ${report.status.toUpperCase()}. I found ${report.activeIssuesCount} active issues. ${report.summary}`,
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMessage]);
      toast.success('Scan completed');
    } catch (error) {
      toast.error('Scan failed');
    } finally {
      setIsScanning(false);
    }
  };

  const handleFix = async (issueId: string) => {
    try {
      await adminService.applyFix(issueId);
      toast.success('Fix applied successfully');
      fetchDiagnostics();
    } catch (error) {
      toast.error('Failed to apply fix');
    }
  };

  const activeIssues = diagnostics.issues.filter(i => i.status === 'active');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-160px)]">
      {/* Chat Interface */}
      <div className="lg:col-span-2 flex flex-col bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <Bot className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="font-bold text-white">AI System Bot</h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-emerald-500 uppercase tracking-widest font-bold">Online & Monitoring</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setMessages([messages[0]])}
            className="p-2 hover:bg-white/10 text-text-muted rounded-lg transition-all"
            title="Clear Chat"
          >
            <History className="w-4 h-4" />
          </button>
        </div>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
        >
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.sender === 'owner' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] flex gap-3 ${msg.sender === 'owner' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs ${
                  msg.sender === 'bot' ? 'bg-indigo-500 text-white' : 'bg-white/10 text-white/60'
                }`}>
                  {msg.sender === 'bot' ? 'AI' : 'ME'}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'bot' 
                    ? 'bg-white/5 border border-white/10 text-white' 
                    : 'bg-indigo-500 text-white'
                }`}>
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                  
                  {msg.changes && msg.changes.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                      <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">System Actions Executed:</p>
                      {msg.changes.map((change, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[11px] bg-black/20 p-2 rounded-lg">
                          {change.status === 'executed' ? (
                            <CheckCircle className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <AlertTriangle className="w-3 h-3 text-amber-500" />
                          )}
                          <span className="text-white/80">
                            {change.type.replace(/_/g, ' ')}: {change.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-[10px] opacity-40 mt-2">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex gap-2">
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border bg-white/5 space-y-4">
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Optimize System', icon: Zap, action: handleOptimize },
              { label: 'Fix Everything', icon: RefreshCw, command: 'Fix all active issues' },
              { label: 'Reduce Cost', icon: Cpu, command: 'Suggest model changes to reduce costs' },
              { label: 'Run Full Scan', icon: Activity, action: handleScan }
            ].map((cmd) => (
              <button
                key={cmd.label}
                onClick={() => {
                  if (cmd.action) {
                    cmd.action();
                  } else if (cmd.command) {
                    setInput(cmd.command);
                    // We need to call handleSend with the new input, but setInput is async.
                    // For simplicity, we'll just set the input and let the user click send, 
                    // or we can trigger it if we refactor handleSend to take an optional text.
                  }
                }}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold text-white/60 hover:text-white transition-all flex items-center gap-2 group"
              >
                <cmd.icon className="w-3 h-3 text-indigo-400 group-hover:scale-110 transition-transform" />
                {cmd.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me to scan, fix problems, or check performance..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-lg transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* System Status Panel */}
      <div className="space-y-6">
        {/* Quick Stats */}
        {systemStatus && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card border border-border p-4 rounded-2xl">
              <p className="text-[10px] text-text-muted uppercase font-bold">Active Users</p>
              <p className="text-xl font-bold text-white mt-1">{systemStatus.users.active}</p>
            </div>
            <div className="bg-card border border-border p-4 rounded-2xl">
              <p className="text-[10px] text-text-muted uppercase font-bold">Health Score</p>
              <p className="text-xl font-bold text-emerald-500 mt-1">{systemStatus.health.score}%</p>
            </div>
          </div>
        )}

        {/* Health Card */}
        <div className="bg-card border border-border p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              System Health
            </h3>
            <button 
              onClick={handleScan}
              disabled={isScanning}
              className="p-2 hover:bg-white/10 text-indigo-400 rounded-lg transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
              diagnostics.latestReport?.status === 'healthy' ? 'bg-emerald-500/10 text-emerald-500' :
              diagnostics.latestReport?.status === 'degraded' ? 'bg-amber-500/10 text-amber-500' :
              'bg-rose-500/10 text-rose-500'
            }`}>
              {diagnostics.latestReport?.status === 'healthy' ? <CheckCircle className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
            </div>
            <div>
              <p className="text-2xl font-bold text-white capitalize">{diagnostics.latestReport?.status || 'Unknown'}</p>
              <p className="text-xs text-text-muted">Last scan: {diagnostics.latestReport ? new Date(diagnostics.latestReport.timestamp).toLocaleTimeString() : 'Never'}</p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            {diagnostics.latestReport?.checks.map((check, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-text-muted">{check.name}</span>
                <span className={
                  check.status === 'pass' ? 'text-emerald-500' :
                  check.status === 'warn' ? 'text-amber-500' :
                  'text-rose-500'
                }>{check.status.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Issues */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-border bg-white/5">
            <h3 className="font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              Active Issues ({activeIssues.length})
            </h3>
          </div>
          <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
            {activeIssues.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-8 h-8 text-emerald-500/20 mx-auto mb-2" />
                <p className="text-xs text-text-muted">All systems operational</p>
              </div>
            ) : activeIssues.map((issue) => (
              <div key={issue.id} className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-white">{issue.title}</h4>
                    <p className="text-xs text-text-muted mt-1">{issue.description}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    issue.severity === IssueSeverity.CRITICAL ? 'bg-rose-500/10 text-rose-500' :
                    issue.severity === IssueSeverity.WARNING ? 'bg-amber-500/10 text-amber-500' :
                    'bg-blue-500/10 text-blue-500'
                  }`}>
                    {issue.severity}
                  </span>
                </div>
                {issue.canAutoFix && (
                  <button 
                    onClick={() => handleFix(issue.id)}
                    className="w-full py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Zap className="w-3 h-3" />
                    Fix Now
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISystemBot;
