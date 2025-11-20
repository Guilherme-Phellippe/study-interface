import { useState } from 'react';
import { useQuestionStore } from '../stores/questionStore';
import { useQuizStore } from '../stores/quizStore';
import type { QuizConfig } from '../@types/database.types';
import { Play } from 'lucide-react';

interface QuizConfigProps {
  onStart: () => void;
}

export function QuizConfig({ onStart }: QuizConfigProps) {
  const { getSubjects } = useQuestionStore();
  const { startQuiz } = useQuizStore();
  const subjects = getSubjects();

  const [questionCount, setQuestionCount] = useState(10);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<'low' | 'high' | 'mixed'>('mixed');
  const [repeatWrong, setRepeatWrong] = useState(true);
  const [questionType, setQuestionType] = useState<'multiple' | 'free' | 'mixed'>('mixed');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const selectAllSubjects = () => {
    setSelectedSubjects(subjects);
  };

  const clearSubjects = () => {
    setSelectedSubjects([]);
  };

  const handleStart = async () => {
    setError('');

    if (selectedSubjects.length === 0) {
      setError('Selecione pelo menos uma matéria');
      return;
    }

    if (questionCount < 1) {
      setError('Selecione pelo menos 1 pergunta');
      return;
    }

    setLoading(true);
    try {
      const config: QuizConfig = {
        subjects: selectedSubjects,
        difficulty,
        repeatWrong,
        questionType,
      };

      await startQuiz(config, questionCount);
      onStart();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao iniciar prova');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Configurar Prova</h2>
        <p className="text-gray-600">Personalize sua prova de acordo com suas necessidades</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Quantidade de Perguntas
          </label>
          <input
            type="number"
            min="1"
            value={questionCount}
            onChange={(e) => setQuestionCount(parseInt(e.target.value) || 1)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Matérias
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAllSubjects}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Todas
              </button>
              <button
                type="button"
                onClick={clearSubjects}
                className="text-xs text-gray-600 hover:text-gray-700"
              >
                Limpar
              </button>
            </div>
          </div>
          {subjects.length === 0 ? (
            <p className="text-sm text-gray-500 italic">Nenhuma matéria cadastrada ainda</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {subjects.map((subject) => (
                <button
                  key={subject}
                  type="button"
                  onClick={() => toggleSubject(subject)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedSubjects.includes(subject)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Nível de Dificuldade
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'low', label: 'Baixa Retenção' },
              { value: 'high', label: 'Alta Retenção' },
              { value: 'mixed', label: 'Mesclado' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDifficulty(option.value as typeof difficulty)}
                className={`py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                  difficulty === option.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tipo de Questão
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'multiple', label: 'Múltipla Escolha' },
              { value: 'free', label: 'Resposta Livre' },
              { value: 'mixed', label: 'Misturado' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setQuestionType(option.value as typeof questionType)}
                className={`py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                  questionType === option.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={repeatWrong}
              onChange={(e) => setRepeatWrong(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              Repetir perguntas erradas no final da prova
            </span>
          </label>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleStart}
          disabled={loading || subjects.length === 0}
          className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-5 h-5" />
          {loading ? 'Preparando...' : 'Iniciar Prova'}
        </button>
      </div>
    </div>
  );
}
