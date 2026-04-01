import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Lock } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { toast } from 'react-hot-toast';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const isProOrStudio = currentUser?.role === 'admin' || currentUser?.role === 'owner';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Features', path: '/features' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'API', path: '/api' },
    { name: 'Blog', path: '/blog' },
    { name: 'About', path: '/about' },
  ];

  const handleAPIClick = (e: React.MouseEvent) => {
    if (!isProOrStudio) {
      e.preventDefault();
      if (!currentUser) {
        toast.error('Please sign in to access the API');
        navigate('/login', { state: { message: 'Please sign in to access the API' } });
      } else {
        toast.error('Upgrade to Pro or Studio to access the API');
        navigate('/pricing', { state: { message: 'Upgrade to Pro or Studio to access the API' } });
      }
    }
  };

  const handleNavClick = (link: any, e: React.MouseEvent) => {
    if (link.name === 'API') {
      handleAPIClick(e);
    }
  };

  const isActive = (link: any) => {
    return location.pathname === link.path;
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-16 flex items-center border-b ${
        isScrolled ? 'bg-surface/80 border-border backdrop-blur-md shadow-sm' : 'bg-transparent border-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto w-full px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-xl group-hover:-translate-y-0.5 transition-all">
            N
          </div>
          <span className="font-display font-bold text-xl text-text-primary tracking-tight">
            NEOTOONS
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <div key={link.name}>
              <Link 
                to={link.path} 
                onClick={(e) => handleNavClick(link, e)}
                className={`text-sm font-medium transition-colors flex items-center gap-2 ${
                  isActive(link) ? 'text-primary font-semibold' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {link.name}
                {link.name === 'API' && !isProOrStudio && (
                  <Lock className="w-3 h-3 text-text-secondary/60" />
                )}
              </Link>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:block">
          <Link to="/login" className="bg-gradient-to-r from-primary via-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg shadow-xl shadow-primary/40 hover:shadow-primary/60 hover:from-primary/95 hover:via-purple-500 hover:to-indigo-500 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 border border-primary/30 hover:border-primary/50 brightness-110 hover:brightness-125">
            Get Started Free
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-text-secondary hover:text-text-primary p-2 transition-colors" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-surface border-b border-border p-6 flex flex-col gap-4 md:hidden shadow-lg">
          {navLinks.map((link) => (
            <div key={link.name}>
              <Link 
                to={link.path} 
                onClick={(e) => {
                  handleNavClick(link, e);
                  setIsMobileMenuOpen(false);
                }}
                className={`text-base font-medium text-text-secondary hover:text-text-primary transition-colors flex items-center justify-between py-2 border-b border-transparent hover:border-border`}
              >
                {link.name}
                {link.name === 'API' && !isProOrStudio && (
                  <Lock className="w-4 h-4 text-text-secondary/60" />
                )}
              </Link>
            </div>
          ))}
          <Link to="/login" className="btn-primary w-full text-center py-3 text-sm font-medium">
            Get Started Free
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
