import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Post, Comment, Reaction } from '../../socialTypes';

interface PostsState {
  items: Post[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
}

const initialState: PostsState = {
  items: [],
  loading: false,
  error: null,
  hasMore: true,
  page: 1,
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setPosts: (state, action: PayloadAction<Post[]>) => {
      state.items = action.payload;
      state.loading = false;
    },
    addPosts: (state, action: PayloadAction<Post[]>) => {
      state.items = [...state.items, ...action.payload];
      state.loading = false;
      if (action.payload.length < 10) {
        state.hasMore = false;
      }
    },
    addPost: (state, action: PayloadAction<Post>) => {
      state.items.unshift(action.payload);
    },
    updatePost: (state, action: PayloadAction<Post>) => {
      const index = state.items.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deletePost: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(p => p.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    incrementPage: (state) => {
      state.page += 1;
    },
    updatePostReactions: (state, action: PayloadAction<{ postId: string; reactions: Reaction[] }>) => {
      const post = state.items.find(p => p.id === action.payload.postId);
      if (post) {
        post.reactions = action.payload.reactions;
      }
    },
    addComment: (state, action: PayloadAction<{ postId: string; comment: Comment }>) => {
      const post = state.items.find(p => p.id === action.payload.postId);
      if (post) {
        post.comments.push(action.payload.comment);
      }
    },
  },
});

export const { 
  setPosts, 
  addPosts, 
  addPost, 
  updatePost, 
  deletePost, 
  setLoading, 
  setError, 
  incrementPage,
  updatePostReactions,
  addComment
} = postsSlice.actions;
export default postsSlice.reducer;
