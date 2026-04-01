import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import { setAuth, logout, setLoading } from './store/slices/authSlice';
import { addNotification } from './store/slices/notificationsSlice';
import { addMessage } from './store/slices/messagesSlice';
import { updatePostReactions, addComment } from './store/slices/postsSlice';
import { RootState } from './store';
import toast from 'react-hot-toast';

let socket: Socket | null = null;
const SOCKET_URL = (import.meta.env.VITE_API_URL || window.location.origin).replace(/\/+$/, '');

export const getSocket = () => socket;

const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const initAuth = async () => {
      dispatch(setLoading(true));
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType?.includes('application/json')) {
            const userData = await response.json();
            dispatch(setAuth({ user: userData }));
          } else {
            dispatch(logout());
          }
        } else {
          dispatch(logout());
        }
      } catch (error) {
        console.error('Auth init failed:', error);
        dispatch(logout());
      } finally {
        dispatch(setLoading(false));
      }
    };

    initAuth();
  }, [dispatch]);

  useEffect(() => {
    if (user && !socket) {
      socket = io(SOCKET_URL, { withCredentials: true });
      
      socket.on('notification', (notif) => {
        dispatch(addNotification(notif));
        toast.success(`New ${notif.type}: ${notif.fromUserName}`);
      });

      socket.on('receive_message', (msg) => {
        dispatch(addMessage(msg));
        if (msg.senderId !== user.id) {
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
  }, [user, dispatch]);

  return <>{children}</>;
};

export default AppInitializer;
