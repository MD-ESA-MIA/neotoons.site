import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Key, 
  Plus, 
  Copy, 
  Trash2, 
  Shield, 
  Eye, 
  EyeOff,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';

interface APIKey {
  id: string;
  name: string;
  key: string;
  status: 'active' | 'revoked';
  lastUsed: string;
  createdAt: string;
  permissions: string[];
}

const APIKeys: React.FC = () => {
  const [showKeyId, setShowKeyId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [keys, setKeys] = useState<APIKey[]>([
    {
      id: '1',
      name: 'Production Main API',
      key: 'sk_live_51MzS...9x2k',
      status: 'active',
      lastUsed: '2024-03-21T14:30:00Z',
      createdAt: '2024-01-15T10:00:00Z',
      permissions: ['read', 'write', 'admin']
    },
    {
      id: '2',
      name: 'Development Testing',
      key: 'sk_test_51MzS...4f8m',
      status: 'active',
      lastUsed: '2024-03-22T09:15:00Z',
      createdAt: '2024-02-10T11:20:00Z',
      permissions: ['read', 'write']
    },
    {
      id: '3',
      name: 'Legacy Integration',
      key: 'sk_live_51MzS...1a7b',
      status: 'revoked',
      lastUsed: '2023-12-05T16:45:00Z',
      createdAt: '2023-06-20T08:30:00Z',
      permissions: ['read']
    }
  ]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('API Key copied to clipboard');
  };

  const toggleKeyVisibility = (id: string) => {
    setShowKeyId(showKeyId === id ? null : id);
  };

  const revokeKey = (id: string) => {
    setKeys(keys.map(k => k.id === id ? { ...k, status: 'revoked' } : k));
    toast.success('API Key revoked successfully');
  };

  const deleteKey = (id: string) => {
    setKeys(keys.filter(k => k.id !== id));
    toast.success('API Key deleted permanently');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <Key className="w-5 h-5 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">API Management</h1>
          </div>
          <p className="text-white/40 max-w-lg">
            Generate and manage API keys to integrate our AI services into your own applications and workflows.
          </p>
        </div>
        
        <button className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 group">
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          Create New Key
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Active Keys', value: keys.filter(k => k.status === 'active').length, icon: CheckCircle2, color: 'text-emerald-400' },
          { label: 'Total Requests', value: '1.2M', icon: RefreshCw, color: 'text-indigo-400' },
          { label: 'Security Alerts', value: '0', icon: Shield, color: 'text-amber-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#0A0A0B] border border-white/5 p-6 rounded-[32px] flex items-center gap-4 group hover:border-white/10 transition-all">
            <div className={cn("w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform", stat.color)}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-white/20 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-[#0A0A0B] border border-white/5 p-6 rounded-[32px] flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
          <input
            type="text"
            placeholder="Search keys by name or permissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/5 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-sm font-bold transition-all border border-white/5">
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      {/* API Keys List */}
      <div className="grid grid-cols-1 gap-4">
        {keys.map((apiKey) => (
          <motion.div
            key={apiKey.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "bg-[#0A0A0B] border border-white/5 p-6 rounded-[32px] group hover:border-white/10 transition-all relative overflow-hidden",
              apiKey.status === 'revoked' && "opacity-60"
            )}
          >
            {/* Background Glow */}
            <div className="absolute -right-20 -top-20 w-40 h-40 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center border",
                  apiKey.status === 'active' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                )}>
                  <Key className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-white">{apiKey.name}</h3>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      apiKey.status === 'active' ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                    )}>
                      {apiKey.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {apiKey.permissions.map(p => (
                      <span key={p} className="px-2 py-0.5 bg-white/5 text-white/40 rounded-md text-[10px] font-medium uppercase tracking-wider">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex-1 max-w-md">
                <div className="relative group/key">
                  <div className="bg-white/5 border border-white/5 rounded-2xl px-4 py-3 flex items-center justify-between gap-4">
                    <code className="text-sm font-mono text-white/60 truncate">
                      {showKeyId === apiKey.id ? apiKey.key : '••••••••••••••••••••••••••••••••'}
                    </code>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                        className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"
                      >
                        {showKeyId === apiKey.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => copyToClipboard(apiKey.key)}
                        className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between lg:justify-end gap-8">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Last Used</p>
                  <p className="text-sm text-white/60">{new Date(apiKey.lastUsed).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  {apiKey.status === 'active' ? (
                    <button 
                      onClick={() => revokeKey(apiKey.id)}
                      className="p-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-2xl transition-all border border-rose-500/20"
                      title="Revoke Key"
                    >
                      <AlertCircle className="w-5 h-5" />
                    </button>
                  ) : (
                    <button 
                      onClick={() => deleteKey(apiKey.id)}
                      className="p-3 bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-400 rounded-2xl transition-all border border-white/5"
                      title="Delete Key"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                  <button className="p-3 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-2xl transition-all border border-white/5">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Security Notice */}
      <div className="bg-indigo-500/5 border border-indigo-500/10 p-6 rounded-[32px] flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
          <Shield className="w-5 h-5 text-indigo-400" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white">Security Best Practices</h4>
          <p className="text-xs text-white/40 leading-relaxed">
            API keys carry full account permissions. Never share them in public repositories or client-side code. 
            We recommend using environment variables and rotating keys every 90 days to maintain optimal security.
          </p>
        </div>
      </div>
    </div>
  );
};

export default APIKeys;
