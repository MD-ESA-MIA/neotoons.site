import React from 'react';
import { motion } from 'motion/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Briefcase, MapPin, Clock, ArrowRight, Star, Coffee, Zap, Globe, Cpu } from 'lucide-react';
import Badge from '../components/ui/Badge';

const Careers: React.FC = () => {
  const perks = [
    { title: 'Remote First', desc: 'Work from anywhere in the world. We believe in talent, not time zones.', icon: Globe },
    { title: 'Modern Stack', desc: 'Build with the latest AI technologies and modern frontend frameworks.', icon: Cpu },
    { title: 'Growth Budget', desc: 'Annual budget for learning, conferences, and personal development.', icon: Zap },
  ];

  const jobs = [
    { title: 'Senior Frontend Engineer', dept: 'Engineering', location: 'Remote', type: 'Full-time' },
    { title: 'AI Research Engineer', dept: 'Engineering', location: 'Remote', type: 'Full-time' },
    { title: 'Content Strategist', dept: 'Marketing', location: 'Remote', type: 'Full-time' },
    { title: 'Senior Product Designer', dept: 'Design', location: 'Remote', type: 'Full-time' },
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
            Join the <span className="text-gradient">NeoToons Team</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-text-muted max-w-2xl mx-auto"
          >
            We're looking for passionate individuals to help us build the future of creative AI.
          </motion.p>
        </div>
      </section>

      {/* Culture */}
      <section className="py-20 px-6 bg-card/30 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-4xl font-bold text-center text-white mb-16">Our Culture</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {perks.map((perk, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mx-auto mb-6">
                  {React.createElement(perk.icon as any, { className: "w-8 h-8" })}
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{perk.title}</h3>
                <p className="text-text-muted leading-relaxed">{perk.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Jobs */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-4xl font-bold text-center text-white mb-16">Open Positions</h2>
          <div className="space-y-4">
            {jobs.map((job, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-accent/30 transition-all"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors">{job.title}</h3>
                    <Badge variant="muted">{job.dept}</Badge>
                  </div>
                  <div className="flex items-center gap-6 text-xs text-text-muted font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3" /> {job.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" /> {job.type}
                    </div>
                  </div>
                </div>
                <button className="btn-secondary py-3 px-8 text-sm group-hover:bg-accent group-hover:text-white group-hover:border-accent transition-all">
                  Apply Now
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-card/30 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Don't see a fit?</h2>
          <p className="text-text-muted mb-10">We're always looking for talented people. Send us an open application and tell us how you can help NeoToons grow.</p>
          <button className="btn-primary px-10 py-4">Open Application</button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Careers;
