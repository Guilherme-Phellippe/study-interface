export interface Database {
  public: {
    Tables: {
      questions: {
        Row: {
          id: string;
          user_id: string;
          question: string;
          answer: string;
          subject: string;
          retention_level: number;
          created_at: string;
          last_reviewed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          question: string;
          answer: string;
          subject: string;
          retention_level?: number;
          created_at?: string;
          last_reviewed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          question?: string;
          answer?: string;
          subject?: string;
          retention_level?: number;
          created_at?: string;
          last_reviewed_at?: string;
        };
      };
      quiz_sessions: {
        Row: {
          id: string;
          user_id: string;
          total_questions: number;
          correct_answers: number;
          config: QuizConfig;
          started_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          total_questions: number;
          correct_answers?: number;
          config?: QuizConfig;
          started_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          total_questions?: number;
          correct_answers?: number;
          config?: QuizConfig;
          started_at?: string;
          completed_at?: string | null;
        };
      };
      quiz_results: {
        Row: {
          id: string;
          quiz_session_id: string;
          question_id: string;
          user_answer: string;
          is_correct: boolean;
          answered_at: string;
        };
        Insert: {
          id?: string;
          quiz_session_id: string;
          question_id: string;
          user_answer: string;
          is_correct: boolean;
          answered_at?: string;
        };
        Update: {
          id?: string;
          quiz_session_id?: string;
          question_id?: string;
          user_answer?: string;
          is_correct?: boolean;
          answered_at?: string;
        };
      };
    };
  };
}

export interface QuizConfig {
  subjects: string[];
  difficulty: 'low' | 'high' | 'mixed';
  repeatWrong: boolean;
  questionType: 'multiple' | 'free' | 'mixed';
}

export type Question = Database['public']['Tables']['questions']['Row'];
export type QuizSession = Database['public']['Tables']['quiz_sessions']['Row'];
export type QuizResult = Database['public']['Tables']['quiz_results']['Row'];
