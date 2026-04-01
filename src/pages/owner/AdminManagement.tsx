import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  MoreVertical, 
  Shield, 
  Lock, 
  Trash2, 
  CheckCircle2,
  XCircle,
  Edit2,
  UserCog,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import toast from 'react-hot-toast';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const admins = [
  { id: '1', name: 'Robert Fox', email: 'robert@platform.com', role: 'admin', permissions: ['all'], status: 'active' },
  { id: '2', name: 'Jane Cooper', email: 'jane@platform.com', role: 'sub-admin', permissions: ['users', 'content'], status: 'active' },
  { id: '3', name: 'Cody Fisher', email: 'cody@platform.com', role: 'sub-admin', permissions: ['analytics', 'logs'], status: 'inactive' },
];

const AdminManagement: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [adminList, setAdminList] = useState(admins);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDeleteAdmin = (id: string) => {
    setAdminList(prev => prev.filter(a => a.id !== id));
    setShowDeleteConfirm(null);
    toast.success("Administrator removed successfully");
  };

  const handleStatusToggle = (id: string) => {
    setAdminList(prev => prev.map(a => 
      a.id === id ? { ...a, status: a.status === 'active' ? 'inactive' : 'active' } : a
    ));
    setOpenMenuId(null);
    toast.success("Administrator status updated");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-white tracking-tight">Admin Management</h1>
          <p className="text-white/40">Manage platform administrators and their granular permissions.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"
        >
          <UserPlus className="w-4 h-4" /> Create Admin
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Admins List */}
        <div className="lg:col-span-2 space-y-4">
          {adminList.map((admin) => (
            <div key={admin.id} className="bg-[#0A0A0B] border border-white/5 p-6 rounded-3xl flex items-center justify-between group hover:border-indigo-500/30 transition-all relative">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white">{admin.name}</h4>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest",
                      admin.role === 'admin' ? "bg-indigo-500/10 text-indigo-500" : "bg-purple-500/10 text-purple-500"
                    )}>
                      {admin.role}
                    </span>
                  </div>
                  <p className="text-xs text-white/40">{admin.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="hidden md:block text-right">
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Permissions</p>
                  <div className="flex gap-1">
                    {admin.permissions.map((p) => (
                      <span key={p} className="px-1.5 py-0.5 bg-white/5 rounded text-[10px] text-white/60 capitalize">{p}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    admin.status === 'active' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-white/10"
                  )}></div>
                  <div className="relative">
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === admin.id ? null : admin.id)}
                      className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-white/20" />
                    </button>

                    <AnimatePresence>
                      {openMenuId === admin.id && (
                        <motion.div
                          ref={menuRef}
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          className="absolute right-0 top-full mt-2 w-48 bg-[#0A0A0B] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                        >
                          <div className="p-2 space-y-1">
                            <button 
                              onClick={() => {
                                toast.error("Edit functionality coming soon");
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                            >
                              <Edit2 className="w-4 h-4" /> Edit Admin
                            </button>
                            <button 
                              onClick={() => handleStatusToggle(admin.id)}
                              className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                            >
                              <UserCog className="w-4 h-4" /> {admin.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <div className="h-px bg-white/5 mx-2 my-1"></div>
                            <button 
                              onClick={() => {
                                setShowDeleteConfirm(admin.id);
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                            >
                              <Trash2 className="w-4 h-4" /> Delete Admin
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Permissions Overview */}
        <div className="bg-[#0A0A0B] border border-white/5 p-8 rounded-3xl space-y-6 h-fit">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-bold text-white">RBAC System</h3>
          </div>
          <p className="text-xs text-white/40 leading-relaxed">
            The Role-Based Access Control system allows you to define granular permissions for each administrative role.
          </p>
          <div className="space-y-4">
            {[
              { role: 'Owner', desc: 'Full system access, billing, and admin management.' },
              { role: 'Admin', desc: 'Manage users, teams, and platform content.' },
              { role: 'Sub Admin', desc: 'Restricted access to specific modules (e.g. Logs).' },
            ].map((r) => (
              <div key={r.role} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-sm font-bold text-white mb-1">{r.role}</p>
                <p className="text-[10px] text-white/40 leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Admin Modal (Simplified) */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#0A0A0B] border border-white/10 rounded-3xl p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Create New Admin</h2>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Full Name</label>
                  <input type="text" className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-indigo-500/50 transition-all" placeholder="Enter name..." />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Email Address</label>
                  <input type="email" className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-indigo-500/50 transition-all" placeholder="admin@platform.com" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Role</label>
                  <select className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-indigo-500/50 transition-all appearance-none cursor-pointer">
                    <option>Admin</option>
                    <option>Sub Admin</option>
                  </select>
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20">
                    Create Admin
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Are you sure?</h2>
              <p className="text-white/40 text-sm mb-8">
                This action will permanently remove this administrator. They will lose all access to the platform immediately.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDeleteAdmin(showDeleteConfirm)}
                  className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-rose-500/20"
                >
                  Delete Admin
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminManagement;
