import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { ArrowRight, Star, Zap, BookOpen, Feather, Image, Check, Shield, Crown } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import { useConfig } from '../context/ConfigContext';

const Landing: React.FC = () => {
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const { cms, features, pricing } = useConfig();
  const navigate = useNavigate();

  const pricingPlans = Array.isArray(pricing) ? pricing : [];
  const featureFlags = Array.isArray(features) ? features : [];

  const freePlan = pricingPlans.find((p) => p?.id === 'free');
  const freePlanFeatures = Array.isArray(freePlan?.features) ? freePlan.features : [];
  const freeGens = freePlanFeatures.find((f) => typeof f === 'string' && f.toLowerCase().includes('generations'))?.split(' ')[0] || '20';

  const isBlogEnabled = featureFlags.find((f) => f?.id === 'blog')?.enabled ?? true;
  const isAIToolsEnabled = featureFlags.find((f) => f?.id === 'ai-tools')?.enabled ?? true;

  const displayFeatures = [
    { title: 'Story Generator', desc: 'Turn raw ideas into compelling stories in seconds.', icon: BookOpen, color: 'text-primary' },
    { title: 'Viral Hooks', desc: 'Generate opening lines that stop the scroll.', icon: Zap, color: 'text-warning' },
    { title: 'Script Rewriter', desc: 'Rewrite scripts while maintaining your unique voice.', icon: Feather, color: 'text-accent' },
    { title: 'AI Prompts', desc: 'Create perfect prompts for Midjourney, DALL-E & more.', icon: Image, color: 'text-success' },
  ];

  const stats = [
    { label: 'Creators', value: '10,000+', color: 'text-primary' },
    { label: 'Stories Generated', value: '500,000+', color: 'text-success' },
    { label: 'Average Rating', value: '4.9★', color: 'text-warning' },
  ];

  const testimonials = [
    { name: 'Alex Rivera', role: 'YouTube Creator', quote: 'NeoToons cut my scriptwriting time by 70%. The hooks are actually viral-worthy.', initials: 'AR' },
    { name: 'Sarah Chen', role: 'TikTok Influencer', quote: 'The AI prompts are insane. I use them for all my Midjourney backgrounds now.', initials: 'SC' },
    { name: 'Marcus Thorne', role: 'Indie Filmmaker', quote: 'Finally, a tool that understands character depth. The Character Creator is a gem.', initials: 'MT' },
  ];

  return (
    <div className="min-h-screen bg-bg overflow-x-hidden">
      <Navbar />

      {/* Hero Section - Now using the new bold design */}
      <HeroSection />

      {/* Features Strip - Premium Upgrade */}
      {isAIToolsEnabled && (
        <section id="features" className="py-24 px-6 relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 opacity-50"></div>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full bg-gradient-to-b from-purple-500/10 via-transparent to-indigo-500/10 blur-3xl"></div>
          
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-display mb-4">Create Like Never Before</h2>
              <p className="text-body max-w-2xl mx-auto">AI tools designed specifically for creators who want to scale faster</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayFeatures.map((f, i) => (
              <div 
                key={f.title}
                className="feature-card-enhanced group hover:border-border transition-all duration-300 hover-lift"
              >
                <div className="feature-icon-enhanced group-hover:bg-primary/10 transition-all duration-300 group-hover:scale-110">
                  <f.icon className={`w-6 h-6 ${f.color} group-hover:text-white transition-colors duration-300`} />
                </div>
                <h3 className="text-heading mb-3 group-hover:text-white transition-colors duration-300">{f.title}</h3>
                <p className="text-body group-hover:text-text-primary transition-colors duration-300">{f.desc}</p>
              </div>
            ))}
            </div>
          </div>
        </section>
      )}

      {/* Social Proof - Premium Upgrade */}
      <section className="py-24 px-6 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 opacity-30"></div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full bg-gradient-to-b from-violet-500/5 via-transparent to-purple-500/5 blur-3xl"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <p className="text-body max-w-2xl mx-auto">Join creators who've transformed their creative workflow with AI</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((s, i) => (
              <div key={s.label} className="feature-card-enhanced group hover:border-border transition-all duration-300 hover-lift text-center">
                <span className={`text-5xl font-bold mb-4 block ${s.color} group-hover:text-white transition-colors duration-300`}>{s.value}</span>
                <span className="text-sm font-medium text-text-secondary uppercase tracking-wider group-hover:text-text-primary transition-colors duration-300">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Premium Upgrade */}
      <section className="py-24 px-6 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 opacity-40"></div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full bg-gradient-to-b from-indigo-500/5 via-transparent to-purple-500/5 blur-3xl"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-display mb-4">Real Results from Real Creators</h2>
            <p className="text-body max-w-2xl mx-auto">See how creators like you are saving hours every week</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={t.name} className="feature-card-enhanced group hover:border-border transition-all duration-300 hover-lift">
                <div className="flex gap-2 mb-6">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-warning text-warning group-hover:fill-white group-hover:text-white transition-colors duration-300" />)}
                </div>
                <p className="text-body italic mb-8 leading-relaxed group-hover:text-text-primary transition-colors duration-300">"{t.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 via-purple-500/20 to-indigo-500/30 border border-primary/40 flex items-center justify-center text-primary font-bold text-base group-hover:from-primary group-hover:via-purple-400 group-hover:to-indigo-400 group-hover:text-white transition-all duration-300 shadow-lg">
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary group-hover:text-white transition-colors duration-300">{t.name}</p>
                    <p className="text-sm text-text-secondary group-hover:text-text-primary transition-colors duration-300">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner - Premium Upgrade */}
      <section className="py-24 px-6 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 opacity-60"></div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full bg-gradient-to-b from-purple-500/15 via-transparent to-indigo-500/15 blur-3xl"></div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="feature-card-enhanced group hover:border-border transition-all duration-300 hover-lift">
            <div className="flex flex-col items-center justify-center text-center space-y-8">
              <h2 className="text-display group-hover:text-white transition-colors duration-300">Ready to Go Viral?</h2>
              <p className="text-body max-w-2xl group-hover:text-text-primary transition-colors duration-300">
                Get unlimited access to all creative tools and start building your content empire today.
              </p>
              <button 
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 text-white px-10 py-4 text-lg font-bold flex items-center gap-3 rounded-xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 border border-white/20 group"
              >
                <span>✨ Start Creating Free</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              <p className="text-sm text-text-secondary group-hover:text-text-primary transition-colors duration-300">
                {freeGens} free generations every month. No credit card required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-6 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 opacity-40"></div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full bg-gradient-to-b from-purple-500/5 via-transparent to-indigo-500/5 blur-3xl"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-display mb-4">Why Choose NeoToons</h2>
            <p className="text-body max-w-2xl mx-auto">Built by creators, for creators. Trusted with 500,000+ stories generated.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="feature-card-enhanced group hover:border-border transition-all duration-300 hover-lift">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/30 via-purple-500/20 to-indigo-500/30 border border-primary/40 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-primary group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-heading mb-3 group-hover:text-white transition-colors duration-300">Made for Creators</h3>
              <p className="text-body group-hover:text-text-primary transition-colors duration-300">
                We understand your workflow. Every tool is designed to save you time, not complicate your process.
              </p>
            </div>

            <div className="feature-card-enhanced group hover:border-border transition-all duration-300 hover-lift">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-success/30 via-green-500/20 to-emerald-500/30 border border-success/40 flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6 text-success group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-heading mb-3 group-hover:text-white transition-colors duration-300">Powered by AI</h3>
              <p className="text-body group-hover:text-text-primary transition-colors duration-300">
                Using the latest AI models (GPT-4o, Claude 3.5, and more) to generate the highest quality content.
              </p>
            </div>

            <div className="feature-card-enhanced group hover:border-border transition-all duration-300 hover-lift">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-warning/30 via-amber-500/20 to-orange-500/30 border border-warning/40 flex items-center justify-center mb-6">
                <Star className="w-6 h-6 text-warning group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-heading mb-3 group-hover:text-white transition-colors duration-300">Join 10K+ Creators</h3>
              <p className="text-body group-hover:text-text-primary transition-colors duration-300">
                Become part of a growing community of YouTube creators, TikTok influencers, and indie filmmakers.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;

