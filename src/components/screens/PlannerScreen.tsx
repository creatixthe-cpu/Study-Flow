import React, { useState } from 'react';
import { 
  Plus, 
  Play, 
  Check, 
  Edit2, 
  Trash2, 
  Clock, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Task, Priority } from '../../types';
import { GlassCard } from '../common/GlassCard';
import { Modal } from '../common/Modal';

interface PlannerScreenProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  onStartStudyForTask: (task: Task) => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export const PlannerScreen: React.FC<PlannerScreenProps> = ({
  tasks,
  onToggleTask,
  onStartStudyForTask,
  onAddTask,
  onEditTask,
  onDeleteTask,
}) => {
  const [selectedTab, setSelectedTab] = useState<'today' | 'upcoming' | 'completed'>('today');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Physics');
  const [topic, setTopic] = useState('General');
  const [deadline, setDeadline] = useState('Today, 8:00 PM');
  const [priority, setPriority] = useState<Priority>('High');
  const [duration, setDuration] = useState(45);

  const todayTasks = tasks.filter(t => !t.isCompleted && (t.deadline.toLowerCase().includes('today') || !t.deadline.toLowerCase().includes('tomorrow')));
  const upcomingTasks = tasks.filter(t => !t.isCompleted && (t.deadline.toLowerCase().includes('tomorrow') || t.deadline.toLowerCase().includes('next') || t.deadline.toLowerCase().includes('in ')));
  const completedTasks = tasks.filter(t => t.isCompleted);

  const displayedTasks = selectedTab === 'today' 
    ? todayTasks 
    : selectedTab === 'upcoming' 
    ? upcomingTasks 
    : completedTasks;

  const getSubjectSymbol = (subj: string) => {
    const s = subj.toLowerCase();
    if (s.includes('physic')) return { icon: '⚛️', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.15)' };
    if (s.includes('math') || s.includes('calc')) return { icon: '∫', color: '#A855F7', bg: 'rgba(168, 85, 247, 0.15)' };
    if (s.includes('chem')) return { icon: '🧪', color: '#EAB308', bg: 'rgba(234, 179, 8, 0.15)' };
    if (s.includes('cs') || s.includes('comp') || s.includes('code')) return { icon: '💻', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' };
    return { icon: '📖', color: '#7C3AED', bg: 'rgba(124, 58, 237, 0.15)' };
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      subject,
      topic: topic.trim() || 'General',
      deadline,
      priority,
      estimatedMinutes: Number(duration) || 30,
      isCompleted: false,
    });

    setTitle('');
    setShowAddModal(false);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editingTask.title.trim()) return;
    onEditTask(editingTask);
    setEditingTask(null);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Study Planner
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Stay ahead of your coursework deadlines and exam milestones.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#7C3AED] hover:bg-purple-600 text-white font-bold text-sm shadow-md transition-all self-start sm:self-auto"
        >
          <Plus size={18} />
          <span>New Task</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center p-1 rounded-2xl bg-white/5 border border-white/10 max-w-md">
        <button
          onClick={() => setSelectedTab('today')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            selectedTab === 'today'
              ? 'bg-[#7C3AED] text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Today</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${selectedTab === 'today' ? 'bg-white/20' : 'bg-white/10'}`}>
            {todayTasks.length}
          </span>
        </button>

        <button
          onClick={() => setSelectedTab('upcoming')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            selectedTab === 'upcoming'
              ? 'bg-[#7C3AED] text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Upcoming</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${selectedTab === 'upcoming' ? 'bg-white/20' : 'bg-white/10'}`}>
            {upcomingTasks.length}
          </span>
        </button>

        <button
          onClick={() => setSelectedTab('completed')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            selectedTab === 'completed'
              ? 'bg-[#7C3AED] text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Completed</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${selectedTab === 'completed' ? 'bg-white/20' : 'bg-white/10'}`}>
            {completedTasks.length}
          </span>
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {displayedTasks.length === 0 ? (
          <GlassCard className="text-center py-16">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Calendar size={22} />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              {selectedTab === 'today' 
                ? 'No tasks due today' 
                : selectedTab === 'upcoming' 
                ? 'No upcoming tasks' 
                : 'No completed tasks yet'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
              Plan out your study blocks and master topics one session at a time.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all"
            >
              Add First Task
            </button>
          </GlassCard>
        ) : (
          displayedTasks.map((task) => {
            const { icon, color, bg } = getSubjectSymbol(task.subject);
            return (
              <GlassCard
                key={task.id}
                className={`!p-4 transition-all duration-200 ${
                  task.isCompleted ? 'opacity-50' : 'hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Subject Symbol Badge */}
                    <div 
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg shrink-0 border"
                      style={{
                        backgroundColor: bg,
                        borderColor: `${color}40`,
                      }}
                    >
                      {icon}
                    </div>

                    {/* Task Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-semibold text-purple-300">
                          {task.subject} • {task.topic}
                        </span>
                        <span 
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                            task.priority === 'High'
                              ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                              : task.priority === 'Medium'
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      <h3 
                        className={`text-sm sm:text-base font-semibold truncate ${
                          task.isCompleted ? 'line-through text-slate-400' : 'text-white'
                        }`}
                      >
                        {task.title}
                      </h3>

                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {task.estimatedMinutes} min
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          Due {task.deadline}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Checkbox */}
                  <div className="flex items-center gap-2 shrink-0">
                    {!task.isCompleted && (
                      <button
                        onClick={() => onStartStudyForTask(task)}
                        className="p-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 transition-colors"
                        title="Start Study Timer"
                      >
                        <Play size={16} className="fill-purple-300" />
                      </button>
                    )}

                    <button
                      onClick={() => setEditingTask(task)}
                      className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={15} />
                    </button>

                    <button
                      onClick={() => setTaskToDelete(task)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>

                    {/* Circular Checkbox */}
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ml-1 ${
                        task.isCompleted
                          ? 'bg-[#7C3AED] border-[#7C3AED] text-white'
                          : 'border-white/30 hover:border-white/60'
                      }`}
                      title={task.isCompleted ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {task.isCompleted && <Check size={16} className="stroke-[3]" />}
                    </button>
                  </div>
                </div>
              </GlassCard>
            );
          })
        )}
      </div>

      {/* Add Task Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Study Task"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Task Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Master Kirchhoff Loop Equations"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
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
                placeholder="e.g. Circuit Analysis"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500"
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
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
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
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
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
                  onClick={() => setPriority(p)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    priority === p
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
          <form onSubmit={handleUpdate} className="space-y-4">
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
                  Subject
                </label>
                <input
                  type="text"
                  value={editingTask.subject}
                  onChange={(e) => setEditingTask({ ...editingTask, subject: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Topic
                </label>
                <input
                  type="text"
                  value={editingTask.topic}
                  onChange={(e) => setEditingTask({ ...editingTask, topic: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-sm focus:outline-none focus:border-purple-500"
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
                  value={editingTask.deadline}
                  onChange={(e) => setEditingTask({ ...editingTask, deadline: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Estimated Minutes
                </label>
                <input
                  type="number"
                  value={editingTask.estimatedMinutes}
                  onChange={(e) => setEditingTask({ ...editingTask, estimatedMinutes: Number(e.target.value) })}
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
                    onClick={() => setEditingTask({ ...editingTask, priority: p })}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      editingTask.priority === p
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

      {/* Delete Confirmation Modal */}
      {taskToDelete && (
        <Modal
          isOpen={true}
          onClose={() => setTaskToDelete(null)}
          title="Delete Task"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-sm">
                Permanently delete "{taskToDelete.title}"? This cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setTaskToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteTask(taskToDelete.id);
                  setTaskToDelete(null);
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
