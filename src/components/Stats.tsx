import { useEffect } from 'react';
import { useStatsStore } from '../stores/statsStore';
import { BarChart3, TrendingUp, Target, Brain } from 'lucide-react';

export function Stats() {
  const { sessions, fetchStats, getSubjectStats, getOverallStats, loading } = useStatsStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const subjectStats = getSubjectStats();
  const overallStats = getOverallStats();

  const completedSessions = sessions.filter(s => s.completed_at);
  const totalAccuracy = completedSessions.length > 0
    ? Math.round(
        (completedSessions.reduce((sum, s) => sum + s.correct_answers, 0) /
          completedSessions.reduce((sum, s) => sum + s.total_questions, 0)) *
          100
      )
    : 0;

  if (loading && sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Estatísticas</h2>
        <p className="text-gray-600">Acompanhe sua evolução nos estudos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Provas Realizadas</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{completedSessions.length}</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-100 p-2 rounded-lg">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Acertos Totais</span>
          </div>
          <div className="text-3xl font-bold text-green-600">{overallStats.totalCorrect}</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Precisão Geral</span>
          </div>
          <div className="text-3xl font-bold text-yellow-600">{totalAccuracy}%</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Brain className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Retenção Média</span>
          </div>
          <div className="text-3xl font-bold text-purple-600">
            {overallStats.avgRetention.toFixed(1)}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Estatísticas por Matéria</h3>
        {subjectStats.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhuma matéria cadastrada ainda</p>
        ) : (
          <div className="space-y-4">
            {subjectStats.map((stat) => (
              <div key={stat.subject} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">{stat.subject}</h4>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600">
                      {stat.totalQuestions} {stat.totalQuestions === 1 ? 'pergunta' : 'perguntas'}
                    </span>
                    <span className="font-semibold text-blue-600">
                      Retenção média: {stat.avgRetention.toFixed(1)}
                    </span>
                  </div>
                </div>

                {stat.weakestQuestions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Perguntas mais fracas:
                    </p>
                    <div className="space-y-2">
                      {stat.weakestQuestions.slice(0, 3).map((q) => (
                        <div
                          key={q.id}
                          className="text-sm bg-gray-50 p-3 rounded-lg flex items-start justify-between"
                        >
                          <span className="text-gray-700 flex-1">{q.question}</span>
                          <span className="text-xs font-semibold px-2 py-1 bg-red-100 text-red-700 rounded ml-3">
                            Retenção: {q.retention_level}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {overallStats.weakestQuestions.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Top 10 Perguntas com Menor Retenção
          </h3>
          <div className="space-y-3">
            {overallStats.weakestQuestions.map((q, index) => (
              <div
                key={q.id}
                className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-700 rounded mr-2">
                        {q.subject}
                      </span>
                      <p className="text-gray-900 mt-2">{q.question}</p>
                      <p className="text-gray-600 text-sm mt-1">{q.answer}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-2xl font-bold text-red-600">{q.retention_level}</div>
                      <div className="text-xs text-gray-500">retenção</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {completedSessions.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Histórico de Provas</h3>
          <div className="space-y-3">
            {completedSessions.slice(0, 10).map((session) => {
              const percentage = Math.round((session.correct_answers / session.total_questions) * 100);
              const startDate = new Date(session.started_at);
              const completedDate = session.completed_at ? new Date(session.completed_at) : null;
              const duration = completedDate
                ? Math.round((completedDate.getTime() - startDate.getTime()) / 1000 / 60)
                : 0;

              return (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {startDate.toLocaleDateString('pt-BR')} às {startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {duration > 0 && (
                        <span className="text-xs text-gray-500">
                          ({duration} min)
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {session.correct_answers} de {session.total_questions} corretas
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      percentage >= 70 ? 'text-green-600' :
                      percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {percentage}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
