import { useQuizStore } from '../stores/quizStore';
import { Trophy, Target, TrendingUp, RotateCcw } from 'lucide-react';

interface QuizResultsProps {
  onNewQuiz: () => void;
  onBackToHome: () => void;
}

export function QuizResults({ onNewQuiz, onBackToHome }: QuizResultsProps) {
  const { currentSession, answers } = useQuizStore();

  if (!currentSession) return null;

  const totalQuestions = currentSession.total_questions;
  const correctAnswers = Array.from(answers.values()).filter(a => a.isCorrect).length;
  const incorrectAnswers = totalQuestions - correctAnswers;
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);

  const getPerformanceMessage = () => {
    if (percentage >= 90) return 'Excelente trabalho!';
    if (percentage >= 70) return 'Muito bem!';
    if (percentage >= 50) return 'Bom desempenho!';
    return 'Continue praticando!';
  };

  const getPerformanceColor = () => {
    if (percentage >= 70) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
          <Trophy className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Prova Concluída!</h2>
        <p className={`text-xl font-semibold ${getPerformanceColor()}`}>
          {getPerformanceMessage()}
        </p>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <div className="text-center mb-8">
          <div className="text-6xl font-bold text-blue-600 mb-2">{percentage}%</div>
          <p className="text-gray-600">Taxa de acerto</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Target className="w-6 h-6 text-gray-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{totalQuestions}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
            <div className="text-sm text-gray-600">Acertos</div>
          </div>

          <div className="text-center p-4 bg-red-50 rounded-lg">
            <RotateCcw className="w-6 h-6 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">{incorrectAnswers}</div>
            <div className="text-sm text-gray-600">Erros</div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Os níveis de retenção foram atualizados automaticamente.
            Perguntas corretas tiveram sua retenção aumentada, enquanto perguntas incorretas
            permaneceram no nível inicial.
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onNewQuiz}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-lg transition-colors"
        >
          Nova Prova
        </button>
        <button
          onClick={onBackToHome}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 rounded-lg transition-colors"
        >
          Voltar ao Início
        </button>
      </div>
    </div>
  );
}
