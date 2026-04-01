import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  Settings, 
  CheckCircle2, 
  ExternalLink, 
  Search,
  Filter,
  ArrowRight,
  Shield,
  LayoutGrid,
  Globe,
  Database,
  Mail,
  MessageSquare,
  Share2,
  Cloud,
  Code2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'Communication' | 'Marketing' | 'Database' | 'Cloud' | 'Development';
  status: 'connected' | 'not_connected' | 'pending';
  icon: any;
  color: string;
  glow: string;
}

const Integrations: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: '1',
      name: 'Slack',
      description: 'Send real-time notifications to your Slack channels.',
      category: 'Communication',
      status: 'connected',
      icon: MessageSquare,
      color: 'text-purple-400',
      glow: 'bg-purple-500/10'
    },
    {
      id: '2',
      name: 'Mailchimp',
      description: 'Sync your users with Mailchimp marketing lists.',
      category: 'Marketing',
      status: 'not_connected',
      icon: Mail,
      color: 'text-yellow-400',
      glow: 'bg-yellow-500/10'
    },
    {
      id: '3',
      name: 'AWS S3',
      description: 'Store and manage your media assets on AWS S3.',
      category: 'Cloud',
      status: 'connected',
      icon: Cloud,
      color: 'text-orange-400',
      glow: 'bg-orange-500/10'
    },
    {
      id: '4',
      name: 'GitHub',
      description: 'Automate deployments and sync your code repositories.',
      category: 'Development',
      status: 'pending',
      icon: Code2,
      color: 'text-indigo-400',
      glow: 'bg-indigo-500/10'
    },
    {
      id: '5',
      name: 'PostgreSQL',
      description: 'Connect your external database for advanced analytics.',
      category: 'Database',
      status: 'not_connected',
      icon: Database,
      color: 'text-blue-400',
      glow: 'bg-blue-500/10'
    },
    {
      id: '6',
      name: 'Zapier',
      description: 'Connect with 5000+ apps using Zapier automation.',
      category: 'Marketing',
      status: 'connected',
      icon: Zap,
      color: 'text-amber-400',
      glow: 'bg-amber-500/10'
    }
  ]);

  const toggleConnection = (id: string) => {
    setIntegrations(integrations.map(int => {
      if (int.id === id) {
        const newStatus = int.status === 'connected' ? 'not_connected' : 'connected';
        toast.success(`${int.name} ${newStatus === 'connected' ? 'connected' : 'disconnected'} successfully`);
        return { ...int, status: newStatus };
      }
      return int;
    }));
  };

  const filteredIntegrations = integrations.filter(int => 
    int.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    int.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <LayoutGrid className="w-5 h-5 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Integrations</h1>
          </div>
          <p className="text-white/40 max-w-lg">
            Connect your favorite tools and services to supercharge your AI workflows and automate your business.
          </p>
        </div>
        
        <button className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-sm font-bold transition-all border border-white/5 group">
          <Globe className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          Explore Marketplace
        </button>
      </div>

      {/* Categories Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Communication', count: 12, icon: MessageSquare, color: 'text-purple-400' },
          { label: 'Cloud Storage', count: 5, icon: Cloud, color: 'text-orange-400' },
          { label: 'Marketing', count: 8, icon: Zap, color: 'text-amber-400' },
          { label: 'Development', count: 15, icon: Code2, color: 'text-indigo-400' },
        ].map((cat, i) => (
          <div key={i} className="bg-[#0A0A0B] border border-white/5 p-4 rounded-2xl flex items-center gap-3 group hover:border-white/10 transition-all">
            <div className={cn("w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform", cat.color)}>
              <cat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{cat.label}</p>
              <p className="text-sm font-bold text-white">{cat.count} Apps</p>
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
            placeholder="Search integrations by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/5 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-sm font-bold transition-all border border-white/5">
          <Filter className="w-4 h-4" /> Categories
        </button>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map((int) => (
          <motion.div
            key={int.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0A0A0B] border border-white/5 p-6 rounded-[32px] group hover:border-white/10 transition-all relative overflow-hidden flex flex-col h-full"
          >
            {/* Background Glow */}
            <div className={cn("absolute -right-10 -top-10 w-32 h-32 blur-[60px] rounded-full pointer-events-none opacity-50 transition-opacity group-hover:opacity-100", int.glow)} />
            
            <div className="flex items-start justify-between mb-6 relative z-10">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform", int.glow, int.color)}>
                <int.icon className="w-7 h-7" />
              </div>
              <div className="flex items-center gap-2">
                {int.status === 'connected' && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> Connected
                  </div>
                )}
                {int.status === 'pending' && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-amber-500/20">
                    <Zap className="w-3 h-3 animate-pulse" /> Pending
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 mb-6 relative z-10 flex-1">
              <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{int.name}</h3>
              <p className="text-sm text-white/40 leading-relaxed line-clamp-2">
                {int.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-white/5 relative z-10">
              <button 
                onClick={() => toggleConnection(int.id)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                  int.status === 'connected' 
                    ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20" 
                    : "bg-indigo-500 hover:bg-indigo-600 text-white border-indigo-500/20"
                )}
              >
                {int.status === 'connected' ? 'Disconnect' : 'Connect Now'}
              </button>
              <button className="p-2 text-white/20 hover:text-white transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Security Notice */}
      <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-[32px] flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
          <Shield className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white">Enterprise Security</h4>
          <p className="text-xs text-white/40 leading-relaxed">
            All integrations are end-to-end encrypted and SOC2 compliant. We never store your third-party credentials directly; 
            instead, we use secure OAuth2 protocols and scoped access tokens.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Integrations;
