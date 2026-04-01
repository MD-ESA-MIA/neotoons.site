import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'motion/react';
import { 
  Shield, 
  Users, 
  Settings, 
  Activity, 
  UserPlus, 
  Trash2, 
  Edit, 
  CheckCircle, 
  XCircle,
  Search,
  Filter,
  MoreVertical,
  Bot,
  History,
  Zap
} from 'lucide-react';
import { RootState } from '../store';
import { User } from '../types';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

const OwnerDashboard: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    activeToday: 0,
    systemHealth: 'Healthy',
    recentChanges: 0
  });

  const fetchUsers = async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/owner/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        
        // Fetch change logs count
        const logsRes = await fetch('/api/owner/logs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const logs = await logsRes.json();

        // Calculate stats
        setStats({
          totalUsers: data.length,
          totalAdmins: data.filter((u: User) => u.role === 'admin').length,
          activeToday: Math.floor(data.length * 0.7), // Mock active count
          systemHealth: 'Healthy',
          recentChanges: logs.length
        });
      }
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'member') => {
    if (!token) return;
    try {
      const response = await fetch(`/api/owner/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      if (response.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        toast.success(`User role updated to ${newRole}`);
      }
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-accent" />
            System Control
          </h1>
          <p className="text-text-muted">Manage system users, administrators, and global settings.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to="/owner/ai-bot"
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
          >
            <Bot className="w-4 h-4" />
            AI System Bot
          </Link>
          <Link 
            to="/owner/settings"
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-all border border-white/10 flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            System Settings
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Total Admins', value: stats.totalAdmins, icon: Shield, color: 'text-accent', bg: 'bg-accent/10' },
          { label: 'Recent Changes', value: stats.recentChanges, icon: History, color: 'text-purple-400', bg: 'bg-purple-400/10' },
          { label: 'System Status', value: stats.systemHealth, icon: CheckCircle, color: 'text-cyan', bg: 'bg-cyan/10' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border border-border p-6 rounded-2xl space-y-4"
          >
            <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-text-muted font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* User Management Section */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-accent" />
            User Management
          </h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input 
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-accent/50 w-64"
              />
            </div>
            <button className="p-2 bg-white/5 hover:bg-white/10 text-text-muted rounded-xl transition-all border border-white/10">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-[10px] uppercase tracking-widest font-bold text-text-muted">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-4 h-16 bg-white/5"></td>
                  </tr>
                ))
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold overflow-hidden">
                        {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : user.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{user.name}</p>
                        <p className="text-xs text-text-muted">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      user.role === 'owner' ? 'bg-rose-500/10 text-rose-500' :
                      user.role === 'admin' ? 'bg-accent/10 text-accent' :
                      'bg-white/10 text-white/60'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-white/20'}`}></div>
                      <span className="text-xs text-text-muted">{user.isOnline ? 'Online' : 'Offline'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-text-muted">
                    {new Date(user.joinedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {user.role !== 'owner' && (
                        <>
                          <button 
                            onClick={() => handleRoleChange(user.id, user.role === 'admin' ? 'member' : 'admin')}
                            className="p-2 hover:bg-white/10 text-text-muted hover:text-accent rounded-lg transition-all"
                            title={user.role === 'admin' ? 'Demote to Member' : 'Promote to Admin'}
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-white/10 text-text-muted hover:text-rose-500 rounded-lg transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button className="p-2 hover:bg-white/10 text-text-muted rounded-lg transition-all">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
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

export default OwnerDashboard;
