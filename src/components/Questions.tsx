import { useEffect, useState } from 'react';
import { useQuestionStore } from '../stores/questionStore';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';

export function Questions() {
  const { questions, loading, fetchQuestions, addQuestion, updateQuestion, deleteQuestion } = useQuestionStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    subject: '',
  });

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      await updateQuestion(editingId, formData);
      setEditingId(null);
    } else {
      await addQuestion(formData);
    }

    setFormData({ question: '', answer: '', subject: '' });
    setShowForm(false);
  };

  const handleEdit = (question: typeof questions[0]) => {
    setFormData({
      question: question.question,
      answer: question.answer,
      subject: question.subject,
    });
    setEditingId(question.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({ question: '', answer: '', subject: '' });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Minhas Perguntas</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nova Pergunta
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Editar Pergunta' : 'Nova Pergunta'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Matéria
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Matemática, História..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pergunta
              </label>
              <textarea
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                required
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Digite sua pergunta..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resposta
              </label>
              <textarea
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                required
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Digite a resposta correta..."
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {editingId ? 'Salvar' : 'Adicionar'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && questions.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">Nenhuma pergunta cadastrada ainda.</p>
          <p className="text-gray-400 text-sm mt-1">Clique em "Nova Pergunta" para começar!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {questions.map((question) => (
            <div
              key={question.id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {question.subject}
                    </span>
                    <span className="text-xs text-gray-500">
                      Retenção: {question.retention_level}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{question.question}</h3>
                  <p className="text-gray-600 text-sm">{question.answer}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(question)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteQuestion(question.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
