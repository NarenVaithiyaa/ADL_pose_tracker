import { useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trophy, Calendar, TrendingUp } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchWorkoutLogs } from '../store/workoutLogsSlice';
import { fetchExercises } from '../store/exercisesSlice';

const Progress = () => {
  const dispatch = useAppDispatch();
  const { logs } = useAppSelector((state) => state.workoutLogs);
  const exercises = useAppSelector((state) => state.exercises.exercises);
  const isDark = useAppSelector((state) => state.theme.mode === 'dark');

  useEffect(() => {
    dispatch(fetchWorkoutLogs());
    dispatch(fetchExercises());
  }, [dispatch]);

  const weeklyData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const data = days.map((day, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      const dayLogs = logs.filter((log) => {
        const logDate = new Date(log.completed_at);
        return logDate >= date && logDate < nextDate;
      });

      const sets = dayLogs.reduce((sum, log) => sum + log.sets, 0);
      const reps = dayLogs.reduce((sum, log) => sum + log.reps * log.sets, 0);

      return { day, sets, reps };
    });

    return data;
  }, [logs]);

  const badges = useMemo(() => {
    const totalWorkouts = logs.length;
    const totalReps = logs.reduce((sum, log) => sum + log.reps * log.sets, 0);
    const uniqueExercises = new Set(logs.map((log) => log.exercise_id)).size;

    const earned = [];

    if (totalWorkouts >= 1) earned.push({ name: 'First Workout', icon: '🎯', color: 'from-blue-500 to-cyan-500' });
    if (totalWorkouts >= 10) earned.push({ name: '10 Workouts', icon: '💪', color: 'from-green-500 to-emerald-500' });
    if (totalWorkouts >= 50) earned.push({ name: '50 Workouts', icon: '🔥', color: 'from-orange-500 to-red-500' });
    if (totalReps >= 100) earned.push({ name: '100 Reps', icon: '⭐', color: 'from-yellow-500 to-orange-500' });
    if (totalReps >= 500) earned.push({ name: '500 Reps', icon: '🌟', color: 'from-purple-500 to-pink-500' });
    if (uniqueExercises >= 5) earned.push({ name: 'Exercise Master', icon: '🏆', color: 'from-indigo-500 to-purple-500' });

    return earned;
  }, [logs]);

  const recentLogs = useMemo(() => {
    return logs.slice(0, 10).map((log) => {
      const exercise = exercises.find((ex) => ex.id === log.exercise_id);
      return { ...log, exerciseName: exercise?.name || 'Unknown' };
    });
  }, [logs, exercises]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Workout Progress</h1>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="flex items-center space-x-2 mb-6">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Weekly Overview</h2>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">No workout data yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="day" stroke={isDark ? '#9ca3af' : '#6b7280'} />
              <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1f2937' : '#ffffff',
                  border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '0.75rem',
                  color: isDark ? '#ffffff' : '#000000',
                }}
              />
              <Bar dataKey="sets" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              <Bar dataKey="reps" fill="#06b6d4" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {badges.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="flex items-center space-x-2 mb-6">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Achievements</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.name}
                className={`bg-gradient-to-br ${badge.color} rounded-xl p-4 text-center transform hover:scale-105 transition-all duration-200 shadow-lg`}
              >
                <div className="text-4xl mb-2">{badge.icon}</div>
                <p className="text-xs font-medium text-white">{badge.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="flex items-center space-x-2 mb-6">
          <Calendar className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Workout History</h2>
        </div>

        {recentLogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No workout logs yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{log.exerciseName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {log.sets} sets × {log.reps} reps
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {new Date(log.completed_at).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {new Date(log.completed_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Progress;
