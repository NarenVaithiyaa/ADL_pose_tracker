import { useState } from 'react';
import { Plus, Minus, Play, Youtube, Camera, Trash2 } from 'lucide-react';
import { useAppDispatch } from '../store/hooks';
import { startTimer } from '../store/timerSlice';
import { deleteExercise } from '../store/exercisesSlice';
import { addWorkoutLog } from '../store/workoutLogsSlice';
import { Exercise } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';

interface ExerciseCardProps {
  exercise: Exercise;
}

const ExerciseCard = ({ exercise }: ExerciseCardProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleStartTimer = (setNumber: number) => {
    dispatch(
      startTimer({
        targetSeconds: timerSeconds,
        exerciseId: exercise.id,
        setNumber,
      })
    );
    navigate('/');
  };

  const handleLogWorkout = async () => {
    await dispatch(
      addWorkoutLog({
        exercise_id: exercise.id,
        sets,
        reps,
        duration_seconds: timerSeconds * sets,
      })
    );
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
    navigate('/');
  };

  const handleDelete = async () => {
    if (confirm(`Delete "${exercise.name}"?`)) {
      await dispatch(deleteExercise(exercise.id));
    }
  };

  const handleTrackPose = () => {
    navigate('/pose', { state: { exercise: exercise.name, sets, reps } });
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{exercise.name}</h3>
          {!exercise.is_predefined && (
            <button
              onClick={handleDelete}
              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
              aria-label="Delete exercise"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sets</span>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSets(Math.max(1, sets - 1))}
                className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                aria-label="Decrease sets"
              >
                <Minus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
              <span className="w-12 text-center font-semibold text-gray-900 dark:text-white">
                {sets}
              </span>
              <button
                onClick={() => setSets(sets + 1)}
                className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                aria-label="Increase sets"
              >
                <Plus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Reps</span>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setReps(Math.max(1, reps - 1))}
                className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                aria-label="Decrease reps"
              >
                <Minus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
              <span className="w-12 text-center font-semibold text-gray-900 dark:text-white">
                {reps}
              </span>
              <button
                onClick={() => setReps(reps + 1)}
                className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                aria-label="Increase reps"
              >
                <Plus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Timer (sec)
            </span>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setTimerSeconds(Math.max(10, timerSeconds - 10))}
                className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                aria-label="Decrease timer"
              >
                <Minus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
              <span className="w-12 text-center font-semibold text-gray-900 dark:text-white">
                {timerSeconds}
              </span>
              <button
                onClick={() => setTimerSeconds(timerSeconds + 10)}
                className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                aria-label="Increase timer"
              >
                <Plus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleStartTimer(1)}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Play className="w-4 h-4" />
            <span>Start Set</span>
          </button>

          <button
            onClick={handleLogWorkout}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-4 h-4" />
            <span>Log It</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          {exercise.youtube_url && (
            <button
              onClick={() => setShowVideoModal(true)}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Youtube className="w-4 h-4" />
              <span>Tutorial</span>
            </button>
          )}

          <button
            onClick={handleTrackPose}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Camera className="w-4 h-4" />
            <span>Track Pose</span>
          </button>
        </div>
      </div>

      {showVideoModal && exercise.youtube_url && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setShowVideoModal(false)}
        >
          <div
            className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/90 dark:bg-gray-900/90 rounded-lg hover:bg-white dark:hover:bg-gray-900 transition-colors duration-200"
            >
              <span className="text-gray-700 dark:text-gray-300 font-bold">✕</span>
            </button>
            <div className="relative pt-[56.25%]">
              <iframe
                src={exercise.youtube_url}
                title={`${exercise.name} tutorial`}
                className="absolute top-0 left-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
      
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={300}
            gravity={0.2}
          />
        </div>
      )}
    </>
  );
};

export default ExerciseCard;
