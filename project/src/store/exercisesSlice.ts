import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase, Exercise } from '../lib/supabase';

interface ExercisesState {
  exercises: Exercise[];
  loading: boolean;
  error: string | null;
}

const initialState: ExercisesState = {
  exercises: [],
  loading: false,
  error: null,
};

export const fetchExercises = createAsyncThunk('exercises/fetchExercises', async () => {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .order('is_predefined', { ascending: false })
    .order('name');

  if (error) throw error;
  return data as Exercise[];
});

export const addExercise = createAsyncThunk(
  'exercises/addExercise',
  async (exercise: { name: string; youtube_url?: string }) => {
    const { data, error } = await supabase
      .from('exercises')
      .insert([{ ...exercise, is_predefined: false }])
      .select()
      .single();

    if (error) throw error;
    return data as Exercise;
  }
);

export const deleteExercise = createAsyncThunk('exercises/deleteExercise', async (id: string) => {
  const { error } = await supabase.from('exercises').delete().eq('id', id);

  if (error) throw error;
  return id;
});

const exercisesSlice = createSlice({
  name: 'exercises',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExercises.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExercises.fulfilled, (state, action) => {
        state.loading = false;
        state.exercises = action.payload;
      })
      .addCase(fetchExercises.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch exercises';
      })
      .addCase(addExercise.fulfilled, (state, action) => {
        state.exercises.push(action.payload);
      })
      .addCase(deleteExercise.fulfilled, (state, action) => {
        state.exercises = state.exercises.filter((ex) => ex.id !== action.payload);
      });
  },
});

export default exercisesSlice.reducer;
