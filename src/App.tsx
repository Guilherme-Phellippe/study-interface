import { useEffect, useState } from 'react';
import { useAuthStore } from './stores/authStore';
import { useQuizStore } from './stores/quizStore';
import { Auth } from './components/Auth';
import { Questions } from './components/Questions';
import { QuizConfig } from './components/QuizConfig';
import { Quiz } from './components/Quiz';
import { QuizResults } from './components/QuizResults';
import { Stats } from './components/Stats';
import { BookOpen, BarChart3, LogOut, Play } from 'lucide-react';

type View = 'questions' | 'quiz-config' | 'quiz' | 'quiz-results' | 'stats';

function App() {
  const { user, initialized, initialize, signOut } = useAuthStore();
  const { resetQuiz } = useQuizStore();
  const [currentView, setCurrentView] = useState<View>('questions');

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleStartQuiz = () => {
    setCurrentView('quiz');
  };

  const handleCompleteQuiz = () => {
    setCurrentView('quiz-results');
  };

  const handleNewQuiz = () => {
    resetQuiz();
    setCurrentView('quiz-config');
  };

  const handleBackToHome = () => {
    resetQuiz();
    setCurrentView('questions');
  };

  if (!initialized) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-blue-500 p-2 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">App de Estudo</h1>
            </div>

            <button
              onClick={signOut}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {currentView !== 'quiz' && currentView !== 'quiz-results' && (
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-4">
              <button
                onClick={() => setCurrentView('questions')}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  currentView === 'questions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                <span className="font-medium">Perguntas</span>
              </button>

              <button
                onClick={() => setCurrentView('quiz-config')}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  currentView === 'quiz-config'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Play className="w-5 h-5" />
                <span className="font-medium">Nova Prova</span>
              </button>

              <button
                onClick={() => setCurrentView('stats')}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  currentView === 'stats'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span className="font-medium">Estatísticas</span>
              </button>
            </div>
          </div>
        </nav>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'questions' && <Questions />}
        {currentView === 'quiz-config' && <QuizConfig onStart={handleStartQuiz} />}
        {currentView === 'quiz' && <Quiz onComplete={handleCompleteQuiz} />}
        {currentView === 'quiz-results' && (
          <QuizResults onNewQuiz={handleNewQuiz} onBackToHome={handleBackToHome} />
        )}
        {currentView === 'stats' && <Stats />}
      </main>
    </div>
  );
}

export default App;
