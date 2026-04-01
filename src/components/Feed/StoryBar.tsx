import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'motion/react';
import { Plus, Eye, X } from 'lucide-react';
import { RootState } from '../../store';
import { Story } from '../../socialTypes';
import toast from 'react-hot-toast';

const StoryBar: React.FC = () => {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  const fetchStories = async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/stories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          throw new Error('Invalid response format');
        }
        const text = await response.text();
        const data = JSON.parse(text);
        setStories(data);
      }
    } catch (error) {
      console.error('Failed to fetch stories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, [token]);

  const handleCreateStory = () => {
    // In a real app, this would open a file picker
    toast.success('Story creation coming soon!');
  };

  const handleViewStory = async (story: Story) => {
    setSelectedStory(story);
    if (token && !story.views.includes(user?.id || '')) {
      await fetch(`/api/stories/${story.id}/view`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        {/* Add Story */}
        <div 
          onClick={handleCreateStory}
          className="flex-shrink-0 w-28 h-44 rounded-xl bg-[#1a1030] border border-dashed border-white/20 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-purple-500/50 transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Add Story</span>
        </div>

        {/* Stories */}
        {stories.map((story) => (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => handleViewStory(story)}
            className="flex-shrink-0 w-28 h-44 rounded-xl bg-cover bg-center relative cursor-pointer group overflow-hidden border border-white/5"
            style={{ backgroundImage: `url(${story.image})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            
            {/* Author Avatar */}
            <div className="absolute top-2 left-2 w-8 h-8 rounded-full border-2 border-purple-500 p-0.5 overflow-hidden bg-black">
              <img src={story.authorAvatar} alt={story.authorName} className="w-full h-full rounded-full object-cover" />
            </div>

            {/* Author Name */}
            <div className="absolute bottom-2 left-2 right-2">
              <p className="text-[10px] font-bold text-white truncate">{story.authorName}</p>
            </div>

            {/* View Count */}
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
              <Eye className="w-3 h-3 text-white/60" />
              <span className="text-[8px] font-bold text-white/60">{story.views.length}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Story Viewer Modal */}
      {selectedStory && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-2xl">
            <img src={selectedStory.image} alt="Story" className="w-full h-full object-cover" />
            
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={selectedStory.authorAvatar} alt="" className="w-10 h-10 rounded-full border-2 border-purple-500" />
                <div>
                  <p className="text-sm font-bold text-white">{selectedStory.authorName}</p>
                  <p className="text-[10px] text-white/60 uppercase tracking-widest">Just now</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStory(null)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 5, ease: 'linear' }}
                onAnimationComplete={() => setSelectedStory(null)}
                className="h-full bg-purple-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryBar;
