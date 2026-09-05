import React, { useState } from 'react';
import { 
  Timer, 
  CheckCircle2, 
  Flame, 
  Layers, 
  ArrowRight, 
  Play, 
  Plus, 
  Sparkles,
  Check,
  Edit2,
  Trash2
} from 'lucide-react';
import { Task, UserProfile, ScreenId, WeeklyStudyDay } from '../../types';
import { GlassCard } from '../common/GlassCard';
import { StatMetricCard } from '../common/StatMetricCard';
import { Modal } from '../common/Modal';

interface DashboardScreenProps {
  profile: UserProfile;
  tasks: Task[];
  todayMinutes: number;
  todaySessionsCount: number;
  weeklyData: WeeklyStudyDay[];
  onToggleTask: (taskId: string) => void;
  onStartStudyForTask: (task: Task) => void;
  onNavigate: (screen: ScreenId) => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  profile,
  tasks,
  todayMinutes,
  todaySessionsCount,
  weeklyData,
  onToggleTask,
  onStartStudyForTask,
  onNavigate,
  onAddTask,
  onDeleteTask,
  onEditTask,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Add task form state
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Physics');
  const [newTopic, setNewTopic] = useState('Electromagnetism');
  const [newDeadline, setNewDeadline] = useState('Today, 8:00 PM');
  const [newPriority, setNewPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [newDuration, setNewDuration] = useState(45);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'GOOD MORNING';
    if (hour < 18) return 'GOOD AFTERNOON';
    return 'GOOD EVENING';
  };

