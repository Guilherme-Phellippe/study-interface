import { CheckCircle, XCircle } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { Question } from "../../../@types/database.types";

type FreeQuestionProps = {
    freeAnswer: string;
    setFreeAnswer: Dispatch<SetStateAction<string>>;
    showResult: boolean;
    currentQuestion: Question
    result: {
        answer: string;
        isCorrect: boolean;
    } | null | undefined;
};

export function FreeQuestion({ freeAnswer, setFreeAnswer, showResult, result, currentQuestion }: FreeQuestionProps) {
    return (
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
    );
}