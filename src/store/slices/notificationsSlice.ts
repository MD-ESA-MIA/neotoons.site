import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Notification } from '../../socialTypes';

interface NotificationsState {
  items: Notification[];
  unreadCount: number;
  loading: boolean;
}

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
  loading: false,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.items = action.payload;
      state.unreadCount = action.payload.filter(n => !n.read).length;
      state.loading = false;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.items.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notif = state.items.find(n => n.id === action.payload);
      if (notif && !notif.read) {
        notif.read = true;
        state.unreadCount -= 1;
      }
    },
    markAllAsRead: (state) => {
      state.items.forEach(n => n.read = true);
      state.unreadCount = 0;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setNotifications, addNotification, markAsRead, markAllAsRead, setLoading } = notificationsSlice.actions;
export default notificationsSlice.reducer;
