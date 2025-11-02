import { useEffect, useMemo } from 'react';
import { Activity, Flame, Target } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchWorkoutLogs } from '../store/workoutLogsSlice';
import { fetchExercises } from '../store/exercisesSlice';
import QuoteCard from '../components/QuoteCard';
import Timer from '../components/Timer';

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { logs, loading: logsLoading } = useAppSelector((state) => state.workoutLogs);
  const { exercises, loading: exercisesLoading } = useAppSelector((state) => state.exercises);

  useEffect(() => {
    dispatch(fetchWorkoutLogs());
    dispatch(fetchExercises());
  }, [dispatch]);

  // Refresh data when component becomes visible (navigation)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        dispatch(fetchWorkoutLogs());
        dispatch(fetchExercises());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [dispatch]);

  const todayStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayLogs = logs.filter((log) => {
      const logDate = new Date(log.completed_at);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime();
    });

    const totalSets = todayLogs.reduce((sum, log) => sum + log.sets, 0);
    const totalReps = todayLogs.reduce((sum, log) => sum + log.reps * log.sets, 0);
    const uniqueExercises = new Set(todayLogs.map((log) => log.exercise_id)).size;

    return { totalSets, totalReps, uniqueExercises };
  }, [logs]);

  const recentWorkouts = useMemo(() => {
    return logs.slice(0, 5).map((log) => {
      const exercise = exercises.find((ex) => ex.id === log.exercise_id);
      return { ...log, exerciseName: exercise?.name || 'Unknown' };
    });
  }, [logs, exercises]);

  const stats = [
    {
      label: 'Total Sets',
      value: todayStats.totalSets,
      icon: Target,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Total Reps',
      value: todayStats.totalReps,
      icon: Flame,
      color: 'from-orange-500 to-red-500',
    },
    {
      label: 'Exercises',
      value: todayStats.uniqueExercises,
      icon: Activity,
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <div className="space-y-6">
      <QuoteCard />

      {(logsLoading || exercisesLoading) ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-400 mt-3">Loading dashboard...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                      <p className="text-4xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    </div>
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-lg`}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Timer />

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h2>

            {recentWorkouts.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No workouts logged yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  Start tracking your exercises to see them here!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentWorkouts.map((workout) => (
                  <div
                    key={workout.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {workout.exerciseName}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {workout.sets} sets × {workout.reps} reps
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {new Date(workout.completed_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {new Date(workout.completed_at).toLocaleTimeString([], {
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
        </>
      )}
    </div>
  );
};

export default Dashboard;
