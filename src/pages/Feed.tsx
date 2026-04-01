import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'motion/react';
import { Globe, Users, TrendingUp, Sparkles, Search, Filter } from 'lucide-react';
import { RootState } from '../store';
import { setPosts, setLoading, setError, incrementPage, addPosts } from '../store/slices/postsSlice';
import PostCard from '../components/Feed/PostCard';
import CreatePost from '../components/Feed/CreatePost';
import StoryBar from '../components/Feed/StoryBar';
import toast from 'react-hot-toast';

const Feed: React.FC = () => {
  const dispatch = useDispatch();
  const { items: posts, loading, hasMore, page } = useSelector((state: RootState) => state.posts);
  const { token } = useSelector((state: RootState) => state.auth);
  const [filter, setFilter] = useState<'all' | 'following' | 'trending'>('all');
  const [search, setSearch] = useState('');

  const fetchPosts = async (pageNum: number, isNewFilter: boolean = false) => {
    if (!token) return;
    if (isNewFilter) dispatch(setLoading(true));
    
    try {
      const response = await fetch(`/api/posts?page=${pageNum}&filter=${filter}&search=${search}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          throw new Error('Invalid response format');
        }
        const text = await response.text();
        const data = JSON.parse(text);
        if (isNewFilter) {
          dispatch(setPosts(data));
        } else {
          dispatch(addPosts(data));
        }
      }
    } catch (error) {
      dispatch(setError('Failed to fetch posts'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchPosts(1, true);
  }, [filter, token]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts(1, true);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      {/* Header & Search */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            Community Feed
          </h1>
          <div className="flex bg-[#1a1030] rounded-lg p-1 border border-white/5">
            <button 
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filter === 'all' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-white/40 hover:text-white'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('following')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filter === 'following' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-white/40 hover:text-white'}`}
            >
              Following
            </button>
            <button 
              onClick={() => setFilter('trending')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filter === 'trending' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-white/40 hover:text-white'}`}
            >
              Trending
            </button>
          </div>
        </div>

        <form onSubmit={handleSearch} className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-purple-500 transition-colors" />
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stories, authors, or tags..."
            className="w-full bg-[#1a1030] border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-purple-500/50 transition-all"
          />
        </form>
      </div>

      {/* Stories */}
      <StoryBar />

      {/* Create Post */}
      <CreatePost />

      {/* Posts List */}
      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}

        {loading && (
          <div className="space-y-6">
            {[1, 2].map(i => (
              <div key={i} className="bg-[#1e1535] border border-white/10 rounded-xl p-4 space-y-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-white/5 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/5 rounded w-1/4" />
                    <div className="h-3 bg-white/5 rounded w-1/6" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-white/5 rounded w-full" />
                  <div className="h-4 bg-white/5 rounded w-full" />
                  <div className="h-4 bg-white/5 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="text-center py-20 space-y-4">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
              <Filter className="w-8 h-8 text-white/20" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-medium text-white/90">No posts found</h3>
              <p className="text-sm text-white/40">Try adjusting your filters or search terms.</p>
            </div>
          </div>
        )}

        {hasMore && !loading && posts.length > 0 && (
          <button 
            onClick={() => {
              dispatch(incrementPage());
              fetchPosts(page + 1);
            }}
            className="w-full py-3 rounded-xl border border-white/5 text-sm font-medium text-white/40 hover:text-white hover:bg-white/5 transition-all"
          >
            Load more stories
          </button>
        )}
      </div>
    </div>
  );
};

export default Feed;
