import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Bell, 
  Send, 
  Users, 
  Target, 
  Mail, 
  MessageSquare, 
  Smartphone,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Megaphone,
  LayoutGrid
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';

interface NotificationTemplate {
  id: string;
  title: string;
  message: string;
  type: 'System' | 'Marketing' | 'Alert' | 'Update';
  channels: ('Email' | 'Push' | 'In-App')[];
  status: 'active' | 'draft';
  lastSent: string | null;
  target: 'All Users' | 'Paid Users' | 'Free Users' | 'Admins';
}

const NotificationsManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [templates, setTemplates] = useState<NotificationTemplate[]>([
    {
      id: '1',
      title: 'New Feature Announcement',
      message: 'We just launched our new AI Video Generator! Check it out now.',
      type: 'Update',
      channels: ['Email', 'In-App'],
      status: 'active',
      lastSent: '2024-03-20T14:30:00Z',
      target: 'All Users'
    },
    {
      id: '2',
      title: 'Subscription Expiring Soon',
      message: 'Your premium subscription will expire in 3 days. Renew now to keep access.',
      type: 'Alert',
      channels: ['Email', 'Push', 'In-App'],
      status: 'active',
      lastSent: '2024-03-22T09:15:00Z',
      target: 'Paid Users'
    },
    {
      id: '3',
      title: 'Weekend Special Offer',
      message: 'Get 50% off on all annual plans this weekend only!',
      type: 'Marketing',
      channels: ['Email'],
      status: 'draft',
      lastSent: null,
      target: 'Free Users'
    },
    {
      id: '4',
      title: 'System Maintenance',
      message: 'Scheduled maintenance on March 25th from 02:00 to 04:00 UTC.',
      type: 'System',
      channels: ['In-App'],
      status: 'active',
      lastSent: '2024-03-18T10:00:00Z',
      target: 'All Users'
    }
  ]);

  const deleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
    toast.success('Notification template deleted');
  };

  const sendNotification = (id: string) => {
    toast.success('Notification broadcast started successfully');
  };

  const filteredTemplates = templates.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'System': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'Marketing': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'Alert': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'Update': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-white/40 bg-white/5 border-white/5';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'Email': return Mail;
      case 'Push': return Smartphone;
      case 'In-App': return Bell;
      default: return MessageSquare;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <Megaphone className="w-5 h-5 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Notification Center</h1>
          </div>
          <p className="text-white/40 max-w-lg">
            Create, manage, and broadcast system-wide notifications and marketing messages across multiple channels.
          </p>
        </div>
        
        <button className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 group">
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          Create Broadcast
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Sent', value: '1.2M', icon: Send, color: 'text-indigo-400' },
          { label: 'Open Rate', value: '24.5%', icon: Target, color: 'text-emerald-400' },
          { label: 'Active Templates', value: '12', icon: LayoutGrid, color: 'text-purple-400' },
          { label: 'Failed Delivery', value: '0.02%', icon: AlertCircle, color: 'text-rose-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#0A0A0B] border border-white/5 p-4 rounded-2xl flex items-center gap-3 group hover:border-white/10 transition-all">
            <div className={cn("w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform", stat.color)}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{stat.label}</p>
              <p className="text-sm font-bold text-white">{stat.value}</p>
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
            placeholder="Search templates by title or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/5 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-sm font-bold transition-all border border-white/5">
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      {/* Templates List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredTemplates.map((template) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0A0A0B] border border-white/5 p-6 rounded-[32px] group hover:border-white/10 transition-all relative overflow-hidden"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="flex items-start gap-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border", getTypeColor(template.type))}>
                  <Bell className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{template.title}</h3>
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest", getTypeColor(template.type))}>
                      {template.type}
                    </span>
                    {template.status === 'draft' && (
                      <span className="px-2 py-0.5 bg-white/5 text-white/40 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/5">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-white/40 max-w-xl">{template.message}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-8">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Channels</p>
                  <div className="flex items-center gap-2">
                    {template.channels.map(channel => (
                      <div key={channel} className="p-1.5 bg-white/5 rounded-lg text-white/40" title={channel}>
                        {React.createElement(getChannelIcon(channel), { className: "w-4 h-4" })}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Target Audience</p>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <Users className="w-4 h-4 text-indigo-400" />
                    {template.target}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => sendNotification(template.id)}
                    className="p-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl transition-all shadow-lg shadow-indigo-500/20"
                    title="Send Now"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                  <button className="p-3 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-2xl transition-all border border-white/5">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => deleteTemplate(template.id)}
                    className="p-3 bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-400 rounded-2xl transition-all border border-white/5"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-6 text-[10px] font-bold text-white/20 uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3" />
                Last Sent: {template.lastSent ? new Date(template.lastSent).toLocaleString() : 'Never'}
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                Delivery Rate: 99.9%
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsManager;
