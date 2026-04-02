import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, ArrowRight, ArrowLeft, Eye, EyeOff, CheckCircle2, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const getErrorMessage = (error: any, fallback: string) => {
  const clerkError = error?.errors?.[0];
  if (clerkError?.longMessage) return clerkError.longMessage;
  if (clerkError?.message) return clerkError.message;
  if (error?.message) return error.message;
  return fallback;
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    currentUser,
    login,
    signup,
    verifyEmailCode,
    requiresEmailVerification,
    pendingVerificationEmail,
    isLoading,
  } = useAuth();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const redirectMessage = location.state?.message;

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  if (currentUser) {
    navigate('/workspace');
    return null;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate('/workspace');
    } catch (err: any) {
      setError(getErrorMessage(err, 'Login failed'));
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!agreeTerms) {
      setError('Please agree to the terms');
      return;
    }

    try {
      await signup(name, email, password);
      setError(null);
    } catch (err: any) {
      setError(getErrorMessage(err, 'Signup failed'));
    }
  };

  const handleVerifyCode = async () => {
    setError(null);

    if (!verificationCode.trim()) {
      setError('Please enter the verification code sent to your email.');
      return;
    }

    try {
      await verifyEmailCode(verificationCode.trim());
      navigate('/workspace');
    } catch (err: any) {
      setError(getErrorMessage(err, 'Verification failed'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Premium Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-purple-500/15 via-transparent to-indigo-500/15 blur-3xl -z-10"></div>
      <div className="absolute inset-0 -z-20 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to Home</span>
      </Link>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[420px] feature-card-enhanced rounded-[32px] p-10 shadow-2xl shadow-purple-500/10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-white font-bold text-xl mb-4 shadow-lg shadow-accent/20">N</div>
          <h2 className="text-2xl font-bold text-white">
            {activeTab === 'signin' ? 'Welcome Back' : 'Start Creating Today'}
          </h2>
          <p className="text-sm text-text-muted mt-1">
            {activeTab === 'signin' ? 'Log in to your creative workspace and continue building' : 'Join 10,000+ creators using AI-powered tools'}
          </p>
        </div>

        {redirectMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-xl border border-[#7C3AED] bg-[#7C3AED]/10 flex items-center gap-3"
          >
            <Key className="w-5 h-5 text-[#7C3AED] shrink-0" />
            <p className="text-xs text-white font-medium">{redirectMessage}</p>
          </motion.div>
        )}

        {/* Tab Switcher */}
        <div className="flex p-1 bg-white/5 rounded-xl mb-8">
          <button 
            onClick={() => { setActiveTab('signin'); setError(null); }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'signin' ? 'bg-card text-white shadow-lg' : 'text-text-muted hover:text-text-primary'}`}
          >
            Sign In
          </button>
          <button 
            onClick={() => { setActiveTab('signup'); setError(null); }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'signup' ? 'bg-card text-white shadow-lg' : 'text-text-muted hover:text-text-primary'}`}
          >
            Sign Up
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'signin' ? (
            <motion.form 
              key="signin"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleSignIn}
              className="space-y-5"
            >
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-bg border border-border rounded-xl py-3 pl-12 pr-4 text-sm text-text-primary focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Password</label>
                  <Link to="/forgot-password" className="text-[10px] font-bold text-accent hover:text-accent-light transition-colors">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-bg border border-border rounded-xl py-3 pl-12 pr-12 text-sm text-text-primary focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all outline-hidden"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs font-bold text-rose-500 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 flex items-start gap-2"
                >
                  <span className="text-sm mt-0.5">⚠️</span>
                  <span>{error === 'Invalid email or password' ? 'Email or password is incorrect. Please try again.' : error}</span>
                </motion.div>
              )}

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Signing in...</>
                ) : (
                  <>Sign In <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </motion.form>
          ) : (
            <motion.form 
              key="signup"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onSubmit={requiresEmailVerification ? (e) => {
                e.preventDefault();
                void handleVerifyCode();
              } : handleSignUp}
              className="space-y-4"
            >
              {!requiresEmailVerification ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input 
                        type="text" 
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full bg-bg border border-border rounded-xl py-2.5 pl-12 pr-4 text-sm text-text-primary focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full bg-bg border border-border rounded-xl py-2.5 pl-12 pr-4 text-sm text-text-primary focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input 
                        type={showSignupPassword ? 'text' : 'password'} 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className="w-full bg-bg border border-border rounded-xl py-2.5 pl-12 pr-12 text-sm text-text-primary focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all outline-hidden"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                      >
                        {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input 
                        type={showConfirmPassword ? 'text' : 'password'} 
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password"
                        className="w-full bg-bg border border-border rounded-xl py-2.5 pl-12 pr-12 text-sm text-text-primary focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all outline-hidden"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 py-2">
                    <input 
                      type="checkbox" 
                      id="terms"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-1 accent-accent"
                    />
                    <label htmlFor="terms" className="text-[11px] text-text-muted leading-relaxed">
                      I agree to the <Link to="/terms" target="_blank" className="text-accent hover:underline">Terms of Service</Link> and <Link to="/privacy" target="_blank" className="text-accent hover:underline">Privacy Policy</Link>
                    </label>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-xs text-text-muted bg-white/5 border border-white/10 rounded-lg p-3">
                    We sent a verification code to <span className="text-white font-semibold">{pendingVerificationEmail || email}</span>.
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Verification Code</label>
                    <div className="relative">
                      <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        type="text"
                        required
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="Enter the 6-digit code"
                        className="w-full bg-bg border border-border rounded-xl py-2.5 pl-12 pr-4 text-sm text-text-primary focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all outline-hidden"
                      />
                    </div>
                  </div>
                </>
              )}

              {error && (
                <div className="text-xs font-bold text-rose-500 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 flex items-start gap-2">
                  <span className="text-sm mt-0.5">⚠️</span>
                  <span>
                    {error === 'Please agree to the terms' && 'You must agree to our Terms of Service and Privacy Policy to create an account.'}
                    {error === 'Passwords do not match' && 'Your passwords don\'t match. Please check and try again.'}
                    {error !== 'Please agree to the terms' && error !== 'Passwords do not match' && error}
                  </span>
                </div>
              )}

              {!requiresEmailVerification ? (
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Creating account...</>
                  ) : (
                    <>Create Account <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleVerifyCode()}
                  disabled={isLoading}
                  className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Verifying...</>
                  ) : (
                    <>Verify Email <CheckCircle2 className="w-4 h-4" /></>
                  )}
                </button>
              )}
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Login;
