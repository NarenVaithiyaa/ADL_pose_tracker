import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  seconds: number;
  targetSeconds: number;
  exerciseId: string | null;
  setNumber: number;
}

const initialState: TimerState = {
  isRunning: false,
  isPaused: false,
  seconds: 0,
  targetSeconds: 60,
  exerciseId: null,
  setNumber: 0,
};

const timerSlice = createSlice({
  name: 'timer',
  initialState,
  reducers: {
    startTimer: (
      state,
      action: PayloadAction<{ targetSeconds: number; exerciseId: string; setNumber: number }>
    ) => {
      state.isRunning = true;
      state.isPaused = false;
      state.seconds = action.payload.targetSeconds;
      state.targetSeconds = action.payload.targetSeconds;
      state.exerciseId = action.payload.exerciseId;
      state.setNumber = action.payload.setNumber;
    },
    pauseTimer: (state) => {
      state.isPaused = true;
    },
    resumeTimer: (state) => {
      state.isPaused = false;
    },
    decrementTimer: (state) => {
      if (state.seconds > 0 && !state.isPaused) {
        state.seconds -= 1;
      }
      if (state.seconds === 0) {
        state.isRunning = false;
      }
    },
    resetTimer: (state) => {
      state.isRunning = false;
      state.isPaused = false;
      state.seconds = 0;
      state.targetSeconds = 60;
      state.exerciseId = null;
      state.setNumber = 0;
    },
  },
});

export const { startTimer, pauseTimer, resumeTimer, decrementTimer, resetTimer } =
  timerSlice.actions;

export default timerSlice.reducer;
