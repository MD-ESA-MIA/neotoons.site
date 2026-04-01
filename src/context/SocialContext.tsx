import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { User, Post, Message, Notification, StoryBattle } from '../socialTypes';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface SocialContextType {
  posts: Post[];
  users: User[];
  notifications: Notification[];
  battles: StoryBattle[];
  messages: Message[];
  createPost: (post: Partial<Post>) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  commentOnPost: (postId: string, text: string) => Promise<void>;
  followUser: (followingId: string) => Promise<void>;
  sendMessage: (receiverId: string, text: string) => void;
  voteInBattle: (battleId: string, option: 'A' | 'B') => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  checkUsernameAvailability: (username: string) => Promise<boolean>;
  deleteAccount: () => Promise<void>;
  unreadNotificationsCount: number;
  markNotificationsAsRead: () => void;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export const SocialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, logout, updateCurrentUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [battles, setBattles] = useState<StoryBattle[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const usersRef = React.useRef<User[]>([]);

  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error("Failed to fetch posts", err);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/notifications/${currentUser.id}`);
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  }, [currentUser]);

  const fetchBattles = useCallback(async () => {
    try {
      const res = await fetch('/api/battles');
      const data = await res.json();
      setBattles(data);
    } catch (err) {
      console.error("Failed to fetch battles", err);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    fetchUsers();
    fetchBattles();
  }, [fetchPosts, fetchUsers, fetchBattles, currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
      const newSocket = io();
      setSocket(newSocket);

      newSocket.on("connect", () => {
        newSocket.emit("join", currentUser.id);
      });

      newSocket.on("new_post", (post: Post) => {
        setPosts(prev => [post, ...prev]);
        toast.success(`${post.authorName} posted a new story!`);
      });

      newSocket.on("notification", (notif: Notification) => {
        setNotifications(prev => [notif, ...prev]);
        toast(`${notif.fromUserName} ${notif.type === 'like' ? 'liked your story' : notif.type === 'comment' ? 'commented on your story' : 'followed you'}!`, {
          icon: '🔔',
        });
      });

      newSocket.on("receive_message", (msg: Message) => {
        setMessages(prev => [...prev, msg]);
        if (msg.senderId !== currentUser.id) {
          const sender = usersRef.current.find(u => u.id === msg.senderId);
          toast(`New message from ${sender?.name || 'Someone'}`, { icon: '💬' });
        }
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [currentUser, fetchNotifications]);

  const createPost = useCallback(async (postData: Partial<Post>) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...postData,
          authorId: currentUser.id,
          authorName: currentUser.name,
          authorAvatar: currentUser.avatar,
        }),
      });
      if (res.ok) {
        toast.success("Story published successfully!");
      }
    } catch (err) {
      toast.error("Failed to publish story");
    }
  }, [currentUser]);

  const likePost = useCallback(async (postId: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id }),
      });
      if (res.ok) {
        const updatedPost = await res.json();
        setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
      }
    } catch (err) {
      console.error("Failed to like post", err);
    }
  }, [currentUser]);

  const commentOnPost = useCallback(async (postId: string, text: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, text }),
      });
      if (res.ok) {
        const updatedPost = await res.json();
        setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
        toast.success("Comment added!");
      }
    } catch (err) {
      toast.error("Failed to add comment");
    }
  }, [currentUser]);

  const followUser = useCallback(async (followingId: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/users/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId: currentUser.id, followingId }),
      });
      if (res.ok) {
        toast.success("User followed!");
        fetchUsers();
      }
    } catch (err) {
      toast.error("Failed to follow user");
    }
  }, [currentUser, fetchUsers]);

  const sendMessage = useCallback((receiverId: string, text: string) => {
    if (!currentUser || !socket) return;
    socket.emit("send_message", {
      senderId: currentUser.id,
      receiverId,
      text,
    });
  }, [currentUser, socket]);

  const voteInBattle = useCallback(async (battleId: string, option: 'A' | 'B') => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/battles/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ battleId, userId: currentUser.id, option }),
      });
      if (res.ok) {
        const updatedBattle = await res.json();
        setBattles(prev => prev.map(b => b.id === battleId ? updatedBattle : b));
        toast.success("Vote cast!");
      }
    } catch (err) {
      toast.error("Failed to cast vote");
    }
  }, [currentUser]);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
        updateCurrentUser(updatedUser);
        toast.success("Profile updated successfully!");
        fetchUsers();
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to update profile");
      }
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    }
  }, [currentUser, fetchUsers]);

  const checkUsernameAvailability = useCallback(async (username: string) => {
    try {
      const res = await fetch(`/api/check-username/${username}`);
      const data = await res.json();
      return data.available;
    } catch (err) {
      return false;
    }
  }, []);

  const deleteAccount = useCallback(async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/users/${currentUser.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success("Account deleted");
        logout();
      }
    } catch (err) {
      toast.error("Failed to delete account");
    }
  }, [currentUser, logout]);

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const markNotificationsAsRead = useCallback(() => {
    setNotifications(prev => {
      const hasUnread = prev.some(n => !n.read);
      if (!hasUnread) return prev;
      return prev.map(n => ({ ...n, read: true }));
    });
  }, []);

  return (
    <SocialContext.Provider value={{
      posts,
      users,
      notifications,
      battles,
      messages,
      createPost,
      likePost,
      commentOnPost,
      followUser,
      sendMessage,
      voteInBattle,
      updateProfile,
      checkUsernameAvailability,
      deleteAccount,
      unreadNotificationsCount,
      markNotificationsAsRead
    }}>
      {children}
    </SocialContext.Provider>
  );
};

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (context === undefined) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
};
