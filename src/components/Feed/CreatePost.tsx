import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Image as ImageIcon, Video, Smile, Send, X, Globe, Users, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RootState } from '../../store';
import { addPost } from '../../store/slices/postsSlice';
import toast from 'react-hot-toast';

const CreatePost: React.FC = () => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<'public' | 'private' | 'followers'>('public');
  const [isExpanded, setIsExpanded] = useState(false);
  const { user, token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !image) return;
    if (!token) return;

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content, image, visibility })
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          throw new Error('Invalid response format');
        }
        const text = await response.text();
        const newPost = JSON.parse(text);
        dispatch(addPost(newPost));
        setContent('');
        setImage(null);
        setIsExpanded(false);
        toast.success('Post created!');
      }
    } catch (error) {
      toast.error('Failed to create post');
    }
  };

  return (
    <div className="bg-[#1e1535] border border-white/10 rounded-xl p-4 shadow-lg">
      <div className="flex gap-3">
        <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}`} alt="" className="w-10 h-10 rounded-full object-cover border border-white/10" />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder={`What's on your mind, ${user?.name?.split(' ')[0]}?`}
            className="w-full bg-transparent border-none focus:ring-0 text-white/90 placeholder:text-white/20 resize-none py-2 min-h-[40px] max-h-[200px] custom-scrollbar"
            rows={isExpanded ? 3 : 1}
          />

          <AnimatePresence>
            {image && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative mt-3 rounded-lg overflow-hidden border border-white/10"
              >
                <img src={image} alt="Preview" className="w-full h-auto max-h-[300px] object-cover" />
                <button 
                  onClick={() => setImage(null)}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isExpanded && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/5">
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 hover:bg-white/5 rounded-lg text-emerald-400 transition-colors flex items-center gap-2"
                    >
                      <ImageIcon className="w-5 h-5" />
                      <span className="text-xs font-medium hidden sm:inline">Photo</span>
                    </button>
                    <button className="p-2 hover:bg-white/5 rounded-lg text-purple-400 transition-colors flex items-center gap-2">
                      <Video className="w-5 h-5" />
                      <span className="text-xs font-medium hidden sm:inline">Video</span>
                    </button>
                    <button className="p-2 hover:bg-white/5 rounded-lg text-yellow-400 transition-colors flex items-center gap-2">
                      <Smile className="w-5 h-5" />
                      <span className="text-xs font-medium hidden sm:inline">Feeling</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <select 
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value as any)}
                      className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white/60 focus:outline-none focus:border-purple-500/50 transition-colors"
                    >
                      <option value="public">Public</option>
                      <option value="followers">Followers</option>
                      <option value="private">Private</option>
                    </select>
                    <button
                      onClick={handleSubmit}
                      disabled={!content.trim() && !image}
                      className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-lg shadow-purple-600/20"
                    >
                      <Send className="w-4 h-4" />
                      Post
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        accept="image/*" 
        className="hidden" 
      />
    </div>
  );
};

export default CreatePost;
