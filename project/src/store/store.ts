import { configureStore } from '@reduxjs/toolkit';
import exercisesReducer from './exercisesSlice';
import workoutLogsReducer from './workoutLogsSlice';
import timerReducer from './timerSlice';
import themeReducer from './themeSlice';
import poseTrackingReducer from './poseTrackingSlice';

export const store = configureStore({
  reducer: {
    exercises: exercisesReducer,
    workoutLogs: workoutLogsReducer,
    timer: timerReducer,
    theme: themeReducer,
    poseTracking: poseTrackingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
