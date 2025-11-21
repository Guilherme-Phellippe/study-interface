import { Question } from "../../../@types/database.types";

type QuizHeadProps = {
    currentIndex: number;
    currentQuestion: Question;
    questionsToShow: Question[]
};

export function QuizHead({ currentIndex, currentQuestion, questionsToShow }: QuizHeadProps) {
    const progress = ((currentIndex + 1) / questionsToShow.length) * 100;


    return (
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
    );
}