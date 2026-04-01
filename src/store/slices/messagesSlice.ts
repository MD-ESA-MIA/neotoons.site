import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Message } from '../../socialTypes';

interface MessagesState {
  conversations: Message[];
  loading: boolean;
  error: string | null;
  activeChatId: string | null;
}

const initialState: MessagesState = {
  conversations: [],
  loading: false,
  error: null,
  activeChatId: null,
};

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setConversations: (state, action: PayloadAction<Message[]>) => {
      state.conversations = action.payload;
      state.loading = false;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.conversations.push(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setActiveChat: (state, action: PayloadAction<string | null>) => {
      state.activeChatId = action.payload;
    },
  },
});

export const { setConversations, addMessage, setLoading, setActiveChat } = messagesSlice.actions;
export default messagesSlice.reducer;
