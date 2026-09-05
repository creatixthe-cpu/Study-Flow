import React from 'react';
import { 
  Timer, 
  CheckCircle2, 
  HelpCircle, 
  AlertTriangle,
  Award,
  BookOpen,
  Calendar,
  Star,
  Trash2
} from 'lucide-react';
import { StudySession, Subject, Topic, WeeklyStudyDay } from '../../types';
import { GlassCard } from '../common/GlassCard';
import { StatMetricCard } from '../common/StatMetricCard';

interface AnalyticsScreenProps {
  sessions: StudySession[];
  subjects: Subject[];
  topics: Topic[];
  weeklyData: WeeklyStudyDay[];
  todayMinutes: number;
  dailyGoalMinutes: number;
  onDeleteSession: (sessionId: string) => void;
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({
  sessions,
  subjects,
  topics,
  weeklyData,
  todayMinutes,
  dailyGoalMinutes,
  onDeleteSession,
}) => {
  const totalWeeklyMinutes = weeklyData.reduce((sum, d) => sum + d.minutes, 0);

  // Total questions & accuracy calculation
  const totalQuestionsAttempted = sessions.reduce((sum, s) => sum + (s.questionsAttempted || 0), 0);
  const totalQuestionsCorrect = sessions.reduce((sum, s) => sum + (s.questionsCorrect || 0), 0);
  const overallAccuracy = totalQuestionsAttempted > 0 
    ? Math.round((totalQuestionsCorrect / totalQuestionsAttempted) * 100) 
    : 85;

  // Subject time allocation
  const subjectBreakdown = subjects.map((sub) => {
    const mins = sessions
      .filter(s => s.subject.toLowerCase() === sub.name.toLowerCase())
      .reduce((sum, s) => sum + s.durationMinutes, 0);
    return {
      name: sub.name,
      color: sub.colorHex,
      minutes: mins,
    };
  });

  const totalSubjectMinutes = subjectBreakdown.reduce((sum, s) => sum + s.minutes, 0) || 1;

  // Topic mastery groupings
  const strongestTopics = topics.filter(t => (t.confidenceScore || 70) >= 80);
  const attentionTopics = topics.filter(t => (t.confidenceScore || 70) < 80 || t.studiedMinutes < 60);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Performance Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Real metrics, retention accuracy, and study distribution.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatMetricCard
          title="Today"
          value={`${todayMinutes}m`}
          subtext={`Goal: ${dailyGoalMinutes}m`}
          icon={<Timer size={18} />}
          accentColor="#7C3AED"
          progressFraction={dailyGoalMinutes > 0 ? todayMinutes / dailyGoalMinutes : 0}
        />
        <StatMetricCard
          title="Weekly Time"
          value={`${Math.floor(totalWeeklyMinutes / 60)}h ${totalWeeklyMinutes % 60}m`}
          subtext="Last 7 calendar days"
          icon={<Calendar size={18} />}
          accentColor="#3B82F6"
        />
        <StatMetricCard
          title="Questions"
          value={String(totalQuestionsAttempted)}
          subtext="Attempted in review"
          icon={<HelpCircle size={18} />}
          accentColor="#F59E0B"
        />
        <StatMetricCard
          title="Accuracy"
          value={`${overallAccuracy}%`}
          subtext="Problem solving rate"
          icon={<CheckCircle2 size={18} />}
          accentColor="#10B981"
          progressFraction={overallAccuracy / 100}
        />
      </div>

      {/* Daily Study Distribution Chart */}
      <GlassCard className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white">Daily Study Distribution</h3>
            <p className="text-xs text-slate-400">Focus hours across the past week</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 self-start sm:self-auto">
            {weeklyData.filter(d => d.minutes > 0).length} Active Days
          </span>
        </div>

        <div className="h-48 flex items-end justify-between gap-3 pt-6">
          {weeklyData.map((d, index) => {
            const maxMins = 120;
            const heightPct = Math.min(100, Math.max(10, (d.minutes / maxMins) * 100));
            const isToday = index === weeklyData.length - 1;

            return (
              <div key={d.dateString} className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {d.minutes}m
                </span>
                <div className="w-full bg-white/[0.05] rounded-xl h-32 flex items-end p-1">
                  <div
                    className={`w-full rounded-lg transition-all duration-500 ${
                      isToday
                        ? 'bg-[#7C3AED] shadow-lg shadow-purple-600/40'
                        : d.minutes > 0
                        ? 'bg-white/30 group-hover:bg-purple-500/80'
                        : 'bg-white/5'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                <span className={`text-xs font-semibold ${isToday ? 'text-purple-400 font-bold' : 'text-slate-400'}`}>
                  {d.dayLabel}
                </span>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Two Column Section: Subject Allocation & Topic Mastery */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Breakdown */}
        <GlassCard className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Study Time by Subject</h3>
            <p className="text-xs text-slate-400">Total time investment across courses</p>
          </div>

          {/* Segmented bar */}
          <div className="w-full h-3.5 rounded-full overflow-hidden flex bg-white/10">
            {subjectBreakdown.map((s) => {
              const pct = (s.minutes / totalSubjectMinutes) * 100;
              if (pct === 0) return null;
              return (
                <div
                  key={s.name}
                  style={{ width: `${pct}%`, backgroundColor: s.color }}
                  title={`${s.name}: ${s.minutes}m (${Math.round(pct)}%)`}
                  className="h-full transition-all duration-500"
                />
              );
            })}
          </div>

          {/* Subject Rows */}
          <div className="space-y-2.5 pt-2">
            {subjectBreakdown.map((s) => {
              const pct = Math.round((s.minutes / totalSubjectMinutes) * 100);
              return (
                <div key={s.name} className="flex items-center justify-between py-1 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-2.5">
                    <span 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="text-sm font-medium text-white">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">{s.minutes}m</span>
                    <span className="text-xs font-bold text-white w-10 text-right">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Strongest & Attention Topics */}
        <div className="space-y-4">
          {/* Strongest */}
          <GlassCard className="border-emerald-500/30">
            <div className="flex items-center gap-2 mb-3">
              <Award size={18} className="text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Strongest Topics</h3>
            </div>
            <div className="space-y-2">
              {strongestTopics.slice(0, 3).map((top) => (
                <div key={top.id} className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{top.name}</div>
                    <div className="text-[11px] text-slate-400">{top.subjectName} • {top.studiedMinutes}m studied</div>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                    {top.confidenceScore || 85}%
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Needs Attention */}
          <GlassCard className="border-amber-500/30">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={18} className="text-amber-400" />
              <h3 className="text-sm font-bold text-white">Needs Review & Practice</h3>
            </div>
            <div className="space-y-2">
              {attentionTopics.slice(0, 3).map((top) => (
                <div key={top.id} className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{top.name}</div>
                    <div className="text-[11px] text-slate-400">{top.subjectName} • {top.studiedMinutes}m studied</div>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
                    {top.confidenceScore || 60}%
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Historical Session Logs */}
      <GlassCard className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Recent Study Sessions</h3>
            <p className="text-xs text-slate-400">Chronological history of completed deep work</p>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {sessions.length} sessions logged
          </span>
        </div>

        <div className="space-y-2.5">
          {sessions.length === 0 ? (
            <p className="text-center py-6 text-xs text-slate-400">
              No sessions logged yet. Complete a study timer block to see records here.
            </p>
          ) : (
            sessions.slice(0, 8).map((sess) => {
              const sessionDate = new Date(sess.timestamp).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div 
                  key={sess.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 gap-3 hover:bg-white/[0.07] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                      <BookOpen size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-white">{sess.subject}</h4>
                        <span className="text-slate-500">•</span>
                        <span className="text-xs font-medium text-purple-300">{sess.topic}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>{sessionDate}</span>
                        <span>•</span>
                        <span className="font-semibold text-white">{sess.durationMinutes} mins</span>
                        {sess.notes && (
                          <>
                            <span>•</span>
                            <span className="italic truncate max-w-xs text-slate-400">"{sess.notes}"</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <div className="flex items-center gap-1 text-amber-400">
                      {Array.from({ length: sess.qualityRating }).map((_, i) => (
                        <Star key={i} size={13} className="fill-amber-400" />
                      ))}
                    </div>

                    {sess.questionsAttempted > 0 && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                        {sess.questionsCorrect}/{sess.questionsAttempted} ({Math.round((sess.questionsCorrect / sess.questionsAttempted) * 100)}%)
                      </span>
                    )}

                    <button
                      onClick={() => onDeleteSession(sess.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-white/10 transition-colors"
                      title="Delete Log"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </GlassCard>
    </div>
  );
};
