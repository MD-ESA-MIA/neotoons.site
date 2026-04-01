import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Shield, 
  UserMinus, 
  Ban, 
  Trash2, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Download,
  CheckCircle2,
  Plus,
  X,
  Lock,
  Mail,
  User as UserIcon,
  Loader2,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import toast from 'react-hot-toast';
import { adminService } from '../../services/adminService';
import RetryPanel from '../../components/ui/RetryPanel';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const UserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showActions, setShowActions] = useState<string | null>(null);
  const [userList, setUserList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [warning, setWarning] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setWarning(null);
      const data = await adminService.getUsers();
      setUserList(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setWarning('Could not load users right now. Please retry.');
      toast.error('Failed to fetch users', { id: 'owner-users-fetch-error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      toast.success(`User role updated to ${newRole}`);
      fetchUsers();
      setShowActions(null);
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await adminService.deleteUser(userId);
      toast.success('User deleted successfully');
      fetchUsers();
      setShowDeleteConfirm(null);
      setShowActions(null);
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleToggleBan = async (userId: string, currentBanStatus: boolean) => {
    try {
      await adminService.toggleUserBan(userId, !currentBanStatus);
      toast.success(`User ${currentBanStatus ? 'unbanned' : 'banned'} successfully`);
      fetchUsers();
      setShowActions(null);
    } catch (error) {
      toast.error(`Failed to ${currentBanStatus ? 'unban' : 'ban'} user`);
    }
  };

  const filteredUsers = userList.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-white tracking-tight">User Management</h1>
          <p className="text-white/40">Manage all platform users, monitor activity, and assign roles.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all border border-white/5">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-[#0A0A0B] border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-indigo-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search users by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-white/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select 
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="appearance-none bg-white/5 border border-white/5 rounded-xl py-2 pl-4 pr-10 text-sm text-white/60 focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="member">Member</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
          </div>
        </div>
      </div>

      {warning && (
        <RetryPanel
          title="User API Error"
          message={warning}
          onRetry={fetchUsers}
          isRetrying={loading}
        />
      )}

      {/* Users Table */}
      <div className="bg-[#0A0A0B] border border-white/5 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-white/20 uppercase tracking-widest border-b border-white/5">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-white/20 text-sm">No users found</td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-white/5 flex items-center justify-center text-sm font-bold text-white">
                        {user.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{user.name}</p>
                        <p className="text-xs text-white/40">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit",
                      user.role === 'owner' ? "bg-amber-500/10 text-amber-500" : 
                      user.role === 'admin' ? "bg-indigo-500/10 text-indigo-500" : 
                      "bg-white/5 text-white/40"
                    )}>
                      {user.role === 'owner' ? <ShieldAlert className="w-3 h-3" /> : 
                       user.role === 'admin' ? <ShieldCheck className="w-3 h-3" /> : 
                       <UserIcon className="w-3 h-3" />}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                      !user.isBanned ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                    )}>
                      {!user.isBanned ? 'Active' : 'Banned'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-white/40">{new Date(user.joinedAt).toLocaleDateString()}</span>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button 
                      onClick={() => setShowActions(showActions === user.id ? null : user.id)}
                      className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-white/20" />
                    </button>

                    <AnimatePresence>
                      {showActions === user.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowActions(null)}></div>
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute right-6 top-14 w-48 bg-[#111112] border border-white/5 rounded-2xl shadow-2xl z-50 p-2"
                          >
                            {user.role !== 'owner' && (
                              <>
                                <button 
                                  onClick={() => handleUpdateRole(user.id, user.role === 'admin' ? 'member' : 'admin')}
                                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all"
                                >
                                  <Shield className="w-3.5 h-3.5" /> 
                                  {user.role === 'admin' ? 'Demote to Member' : 'Promote to Admin'}
                                </button>
                                <div className="h-px bg-white/5 my-2"></div>
                              </>
                            )}
                            <button 
                              onClick={() => handleToggleBan(user.id, user.isBanned)}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all"
                            >
                              <Ban className="w-3.5 h-3.5" /> {user.isBanned ? 'Unban User' : 'Ban User'}
                            </button>
                            <button 
                              onClick={() => {
                                setShowDeleteConfirm(user.id);
                                setShowActions(null);
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-600/10 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete User
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#0A0A0B] border border-white/10 rounded-3xl p-8 shadow-2xl text-center"
            >
              <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto mb-6">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Are you sure?</h2>
              <p className="text-white/40 text-sm mb-8">
                This action will permanently remove this user. They will lose all access to the platform immediately. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDeleteUser(showDeleteConfirm)}
                  className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-rose-500/20"
                >
                  Delete User
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManagement;

