import React, { useState, useEffect } from 'react';
import { Check, Zap, Shield, Crown, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [monetization, setMonetization] = useState<any>(null);
  const [fetching, setFetching] = useState(true);
  const isAuthenticated = Boolean(currentUser);
  const activePlan = currentUser?.plan || null;

  useEffect(() => {
    const fetchMonetization = async () => {
      try {
        const response = await fetch('/api/system/monetization');
        if (response.ok) {
          try {
            const contentType = response.headers.get('content-type');
            if (contentType?.includes('application/json')) {
              const data = await response.json();
              setMonetization(data);
            }
          } catch (jsonErr) {
            console.error('Failed to parse monetization data:', jsonErr);
          }
        }
      } catch (error) {
        console.error('Failed to fetch monetization settings:', error);
      } finally {
        setFetching(false);
      }
    };
    fetchMonetization();
  }, []);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      credits: monetization?.freeCreditsPerMonth || 20,
      features: [
        'Access to basic models',
        `${monetization?.freeCreditsPerMonth || 20} credits per month`,
        'Standard support',
        'Public library access'
      ],
      icon: Zap,
      color: 'text-slate-400',
      bg: 'bg-slate-400/10'
    },
    {
      id: 'pro_monthly',
      name: 'Pro',
      price: 29,
      credits: monetization?.proCreditsPerMonth || 1000,
      features: [
        'Access to smart models (GPT-4o)',
        `${(monetization?.proCreditsPerMonth || 1000).toLocaleString()} credits per month`,
        'Priority support',
        'Private library',
        'No ads'
      ],
      icon: Shield,
      color: 'text-indigo-400',
      bg: 'bg-indigo-400/10',
      popular: true
    },
    {
      id: 'studio_monthly',
      name: 'Studio',
      price: 99,
      credits: monetization?.studioCreditsPerMonth || 5000,
      features: [
        'Access to all models',
        `${(monetization?.studioCreditsPerMonth || 5000).toLocaleString()} credits per month`,
        'Dedicated support',
        'API access',
        'Custom branding'
      ],
      icon: Crown,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10'
    },
    {
      id: 'premium_monthly',
      name: 'Premium',
      price: 249,
      credits: monetization?.premiumCreditsPerMonth || 20000,
      features: [
        'Unlimited access to all models',
        `${(monetization?.premiumCreditsPerMonth || 20000).toLocaleString()} credits per month`,
        '24/7 Priority support',
        'White-label options',
        'Custom AI training'
      ],
      icon: Crown,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10'
    }
  ];

  const getPlanKey = (planId: string) => planId.split('_')[0];
  const isActivePlan = (planId: string) => isAuthenticated && activePlan === getPlanKey(planId);

  const handleSubscribe = async (planId: string) => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: '/pricing',
          message: 'Please sign in or create an account to choose a plan',
        },
      });
      return;
    }

    if (planId === 'free') {
      return;
    }
    
    setLoading(planId);
    try {
      const response = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ planId })
      });
      
      let data;
      try {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          data = await response.json();
        } else {
          throw new Error('Invalid response format');
        }
      } catch (jsonErr) {
        console.error('Failed to parse response:', jsonErr);
        alert('Failed to start checkout. Please try again.');
        return;
      }
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data?.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  if (fetching || authLoading) {
    return (
      <div className="min-h-screen bg-bg">
        <Navbar />
        <div className="pt-40 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-to-br from-purple-500/10 via-transparent to-indigo-500/10 blur-3xl -z-10"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display font-black text-5xl md:text-7xl text-white mb-6 tracking-tight"
          >
            Simple, Transparent <span className="text-gradient">Pricing</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-text-muted max-w-3xl mx-auto leading-relaxed"
          >
            Choose the perfect plan for your creative needs. Scale as you grow with our flexible credit-based system.
          </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
                className={`relative p-8 rounded-3xl border ${
                  isActivePlan(plan.id)
                    ? 'border-primary/60 bg-primary/5'
                    : 'border-border bg-surface/80'
              } flex flex-col feature-card-enhanced group hover:border-primary/50 transition-all duration-300 hover-lift`}
            >
              {plan.popular && isAuthenticated && !isActivePlan(plan.id) && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-xs font-bold rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <div className={`w-12 h-12 rounded-2xl ${plan.bg} flex items-center justify-center mb-6 border border-border`}>
                  <plan.icon className={`w-6 h-6 ${plan.color} group-hover:text-white transition-colors duration-300`} />
                </div>
                <h3 className="text-2xl font-bold text-text-primary mb-2 group-hover:text-white transition-colors duration-300">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-text-primary group-hover:text-white transition-colors duration-300">${plan.price}</span>
                  <span className="text-text-secondary group-hover:text-text-primary transition-colors duration-300">/month</span>
                </div>
                <p className="text-text-secondary mt-4 text-sm group-hover:text-text-primary transition-colors duration-300">
                  Includes {plan.credits.toLocaleString()} credits per month
                </p>
              </div>

              <div className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-success/10 border border-success/20 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-success" />
                    </div>
                    <span className="text-text-secondary text-sm group-hover:text-text-primary transition-colors duration-300">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading === plan.id}
                className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
                  !isAuthenticated
                    ? 'bg-primary text-white hover:bg-primary-hover shadow-md hover:shadow-lg'
                    : plan.id === 'free'
                    ? 'bg-surface text-text-secondary cursor-not-allowed border border-border'
                    : plan.popular
                    ? 'bg-primary text-white hover:bg-primary-hover shadow-md hover:shadow-lg'
                    : 'bg-transparent border border-border text-text-primary hover:border-text-primary hover:bg-surface/80'
                }`}
              >
                {loading === plan.id ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {!isAuthenticated
                      ? 'Get Started Free'
                      : plan.id === 'free'
                      ? isActivePlan(plan.id)
                        ? 'Current Plan'
                        : 'Free Plan'
                      : 'Get Started'}
                    {isAuthenticated && plan.id !== 'free' && <ArrowRight className="w-4 h-4" />}
                  </>
                )}
              </button>
            </motion.div>
          ))}
          </div>

          <div className="mt-20 feature-card-enhanced rounded-3xl border border-border text-center">
            <h3 className="text-xl font-bold text-white mb-4 transition-colors duration-300">Need a custom solution?</h3>
            <p className="text-text-muted mb-8 max-w-xl mx-auto transition-colors duration-300">
              We offer enterprise-grade solutions for large teams and high-volume needs. Contact our sales team for a custom quote.
            </p>
            <button
              onClick={() => navigate('/login', { state: { from: '/pricing', message: 'Please sign in to contact sales' } })}
              className="px-8 py-3 rounded-xl border border-border text-text-primary font-medium hover:bg-surface/80 hover:border-text-primary transition-all duration-300"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
