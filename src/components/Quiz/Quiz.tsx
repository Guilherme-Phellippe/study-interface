import { useState, useEffect } from 'react';
import { useQuizStore } from '../../stores/quizStore';
import { ArrowRight } from 'lucide-react';
import { QuizHead } from './components/QuizHead';
import { MultipleQuestion } from './components/MultipleQuestion';
import { FreeQuestion } from './components/FreeQuestion';
import { QuizFooter } from './components/QuizFooter';

interface QuizProps {
  onComplete: () => void;
}

export function Quiz({ onComplete }: QuizProps) {
  const {
    questions,
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

    let isCorrect = false;
    if (currentQuestion.questionType === "free") {
      isCorrect = confirm(`[RESPOSTA CORRETA É]:\n ${currentQuestion.answer} \n\n Sua resposta está correto?`);
    }else {
      isCorrect = answer === currentQuestion.answer
    }

    await submitAnswer(currentQuestion.id, answer, isCorrect);
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">

        <QuizHead
          currentIndex={currentIndex}
          currentQuestion={currentQuestion}
          questionsToShow={questionsToShow}
        />

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {currentQuestion.question}
          </h3>

          {currentQuestion.questionType === 'multiple' ? (
            <MultipleQuestion
              currentQuestion={currentQuestion}
              selectedAnswer={selectedAnswer}
              setSelectedAnswer={setSelectedAnswer}
              showResult={showResult}
            />
          ) : (
            <FreeQuestion
              currentQuestion={currentQuestion}
              freeAnswer={freeAnswer}
              result={result}
              setFreeAnswer={setFreeAnswer}
              showResult={showResult}
            />
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

      <QuizFooter
        answers={answers}
      />
    </div>
  );
}
