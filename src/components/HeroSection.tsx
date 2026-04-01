import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { ArrowRight, Star, Zap, BookOpen, Feather, Image } from 'lucide-react';

const HeroSection: React.FC = () => {
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate(currentUser ? '/workspace' : '/login');
  };

  return (
    <section className="relative pt-32 pb-24 px-6 overflow-hidden">
      {/* Dark Purple Background with Subtle Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 z-0">
        {/* Background Glow Upgrade */}
        <div className="hero-background-upgrade"></div>
        
        {/* Animated Wave Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="wave-bg"></div>
        </div>
        
        {/* Subtle Purple Glow Effect */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-violet-500/15 via-purple-500/10 to-indigo-500/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/15 via-indigo-500/10 to-violet-500/15 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto text-center relative z-10">
        {/* Original Pretitle with Purple Accent */}
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-purple-400/30 bg-purple-500/10 text-purple-200 text-sm font-medium mb-8 hover:border-purple-400/50 transition-colors">
          <span className="w-2 h-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"></span>
          Next Gen AI Creative Suite
        </div>

        {/* Original Headline - Bold Serif Typography */}
        <h1 className="text-display mb-6 max-w-4xl mx-auto font-display">
          Build, Automate & Scale with AI — All in One Platform
        </h1>

        {/* Original Subtitle */}
        <p className="text-body max-w-2xl mx-auto mb-10">
          Create content, generate images, write code, and launch AI-powered tools without switching platforms or writing complex code.
        </p>

        {/* BIG Dashboard Preview */}
        <div className="hero-dashboard-preview mb-16">
          <div className="dashboard-card">
            <div className="dashboard-header">
              <div className="dashboard-title">AI Workspace Dashboard</div>
              <div className="dashboard-stats">
                <span className="stat-item">⚡ Real-time</span>
                <span className="stat-item">🤖 AI Tools</span>
                <span className="stat-item">📊 Analytics</span>
              </div>
            </div>
            <div className="dashboard-content">
              <div className="dashboard-grid">
                <div className="dashboard-widget widget-1">
                  <div className="widget-header">
                    <span className="widget-icon">🎨</span>
                    <span className="widget-label">Image Generation</span>
                  </div>
                  <div className="widget-content">
                    <div className="progress-bar">
                      <div className="progress-fill"></div>
                    </div>
                    <div className="widget-stats">
                      <span className="stat-value">1,234</span>
                      <span className="stat-label">Generated</span>
                    </div>
                  </div>
                </div>
                <div className="dashboard-widget widget-2">
                  <div className="widget-header">
                    <span className="widget-icon">📝</span>
                    <span className="widget-label">Content AI</span>
                  </div>
                  <div className="widget-content">
                    <div className="progress-bar">
                      <div className="progress-fill"></div>
                    </div>
                    <div className="widget-stats">
                      <span className="stat-value">89%</span>
                      <span className="stat-label">Accuracy</span>
                    </div>
                  </div>
                </div>
                <div className="dashboard-widget widget-3">
                  <div className="widget-header">
                    <span className="widget-icon">💻</span>
                    <span className="widget-label">Code Assistant</span>
                  </div>
                  <div className="widget-content">
                    <div className="progress-bar">
                      <div className="progress-fill"></div>
                    </div>
                    <div className="widget-stats">
                      <span className="stat-value">567</span>
                      <span className="stat-label">Lines</span>
                    </div>
                  </div>
                </div>
                <div className="dashboard-widget widget-4">
                  <div className="widget-header">
                    <span className="widget-icon">📈</span>
                    <span className="widget-label">Performance</span>
                  </div>
                  <div className="widget-content">
                    <div className="progress-bar">
                      <div className="progress-fill"></div>
                    </div>
                    <div className="widget-stats">
                      <span className="stat-value">98%</span>
                      <span className="stat-label">Uptime</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Original CTA Buttons with Purple Gradient */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 text-white px-8 py-3 text-base font-medium flex items-center gap-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 border border-white/20"
          >
            Launch Workspace <ArrowRight className="w-4 h-4" />
          </button>
          <Link to="/features" className="border border-purple-400/30 bg-purple-500/10 text-purple-200 px-8 py-3 text-base font-medium rounded-lg hover:bg-purple-500/20 hover:border-purple-400/50 transition-all duration-300 hover:scale-105">
            See How It Works
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;