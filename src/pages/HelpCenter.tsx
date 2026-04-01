import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, HelpCircle, Mail } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const HelpCenter: React.FC = () => {
  const faqs = [
    {
      question: 'How do I get started with NeoToons?',
      answer: 'Sign up for a free account, choose your plan, and start creating content with our AI tools.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards and process payments through Stripe.'
    },
    {
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes, you can cancel your subscription at any time. No questions asked.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'We offer a 7-day money-back guarantee for annual plans. Contact support for more details.'
    },
    {
      question: 'How do I upgrade or downgrade my plan?',
      answer: 'Go to your account settings and click on "Billing" to manage your subscription.'
    },
    {
      question: 'Does NeoToons offer API access?',
      answer: 'Yes, API access is available on Pro and Studio plans. Check our API documentation for details.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="mb-12">
            <Link to="/" className="text-primary hover:text-primary/80 flex items-center gap-2 mb-6">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-text-primary mb-4">
              Help Center
            </h1>
            <p className="text-text-secondary text-lg">
              Find answers to common questions about NeoToons AI
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-12">
            <input 
              type="text" 
              placeholder="Search help articles..." 
              className="w-full px-6 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          {/* FAQs */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-text-primary mb-8">Frequently Asked Questions</h2>
            
            {faqs.map((faq, index) => (
              <details key={index} className="group p-6 rounded-lg border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                <summary className="flex items-start justify-between cursor-pointer font-semibold text-text-primary hover:text-primary transition-colors">
                  <span className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary" />
                    {faq.question}
                  </span>
                </summary>
                <p className="mt-4 ml-8 text-text-secondary leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>

          {/* Contact Support */}
          <div className="mt-16 p-8 rounded-lg border border-primary/20 bg-primary/5">
            <div className="flex items-start gap-4">
              <Mail className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">Still need help?</h3>
                <p className="text-text-secondary mb-4">
                  Can't find what you're looking for? Our support team is ready to help.
                </p>
                <a 
                  href="mailto:neotoons.site.help@gmail.com" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Email Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HelpCenter;
