import React from 'react';
import { motion } from 'motion/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getIcon } from '../components/Icons';
import { ArrowRight, BookOpen, Zap, Check, Youtube, Share2, Library } from 'lucide-react';
import { Link } from 'react-router-dom';

const Features: React.FC = () => {
  const modules = [
    { name: 'Story Generator', desc: 'Create epic narratives from simple ideas with deep character arcs.', icon: 'BookOpen', color: 'from-primary to-indigo-600' },
    { name: 'Viral Hooks', desc: 'Generate 5 scroll-stopping hooks for Shorts, Reels, and TikTok.', icon: 'Zap', color: 'from-primary to-purple-500' },
    { name: 'Script Rewriter', desc: 'Rewrite existing scripts into copyright-safe, original versions.', icon: 'Feather', color: 'from-primary to-indigo-500' },
    { name: 'Voice-Over', desc: 'Create professional, natural-sounding narration scripts for any video.', icon: 'Mic', color: 'from-primary to-purple-500' },
    { name: 'AI Prompts', desc: 'Convert stories into detailed Midjourney or Video AI prompts.', icon: 'Image', color: 'from-primary to-indigo-500' },
    { name: 'Social Media', desc: 'Turn your content into viral social media posts for all platforms.', icon: 'Share2', color: 'from-primary to-purple-500' },
    { name: 'Character Creator', desc: 'Design deep, complex characters with backstories and goals.', icon: 'UserCircle', color: 'from-primary to-indigo-500' },
  ];

  const steps = [
    { title: 'Input Your Idea', desc: 'Start with a simple prompt, a rough draft, or an existing script.' },
    { title: 'AI Transformation', desc: 'Our specialized models process your input into high-quality creative assets.' },
    { title: 'Refine & Export', desc: 'Edit the results, save them to your library, or export for your production.' },
  ];

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display font-black text-5xl md:text-7xl text-white mb-6 tracking-tight"
          >
            Everything You Need <br /> <span className="text-primary">to Create</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-text-muted max-w-2xl mx-auto"
          >
            A complete suite of AI-powered tools designed specifically for modern storytellers and content creators.
          </motion.p>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {modules.map((module, i) => (
              <motion.div 
                key={module.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="feature-card-enhanced rounded-[32px] p-8 hover:border-primary/50 transition-all duration-300 hover-lift group"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${module.color} flex items-center justify-center text-white mb-6 shadow-xl shadow-primary/20 group-hover:shadow-primary/40 transition-shadow duration-300`}>
                  {getIcon(module.icon, "w-7 h-7")}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-accent transition-colors duration-300">{module.name}</h3>
                <p className="text-text-muted leading-relaxed group-hover:text-text-primary transition-colors duration-300">{module.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Details */}
      <section className="py-20 px-6 bg-card/20 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-white mb-6">Deep Dive into Our Tools</h2>
            <p className="text-text-muted text-lg max-w-3xl mx-auto">Each tool is designed with professional creators in mind, offering advanced features and seamless integration.</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="feature-card-enhanced rounded-[32px] p-8 hover:border-primary/50 transition-all duration-300 hover-lift">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-primary/30">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-accent transition-colors duration-300">Story Generator</h3>
              <p className="text-text-muted mb-6 group-hover:text-text-primary transition-colors duration-300">
                Generate complete story arcs with character development, plot twists, and satisfying conclusions. Perfect for writers, game developers, and content creators.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-text-muted group-hover:text-text-primary transition-colors duration-300">
                  <Check className="w-4 h-4 text-success" />
                  <span>Multi-chapter story generation</span>
                </div>
                <div className="flex items-center gap-3 text-text-muted group-hover:text-text-primary transition-colors duration-300">
                  <Check className="w-4 h-4 text-success" />
                  <span>Character arc development</span>
                </div>
                <div className="flex items-center gap-3 text-text-muted group-hover:text-text-primary transition-colors duration-300">
                  <Check className="w-4 h-4 text-success" />
                  <span>Genre-specific templates</span>
                </div>
              </div>
            </div>

            <div className="feature-card-enhanced rounded-[32px] p-8 hover:border-primary/50 transition-all duration-300 hover-lift">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white mb-6 shadow-lg shadow-primary/30">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-accent transition-colors duration-300">Viral Hooks</h3>
              <p className="text-text-muted mb-6 group-hover:text-text-primary transition-colors duration-300">
                Create attention-grabbing hooks that stop scrollers in their tracks. Designed specifically for short-form video platforms.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-text-muted group-hover:text-text-primary transition-colors duration-300">
                  <Check className="w-4 h-4 text-success" />
                  <span>Platform-specific optimization</span>
                </div>
                <div className="flex items-center gap-3 text-text-muted group-hover:text-text-primary transition-colors duration-300">
                  <Check className="w-4 h-4 text-success" />
                  <span>Hook performance analytics</span>
                </div>
                <div className="flex items-center gap-3 text-text-muted group-hover:text-text-primary transition-colors duration-300">
                  <Check className="w-4 h-4 text-success" />
                  <span>A/B testing suggestions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-white mb-6">Real-World Applications</h2>
            <p className="text-text-muted text-lg max-w-3xl mx-auto">See how creators like you are using NeoToons to build amazing content.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="feature-card-enhanced rounded-[32px] p-8 hover:border-primary/50 transition-all duration-300 hover-lift">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-success to-emerald-500 flex items-center justify-center text-white mb-6 shadow-lg shadow-success/30">
                <Youtube className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4 group-hover:text-accent transition-colors duration-300">Content Creators</h3>
              <p className="text-text-muted text-sm leading-relaxed group-hover:text-text-primary transition-colors duration-300">
                Generate viral video scripts, create engaging thumbnails, and build consistent content calendars that keep your audience coming back.
              </p>
            </div>

            <div className="feature-card-enhanced rounded-[32px] p-8 hover:border-primary/50 transition-all duration-300 hover-lift">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-warning to-orange-500 flex items-center justify-center text-white mb-6 shadow-lg shadow-warning/30">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4 group-hover:text-accent transition-colors duration-300">Social Media Managers</h3>
              <p className="text-text-muted text-sm leading-relaxed group-hover:text-text-primary transition-colors duration-300">
                Create platform-specific content, optimize posting schedules, and generate engaging captions that drive interaction.
              </p>
            </div>

            <div className="feature-card-enhanced rounded-[32px] p-8 hover:border-primary/50 transition-all duration-300 hover-lift">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent to-cyan-500 flex items-center justify-center text-white mb-6 shadow-lg shadow-accent/30">
                <Library className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4 group-hover:text-accent transition-colors duration-300">Writers & Authors</h3>
              <p className="text-text-muted text-sm leading-relaxed group-hover:text-text-primary transition-colors duration-300">
                Overcome writer's block, develop complex characters, and build intricate story worlds that captivate readers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-6 bg-card/20 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-4xl font-bold text-center text-white mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((step, i) => (
              <div key={i} className="relative text-center feature-card-enhanced rounded-[32px] p-8 hover:border-primary/50 transition-all duration-300 hover-lift">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary via-purple-500 to-indigo-500 flex items-center justify-center text-white font-black text-xl mx-auto mb-6 shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow duration-300">
                  {i + 1}
                </div>
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-accent transition-colors duration-300">{step.title}</h3>
                <p className="text-text-muted leading-relaxed group-hover:text-text-primary transition-colors duration-300">{step.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-6 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px bg-border"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto feature-card-enhanced rounded-[40px] p-12 text-center border-primary/20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Supercharge Your Creativity?</h2>
          <p className="text-text-muted text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of creators who have already transformed their workflow with NeoToons. Start building your creative empire today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login" className="bg-gradient-to-r from-primary via-purple-600 to-indigo-600 text-white px-10 py-4 text-lg inline-flex items-center gap-2 rounded-xl shadow-lg shadow-primary/20 hover:from-primary/90 hover:via-purple-500 hover:to-indigo-500 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105">
              Start Building Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/pricing" className="bg-surface border border-border text-text-secondary hover:text-text-primary px-10 py-4 text-lg inline-flex items-center gap-2 rounded-xl transition-all duration-300 hover:border-primary/50 hover:bg-surface/50">
              View All Plans
            </Link>
          </div>
          <p className="text-text-muted text-sm mt-6">No credit card required • 20 free generations monthly • Cancel anytime</p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Features;
