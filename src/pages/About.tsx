import React from 'react';
import { motion } from 'motion/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Zap, ShieldCheck, Palette, Lightbulb, Key, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  const values = [
    { 
      title: 'Creator First', 
      desc: 'Every decision we make starts with one question: does this make creators more powerful? Features, pricing, design — all of it is built around the creator\'s workflow.', 
      icon: Palette 
    },
    { 
      title: 'Speed Without Sacrifice', 
      desc: 'We believe fast and good aren\'t opposites. NeoToons generates professional-quality content in seconds because creators shouldn\'t have to choose between speed and craft.', 
      icon: Zap 
    },
    { 
      title: 'Owned by You', 
      desc: 'Everything you create on NeoToons belongs to you. Your stories, your scripts, your prompts — we generate them, you own them. No exceptions.', 
      icon: Key 
    },
  ];

  const timeline = [
    {
      year: '2024',
      title: 'The Problem',
      desc: 'We were animators ourselves. We spent 70% of our time on scripts, hooks, and prompts — work that felt repetitive and draining. The actual animation, the part we loved, kept getting squeezed out.'
    },
    {
      year: 'Early 2025',
      title: 'The Experiment',
      desc: 'We built the first version of NeoToons as an internal tool — just for ourselves. Within a month, we\'d shared it with 50 creator friends. The feedback was overwhelming: this needed to exist for everyone.'
    },
    {
      year: '2026',
      title: 'The Platform',
      desc: 'Today, NeoToons serves 10,000+ creators across 47 countries. We\'ve helped generate over 500,000 stories, scripts, and prompts. And we\'re just getting started.'
    }
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
            Built for the <span className="text-gradient">Creators</span> <br /> Who Dare to Tell Stories
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-text-muted max-w-3xl mx-auto leading-relaxed"
          >
            NeoToons was born from a simple frustration: great ideas were dying because the tools to bring them to life were too slow, too expensive, or too complicated.
          </motion.p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-panel p-12 rounded-[40px] border-l-4 border-l-accent bg-card/50 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Lightbulb className="w-32 h-32 text-accent" />
            </div>
            <h2 className="font-display text-3xl font-bold text-white mb-6">Our Mission</h2>
            <p className="text-2xl text-text-primary leading-relaxed font-medium">
              We believe every person has a story worth telling. Our mission is to remove every barrier between imagination and creation — giving animators, storytellers, and content creators the AI tools they need to bring their vision to life at the speed of thought.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story (Timeline) */}
      <section className="py-20 px-6 bg-card/20 border-y border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-4xl font-bold text-center text-white mb-20">The Story Behind NeoToons</h2>
          
          <div className="relative space-y-16">
            {/* Vertical Line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2 hidden md:block"></div>
            
            {timeline.map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative flex flex-col md:flex-row items-center gap-8 ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
              >
                {/* Dot */}
                <div className="absolute left-8 md:left-1/2 w-4 h-4 rounded-full bg-accent border-4 border-bg -translate-x-1/2 z-10"></div>
                
                <div className="w-full md:w-1/2 pl-16 md:pl-0">
                  <div className={`glass-panel p-8 rounded-3xl ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <span className="text-accent font-black text-sm uppercase tracking-widest mb-2 block">{item.year}</span>
                    <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
                    <p className="text-text-muted leading-relaxed">{item.desc}</p>
                  </div>
                </div>
                <div className="hidden md:block md:w-1/2"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-4xl font-bold text-center text-white mb-20">What We Stand For</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel p-10 rounded-[32px] hover:border-accent/30 transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-8 group-hover:scale-110 transition-transform">
                  <value.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{value.title}</h3>
                <p className="text-text-muted leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[40px] bg-linear-to-br from-accent to-indigo-900 p-12 md:p-20 text-center"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight relative z-10">Ready to Tell Your Story?</h2>
            <Link 
              to="/login" 
              className="inline-flex items-center gap-3 bg-white text-accent px-10 py-5 rounded-2xl font-black text-lg hover:bg-opacity-90 transition-all hover:scale-105 relative z-10"
            >
              Start Creating Free <ArrowRight className="w-6 h-6" />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
