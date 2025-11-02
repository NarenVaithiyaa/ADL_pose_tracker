import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchExercises, addExercise } from '../store/exercisesSlice';
import ExerciseCard from '../components/ExerciseCard';

const Exercises = () => {
  const dispatch = useAppDispatch();
  const { exercises, loading } = useAppSelector((state) => state.exercises);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseUrl, setNewExerciseUrl] = useState('');

  useEffect(() => {
    dispatch(fetchExercises());
  }, [dispatch]);

  const handleAddExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newExerciseName.trim()) {
      await dispatch(
        addExercise({
          name: newExerciseName.trim(),
          youtube_url: newExerciseUrl.trim() || undefined,
        })
      );
      setNewExerciseName('');
      setNewExerciseUrl('');
      setShowAddModal(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Exercises</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          <span>Add Exercise</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-400 mt-3">Loading exercises...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.map((exercise) => (
            <ExerciseCard key={exercise.id} exercise={exercise} />
          ))}
        </div>
      )}

      {!loading && exercises.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">No exercises available</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Add your first exercise to get started!
          </p>
        </div>
      )}

      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Add New Exercise
            </h2>

            <form onSubmit={handleAddExercise} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Exercise Name
                </label>
                <input
                  type="text"
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value)}
                  placeholder="e.g., Pull-ups"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  YouTube URL (optional)
                </label>
                <input
                  type="url"
                  value={newExerciseUrl}
                  onChange={(e) => setNewExerciseUrl(e.target.value)}
                  placeholder="https://youtu.be/G2hv_NYhM-A?si=vhCvmw_wwZwUzyrd"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                />
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Use the embed URL format
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors duration-200 shadow-lg"
                >
                  Add Exercise
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exercises;
