import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, ExternalLink } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Documentation: React.FC = () => {
  const docs = [
    {
      category: 'Getting Started',
      items: [
        { title: 'Installation Guide', href: '#' },
        { title: 'Quick Start', href: '#' },
        { title: 'Configuration', href: '#' },
        { title: 'First Project', href: '#' }
      ]
    },
    {
      category: 'API Reference',
      items: [
        { title: 'Authentication', href: '#' },
        { title: 'Content Generation', href: '#' },
        { title: 'Image Generation', href: '#' },
        { title: 'Error Handling', href: '#' }
      ]
    },
    {
      category: 'Guides',
      items: [
        { title: 'Best Practices', href: '#' },
        { title: 'Optimization Tips', href: '#' },
        { title: 'Troubleshooting', href: '#' },
        { title: 'FAQ', href: '#' }
      ]
    },
    {
      category: 'Advanced',
      items: [
        { title: 'Custom Models', href: '#' },
        { title: 'Batch Processing', href: '#' },
        { title: 'Webhooks', href: '#' },
        { title: 'Rate Limiting', href: '#' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="mb-12">
            <Link to="/" className="text-primary hover:text-primary/80 flex items-center gap-2 mb-6">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-text-primary mb-4">
              Documentation
            </h1>
            <p className="text-text-secondary text-lg">
              Comprehensive guides and API reference for NeoToons AI
            </p>
          </div>

          {/* Documentation Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {docs.map((doc) => (
              <div key={doc.category} className="p-6 rounded-lg border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                <h3 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  {doc.category}
                </h3>
                
                <ul className="space-y-3">
                  {doc.items.map((item) => (
                    <li key={item.title}>
                      <a 
                        href={item.href}
                        className="text-text-secondary hover:text-primary transition-colors flex items-center justify-between group"
                      >
                        <span>{item.title}</span>
                        <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Additional Resources */}
          <div className="mt-16 p-8 rounded-lg border border-primary/20 bg-primary/5">
            <h3 className="text-xl font-semibold text-text-primary mb-4">Need More Help?</h3>
            <p className="text-text-secondary mb-6">
              Check out our Help Center or join our community forum for discussions and support.
            </p>
            <div className="flex gap-4">
              <Link 
                to="/help"
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Help Center
              </Link>
              <Link 
                to="/community"
                className="px-6 py-3 border border-primary text-primary hover:bg-primary/10 rounded-lg transition-colors"
              >
                Community
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Documentation;
