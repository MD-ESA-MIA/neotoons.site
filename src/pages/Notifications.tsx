import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Heart, 
  MessageSquare, 
  UserPlus, 
  Shield, 
  Trash2, 
  CheckCircle2,
  Clock,
  MoreHorizontal
} from 'lucide-react';
import { RootState } from '../store';
import { setNotifications, markAsRead, setLoading } from '../store/slices/notificationsSlice';
import { Notification } from '../socialTypes';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const Notifications: React.FC = () => {
  const dispatch = useDispatch();
  const { items: notifications, loading } = useSelector((state: RootState) => state.notifications);
  const { token } = useSelector((state: RootState) => state.auth);

  const fetchNotifications = async () => {
    if (!token) return;
    dispatch(setLoading(true));
    try {
      const response = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        dispatch(setNotifications(data));
      }
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [token]);

  const handleMarkAsRead = async (id: string) => {
    if (!token) return;
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        dispatch(markAsRead(id));
      }
    } catch (error) {
      console.error('Failed to mark as read');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="w-4 h-4 text-rose-500" />;
      case 'comment': return <MessageSquare className="w-4 h-4 text-purple-500" />;
      case 'follow': return <UserPlus className="w-4 h-4 text-emerald-500" />;
      case 'admin': return <Shield className="w-4 h-4 text-amber-500" />;
      default: return <Bell className="w-4 h-4 text-white/40" />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bell className="w-6 h-6 text-purple-500" />
          Notifications
        </h1>
        <button 
          onClick={() => notifications.forEach(n => !n.read && handleMarkAsRead(n.id))}
          className="text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors"
        >
          Mark all as read
        </button>
      </div>

      <div className="bg-[#1e1535] border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
        {loading ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="p-4 flex gap-4 animate-pulse">
              <div className="w-10 h-10 bg-white/5 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/5 rounded w-3/4" />
                <div className="h-3 bg-white/5 rounded w-1/4" />
              </div>
            </div>
          ))
        ) : (
          <AnimatePresence initial={false}>
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`p-4 flex gap-4 hover:bg-white/5 transition-all group relative ${!notification.read ? 'bg-purple-600/5' : ''}`}
                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
              >
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center overflow-hidden border border-white/5">
                    {notification.senderAvatar ? (
                      <img src={notification.senderAvatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <Bell className="w-5 h-5 text-white/20" />
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#1a1030] border border-white/10 flex items-center justify-center shadow-lg">
                    {getIcon(notification.type)}
                  </div>
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <p className="text-sm text-white/90 leading-relaxed">
                      <span className="font-bold">{notification.senderName}</span> {notification.content}
                    </p>
                    <button className="p-1 text-white/0 group-hover:text-white/20 hover:text-white/60 transition-all">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-white/30 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                    {!notification.read && (
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                    )}
                  </div>
                </div>
                
                {notification.link && (
                  <Link 
                    to={notification.link} 
                    className="absolute inset-0 z-0"
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {!loading && notifications.length === 0 && (
          <div className="p-20 text-center space-y-4">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-white/10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-medium text-white/90">All caught up!</h3>
              <p className="text-sm text-white/40">You have no new notifications at the moment.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
