import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Question, QuizSession } from '../@types/database.types';

interface SubjectStats {
  subject: string;
  avgRetention: number;
  totalQuestions: number;
  weakestQuestions: Question[];
}

interface StatsState {
  sessions: QuizSession[];
  questions: Question[];
  loading: boolean;
  fetchStats: () => Promise<void>;
  getSubjectStats: () => SubjectStats[];
  getOverallStats: () => {
    totalCorrect: number;
    totalIncorrect: number;
    avgRetention: number;
    weakestQuestions: Question[];
  };
}

export const useStatsStore = create<StatsState>((set, get) => ({
  sessions: [],
  questions: [],
  loading: false,

  fetchStats: async () => {
    set({ loading: true });
    try {
      const [sessionsResult, questionsResult] = await Promise.all([
        supabase
          .from('quiz_sessions')
          .select('*')
          .order('started_at', { ascending: false }),
        supabase
          .from('questions')
          .select('*')
          .order('retention_level', { ascending: true }),
      ]);

      if (sessionsResult.error) throw sessionsResult.error;
      if (questionsResult.error) throw questionsResult.error;

      set({
        sessions: sessionsResult.data || [],
        questions: questionsResult.data || [],
      });
    } finally {
      set({ loading: false });
    }
  },

  getSubjectStats: () => {
    const { questions } = get();
    const subjectMap = new Map<string, Question[]>();

    questions.forEach(q => {
      if (!subjectMap.has(q.subject)) {
        subjectMap.set(q.subject, []);
      }
      subjectMap.get(q.subject)!.push(q);
    });

    return Array.from(subjectMap.entries()).map(([subject, qs]) => {
      const avgRetention = qs.reduce((sum, q) => sum + q.retention_level, 0) / qs.length;
      const weakestQuestions = [...qs]
        .sort((a, b) => a.retention_level - b.retention_level)
        .slice(0, 5);

      return {
        subject,
        avgRetention,
        totalQuestions: qs.length,
        weakestQuestions,
      };
    });
  },

  getOverallStats: () => {
    const { sessions, questions } = get();

    const totalCorrect = sessions.reduce((sum, s) => sum + s.correct_answers, 0);
    const totalIncorrect = sessions.reduce((sum, s) => sum + (s.total_questions - s.correct_answers), 0);
    const avgRetention = questions.length > 0
      ? questions.reduce((sum, q) => sum + q.retention_level, 0) / questions.length
      : 0;
    const weakestQuestions = [...questions]
      .sort((a, b) => a.retention_level - b.retention_level)
      .slice(0, 10);

    return {
      totalCorrect,
      totalIncorrect,
      avgRetention,
      weakestQuestions,
    };
  },
}));