  const getTodayDateFormatted = () => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options).toUpperCase();
  };

  const completedTodayTasksCount = tasks.filter(t => t.isCompleted).length;
  const totalTasksCount = tasks.length;
  const progressRatio = profile.dailyGoalMinutes > 0 ? todayMinutes / profile.dailyGoalMinutes : 0;

  // Active uncompleted priority task
  const topPriorityTask = tasks.find(t => !t.isCompleted && t.priority === 'High') || tasks.find(t => !t.isCompleted);

  const getSubjectIcon = (subject: string) => {
    const s = subject.toLowerCase();
    if (s.includes('physic')) return { icon: '⚛️', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.15)' };
    if (s.includes('math') || s.includes('calc')) return { icon: '∫', color: '#A855F7', bg: 'rgba(168, 85, 247, 0.15)' };
    if (s.includes('chem')) return { icon: '🧪', color: '#EAB308', bg: 'rgba(234, 179, 8, 0.15)' };
    if (s.includes('cs') || s.includes('comp') || s.includes('code')) return { icon: '💻', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' };
    return { icon: '📖', color: '#7C3AED', bg: 'rgba(124, 58, 237, 0.15)' };
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTask({
      title: newTitle.trim(),
      subject: newSubject,
      topic: newTopic,
      deadline: newDeadline,
      priority: newPriority,
      estimatedMinutes: Number(newDuration) || 30,
      isCompleted: false,
    });

    setNewTitle('');
    setShowAddModal(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editingTask.title.trim()) return;
    onEditTask(editingTask);
    setEditingTask(null);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-widest text-slate-400">
              {getGreeting()}, {profile.name.split(' ')[0].toUpperCase()}
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs font-semibold text-slate-400">
              {getTodayDateFormatted()}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
            Focus & Execution Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-orange-400">
            <Flame size={18} className="animate-pulse" />
            <span className="text-sm font-bold">{profile.streakDays} Day Streak</span>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-white font-semibold text-sm transition-all shadow-sm"
          >
            <Plus size={16} />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatMetricCard
          title="Study Time"
          value={`${Math.floor(todayMinutes / 60)}h ${todayMinutes % 60}m`}
          subtext={`Goal: ${profile.dailyGoalMinutes}m (${Math.round(progressRatio * 100)}%)`}
          icon={<Timer size={18} />}
          progressFraction={progressRatio}
          accentColor="#7C3AED"
        />
        <StatMetricCard
          title="Sessions"
          value={String(todaySessionsCount).padStart(2, '0')}
          subtext={`${todaySessionsCount > 0 ? `+${todaySessionsCount} sessions today` : 'Ready to start'}`}
          icon={<Layers size={18} />}
          accentColor="#3B82F6"
        />
        <StatMetricCard
          title="Tasks Done"
          value={`${completedTodayTasksCount}/${totalTasksCount}`}
          subtext={`${totalTasksCount - completedTodayTasksCount} remaining`}
          icon={<CheckCircle2 size={18} />}
          progressFraction={totalTasksCount > 0 ? completedTodayTasksCount / totalTasksCount : 0}
          accentColor="#10B981"
        />
        <StatMetricCard
          title="Current Streak"
          value={`${profile.streakDays} days`}
          subtext="Unstoppable momentum"
          icon={<Flame size={18} />}
          accentColor="#F97316"
        />
      </div>

      {/* Current Priority Glow Card */}
      {topPriorityTask && (
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#7C3AED] to-[#6366F1] p-6 text-white shadow-[0_0_50px_-10px_rgba(124,58,237,0.45)] border border-purple-400/30">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-md">
                  Current Priority
                </span>
                <span className="text-xs font-semibold text-purple-200">
                  {topPriorityTask.subject} • {topPriorityTask.topic}
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-tight">{topPriorityTask.title}</h2>
              <p className="text-sm text-purple-100/80 font-medium">
                Est. {topPriorityTask.estimatedMinutes} mins • Due {topPriorityTask.deadline}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onStartStudyForTask(topPriorityTask)}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-purple-900 font-bold hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
              >
                <Play size={18} className="fill-purple-900" />
                <span>Start Study Session</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Two Column Layout: Today's Plan & Weekly Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold tracking-tight text-white">Today's Plan</h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                {tasks.filter(t => !t.isCompleted).length}
              </span>
            </div>
            <button
              onClick={() => onNavigate('planner')}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
            >
              <span>View Planner</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="space-y-2.5">
            {tasks.length === 0 ? (
              <GlassCard className="text-center py-12">
                <p className="text-slate-400 text-sm">No tasks planned yet. Tap 'New Task' to get started!</p>
              </GlassCard>
            ) : (
              tasks.slice(0, 5).map((task) => {
                const { icon, color, bg } = getSubjectIcon(task.subject);
                return (
                  <GlassCard 
                    key={task.id}
                    className={`!p-4 flex items-center justify-between gap-3 ${
                      task.isCompleted ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Subject Icon Box */}
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-base shrink-0 border"
                        style={{
                          backgroundColor: bg,
                          borderColor: `${color}33`,
                        }}
                      >
                        {icon}
                      </div>

                      {/* Title and details */}
                      <div className="min-w-0">
                        <h4 
                          className={`text-sm font-semibold truncate ${
                            task.isCompleted ? 'line-through text-slate-400' : 'text-white'
                          }`}
                        >
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 truncate">
                          <span>{task.subject}</span>
                          <span>•</span>
                          <span>{task.estimatedMinutes}m</span>
                          <span>•</span>
                          <span className={task.priority === 'High' ? 'text-red-400 font-semibold' : ''}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {!task.isCompleted && (
                        <button
                          onClick={() => onStartStudyForTask(task)}
                          className="p-2 rounded-xl text-purple-400 hover:text-purple-300 hover:bg-white/10 transition-colors"
                          title="Start Timer"
                        >
                          <Play size={17} className="fill-purple-400" />
                        </button>
                      )}

                      <button
                        onClick={() => setEditingTask(task)}
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        title="Edit Task"
                      >
                        <Edit2 size={15} />
                      </button>

                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-white/10 transition-colors"
                        title="Delete Task"
                      >
                        <Trash2 size={15} />
                      </button>

                      {/* Custom Circular Checkbox */}
                      <button
                        onClick={() => onToggleTask(task.id)}
                        className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ml-1 ${
                          task.isCompleted
                            ? 'bg-[#7C3AED] border-[#7C3AED] text-white'
                            : 'border-white/30 hover:border-white/60'
                        }`}
                        title={task.isCompleted ? 'Mark uncompleted' : 'Mark completed'}
                      >
                        {task.isCompleted && <Check size={14} className="stroke-[3]" />}
                      </button>
                    </div>
                  </GlassCard>
                );
              })
            )}
          </div>
        </div>

        {/* Weekly Activity Summary (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold tracking-tight text-white">Weekly Focus</h3>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
            >
              <span>Analytics</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <GlassCard className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Last 7 Days</span>
              <span className="font-semibold text-white">
                {weeklyData.reduce((acc, d) => acc + d.minutes, 0)} mins total
              </span>
            </div>

            {/* Vertical Bar chart */}
            <div className="h-44 flex items-end justify-between gap-2 pt-6">
              {weeklyData.map((d, index) => {
                const maxMins = 120;
                const heightPct = Math.min(100, Math.max(12, (d.minutes / maxMins) * 100));
                const isToday = index === weeklyData.length - 1;

                return (
                  <div key={d.dateString} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full flex justify-center">
                      <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        {d.minutes}m
                      </span>
                    </div>
                    <div className="w-full bg-white/[0.06] rounded-xl h-28 flex items-end p-1">
                      <div
                        className={`w-full rounded-lg transition-all duration-500 ${
                          isToday 
                            ? 'bg-gradient-to-t from-purple-600 to-indigo-500 shadow-lg shadow-purple-600/30' 
                            : d.minutes > 0 ? 'bg-white/30 group-hover:bg-purple-500/70' : 'bg-white/5'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className={`text-[11px] font-semibold ${isToday ? 'text-purple-400 font-bold' : 'text-slate-400'}`}>
                      {d.dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-purple-400" />
                Active Days
              </span>
              <span className="font-bold text-white">
                {weeklyData.filter(d => d.minutes > 0).length} of 7 days
              </span>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Add Task Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create Study Task"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Task Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Master Maxwell Equations Problems"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Subject
              </label>
              <select
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#16161E] border border-white/15 text-white text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="Physics">Physics</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Computer Science">Computer Science</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Topic
              </label>
              <input
                type="text"
                placeholder="e.g. Electromagnetism"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Deadline
              </label>
              <input
                type="text"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                placeholder="Today, 8:00 PM"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Estimated Minutes
              </label>
              <input
                type="number"
                min="5"
                max="240"
                value={newDuration}
                onChange={(e) => setNewDuration(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['High', 'Medium', 'Low'] as const).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setNewPriority(p)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    newPriority === p
                      ? 'bg-[#7C3AED] border-purple-500 text-white'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#7C3AED] hover:bg-purple-600 text-white font-bold text-sm shadow-md transition-all"
            >
              Add Task
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Task Modal */}
      {editingTask && (
        <Modal
          isOpen={true}
          onClose={() => setEditingTask(null)}
          title="Edit Task"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Task Title
              </label>
              <input
                type="text"
                required
                value={editingTask.title}
                onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Deadline
                </label>
                <input
                  type="text"
                  value={editingTask.deadline}
                  onChange={(e) => setEditingTask({ ...editingTask, deadline: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Duration (mins)
                </label>
                <input
                  type="number"
                  value={editingTask.estimatedMinutes}
                  onChange={(e) => setEditingTask({ ...editingTask, estimatedMinutes: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#7C3AED] hover:bg-purple-600 text-white font-bold text-sm shadow-md transition-all"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
