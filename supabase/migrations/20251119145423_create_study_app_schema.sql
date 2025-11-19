/*
  # Study App Database Schema

  ## Overview
  This migration creates the complete database structure for a study application that allows users to create questions, take customized quizzes, and track their learning progress.

  ## 1. New Tables
  
  ### `questions`
  Stores all user-created questions with their answers and metadata
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - Links to auth.users
  - `question` (text) - The question text
  - `answer` (text) - The correct answer
  - `subject` (text) - Subject/topic category
  - `retention_level` (integer) - Current retention score (0+)
  - `created_at` (timestamptz) - Creation timestamp
  - `last_reviewed_at` (timestamptz) - Last review timestamp
  - Indexes on user_id and subject for efficient queries

  ### `quiz_sessions`
  Tracks each quiz attempt with configuration
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - Links to auth.users
  - `total_questions` (integer) - Number of questions in quiz
  - `correct_answers` (integer) - Number correct
  - `config` (jsonb) - Quiz configuration (subjects, difficulty, type)
  - `started_at` (timestamptz) - Start time
  - `completed_at` (timestamptz) - Completion time
  - Index on user_id for efficient user queries

  ### `quiz_results`
  Stores individual question results within each quiz
  - `id` (uuid, primary key) - Unique identifier
  - `quiz_session_id` (uuid, foreign key) - Links to quiz_sessions
  - `question_id` (uuid, foreign key) - Links to questions
  - `user_answer` (text) - User's submitted answer
  - `is_correct` (boolean) - Whether answer was correct
  - `answered_at` (timestamptz) - Answer timestamp
  - Indexes on quiz_session_id and question_id

  ## 2. Security
  
  ### Row Level Security (RLS)
  All tables have RLS enabled with policies ensuring:
  - Users can only access their own data
  - Authenticated users required for all operations
  - No public access to any data
  
  ### Policies per table
  
  #### questions table
  - SELECT: Users can view only their questions
  - INSERT: Users can create questions for themselves
  - UPDATE: Users can update only their questions
  - DELETE: Users can delete only their questions
  
  #### quiz_sessions table
  - SELECT: Users can view only their quiz sessions
  - INSERT: Users can create quiz sessions for themselves
  - UPDATE: Users can update only their quiz sessions
  - DELETE: Users can delete only their quiz sessions
  
  #### quiz_results table
  - SELECT: Users can view results from their quiz sessions
  - INSERT: Users can create results for their quiz sessions
  - UPDATE: Users can update results from their quiz sessions
  - DELETE: Users can delete results from their quiz sessions

  ## 3. Important Notes
  - Retention levels cannot be negative (CHECK constraint)
  - All timestamps use timestamptz for timezone awareness
  - JSONB used for flexible quiz configuration storage
  - Foreign key constraints ensure referential integrity
  - Cascade deletes ensure cleanup of related data
*/

CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question text NOT NULL,
  answer text NOT NULL,
  subject text NOT NULL,
  retention_level integer DEFAULT 0 CHECK (retention_level >= 0) NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  last_reviewed_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_questions_user_id ON questions(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject);
CREATE INDEX IF NOT EXISTS idx_questions_retention ON questions(retention_level);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own questions"
  ON questions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own questions"
  ON questions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own questions"
  ON questions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own questions"
  ON questions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS quiz_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  total_questions integer NOT NULL,
  correct_answers integer DEFAULT 0 NOT NULL,
  config jsonb DEFAULT '{}'::jsonb NOT NULL,
  started_at timestamptz DEFAULT now() NOT NULL,
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id ON quiz_sessions(user_id);

ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quiz sessions"
  ON quiz_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own quiz sessions"
  ON quiz_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quiz sessions"
  ON quiz_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own quiz sessions"
  ON quiz_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS quiz_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_session_id uuid REFERENCES quiz_sessions(id) ON DELETE CASCADE NOT NULL,
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  user_answer text NOT NULL,
  is_correct boolean NOT NULL,
  answered_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_quiz_results_session ON quiz_results(quiz_session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_question ON quiz_results(question_id);

ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quiz results"
  ON quiz_results FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quiz_sessions
      WHERE quiz_sessions.id = quiz_results.quiz_session_id
      AND quiz_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own quiz results"
  ON quiz_results FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quiz_sessions
      WHERE quiz_sessions.id = quiz_results.quiz_session_id
      AND quiz_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own quiz results"
  ON quiz_results FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quiz_sessions
      WHERE quiz_sessions.id = quiz_results.quiz_session_id
      AND quiz_sessions.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quiz_sessions
      WHERE quiz_sessions.id = quiz_results.quiz_session_id
      AND quiz_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own quiz results"
  ON quiz_results FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quiz_sessions
      WHERE quiz_sessions.id = quiz_sessions.id
      AND quiz_sessions.user_id = auth.uid()
    )
  );