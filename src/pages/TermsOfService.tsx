import React from 'react';
import { motion } from 'motion/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TermsOfService: React.FC = () => {
  const sections = [
    {
      id: 'acceptance',
      title: '1. Acceptance of Terms',
      content: 'By accessing or using NeoToons, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.'
    },
    {
      id: 'description',
      title: '2. Description of Service',
      content: 'NeoToons is an AI-powered creative suite designed for storytellers and video creators. We provide tools for generating stories, hooks, scripts, voice-overs, and visual prompts. We reserve the right to modify or discontinue any part of the service at any time.'
    },
    {
      id: 'accounts',
      title: '3. User Accounts',
      content: 'To access certain features, you must register for an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate and complete information during registration.'
    },
    {
      id: 'use',
      title: '4. Acceptable Use',
      content: 'You agree not to use NeoToons for any unlawful purpose or in any way that could damage, disable, or impair our services. Prohibited activities include generating harmful or illegal content, attempting to reverse-engineer our AI models, or bypassing any security measures.'
    },
    {
      id: 'property',
      title: '5. Intellectual Property',
      content: 'You own the content you generate using NeoToons. However, by using our service, you grant us a limited license to host and display your content as necessary to provide the service. NeoToons owns all rights to the platform, its underlying technology, and its original assets.'
    },
    {
      id: 'billing',
      title: '6. Payment & Billing',
      content: 'Certain features require a paid subscription. Subscriptions are billed in advance on a recurring basis. You can cancel your subscription at any time. Refunds are handled on a case-by-case basis in accordance with our refund policy.'
    },
    {
      id: 'liability',
      title: '7. Limitation of Liability',
      content: 'NeoToons and its affiliates shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use of the service. We provide the service on an "as is" and "as available" basis without any warranties.'
    },
    {
      id: 'termination',
      title: '8. Termination',
      content: 'We reserve the right to suspend or terminate your account at our sole discretion, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users or our business interests.'
    },
    {
      id: 'changes',
      title: '9. Changes to Terms',
      content: 'We may revise these Terms of Service at any time. By continuing to use NeoToons after changes are posted, you agree to be bound by the revised terms. We will notify users of significant changes via email or platform notifications.'
    },
    {
      id: 'contact',
      title: '10. Contact',
      content: 'If you have any legal questions regarding these terms, please contact our legal team at legal@neotoons.ai.'
    }
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      
      <main className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero */}
          <div className="mb-16">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#1C1C32] text-[#6B7280] text-xs font-medium mb-6">
              Last updated: March 2026
            </div>
            <h1 className="font-display font-black text-5xl md:text-6xl text-white tracking-tight">
              Terms of <span className="text-gradient">Service</span>
            </h1>
          </div>

          <div className="flex flex-col lg:flex-row gap-16">
            {/* Sidebar TOC */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-32 space-y-4">
                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6">Contents</h3>
                <nav className="flex flex-col gap-3">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className="text-left text-sm text-text-muted hover:text-accent transition-colors"
                    >
                      {section.title.split('. ')[1]}
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Content Area */}
            <div className="flex-1 max-w-3xl">
              {sections.map((section, index) => (
                <motion.section
                  key={section.id}
                  id={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="mb-12 pb-12 border-b border-border last:border-0 last:mb-0 last:pb-0"
                >
                  <h2 className="font-display text-[22px] font-bold text-[#A78BFA] mb-6">
                    {section.title}
                  </h2>
                  <p className="font-sans text-[15px] text-[#C4C4D4] leading-[1.8]">
                    {section.content}
                  </p>
                </motion.section>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;
