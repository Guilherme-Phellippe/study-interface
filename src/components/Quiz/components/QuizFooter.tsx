import { CheckCircle, XCircle } from "lucide-react";

type QuizFooterProps = {
    answers: Map<string, {
        answer: string;
        isCorrect: boolean;
    }>
};

export function QuizFooter({ answers }: QuizFooterProps) {
    return (
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
    );
}