import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PoseTrackingState {
  isTracking: boolean;
  exerciseName: string | null;
  currentReps: number;
  targetReps: number;
  currentSet: number;
  targetSets: number;
  feedback: string;
}

const initialState: PoseTrackingState = {
  isTracking: false,
  exerciseName: null,
  currentReps: 0,
  targetReps: 0,
  currentSet: 0,
  targetSets: 1,
  feedback: '',
};

const poseTrackingSlice = createSlice({
  name: 'poseTracking',
  initialState,
  reducers: {
    startTracking: (
      state,
      action: PayloadAction<{
        exerciseName: string;
        targetReps: number;
        targetSets: number;
      }>
    ) => {
      state.isTracking = true;
      state.exerciseName = action.payload.exerciseName;
      state.targetReps = action.payload.targetReps;
      state.targetSets = action.payload.targetSets;
      state.currentReps = 0;
      state.currentSet = 0;
      state.feedback = 'Get into position...';
    },
    stopTracking: (state) => {
      state.isTracking = false;
      state.exerciseName = null;
      state.currentReps = 0;
      state.targetReps = 0;
      state.currentSet = 0;
      state.targetSets = 1;
      state.feedback = '';
    },
    incrementRep: (state) => {
      state.currentReps += 1;
      state.feedback = `Rep ${state.currentReps} completed!`;
    },
    nextSet: (state) => {
      if (state.currentSet < state.targetSets) {
        state.currentSet += 1;
        state.currentReps = 0;
        state.feedback = `Set ${state.currentSet} started!`;
      }
    },
    setFeedback: (state, action: PayloadAction<string>) => {
      state.feedback = action.payload;
    },
  },
});

export const { startTracking, stopTracking, incrementRep, nextSet, setFeedback } =
  poseTrackingSlice.actions;

export default poseTrackingSlice.reducer;
