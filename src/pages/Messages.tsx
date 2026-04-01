import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Search, MoreVertical, Phone, Video, Image, Smile, ArrowLeft, User } from 'lucide-react';
import { RootState } from '../store';
import { setConversations, addMessage, setLoading } from '../store/slices/messagesSlice';
import { User as UserType, Message } from '../socialTypes';
import { getSocket } from '../AppInitializer';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Messages: React.FC = () => {
  const { userId: activeUserId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { conversations, loading } = useSelector((state: RootState) => state.messages);
  const { user: currentUser, token } = useSelector((state: RootState) => state.auth);
  const [activeUser, setActiveUser] = useState<UserType | null>(null);
  const [messageText, setMessageText] = useState('');
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversations, activeUserId]);

  const fetchConversations = async () => {
    if (!token) return;
    dispatch(setLoading(true));
    try {
      const response = await fetch('/api/messages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        dispatch(setConversations(data));
      }
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fetchActiveUser = async (uid: string) => {
    if (!token) return;
    try {
      const response = await fetch(`/api/users/${uid}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setActiveUser(data);
      }
    } catch (error) {
      console.error('Failed to fetch user');
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [token]);

  useEffect(() => {
    if (activeUserId) {
      fetchActiveUser(activeUserId);
    } else {
      setActiveUser(null);
    }
  }, [activeUserId, token]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!messageText.trim() || !activeUserId || !token) return;

    const text = messageText;
    setMessageText('');

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ receiverId: activeUserId, text })
      });

      if (response.ok) {
        const newMessage = await response.json();
        dispatch(addMessage(newMessage));
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const activeMessages = activeUserId 
    ? conversations.filter(m => m.senderId === activeUserId || m.receiverId === activeUserId)
    : [];

  const conversationList = Array.from(new Set(
    conversations.map(m => m.senderId === currentUser?.id ? m.receiverId : m.senderId)
  )).map(uid => {
    const lastMsg = [...conversations]
      .reverse()
      .find(m => m.senderId === uid || m.receiverId === uid);
    return { userId: uid, lastMessage: lastMsg };
  });

  return (
    <div className="h-[calc(100vh-120px)] flex bg-[#1a1030] rounded-2xl border border-white/5 overflow-hidden">
      {/* Sidebar */}
      <div className={`w-full md:w-80 border-r border-white/5 flex flex-col ${activeUserId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-white/5 space-y-4">
          <h2 className="text-xl font-bold text-white">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input 
              type="text"
              placeholder="Search chats..."
              className="w-full bg-white/5 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-purple-500/50 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversationList.map((conv) => (
            <button
              key={conv.userId}
              onClick={() => navigate(`/workspace/messages/${conv.userId}`)}
              className={`w-full p-4 flex gap-3 hover:bg-white/5 transition-all border-b border-white/5 ${activeUserId === conv.userId ? 'bg-white/5' : ''}`}
            >
              <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center text-lg font-bold text-white shrink-0">
                {conv.userId[0].toUpperCase()}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-white truncate">User {conv.userId.slice(0, 5)}</span>
                  <span className="text-[10px] text-white/30">
                    {conv.lastMessage && format(new Date(conv.lastMessage.createdAt), 'HH:mm')}
                  </span>
                </div>
                <p className="text-xs text-white/40 truncate">
                  {conv.lastMessage?.text || 'No messages yet'}
                </p>
              </div>
            </button>
          ))}
          {conversationList.length === 0 && !loading && (
            <div className="p-8 text-center text-white/20">
              <p className="text-sm">No conversations yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className={`flex-1 flex flex-col ${!activeUserId ? 'hidden md:flex' : 'flex'}`}>
        {activeUserId ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#1a1030]/50 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <button onClick={() => navigate('/workspace/messages')} className="md:hidden p-2 text-white/60">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center font-bold text-white">
                  {activeUser?.displayName?.[0] || activeUserId[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-white">{activeUser?.displayName || `User ${activeUserId.slice(0, 5)}`}</h3>
                  <p className="text-[10px] text-emerald-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-white/40 hover:text-white transition-all"><Phone className="w-5 h-5" /></button>
                <button className="p-2 text-white/40 hover:text-white transition-all"><Video className="w-5 h-5" /></button>
                <button className="p-2 text-white/40 hover:text-white transition-all"><MoreVertical className="w-5 h-5" /></button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {activeMessages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex ${msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] space-y-1`}>
                    <div className={`p-3 rounded-2xl text-sm ${
                      msg.senderId === currentUser?.id 
                        ? 'bg-purple-600 text-white rounded-tr-none' 
                        : 'bg-white/5 text-white/90 rounded-tl-none border border-white/5'
                    }`}>
                      {msg.text}
                    </div>
                    <p className={`text-[9px] text-white/20 ${msg.senderId === currentUser?.id ? 'text-right' : 'text-left'}`}>
                      {format(new Date(msg.createdAt), 'HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-[#1a1030]/50">
              <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-2xl p-2 focus-within:border-purple-500/50 transition-all">
                <button type="button" className="p-2 text-white/40 hover:text-white transition-all"><Smile className="w-5 h-5" /></button>
                <button type="button" className="p-2 text-white/40 hover:text-white transition-all"><Image className="w-5 h-5" /></button>
                <input 
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-white placeholder:text-white/20"
                />
                <button 
                  type="submit"
                  disabled={!messageText.trim()}
                  className="p-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:hover:bg-purple-600 transition-all shadow-lg shadow-purple-600/20"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
              <MessageSquare className="w-10 h-10 text-white/20" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Your Messages</h3>
              <p className="text-sm text-white/40 max-w-xs">Select a conversation from the sidebar to start chatting with other members.</p>
            </div>
            <button 
              onClick={() => navigate('/workspace/members')}
              className="px-6 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-all"
            >
              Find Members
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const MessageSquare = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
);

export default Messages;
