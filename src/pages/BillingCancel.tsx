import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

const BillingCancel: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-[#0A0A0B] border border-white/5 p-12 rounded-[2.5rem] text-center space-y-8"
      >
        <div className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto">
          <XCircle className="w-12 h-12 text-rose-500" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-display font-bold text-white tracking-tight">Payment Cancelled</h1>
          <p className="text-text-muted text-lg leading-relaxed">
            Your payment was not completed. No charges were made to your account.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => navigate('/pricing')}
            className="w-full py-4 bg-accent text-black font-bold rounded-2xl hover:bg-accent-light transition-all shadow-lg shadow-accent/20 flex items-center justify-center gap-2 group"
          >
            Try Again
          </button>
          
          <button
            onClick={() => navigate('/workspace')}
            className="w-full py-4 bg-white/5 text-white font-bold rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-2 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default BillingCancel;
