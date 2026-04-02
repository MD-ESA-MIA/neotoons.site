import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import { setAuth, logout, setLoading } from './store/slices/authSlice';
import { addNotification } from './store/slices/notificationsSlice';
import { addMessage } from './store/slices/messagesSlice';
import { updatePostReactions, addComment } from './store/slices/postsSlice';
import toast from 'react-hot-toast';
import { useAuth } from './context/AuthContext';

let socket: Socket | null = null;
const SOCKET_URL = (import.meta.env.VITE_API_URL || window.location.origin).replace(/\/+$/, '');

export const getSocket = () => socket;

const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const { currentUser, isLoading: authLoading } = useAuth();

  useEffect(() => {
    dispatch(setLoading(authLoading));

    if (authLoading) {
      return;
    }

    if (currentUser) {
      dispatch(setAuth({ user: currentUser }));
    } else {
      dispatch(logout());
    }
  }, [dispatch, currentUser, authLoading]);

  useEffect(() => {
    if (currentUser && !socket) {
      socket = io(SOCKET_URL, { withCredentials: true });
      
      socket.on('notification', (notif) => {
        dispatch(addNotification(notif));
        toast.success(`New ${notif.type}: ${notif.fromUserName}`);
      });

      socket.on('receive_message', (msg) => {
        dispatch(addMessage(msg));
        if (msg.senderId !== currentUser.id) {
          toast.success(`New message from ${msg.senderId}`);
        }
      });

      socket.on('reaction_updated', (data) => {
        dispatch(updatePostReactions(data));
      });

      socket.on('comment_added', (data) => {
        dispatch(addComment(data));
      });

      socket.on('user_online', (userId) => {
        // Handle user online status if needed
      });

      socket.on('user_offline', (userId) => {
        // Handle user offline status if needed
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, [currentUser, dispatch]);

  return <>{children}</>;
};

export default AppInitializer;
