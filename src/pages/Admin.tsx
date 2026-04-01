import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'motion/react';
import { 
  Shield, 
  AlertTriangle, 
  UserX, 
  CheckCircle, 
  XCircle, 
  Flag, 
  MoreVertical,
  Clock,
  ExternalLink,
  Trash2,
  Ban
} from 'lucide-react';
import { RootState } from '../store';
import { Report } from '../socialTypes';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const Admin: React.FC = () => {
  const { token, user: currentUser } = useSelector((state: RootState) => state.auth);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'resolved'>('pending');

  const fetchReports = async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/admin/reports', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [token]);

  const handleAction = async (reportId: string, action: 'resolve' | 'dismiss') => {
    if (!token) return;
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: action === 'resolve' ? 'resolved' : 'dismissed' })
      });
      if (response.ok) {
        setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: action === 'resolve' ? 'resolved' : 'dismissed' } : r));
        toast.success(`Report ${action}ed`);
      }
    } catch (error) {
      toast.error('Action failed');
    }
  };

  const handleBanUser = async (userId: string) => {
    if (!token) return;
    try {
      const response = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        toast.success('User banned successfully');
      }
    } catch (error) {
      toast.error('Failed to ban user');
    }
  };

  const filteredReports = reports.filter(r => r.status === activeTab);

  if (currentUser?.role === 'member') {
    return <div className="text-center py-20 text-rose-500 font-bold">Access Denied</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-rose-500" />
            Admin Dashboard
          </h1>
          <p className="text-sm text-white/40">Manage reports and community safety.</p>
        </div>
        <div className="flex bg-[#1a1030] rounded-lg p-1 border border-white/5">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'pending' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' : 'text-white/40 hover:text-white'}`}
          >
            Pending
          </button>
          <button 
            onClick={() => setActiveTab('resolved')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'resolved' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-white/40 hover:text-white'}`}
          >
            Resolved
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="bg-[#1e1535] h-32 rounded-xl animate-pulse" />
          ))
        ) : (
          filteredReports.map((report) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1e1535] border border-white/5 rounded-xl p-6 space-y-4 hover:border-rose-500/20 transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">Report #{report.id.slice(-6)}</span>
                      <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] uppercase font-bold text-white/40 tracking-widest">
                        {report.targetType}
                      </span>
                    </div>
                    <p className="text-xs text-white/60">
                      Reported by <span className="text-white font-bold">User {report.reporterId.slice(0, 5)}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-white/30">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                </div>
              </div>

              <div className="bg-black/20 rounded-lg p-4 border border-white/5">
                <p className="text-sm text-white/80 italic">"{report.reason}"</p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-4">
                  <button className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                    View Target
                  </button>
                  <button 
                    onClick={() => handleBanUser(report.targetId)}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    Ban User
                  </button>
                </div>

                {report.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleAction(report.id, 'dismiss')}
                      className="px-4 py-1.5 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 text-xs font-bold transition-all"
                    >
                      Dismiss
                    </button>
                    <button 
                      onClick={() => handleAction(report.id, 'resolve')}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold transition-all shadow-lg shadow-emerald-600/20"
                    >
                      Resolve
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}

        {!loading && filteredReports.length === 0 && (
          <div className="text-center py-20 bg-[#1e1535] rounded-2xl border border-white/5 space-y-4">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-emerald-500/20" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-medium text-white/90">No pending reports</h3>
              <p className="text-sm text-white/40">The community is safe and sound.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
