import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import { Heart, Reply, MoreHorizontal, Send } from 'lucide-react';
import { Comment } from '../../socialTypes';
import { RootState } from '../../store';
import { addComment } from '../../store/slices/postsSlice';
import toast from 'react-hot-toast';

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
}

const CommentItem: React.FC<{ comment: Comment; onReply: (commentId: string) => void }> = ({ comment, onReply }) => {
  const [showReplies, setShowReplies] = useState(false);

  return (
    <div className="flex gap-3 group">
      <img src={comment.authorAvatar || `https://ui-avatars.com/api/?name=${comment.authorName}`} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="bg-white/5 rounded-2xl px-3 py-2 inline-block max-w-full">
          <div className="font-semibold text-xs text-white/90">{comment.authorName}</div>
          <div className="text-sm text-white/70 break-words">{comment.text}</div>
        </div>
        <div className="flex items-center gap-4 mt-1 ml-2 text-[11px] font-medium text-white/40">
          <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
          <button className="hover:text-white transition-colors">Like</button>
          <button onClick={() => onReply(comment.id)} className="hover:text-white transition-colors">Reply</button>
        </div>

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {!showReplies ? (
              <button 
                onClick={() => setShowReplies(true)}
                className="text-[11px] text-purple-400 hover:underline flex items-center gap-1"
              >
                <Reply className="w-3 h-3 rotate-180" />
                View {comment.replies.length} replies
              </button>
            ) : (
              <div className="space-y-3 mt-3 ml-2 border-l border-white/10 pl-4">
                {comment.replies.map(reply => (
                  <CommentItem key={reply.id} comment={reply} onReply={onReply} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const CommentSection: React.FC<CommentSectionProps> = ({ postId, comments }) => {
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const { user, token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !token) return;

    try {
      const url = replyTo ? `/api/comments/${replyTo}/reply` : `/api/posts/${postId}/comments`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          throw new Error('Invalid response format');
        }
        const text = await response.text();
        const newComment = JSON.parse(text);
        dispatch(addComment({ postId, comment: newComment }));
        setText('');
        setReplyTo(null);
        toast.success('Comment posted');
      }
    } catch (error) {
      toast.error('Failed to post comment');
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-white/5">
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {comments.map(comment => (
          <CommentItem key={comment.id} comment={comment} onReply={(id) => {
            setReplyTo(id);
            const input = document.getElementById(`comment-input-${postId}`);
            input?.focus();
          }} />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
        <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}`} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
        <div className="flex-1 relative">
          {replyTo && (
            <div className="absolute -top-6 left-0 text-[10px] text-purple-400 flex items-center gap-1">
              Replying to a comment...
              <button onClick={() => setReplyTo(null)} className="text-white/40 hover:text-white">Cancel</button>
            </div>
          )}
          <input
            id={`comment-input-${postId}`}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
            className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-purple-500/50 transition-colors pr-10"
          />
          <button 
            type="submit"
            disabled={!text.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-purple-500 hover:text-purple-400 disabled:text-white/20 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentSection;
