import React from 'react';
import { motion } from 'motion/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PrivacyPolicy: React.FC = () => {
  const sections = [
    {
      id: 'collection',
      title: '1. Information We Collect',
      content: 'We collect information that you provide directly to us when you create an account, use our AI generation tools, or communicate with us. This includes account data (name, email), usage data (how you interact with our services), and generated content (the stories, scripts, and prompts you create using NeoToons).'
    },
    {
      id: 'usage',
      title: '2. How We Use Your Information',
      content: 'We use the collected information to deliver and improve our services, facilitate AI generation, and perform analytics. Your data helps us personalize your experience and ensure the reliability of our platform. We do not use your generated content to train our base models without your explicit consent.'
    },
    {
      id: 'security',
      title: '3. Data Storage & Security',
      content: 'We implement industry-standard encryption and security measures to protect your data. Your information is stored on secure servers with restricted access. We retain your data for as long as your account is active or as needed to provide you with our services.'
    },
    {
      id: 'third-party',
      title: '4. Third-Party Services',
      content: 'NeoToons utilizes third-party APIs to power our generation modules. We do not sell your personal data to third parties. These services are only provided with the minimum data necessary to perform their functions.'
    },
    {
      id: 'rights',
      title: '5. Your Rights',
      content: 'You have the right to access, correct, or delete your personal data at any time. You can also export your generated content from your library. If you wish to exercise these rights, please contact our privacy team.'
    },
    {
      id: 'cookies',
      title: '6. Cookies',
      content: 'We use cookies to enhance your browsing experience, remember your preferences, and analyze site traffic. You can manage your cookie preferences through your browser settings, though some features of NeoToons may not function correctly without them.'
    },
    {
      id: 'children',
      title: '7. Children\'s Privacy',
      content: 'NeoToons is intended for users aged 13 and older. We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided us with personal data, we will take steps to delete such information.'
    },
    {
      id: 'contact',
      title: '8. Contact Us',
      content: 'If you have any questions or concerns about our Privacy Policy or data practices, please reach out to us at privacy@neotoons.ai.'
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
              Privacy <span className="text-gradient">Policy</span>
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

export default PrivacyPolicy;
