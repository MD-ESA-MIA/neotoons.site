import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // TODO: Integrate with your backend password reset service
      // For now, just show the success message
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center p-6 py-20">
        {/* Premium Background Glow */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-purple-500/15 via-transparent to-indigo-500/15 blur-3xl"></div>
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[420px]"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-2">
              Reset Your Password
            </h1>
            <p className="text-text-muted">
              {isSubmitted ? "Check your email for reset instructions" : "Enter your email and we'll send you a link to reset your password"}
            </p>
          </motion.div>

          {!isSubmitted ? (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              onSubmit={handleSubmit}
              className="feature-card-enhanced rounded-[24px] p-8 space-y-6"
            >
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full bg-bg border border-border rounded-xl py-3 pl-12 pr-4 text-sm text-text-primary placeholder-text-muted focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all outline-none"
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs font-bold text-rose-500 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20"
                >
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto inline-block"></div> Sending...</>
                ) : (
                  "Send Reset Link"
                )}
              </button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm text-text-muted hover:text-text-primary transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Link>
              </div>
            </motion.form>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="feature-card-enhanced rounded-[24px] p-8 text-center space-y-6"
            >
              <div className="flex justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center"
                >
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </motion.div>
              </div>

              <div>
                <h3 className="text-white font-bold mb-2">Email Sent!</h3>
                <p className="text-sm text-text-muted">
                  We've sent a password reset link to <span className="text-text-primary font-medium">{email}</span>. 
                  Click the link in your email to set a new password.
                </p>
              </div>

              <div className="pt-6 border-t border-border">
                <p className="text-xs text-text-muted mb-4">
                  Didn't receive the reset link? Check your spam folder or try again with a different email.
                </p>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail('');
                    setError(null);
                  }}
                  className="text-sm text-accent hover:text-accent-light font-bold transition-colors"
                >
                  Try Another Email
                </button>
              </div>

              <Link
                to="/login"
                className="text-sm text-text-muted hover:text-text-primary transition-colors flex items-center justify-center gap-2 pt-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default ForgotPassword;
