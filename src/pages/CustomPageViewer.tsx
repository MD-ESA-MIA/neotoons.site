import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, Clock, Calendar, Share2, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { adminService } from '../services/adminService';
import { CustomPage } from '../socialTypes';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CustomPageViewer: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<CustomPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const data = await adminService.getPageBySlug(slug);
        if (data && data.status === 'published') {
          setPage(data);
        } else {
          setError('Page not found or not published');
        }
      } catch (err) {
        console.error('Error fetching page:', err);
        setError('Failed to load page content');
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-bg flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center px-6">
          <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-rose-500" />
          </div>
          <h1 className="text-3xl font-black text-white mb-4">Page Not Found</h1>
          <p className="text-text-muted mb-8 text-center max-w-md">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <Link to="/" className="btn-primary px-8 py-3">
            Back to Home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumbs / Back Link */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-text-muted hover:text-white transition-colors mb-12 group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-8 leading-tight">
              {page.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-text-muted">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(page.updatedAt || page.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {Math.ceil(page.content.split(' ').length / 200)} min read
              </div>
              <button className="flex items-center gap-2 hover:text-white transition-colors">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="prose prose-invert prose-indigo max-w-none"
          >
            <div className="markdown-body">
              <ReactMarkdown>{page.content}</ReactMarkdown>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CustomPageViewer;
