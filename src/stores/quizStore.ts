import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Question, QuizSession, QuizConfig } from '../@types/database.types';

interface QuizQuestion extends Question {
  options?: string[];
  questionType: 'multiple' | 'free';
}

interface QuizState {
  currentSession: QuizSession | null;
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  answers: Map<string, { answer: string; isCorrect: boolean }>;
  wrongQuestions: string[];
  loading: boolean;
  startQuiz: (config: QuizConfig, questionCount: number) => Promise<void>;
  submitAnswer: (questionId: string, answer: string) => Promise<void>;
  completeQuiz: () => Promise<void>;
  resetQuiz: () => void;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  currentSession: null,
  questions: [],
  currentQuestionIndex: 0,
  answers: new Map(),
  wrongQuestions: [],
  loading: false,

  startQuiz: async (config: QuizConfig, questionCount: number) => {
    set({ loading: true });
    try {

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase.from('questions').select('*');

      if (config.subjects.length > 0) {
        query = query.in('subject', config.subjects);
      }

      if (config.difficulty === 'low') {
        query = query.lte('retention_level', 2);
      } else if (config.difficulty === 'high') {
        query = query.gte('retention_level', 3);
      }

      const { data: allQuestions, error } = await query;
      if (error) throw error;
      if (!allQuestions || allQuestions.length === 0) {
        throw new Error('Nenhuma pergunta encontrada com os critérios selecionados');
      }

      const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
      const selectedQuestions = shuffled.slice(0, Math.min(questionCount, shuffled.length));

      const quizQuestions: QuizQuestion[] = selectedQuestions.map(q => {
        const questionType = config.questionType === 'mixed'
          ? Math.random() > 0.5 ? 'multiple' : 'free'
          : config.questionType;

        let options: string[] | undefined;
        if (questionType === 'multiple') {

          const wrongAnswers = allQuestions
            .filter(other => other.id !== q.id && other.subject === q.subject)
            .map(other => other.answer)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

          options = [q.answer, ...wrongAnswers].sort(() => Math.random() - 0.5);

        }

        return { ...q, options, questionType };
      });

      const { data: session, error: sessionError } = await supabase
        .from('quiz_sessions')
        .insert([{
          user_id: user.id,
          total_questions: quizQuestions.length,
          config: config as any,
        }])
        .select()
        .single();

      if (sessionError) throw sessionError;

      set({
        currentSession: session,
        questions: quizQuestions,
        currentQuestionIndex: 0,
        answers: new Map(),
        wrongQuestions: [],
      });
    } finally {
      set({ loading: false });
    }
  },

  submitAnswer: async (questionId: string, answer: string) => {
    const { currentSession, questions, answers, wrongQuestions } = get();
    if (!currentSession) return;

    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    const isCorrect = answer.toLowerCase().trim() === question.answer.toLowerCase().trim();

    const newAnswers = new Map(answers);
    newAnswers.set(questionId, { answer, isCorrect });

    const newWrongQuestions = isCorrect
      ? wrongQuestions
      : [...wrongQuestions, questionId];

    set({ answers: newAnswers, wrongQuestions: newWrongQuestions });

    await supabase.from('quiz_results').insert([{
      quiz_session_id: currentSession.id,
      question_id: questionId,
      user_answer: answer,
      is_correct: isCorrect,
    }]);

    const newRetention = isCorrect ? question.retention_level + 1 : 0;
    await supabase
      .from('questions')
      .update({
        retention_level: newRetention,
        last_reviewed_at: new Date().toISOString(),
      })
      .eq('id', questionId);
  },

  completeQuiz: async () => {
    const { currentSession, answers } = get();
    if (!currentSession) return;

    const correctCount = Array.from(answers.values()).filter(a => a.isCorrect).length;

    await supabase
      .from('quiz_sessions')
      .update({
        correct_answers: correctCount,
        completed_at: new Date().toISOString(),
      })
      .eq('id', currentSession.id);
  },

  resetQuiz: () => {
    set({
      currentSession: null,
      questions: [],
      currentQuestionIndex: 0,
      answers: new Map(),
      wrongQuestions: [],
    });
  },
}));
