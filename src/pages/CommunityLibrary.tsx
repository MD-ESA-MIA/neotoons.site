import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setPosts } from '../store/slices/postsSlice';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Clock, 
  Heart, 
  ChevronDown,
  BookOpen,
  Sparkles,
  User
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import Dropdown from '../components/ui/Dropdown';
import toast from 'react-hot-toast';

const CommunityLibrary: React.FC = () => {
  const dispatch = useDispatch();
  const { items: posts } = useSelector((state: RootState) => state.posts);
  const { token } = useSelector((state: RootState) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'trending' | 'new' | 'liked'>('trending');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('/api/posts');
        if (res.ok) {
          const data = await res.json();
          dispatch(setPosts(data));
        }
      } catch (err) {
        console.error("Failed to fetch posts", err);
      }
    };
    fetchPosts();
  }, [dispatch]);

  const filteredPosts = posts
    .filter(p => p.visibility === 'public')
    .filter(p => (p.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || p.content.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (filter === 'new') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (filter === 'liked') return b.likes.length - a.likes.length;
      return (b.likes.length + b.comments.length) - (a.likes.length + a.comments.length); // Trending
    });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Community Library</h1>
          <p className="text-text-muted">Discover the best AI-powered stories from our creators.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search stories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-card border border-border rounded-2xl py-3 pl-12 pr-6 text-sm text-white focus:outline-hidden focus:border-accent w-full md:w-64 transition-all"
            />
          </div>
          <Dropdown 
            options={[
              { label: 'Trending', icon: <TrendingUp className="w-4 h-4" /> },
              { label: 'New', icon: <Clock className="w-4 h-4" /> },
              { label: 'Liked', icon: <Heart className="w-4 h-4" /> }
            ]}
            value={filter.charAt(0).toUpperCase() + filter.slice(1)}
            onChange={(val) => setFilter(val as any)}
            className="w-40"
            triggerClassName="bg-card border-border py-3"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.map((post) => (
          <motion.div 
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-card border border-border rounded-[32px] overflow-hidden hover:border-accent/30 transition-all shadow-xl flex flex-col"
          >
            <div className="h-40 bg-linear-to-br from-accent/20 to-indigo-600/20 relative p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-accent shadow-lg">
                  <BookOpen className="w-6 h-6" />
                </div>
                {post.isAIExpanded && (
                  <div className="px-2 py-1 rounded-full bg-accent text-[8px] font-black uppercase tracking-widest text-white shadow-lg">
                    AI Enhanced
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-black text-white line-clamp-2 leading-tight">{post.title}</h3>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col space-y-4">
              <div className="prose prose-invert prose-sm line-clamp-4 text-text-muted flex-1">
                <ReactMarkdown>{post.content}</ReactMarkdown>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Link to={`/workspace/profile/${post.authorId}`} className="flex items-center gap-2 group/author">
                  <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-text-muted overflow-hidden">
                    {post.authorAvatar ? (
                      <img src={post.authorAvatar} alt={post.authorName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User className="w-3 h-3" />
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-text-muted group-hover/author:text-white transition-colors">{post.authorName}</span>
                </Link>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-[10px] text-text-muted font-bold">
                    <Heart className="w-3 h-3" /> {post.likes.length}
                  </div>
                  <Link to={`/workspace/feed`} className="px-3 py-1 rounded-lg bg-white/5 text-[10px] font-bold text-accent hover:bg-accent/10 transition-all">
                    Read
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="py-40 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-text-muted mx-auto">
            <Search className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-white">No stories found</h2>
          <p className="text-text-muted">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};

export default CommunityLibrary;
