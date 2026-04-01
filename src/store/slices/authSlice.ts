import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { User } from '../../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const safeParseJson = async (response: Response) => {
  try {
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return null;
    }
    return await response.json();
  } catch (err) {
    return null;
  }
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: any, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await safeParseJson(response);
        return rejectWithValue(error?.error || 'Login failed');
      }

      const data = await safeParseJson(response);
      if (!data) {
        return rejectWithValue('Invalid response from server');
      }
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Login failed');
    }
  }
);

export const signup = createAsyncThunk(
  'auth/signup',
  async ({ displayName, email, password }: any, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: displayName, email, password, username: displayName.toLowerCase().replace(/\s+/g, '_') + Math.floor(Math.random() * 1000) })
      });

      if (!response.ok) {
        const error = await safeParseJson(response);
        return rejectWithValue(error?.error || 'Signup failed');
      }

      const data = await safeParseJson(response);
      if (!data) {
        return rejectWithValue('Invalid response from server');
      }
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Signup failed');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData: Partial<User>, { getState, rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const error = await safeParseJson(response);
        return rejectWithValue(error?.error || 'Update failed');
      }

      const data = await safeParseJson(response);
      if (!data) {
        return rejectWithValue('Invalid response from server');
      }
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Update failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setAuth: (state, action: PayloadAction<{ user: User }>) => {
      state.user = action.payload.user;
      state.token = null;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = null;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = null;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        if (state.user) {
          state.user = { ...state.user, ...action.payload };
        }
      });
  },
});

export const { setLoading, setAuth, updateUser, logout, setError } = authSlice.actions;
export default authSlice.reducer;
