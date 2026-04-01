import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  Filter, 
  Clock, 
  User, 
  Activity as ActivityIcon,
  Calendar,
  ChevronDown,
  RefreshCw,
  Download,
  Loader2
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const ActivityLog: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const data = await adminService.getActivity();
      setActivities(data);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      activity.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = filterAction === 'all' || activity.action === filterAction;
    
    return matchesSearch && matchesAction;
  });

  const uniqueActions = Array.from(new Set(activities.map(a => a.action)));

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login': return 'text-blue-400 bg-blue-400/10';
      case 'registration': return 'text-emerald-400 bg-emerald-400/10';
      case 'create post': return 'text-purple-400 bg-purple-400/10';
      case 'create task': return 'text-indigo-400 bg-indigo-400/10';
      case 'update task status': return 'text-amber-400 bg-amber-400/10';
      case 'ai generation': return 'text-pink-400 bg-pink-400/10';
      case 'ban user': return 'text-rose-400 bg-rose-400/10';
      default: return 'text-white/40 bg-white/5';
    }
  };

  const safeFormatDate = (dateString: string, formatStr: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return format(date, formatStr);
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-white tracking-tight">System Activity Logs</h1>
          <p className="text-white/40">Monitor all user actions and system events across the platform.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchActivities}
            className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all border border-white/5"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all border border-white/5">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#0A0A0B] border border-white/5 p-6 rounded-[32px] space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
            <input
              type="text"
              placeholder="Search by user, action, or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/5 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 bg-white/5 border border-white/5 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all min-w-[160px]"
              >
                <option value="all" className="bg-[#0A0A0B]">All Actions</option>
                {uniqueActions.map(action => (
                  <option key={action} value={action} className="bg-[#0A0A0B]">{action}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="bg-[#0A0A0B] border border-white/5 rounded-[32px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-8 py-6 text-[10px] font-bold text-white/20 uppercase tracking-widest">Timestamp</th>
                <th className="px-8 py-6 text-[10px] font-bold text-white/20 uppercase tracking-widest">User</th>
                <th className="px-8 py-6 text-[10px] font-bold text-white/20 uppercase tracking-widest">Action</th>
                <th className="px-8 py-6 text-[10px] font-bold text-white/20 uppercase tracking-widest">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && activities.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-6"><div className="h-4 bg-white/5 rounded w-32"></div></td>
                    <td className="px-8 py-6"><div className="h-4 bg-white/5 rounded w-24"></div></td>
                    <td className="px-8 py-6"><div className="h-6 bg-white/5 rounded-full w-20"></div></td>
                    <td className="px-8 py-6"><div className="h-4 bg-white/5 rounded w-48"></div></td>
                  </tr>
                ))
              ) : filteredActivities.length > 0 ? (
                filteredActivities.map((activity) => (
                  <motion.tr 
                    key={activity.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-xs text-white/40">
                        <Clock className="w-4 h-4 text-white/20" />
                        {safeFormatDate(activity.timestamp, 'MMM dd, HH:mm:ss')}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                          <User className="w-4 h-4 text-white/40" />
                        </div>
                        <span className="text-sm font-bold text-white">{activity.userName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${getActionColor(activity.action)}`}>
                        {activity.action}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm text-white/60 max-w-md truncate" title={activity.details}>
                        {activity.details}
                      </p>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center">
                        <ActivityIcon className="w-8 h-8 text-white/10" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-white font-bold">No activities found</p>
                        <p className="text-xs text-white/20">Try adjusting your search or filters</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
