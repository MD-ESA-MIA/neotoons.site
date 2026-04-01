import React from 'react';
import { motion } from 'motion/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Code, Terminal, Zap, ShieldCheck, Globe, Cpu, Database } from 'lucide-react';

const API: React.FC = () => {
  const endpoints = [
    { method: 'POST', path: '/v1/story', desc: 'Generate a full story narrative from a prompt.' },
    { method: 'POST', path: '/v1/hooks', desc: 'Generate 5 viral video hooks for a topic.' },
    { method: 'POST', path: '/v1/rewrite', desc: 'Rewrite a script to be copyright-safe.' },
    { method: 'POST', path: '/v1/voiceover', desc: 'Generate a professional narration script.' },
    { method: 'POST', path: '/v1/prompts', desc: 'Convert text into cinematic AI prompts.' },
    { method: 'POST', path: '/v1/social', desc: 'Generate cross-platform social media posts.' },
    { method: 'GET', path: '/v1/character/:id', desc: 'Retrieve a generated character profile.' },
  ];

  const apiPricing = [
    { name: 'Starter', price: '$29', limit: '1,000 requests/mo' },
    { name: 'Growth', price: '$79', limit: '10,000 requests/mo' },
    { name: 'Scale', price: '$199', limit: '100,000 requests/mo' },
    { name: 'Enterprise', price: 'Custom', limit: 'Unlimited' },
  ];

  const codeExample = `
// Example Request to NeoToons API
const response = await fetch('https://api.neotoons.ai/v1/hooks', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    topic: "AI taking over creative jobs",
    style: "shocking",
    count: 5
  })
});

const data = await response.json();
console.log(data.hooks);
  `;

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
            NeoToons <span className="text-gradient">API</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-text-muted max-w-2xl mx-auto"
          >
            Integrate the world's most advanced creative AI directly into your own applications and workflows.
          </motion.p>
        </div>
      </section>

      {/* Endpoints */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-black text-white mb-10 flex items-center gap-3">
            <Terminal className="text-accent" /> Available Endpoints
          </h2>
          <div className="space-y-4">
            {endpoints.map((ep, i) => (
              <div key={i} className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center gap-6 group hover:border-accent/30 transition-all">
                <div className="flex items-center gap-4 min-w-[240px]">
                  <span className="text-[10px] font-black bg-accent/20 text-accent px-3 py-1 rounded-full uppercase tracking-widest">
                    {ep.method}
                  </span>
                  <code className="text-sm font-mono text-white font-bold">{ep.path}</code>
                </div>
                <p className="text-sm text-text-muted">{ep.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code Example */}
      <section className="py-20 px-6 bg-card/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-black text-white mb-10 flex items-center gap-3">
            <Code className="text-accent" /> Quick Start
          </h2>
          <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-white/5 px-6 py-3 border-b border-border flex items-center justify-between">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
              </div>
              <span className="text-[10px] font-mono text-text-muted">javascript</span>
            </div>
            <pre className="p-8 text-sm font-mono text-accent-light overflow-x-auto custom-scrollbar leading-relaxed">
              <code>{codeExample}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* API Pricing */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-black text-white mb-10 flex items-center gap-3">
            <Database className="text-accent" /> API Pricing
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {apiPricing.map((tier, i) => (
              <div key={i} className="glass-panel p-8 rounded-3xl text-center hover:border-accent/30 transition-all">
                <h3 className="text-sm font-black text-text-muted uppercase tracking-widest mb-4">{tier.name}</h3>
                <div className="text-3xl font-black text-white mb-2">{tier.price}</div>
                <p className="text-xs text-text-muted">{tier.limit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default API;
