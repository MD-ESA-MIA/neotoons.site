import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LibraryItem } from '../../types';

interface LibraryState {
  items: LibraryItem[];
  loading: boolean;
  error: string | null;
}

const initialState: LibraryState = {
  items: [],
  loading: false,
  error: null,
};

const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {
    setItems: (state, action: PayloadAction<LibraryItem[]>) => {
      state.items = action.payload;
      state.loading = false;
    },
    addItem: (state, action: PayloadAction<LibraryItem>) => {
      state.items.unshift(action.payload);
    },
    updateItem: (state, action: PayloadAction<LibraryItem>) => {
      const index = state.items.findIndex(i => i.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(i => i.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setItems, addItem, updateItem, deleteItem, setLoading } = librarySlice.actions;
export default librarySlice.reducer;
