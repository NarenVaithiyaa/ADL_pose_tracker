/*
  # Exercise Rep Tracker Database Schema

  ## Overview
  Creates the complete database schema for the Exercise Rep Tracker application with support for:
  - Exercise management with predefined and custom exercises
  - Workout session logging with sets and reps tracking
  - User preferences for theme and app settings
  - Daily statistics and progress tracking

  ## New Tables

  ### exercises
  Stores all exercises (predefined and user-created)
  - `id` (uuid, primary key) - Unique exercise identifier
  - `name` (text, not null) - Exercise name
  - `youtube_url` (text, nullable) - YouTube tutorial URL
  - `is_predefined` (boolean, default false) - Whether exercise is predefined or user-created
  - `created_at` (timestamptz) - Timestamp of creation
  - `updated_at` (timestamptz) - Timestamp of last update

  ### workout_logs
  Tracks individual workout sessions
  - `id` (uuid, primary key) - Unique log identifier
  - `exercise_id` (uuid, foreign key) - Reference to exercise
  - `sets` (integer, not null) - Number of sets completed
  - `reps` (integer, not null) - Number of reps per set
  - `duration_seconds` (integer, nullable) - Total workout duration
  - `completed_at` (timestamptz, default now()) - When workout was completed
  - `notes` (text, nullable) - Optional workout notes

  ### user_preferences
  Stores user settings and preferences
  - `id` (uuid, primary key) - Unique preference identifier
  - `theme_mode` (text, default 'light') - Theme preference (light/dark)
  - `last_quote_refresh` (timestamptz, nullable) - Last time motivational quote was refreshed
  - `updated_at` (timestamptz, default now()) - Timestamp of last update

  ## Security
  - Enable Row Level Security (RLS) on all tables
  - Public access policies for read operations (single-user app context)
  - Public access policies for write operations (single-user app context)

  ## Notes
  - All tables use uuid for primary keys with automatic generation
  - Timestamps use timestamptz for timezone awareness
  - Foreign key constraints ensure data integrity
  - Indexes added for common query patterns
*/

CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  youtube_url text,
  is_predefined boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workout_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id uuid REFERENCES exercises(id) ON DELETE CASCADE,
  sets integer NOT NULL DEFAULT 0,
  reps integer NOT NULL DEFAULT 0,
  duration_seconds integer,
  completed_at timestamptz DEFAULT now(),
  notes text
);

CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_mode text DEFAULT 'light',
  last_quote_refresh timestamptz,
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workout_logs_exercise_id ON workout_logs(exercise_id);
CREATE INDEX IF NOT EXISTS idx_workout_logs_completed_at ON workout_logs(completed_at DESC);

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to exercises"
  ON exercises FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to exercises"
  ON exercises FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to exercises"
  ON exercises FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to exercises"
  ON exercises FOR DELETE
  USING (true);

CREATE POLICY "Allow public read access to workout_logs"
  ON workout_logs FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to workout_logs"
  ON workout_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to workout_logs"
  ON workout_logs FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to workout_logs"
  ON workout_logs FOR DELETE
  USING (true);

CREATE POLICY "Allow public read access to user_preferences"
  ON user_preferences FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to user_preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to user_preferences"
  ON user_preferences FOR UPDATE
  USING (true)
  WITH CHECK (true);

INSERT INTO exercises (name, youtube_url, is_predefined) VALUES
  ('Push-ups', 'https://www.youtube.com/embed/IODxDxX7oi4', true),
  ('Squats', 'https://www.youtube.com/embed/aclHkVaku9U', true),
  ('Lunges', 'https://www.youtube.com/embed/QOVaHwm-Q6U', true),
  ('Plank', 'https://www.youtube.com/embed/pSHjTRCQxIw', true),
  ('Burpees', 'https://www.youtube.com/embed/JZQA08SlJnM', true),
  ('Mountain Climbers', 'https://www.youtube.com/embed/nmwgirgXLYM', true)
ON CONFLICT DO NOTHING;

INSERT INTO user_preferences (theme_mode) VALUES ('light')
ON CONFLICT DO NOTHING;