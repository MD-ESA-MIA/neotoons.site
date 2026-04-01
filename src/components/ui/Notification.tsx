import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface NotificationProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

const Notification: React.FC<NotificationProps> = ({ 
  message, 
  type = 'success', 
  onClose, 
  duration = 3000 
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed bottom-8 right-8 z-100"
      >
        <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${
          type === 'success' 
            ? 'bg-card border-emerald-500/20 text-emerald-400' 
            : 'bg-card border-rose-500/20 text-rose-500'
        }`}>
          {type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-bold">{message}</span>
          <button onClick={onClose} className="ml-4 p-1 rounded-full hover:bg-white/5 text-text-muted">
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Notification;
