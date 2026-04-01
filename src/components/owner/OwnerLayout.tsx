import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import OwnerSidebar from './OwnerSidebar';
import { adminService } from '../../services/adminService';
import { 
  Search, 
  Bell, 
  User, 
  ChevronDown, 
  Plus, 
  Shield, 
  Zap, 
  Users, 
  Check, 
  X,
  Clock,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const mockNotifications = [
  { id: '1', title: 'New Admin Registered', message: 'Robert Fox has joined as a Platform Admin.', time: '2 mins ago', read: false },
  { id: '2', title: 'System Update', message: 'NeoToons AI v2.4 is now live with improved generation.', time: '1 hour ago', read: false },
  { id: '3', title: 'Revenue Milestone', message: 'Daily revenue has exceeded $5,000.', time: '5 hours ago', read: true },
];

const OwnerLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [sessionStatus, setSessionStatus] = useState<'checking' | 'valid' | 'expired'>('checking');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(mockNotifications);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const quickActionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (quickActionRef.current && !quickActionRef.current.contains(event.target as Node)) {
        setShowQuickActions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      try {
        const status = await adminService.getOwnerSessionStatus();
        if (!active) return;
        setSessionStatus(status.valid ? 'valid' : 'expired');
      } catch (_error) {
        if (!active) return;
        setSessionStatus('expired');
      }
    };

    checkSession();
    const interval = window.setInterval(checkSession, 60_000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  const hasAdminAccess = currentUser?.role === 'owner' || currentUser?.role === 'admin';

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const clearNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

  // Security: only admin-level roles can access
  if (!hasAdminAccess) {
    return <Navigate to="/workspace" replace />;
  }

  return (
    <div className="flex min-h-screen bg-bg text-white font-sans selection:bg-accent/30 antialiased">
      <OwnerSidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <header className="h-20 border-b border-white/5 bg-bg/80 backdrop-blur-xl sticky top-0 z-30 px-8 flex items-center justify-between">
          <div className="flex-1 max-w-md relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-accent transition-colors" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search everything..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:outline-hidden focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-text-muted/50"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-3 h-3 text-text-muted" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                if (sessionStatus === 'expired') {
                  navigate('/login');
                  return;
                }
                navigate('/owner/health');
              }}
              className={cn(
                'hidden md:inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-[11px] font-semibold transition',
                sessionStatus === 'valid'
                  ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
                  : sessionStatus === 'expired'
                    ? 'border-rose-400/30 bg-rose-500/10 text-rose-200'
                    : 'border-amber-400/30 bg-amber-500/10 text-amber-200'
              )}
              title={sessionStatus === 'expired' ? 'Session expired. Click to login.' : 'Open owner health'}
            >
              <span
                className={cn(
                  'h-2 w-2 rounded-full',
                  sessionStatus === 'valid' ? 'bg-emerald-400' : sessionStatus === 'expired' ? 'bg-rose-400' : 'bg-amber-300'
                )}
              />
              {sessionStatus === 'valid' ? 'Logged in' : sessionStatus === 'expired' ? 'Session expired' : 'Checking session'}
            </button>

            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={cn(
                  "relative p-2.5 rounded-xl transition-all duration-300",
                  showNotifications ? "bg-accent/10 text-accent" : "bg-white/5 text-text-muted hover:text-white hover:bg-white/10"
                )}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent rounded-full border-2 border-bg shadow-[0_0_8px_rgba(124,58,237,0.8)]"></span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 top-full mt-3 w-80 bg-card/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                      <h3 className="text-sm font-bold text-white">Notifications</h3>
                      <div className="flex gap-2">
                        <button onClick={markAllRead} className="text-[10px] font-bold text-accent-light hover:text-accent uppercase tracking-widest transition-colors">Mark all read</button>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div key={n.id} className={cn(
                            "p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer relative group",
                            !n.read && "bg-accent/5"
                          )}>
                            {!n.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent shadow-[2px_0_8px_rgba(124,58,237,0.4)]"></div>}
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="text-xs font-bold text-white group-hover:text-accent-light transition-colors">{n.title}</h4>
                              <span className="text-[10px] text-text-muted flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {n.time}
                              </span>
                            </div>
                            <p className="text-[11px] text-text-muted leading-relaxed line-clamp-2">{n.message}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-12 text-center">
                          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-text-muted/20 mx-auto mb-4">
                            <Bell className="w-8 h-8" />
                          </div>
                          <p className="text-xs text-text-muted">No notifications yet</p>
                        </div>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <button 
                        onClick={clearNotifications}
                        className="w-full p-3 text-[10px] font-bold text-text-muted hover:text-white hover:bg-white/5 transition-all border-t border-white/5 uppercase tracking-widest"
                      >
                        Clear all
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="h-8 w-px bg-white/5"></div>

            <button className="flex items-center gap-3 p-1.5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all group">
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-accent to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-accent/20">
                {currentUser?.name[0]}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-white leading-none">{currentUser?.name}</p>
                <p className="text-[10px] text-text-muted uppercase tracking-widest mt-1">
                  {currentUser?.role === 'owner' ? 'Platform Owner' : 'Platform Admin'}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-text-muted group-hover:text-white transition-colors" />
            </button>
            
            <div className="relative" ref={quickActionRef}>
              <button 
                onClick={() => setShowQuickActions(!showQuickActions)}
                className={cn(
                  "hidden lg:flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-accent to-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-accent/20 hover:shadow-accent/40 hover:-translate-y-0.5",
                  showQuickActions && "scale-95 opacity-90"
                )}
              >
                <Plus className="w-4 h-4" /> Quick Action
              </button>

              <AnimatePresence>
                {showQuickActions && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 top-full mt-3 w-64 bg-card/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="p-2 space-y-1">
                      {[
                        { label: 'Create Admin', icon: Shield, path: '/owner/team-admins', color: 'text-accent' },
                        { label: 'Add Tool', icon: Zap, path: '/owner/ai-tools', color: 'text-amber-400' },
                        { label: 'Manage Users', icon: Users, path: '/owner/users', color: 'text-cyan' }
                      ].map((item) => (
                        <button 
                          key={item.label}
                          onClick={() => {
                            navigate(item.path);
                            setShowQuickActions(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-text-muted hover:text-white hover:bg-white/5 rounded-xl transition-all group"
                        >
                          <item.icon className={cn("w-4 h-4 transition-colors", item.color)} />
                          {item.label}
                          <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
          <div className="glow-bg top-0 right-0 opacity-20"></div>
          <div className="glow-bg bottom-0 left-0 opacity-10"></div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default OwnerLayout;
