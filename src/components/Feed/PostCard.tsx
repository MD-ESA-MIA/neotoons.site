import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import { 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  Heart, 
  ThumbsUp, 
  Smile, 
  Flag, 
  UserMinus, 
  Pin,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Post, ReactionType } from '../../socialTypes';
import { RootState } from '../../store';
import ReactionPicker from './ReactionPicker';
import CommentSection from './CommentSection';
import toast from 'react-hot-toast';
import { deletePost, updatePostReactions } from '../../store/slices/postsSlice';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [showReactions, setShowReactions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { user, token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const myReaction = post.reactions.find(r => r.userId === user?.id);
  
  const handleReact = async (type: ReactionType) => {
    if (!token) return;
    try {
      const response = await fetch(`/api/posts/${post.id}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ type })
      });
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          throw new Error('Invalid response format');
        }
        const text = await response.text();
        const updatedReactions = JSON.parse(text);
        dispatch(updatePostReactions({ postId: post.id, reactions: updatedReactions }));
      } else {
        throw new Error();
      }
    } catch (error) {
      toast.error('Failed to react');
    }
  };

  const handleDelete = async () => {
    if (!token || !window.confirm('Delete this post?')) return;
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        dispatch(deletePost(post.id));
        toast.success('Post deleted');
      }
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const handleReport = async (reason: string) => {
    if (!token) return;
    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ targetId: post.id, targetType: 'post', reason })
      });
      if (response.ok) {
        toast.success('Report submitted');
        setShowMenu(false);
      }
    } catch (error) {
      toast.error('Failed to report');
    }
  };

  const reactionIcons: Record<ReactionType, string> = {
    like: '👍',
    love: '❤️',
    haha: '😆',
    wow: '😮',
    sad: '😢',
    angry: '😡'
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1e1535] border border-white/10 rounded-xl p-4 space-y-4 relative"
    >
      {post.isPinned && (
        <div className="absolute top-4 right-12 flex items-center gap-1 text-[10px] text-purple-400 font-medium uppercase tracking-wider">
          <Pin className="w-3 h-3" />
          Pinned
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={post.authorAvatar || `https://ui-avatars.com/api/?name=${post.authorName}`} alt="" className="w-10 h-10 rounded-full object-cover border border-white/10" />
            {post.authorBadge && (
              <div className="absolute -bottom-1 -right-1 bg-purple-600 text-[8px] font-bold px-1 rounded border border-[#1e1535]">
                {post.authorBadge}
              </div>
            )}
          </div>
          <div>
            <div className="font-semibold text-white/90 flex items-center gap-2">
              {post.authorName}
              {post.authorBadge === 'STUDIO' && <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />}
            </div>
            <div className="text-xs text-white/40">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </div>
          </div>
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-[#1a1030] border border-white/10 rounded-lg shadow-2xl py-1 z-50"
              >
                {user?.id === post.authorId || user?.role === 'admin' ? (
                  <>
                    <button onClick={handleDelete} className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-white/5 flex items-center gap-2">
                      <Trash2 className="w-4 h-4" /> Delete Post
                    </button>
                    {user?.role === 'admin' && (
                      <button className="w-full px-4 py-2 text-left text-sm text-white/70 hover:bg-white/5 flex items-center gap-2">
                        <Pin className="w-4 h-4" /> {post.isPinned ? 'Unpin' : 'Pin'} Post
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button onClick={() => handleReport('inappropriate')} className="w-full px-4 py-2 text-left text-sm text-white/70 hover:bg-white/5 flex items-center gap-2">
                      <Flag className="w-4 h-4" /> Report Post
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm text-white/70 hover:bg-white/5 flex items-center gap-2">
                      <UserMinus className="w-4 h-4" /> Unfollow {post.authorName}
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <p className="text-white/80 whitespace-pre-wrap leading-relaxed">
          {post.content}
        </p>
        {post.image && (
          <div className="rounded-lg overflow-hidden border border-white/5">
            <img src={post.image} alt="" className="w-full h-auto max-h-[500px] object-cover" />
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-white/40 px-1">
        <div className="flex items-center gap-1">
          <div className="flex -space-x-1">
            {Array.from(new Set(post.reactions.map(r => r.type))).slice(0, 3).map(type => (
              <span key={type} className="w-4 h-4 flex items-center justify-center bg-[#1a1030] rounded-full border border-white/10 text-[10px]">
                {reactionIcons[type]}
              </span>
            ))}
          </div>
          <span>{post.reactions.length > 0 ? post.reactions.length : ''}</span>
        </div>
        <div className="flex gap-3">
          <span>{post.comments.length} comments</span>
          <span>{post.shares} shares</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 pt-2 border-t border-white/5 relative">
        <div className="flex-1 relative">
          <button 
            onMouseEnter={() => setShowReactions(true)}
            onClick={() => handleReact('like')}
            className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
              myReaction ? 'text-purple-400 bg-purple-500/10' : 'text-white/40 hover:bg-white/5'
            }`}
          >
            {myReaction ? (
              <span className="text-lg">{reactionIcons[myReaction.type]}</span>
            ) : (
              <ThumbsUp className="w-5 h-5" />
            )}
            <span className="font-medium">{myReaction ? myReaction.type.charAt(0).toUpperCase() + myReaction.type.slice(1) : 'Like'}</span>
          </button>

          <AnimatePresence>
            {showReactions && (
              <ReactionPicker 
                onReact={handleReact} 
                onClose={() => setShowReactions(false)} 
              />
            )}
          </AnimatePresence>
        </div>

        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-white/40 hover:bg-white/5 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium">Comment</span>
        </button>

        <button className="flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-white/40 hover:bg-white/5 transition-colors">
          <Share2 className="w-5 h-5" />
          <span className="font-medium">Share</span>
        </button>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <CommentSection postId={post.id} comments={post.comments} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PostCard;
