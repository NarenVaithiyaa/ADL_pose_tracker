import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase, WorkoutLog } from '../lib/supabase';

interface WorkoutLogsState {
  logs: WorkoutLog[];
  loading: boolean;
  error: string | null;
}

const initialState: WorkoutLogsState = {
  logs: [],
  loading: false,
  error: null,
};

export const fetchWorkoutLogs = createAsyncThunk('workoutLogs/fetchWorkoutLogs', async () => {
  const { data, error } = await supabase
    .from('workout_logs')
    .select('*')
    .order('completed_at', { ascending: false });

  if (error) throw error;
  return data as WorkoutLog[];
});

export const addWorkoutLog = createAsyncThunk(
  'workoutLogs/addWorkoutLog',
  async (log: {
    exercise_id: string;
    sets: number;
    reps: number;
    duration_seconds?: number;
    notes?: string;
  }) => {
    const { data, error } = await supabase
      .from('workout_logs')
      .insert([log])
      .select()
      .single();

    if (error) throw error;
    return data as WorkoutLog;
  }
);

export const deleteWorkoutLog = createAsyncThunk(
  'workoutLogs/deleteWorkoutLog',
  async (id: string) => {
    const { error } = await supabase.from('workout_logs').delete().eq('id', id);

    if (error) throw error;
    return id;
  }
);

const workoutLogsSlice = createSlice({
  name: 'workoutLogs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkoutLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkoutLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload;
      })
      .addCase(fetchWorkoutLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch workout logs';
      })
      .addCase(addWorkoutLog.fulfilled, (state, action) => {
        state.logs.unshift(action.payload);
      })
      .addCase(deleteWorkoutLog.fulfilled, (state, action) => {
        state.logs = state.logs.filter((log) => log.id !== action.payload);
      });
  },
});

export default workoutLogsSlice.reducer;
