import { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { pauseTimer, resumeTimer, resetTimer, decrementTimer } from '../store/timerSlice';
import Confetti from 'react-confetti';

const Timer = () => {
  const dispatch = useAppDispatch();
  const { isRunning, isPaused, seconds, targetSeconds, exerciseId, setNumber } = useAppSelector(
    (state) => state.timer
  );
  const exercises = useAppSelector((state) => state.exercises.exercises);
  const [showConfetti, setShowConfetti] = useState(false);

  const exercise = exercises.find((ex) => ex.id === exerciseId);

  useEffect(() => {
    if (isRunning && !isPaused) {
      const interval = setInterval(() => {
        dispatch(decrementTimer());
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isRunning, isPaused, dispatch]);

  // Trigger confetti when timer reaches 0
  useEffect(() => {
    if (seconds === 0 && isRunning) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [seconds, isRunning]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = targetSeconds > 0 ? ((targetSeconds - seconds) / targetSeconds) * 100 : 0;

  if (!isRunning) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Active Timer</h3>
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-400">Set {setNumber}</span>
      </div>

      {exercise && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{exercise.name}</p>
      )}

      <div className="relative">
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <div className="text-4xl font-bold text-gray-900 dark:text-white tabular-nums">
          {formatTime(seconds)}
        </div>

        <div className="flex space-x-2">
          {!isPaused ? (
            <button
              onClick={() => dispatch(pauseTimer())}
              className="p-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              aria-label="Pause timer"
            >
              <Pause className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => dispatch(resumeTimer())}
              className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              aria-label="Resume timer"
            >
              <Play className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={() => dispatch(resetTimer())}
            className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            aria-label="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {seconds === 0 && (
        <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg text-center font-medium">
          Set complete!
        </div>
      )}

      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={300}
            gravity={0.2}
          />
        </div>
      )}
    </div>
  );
};

export default Timer;
