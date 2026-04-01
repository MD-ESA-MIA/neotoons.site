import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { markAllAsRead, markAsRead } from '../../store/slices/notificationsSlice';
import { RootState } from '../../store';
import { Search, Bell, User, Settings, LogOut, CreditCard, Shield, Clock, Check, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import toast from 'react-hot-toast';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Topbar: React.FC = () => {
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const { items: notifications } = useSelector((state: RootState) => state.notifications);
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead());
    toast.success("All notifications marked as read");
  };

  const handleNotificationClick = (id: string) => {
    dispatch(markAsRead(id));
    setIsNotificationsOpen(false);
  };

  return (
    <header className="h-20 border-b border-white/5 bg-bg/80 backdrop-blur-xl sticky top-0 z-30 px-8 flex items-center justify-between">
      <div className="flex-1 max-w-md relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-accent transition-colors" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tools, templates, or help..." 
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
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={cn(
              "relative p-2.5 rounded-xl transition-all duration-300",
              isNotificationsOpen ? "bg-accent/10 text-accent" : "bg-white/5 text-text-muted hover:text-white hover:bg-white/10"
            )}
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent rounded-full border-2 border-bg shadow-[0_0_8px_rgba(124,58,237,0.8)]"></span>
            )}
          </button>

          <AnimatePresence>
            {isNotificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-80 bg-card/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
              >
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                  <h3 className="text-sm font-bold text-white">Notifications</h3>
                  {unreadNotificationsCount > 0 && (
                    <button 
                      onClick={handleMarkAllRead}
                      className="text-[10px] font-bold text-accent-light hover:text-accent uppercase tracking-widest transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto custom-scrollbar">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        onClick={() => handleNotificationClick(n.id)}
                        className={cn(
                          "p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer relative group",
                          !n.read && "bg-accent/5"
                        )}
                      >
                        {!n.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent shadow-[2px_0_8px_rgba(124,58,237,0.4)]"></div>}
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-xs font-bold text-white group-hover:text-accent-light transition-colors">{n.fromUserName || 'System'}</h4>
                          <span className="text-[10px] text-text-muted flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-muted leading-relaxed line-clamp-2">{n.content}</p>
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
                <Link 
                  to="/workspace/notifications"
                  onClick={() => setIsNotificationsOpen(false)}
                  className="block w-full p-3 text-center text-[10px] font-bold text-text-muted hover:text-white hover:bg-white/5 transition-all border-t border-white/5 uppercase tracking-widest"
                >
                  View all notifications
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-8 w-px bg-white/5 mx-2"></div>

        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1.5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all group"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-text-primary leading-none">{currentUser?.displayName}</p>
              <p className="text-[10px] text-text-muted uppercase tracking-widest mt-1">{currentUser?.plan} Plan</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-accent to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-accent/20 overflow-hidden">
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-64 bg-card/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
              >
                <div className="p-4 border-b border-white/5 bg-white/5">
                  <p className="text-xs font-bold text-white">{currentUser?.displayName}</p>
                  <p className="text-[10px] text-text-muted truncate">{currentUser?.email}</p>
                </div>
                <div className="p-2 space-y-1">
                  {[
                    { label: 'Profile Settings', icon: User, path: '/workspace/profile/edit', state: { activeTab: 'public' } },
                    { label: 'Billing & Plan', icon: CreditCard, path: '/workspace/profile/edit', state: { activeTab: 'billing' } },
                    { label: 'Security', icon: Shield, path: '/workspace/profile/edit', state: { activeTab: 'security' } }
                  ].map((item) => (
                    <Link 
                      key={item.label}
                      to={item.path} 
                      state={item.state}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-text-muted hover:text-white hover:bg-white/5 transition-all"
                    >
                      <item.icon className="w-4 h-4" /> {item.label}
                    </Link>
                  ))}
                </div>
                <div className="p-2 border-t border-white/5">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-all"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
