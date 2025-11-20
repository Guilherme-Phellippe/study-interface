import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Question } from '../@types/database.types';

interface QuestionState {
  questions: Question[];
  loading: boolean;
  fetchQuestions: () => Promise<void>;
  addQuestion: (question: Omit<Question, 'id' | 'user_id' | 'created_at' | 'last_reviewed_at' | 'retention_level'>) => Promise<void>;
  updateQuestion: (id: string, updates: Partial<Question>) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  getSubjects: () => string[];
}

export const useQuestionStore = create<QuestionState>((set, get) => ({
  questions: [],
  loading: false,

  fetchQuestions: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ questions: data || [] });
    } finally {
      set({ loading: false });
    }
  },

  addQuestion: async (question) => {
    set({ loading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('questions')
        .insert([{ ...question, user_id: user.id }]);

      if (error) throw error;
      await get().fetchQuestions();
    } finally {
      set({ loading: false });
    }
  },

  updateQuestion: async (id, updates) => {
    set({ loading: true });
    try {
      const { error } = await supabase
        .from('questions')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await get().fetchQuestions();
    } finally {
      set({ loading: false });
    }
  },

  deleteQuestion: async (id) => {
    set({ loading: true });
    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await get().fetchQuestions();
    } finally {
      set({ loading: false });
    }
  },

  getSubjects: () => {
    const questions = get().questions;
    return [...new Set(questions.map(q => q.subject))];
  },
}));
