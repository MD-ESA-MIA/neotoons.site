import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Mail, 
  MapPin, 
  Shield, 
  Zap, 
  Users, 
  Globe, 
  CreditCard, 
  Lock 
} from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Features', path: '/features' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'API', path: '/api' },
    { name: 'Blog', path: '/blog' },
  ];

  const companyLinks = [
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Service', path: '/terms' },
  ];

  const supportLinks = [
    { name: 'Help Center', path: '/help' },
    { name: 'Community', path: '/community' },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, url: '#' },
    { name: 'Twitter', icon: Twitter, url: '#' },
    { name: 'Instagram', icon: Instagram, url: '#' },
    { name: 'YouTube', icon: Youtube, url: '#' },
  ];

  return (
    <footer className="bg-surface border-t border-border">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg">
                N
              </div>
              <span className="font-display text-xl font-bold text-text-primary">NEOTOONS</span>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed max-w-md">
              Build, automate, and scale your creative workflow with AI. All in one platform designed for creators, by creators.
            </p>
            <div className="flex items-center gap-4 text-text-secondary text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>neotoons.site.help@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-text-primary mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="text-text-secondary hover:text-text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-text-primary mb-4">Company</h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="text-text-secondary hover:text-text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-text-primary mb-4">Support</h3>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="text-text-secondary hover:text-text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  className="text-text-secondary hover:text-text-primary transition-colors p-2 rounded-lg hover:bg-surface/50"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>

            {/* Copyright */}
            <p className="text-text-secondary text-sm">
              © {currentYear} Neotoons AI. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border bg-surface/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-text-secondary">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>Lightning Fast</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="hover:text-text-primary transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-text-primary transition-colors">Terms of Service</Link>
              <Link to="/contact" className="hover:text-text-primary transition-colors">Contact Us</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;