import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import postsReducer from './slices/postsSlice';
import messagesReducer from './slices/messagesSlice';
import notificationsReducer from './slices/notificationsSlice';
import libraryReducer from './slices/librarySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    messages: messagesReducer,
    notifications: notificationsReducer,
    library: libraryReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
