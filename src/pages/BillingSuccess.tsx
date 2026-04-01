import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

const BillingSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // You could verify the session here if needed
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-[#0A0A0B] border border-white/5 p-12 rounded-[2.5rem] text-center space-y-8"
      >
        <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-12 h-12 text-emerald-500" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-display font-bold text-white tracking-tight">Payment Successful!</h1>
          <p className="text-text-muted text-lg leading-relaxed">
            Thank you for subscribing. Your account has been upgraded and your credits have been added.
          </p>
        </div>

        <button
          onClick={() => navigate('/workspace')}
          className="w-full py-4 bg-accent text-black font-bold rounded-2xl hover:bg-accent-light transition-all shadow-lg shadow-accent/20 flex items-center justify-center gap-2 group"
        >
          Go to Dashboard
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>
    </div>
  );
};

export default BillingSuccess;
