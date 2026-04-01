import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, Clock, User, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Badge from '../components/ui/Badge';
import { blogPosts } from '../data/blogPosts';

const BlogPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const post = blogPosts.find((p) => p.id === id);

  if (!post) {
    return (
      <div className="min-h-screen bg-bg flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <h1 className="text-3xl font-bold text-white mb-4">Post not found</h1>
          <button 
            onClick={() => navigate('/blog')}
            className="btn-secondary px-6 py-2 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // Simple markdown-style parser
  const renderContent = (content: string) => {
    return content.split('\n\n').map((block, index) => {
      if (block.startsWith('## ')) {
        return (
          <h2 key={index} className="text-2xl font-bold text-white mt-12 mb-6">
            {block.replace('## ', '')}
          </h2>
        );
      }
      if (block.startsWith('- ')) {
        return (
          <ul key={index} className="list-disc list-inside space-y-2 mb-6 text-text-muted">
            {block.split('\n').map((item, i) => (
              <li key={i}>{item.replace('- ', '')}</li>
            ))}
          </ul>
        );
      }
      
      // Handle bold text **text**
      const parts = block.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={index} className="text-lg text-text-muted leading-relaxed mb-6">
          {parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  // Get 2 other random posts
  const otherPosts = blogPosts
    .filter((p) => p.id !== id)
    .sort(() => 0.5 - Math.random())
    .slice(0, 2);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Product Update': return 'cyan';
      case 'Tutorial': return 'accent';
      case 'Creator Story': return 'gold';
      default: return 'muted';
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      
      <article className="pt-40 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Back Button */}
          <Link 
            to="/blog" 
            className="inline-flex items-center gap-2 text-sm font-bold text-text-muted hover:text-white transition-colors mb-12 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Blog
          </Link>

          {/* Header */}
          <div className="mb-12">
            <Badge variant={getCategoryColor(post.category)} className="mb-6">
              {post.category}
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-white mb-8 leading-tight tracking-tight">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 py-8 border-y border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
                  {post.author.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{post.author}</div>
                  <div className="text-[10px] text-text-muted uppercase tracking-widest font-bold">{post.authorRole}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-6 text-xs text-text-muted font-bold uppercase tracking-widest ml-auto">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  {post.date}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  {post.readTime}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none">
            {renderContent(post.content)}
          </div>

          {/* More Articles */}
          <div className="mt-32 pt-20 border-t border-border">
            <h3 className="text-2xl font-bold text-white mb-12">More Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {otherPosts.map((otherPost) => (
                <Link 
                  key={otherPost.id}
                  to={`/blog/${otherPost.id}`}
                  className="glass-panel p-8 rounded-3xl group hover:border-accent transition-all"
                >
                  <Badge variant={getCategoryColor(otherPost.category)} className="mb-4">
                    {otherPost.category}
                  </Badge>
                  <h4 className="text-xl font-bold text-white mb-4 group-hover:text-accent transition-colors leading-tight">
                    {otherPost.title}
                  </h4>
                  <div className="flex items-center gap-2 text-sm font-black text-white group-hover:text-accent transition-colors">
                    Read more <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default BlogPost;
