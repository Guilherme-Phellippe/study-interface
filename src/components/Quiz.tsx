import { useState, useEffect } from 'react';
import { useQuizStore } from '../stores/quizStore';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';

interface QuizProps {
  onComplete: () => void;
}

export function Quiz({ onComplete }: QuizProps) {
  const {
    questions,
    currentQuestionIndex,
    answers,
    wrongQuestions,
    submitAnswer,
    completeQuiz,
  } = useQuizStore();

  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [freeAnswer, setFreeAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(questions[0]);
  const [questionsToShow, setQuestionsToShow] = useState(questions);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex >= questionsToShow.length && wrongQuestions.length > 0) {
      const wrongQs = questions.filter(q => wrongQuestions.includes(q.id));
      setQuestionsToShow([...questions, ...wrongQs]);
    }
  }, [currentIndex, questionsToShow.length, wrongQuestions, questions]);

  useEffect(() => {
    if (currentIndex < questionsToShow.length) {
      setCurrentQuestion(questionsToShow[currentIndex]);
    }
  }, [currentIndex, questionsToShow]);

  const handleSubmit = async () => {
    if (!currentQuestion) return;

    const answer = currentQuestion.questionType === 'multiple' ? selectedAnswer : freeAnswer;
    if (!answer.trim()) return;

    await submitAnswer(currentQuestion.id, answer);
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questionsToShow.length) {
      completeQuiz();
      onComplete();
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer('');
      setFreeAnswer('');
      setShowResult(false);
    }
  };

  if (!currentQuestion) return null;

  const isAnswered = answers.has(currentQuestion.id);
  const result = isAnswered ? answers.get(currentQuestion.id) : null;
  const progress = ((currentIndex + 1) / questionsToShow.length) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Questão {currentIndex + 1} de {questionsToShow.length}
            </span>
            <span className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
              {currentQuestion.subject}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {currentQuestion.question}
          </h3>

          {currentQuestion.questionType === 'multiple' ? (
            <div className="space-y-3">
              {currentQuestion.options?.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === currentQuestion.answer;
                const showCorrect = showResult && isCorrect;
                const showWrong = showResult && isSelected && !isCorrect;

                return (
                  <button
                    key={index}
                    onClick={() => !showResult && setSelectedAnswer(option)}
                    disabled={showResult}
                    className={`w-full text-left px-6 py-4 rounded-lg border-2 transition-all ${
                      showCorrect
                        ? 'border-green-500 bg-green-50'
                        : showWrong
                        ? 'border-red-500 bg-red-50'
                        : isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    } ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option}</span>
                      {showCorrect && <CheckCircle className="w-5 h-5 text-green-500" />}
                      {showWrong && <XCircle className="w-5 h-5 text-red-500" />}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              <textarea
                value={freeAnswer}
                onChange={(e) => setFreeAnswer(e.target.value)}
                disabled={showResult}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                placeholder="Digite sua resposta..."
              />
              {showResult && (
                <div className={`p-4 rounded-lg ${result?.isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {result?.isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className={`font-semibold ${result?.isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                      {result?.isCorrect ? 'Correto!' : 'Incorreto'}
                    </span>
                  </div>
                  {!result?.isCorrect && (
                    <p className="text-sm text-gray-700">
                      <strong>Resposta correta:</strong> {currentQuestion.answer}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          {!showResult ? (
            <button
              onClick={handleSubmit}
              disabled={
                currentQuestion.questionType === 'multiple'
                  ? !selectedAnswer
                  : !freeAnswer.trim()
              }
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirmar
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              {currentIndex + 1 >= questionsToShow.length ? 'Finalizar' : 'Próxima'}
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-gray-600">
                Acertos: {Array.from(answers.values()).filter(a => a.isCorrect).length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-gray-600">
                Erros: {Array.from(answers.values()).filter(a => !a.isCorrect).length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
