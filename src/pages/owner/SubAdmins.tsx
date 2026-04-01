import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Plus, 
  Shield, 
  ShieldCheck, 
  ShieldAlert,
  MoreVertical,
  Search,
  Filter,
  Mail,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';

interface SubAdmin {
  id: string;
  name: string;
  email: string;
  role: 'Manager' | 'Support' | 'Moderator' | 'Billing';
  status: 'active' | 'suspended';
  lastActive: string;
  permissions: string[];
  avatar?: string;
}

const SubAdmins: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [admins, setAdmins] = useState<SubAdmin[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.j@aisaas.com',
      role: 'Manager',
      status: 'active',
      lastActive: '2024-03-22T10:30:00Z',
      permissions: ['users_read', 'users_write', 'billing_read', 'analytics_read']
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'm.chen@aisaas.com',
      role: 'Support',
      status: 'active',
      lastActive: '2024-03-22T09:15:00Z',
      permissions: ['users_read', 'support_chat', 'tickets_manage']
    },
    {
      id: '3',
      name: 'Alex Rivera',
      email: 'a.rivera@aisaas.com',
      role: 'Moderator',
      status: 'suspended',
      lastActive: '2024-03-15T16:45:00Z',
      permissions: ['content_moderate', 'users_read']
    },
    {
      id: '4',
      name: 'Emma Wilson',
      email: 'e.wilson@aisaas.com',
      role: 'Billing',
      status: 'active',
      lastActive: '2024-03-21T14:20:00Z',
      permissions: ['billing_manage', 'revenue_read']
    }
  ]);

  const toggleStatus = (id: string) => {
    setAdmins(admins.map(admin => {
      if (admin.id === id) {
        const newStatus = admin.status === 'active' ? 'suspended' : 'active';
        toast.success(`${admin.name} ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`);
        return { ...admin, status: newStatus };
      }
      return admin;
    }));
  };

  const deleteAdmin = (id: string) => {
    setAdmins(admins.filter(a => a.id !== id));
    toast.success('Sub-admin removed successfully');
  };

  const filteredAdmins = admins.filter(admin => 
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Manager': return ShieldCheck;
      case 'Support': return Mail;
      case 'Moderator': return ShieldAlert;
      case 'Billing': return Shield;
      default: return Users;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Manager': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      case 'Support': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Moderator': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Billing': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      default: return 'text-white/40 bg-white/5 border-white/5';
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Sub-Admin Management</h1>
          </div>
          <p className="text-white/40 max-w-lg">
            Delegate administrative tasks to your team members with granular permission controls and role-based access.
          </p>
        </div>
        
        <button className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 group">
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          Invite Sub-Admin
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-[#0A0A0B] border border-white/5 p-6 rounded-[32px] flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/5 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-sm font-bold transition-all border border-white/5">
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      {/* Admins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAdmins.map((admin) => (
          <motion.div
            key={admin.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "bg-[#0A0A0B] border border-white/5 p-6 rounded-[32px] group hover:border-white/10 transition-all relative overflow-hidden",
              admin.status === 'suspended' && "opacity-60"
            )}
          >
            <div className="flex items-start justify-between mb-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 overflow-hidden">
                    {admin.avatar ? (
                      <img src={admin.avatar} alt={admin.name} className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-7 h-7 text-white/20" />
                    )}
                  </div>
                  <div className={cn(
                    "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-[#0A0A0B] flex items-center justify-center",
                    admin.status === 'active' ? "bg-emerald-500" : "bg-rose-500"
                  )}>
                    {admin.status === 'active' ? <CheckCircle2 className="w-3 h-3 text-white" /> : <XCircle className="w-3 h-3 text-white" />}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{admin.name}</h3>
                  <p className="text-sm text-white/40">{admin.email}</p>
                </div>
              </div>
              <div className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border flex items-center gap-2", getRoleColor(admin.role))}>
                {React.createElement(getRoleIcon(admin.role), { className: "w-3 h-3" })}
                {admin.role}
              </div>
            </div>

            <div className="space-y-4 mb-6 relative z-10">
              <div className="flex flex-wrap gap-2">
                {admin.permissions.map(p => (
                  <span key={p} className="px-2 py-0.5 bg-white/5 text-white/40 rounded-md text-[10px] font-medium uppercase tracking-wider">
                    {p.replace('_', ' ')}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 text-xs text-white/20">
                <Clock className="w-4 h-4" />
                Last active: {new Date(admin.lastActive).toLocaleString()}
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-white/5 relative z-10">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toggleStatus(admin.id)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                    admin.status === 'active' 
                      ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20" 
                      : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
                  )}
                >
                  {admin.status === 'active' ? 'Suspend' : 'Activate'}
                </button>
                <button className="p-2 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-xl transition-all border border-white/5">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              <button 
                onClick={() => deleteAdmin(admin.id)}
                className="p-2 bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-400 rounded-xl transition-all border border-white/5"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Audit Notice */}
      <div className="bg-amber-500/5 border border-amber-500/10 p-6 rounded-[32px] flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shrink-0">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white">Security Audit Logging</h4>
          <p className="text-xs text-white/40 leading-relaxed">
            Every action performed by sub-admins is recorded in the system audit logs. 
            You can review these actions in the <span className="text-indigo-400 font-bold">Activity Logs</span> section to ensure compliance and security.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubAdmins;
