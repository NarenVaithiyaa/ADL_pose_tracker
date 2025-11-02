import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase, UserPreferences } from '../lib/supabase';

interface ThemeState {
  mode: 'light' | 'dark';
  loading: boolean;
}

const initialState: ThemeState = {
  mode: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
  loading: false,
};

export const fetchThemePreference = createAsyncThunk('theme/fetchThemePreference', async () => {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('theme_mode')
    .maybeSingle();

  if (error) throw error;
  return data?.theme_mode || 'light';
});

export const saveThemePreference = createAsyncThunk(
  'theme/saveThemePreference',
  async (theme: 'light' | 'dark') => {
    const { data: existing } = await supabase
      .from('user_preferences')
      .select('id')
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('user_preferences')
        .update({ theme_mode: theme })
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('user_preferences').insert([{ theme_mode: theme }]);
      if (error) throw error;
    }

    return theme;
  }
);

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.mode);
      document.documentElement.classList.toggle('dark', state.mode === 'dark');
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.mode = action.payload;
      localStorage.setItem('theme', state.mode);
      document.documentElement.classList.toggle('dark', state.mode === 'dark');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchThemePreference.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchThemePreference.fulfilled, (state, action) => {
        state.loading = false;
        state.mode = action.payload as 'light' | 'dark';
        localStorage.setItem('theme', state.mode);
        document.documentElement.classList.toggle('dark', state.mode === 'dark');
      })
      .addCase(saveThemePreference.fulfilled, (state, action) => {
        state.mode = action.payload;
      });
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;

export default themeSlice.reducer;
