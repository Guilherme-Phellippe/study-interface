import { CheckCircle, XCircle } from "lucide-react";
import { QuizQuestion } from "../../../stores/quizStore";
import { Dispatch, SetStateAction } from "react";

type MultipleQuestionProps = {
    currentQuestion: QuizQuestion;
    selectedAnswer: string;
    showResult: boolean;
    setSelectedAnswer: Dispatch<SetStateAction<string>>

};

export function MultipleQuestion({ currentQuestion, selectedAnswer, showResult, setSelectedAnswer }: MultipleQuestionProps) {
    return (
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
                        className={`w-full text-left px-6 py-4 rounded-lg border-2 transition-all ${showCorrect
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
    );
}