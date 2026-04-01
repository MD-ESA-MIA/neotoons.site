import React from 'react';
import { motion } from 'motion/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Calendar, ArrowRight } from 'lucide-react';
import Badge from '../components/ui/Badge';
import { Link } from 'react-router-dom';
import { blogPosts } from '../data/blogPosts';

const Blog: React.FC = () => {
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
            Stories & <span className="text-gradient">Updates</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-text-muted max-w-2xl mx-auto"
          >
            Tips, tutorials, and the latest news from the intersection of AI and creativity.
          </motion.p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, i) => (
              <motion.div 
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link 
                  to={`/blog/${post.id}`}
                  className="block glass-panel rounded-[32px] overflow-hidden group hover:border-accent transition-all cursor-pointer h-full"
                >
                  <div className="h-48 bg-linear-to-br from-accent/20 to-indigo-900/40 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors flex items-center justify-center">
                      <span className="text-white/10 font-black text-6xl uppercase tracking-tighter select-none">{post.category.split(' ')[0]}</span>
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant={post.category === 'Product Update' ? 'cyan' : post.category === 'Tutorial' ? 'accent' : 'gold'}>
                        {post.category}
                      </Badge>
                      <div className="flex items-center gap-2 text-[10px] text-text-muted font-bold uppercase tracking-widest">
                        <Calendar className="w-3 h-3" />
                        {post.date}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4 group-hover:text-accent transition-colors leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-sm text-text-muted mb-8 line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-2 text-sm font-black text-white group-hover:text-accent transition-colors group/link">
                      Read more <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 px-6 bg-card/30 border-y border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Stay in the Loop</h2>
          <p className="text-text-muted mb-10">Get the latest tutorials and product updates delivered straight to your inbox.</p>
          <form className="flex flex-col sm:flex-row gap-4">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 bg-bg border border-border rounded-2xl px-6 py-4 text-sm text-white focus:border-accent outline-hidden transition-all"
            />
            <button className="btn-primary px-10 py-4">Subscribe</button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
