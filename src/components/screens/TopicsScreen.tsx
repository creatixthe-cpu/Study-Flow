import React, { useState } from 'react';
import { 
  Plus, 
  Play, 
  Sparkles, 
  Trash2, 
  Lightbulb,
  AlertOctagon,
  Target
} from 'lucide-react';
import { Subject, Topic } from '../../types';
import { GlassCard } from '../common/GlassCard';
import { Modal } from '../common/Modal';
import { aiService, AiTopicBreakdown } from '../../services/ai';

interface TopicsScreenProps {
  subjects: Subject[];
  topics: Topic[];
  onStartStudyForTopic: (subject: string, topic: string) => void;
  onAddSubject: (name: string, colorHex: string) => void;
  onDeleteSubject: (subjectId: string) => void;
  onAddTopic: (topic: Omit<Topic, 'id' | 'studiedMinutes'>) => void;
  onDeleteTopic: (topicId: string) => void;
}

export const TopicsScreen: React.FC<TopicsScreenProps> = ({
  subjects,
  topics,
  onStartStudyForTopic,
  onAddSubject,
  onDeleteSubject,
  onAddTopic,
  onDeleteTopic,
}) => {
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [showAddTopicModal, setShowAddTopicModal] = useState(false);
  const [selectedSubjectForTopic, setSelectedSubjectForTopic] = useState(subjects[0]?.name || 'Physics');

  // AI Breakdown state
  const [aiBreakdown, setAiBreakdown] = useState<AiTopicBreakdown | null>(null);
  const [analyzingTopic, setAnalyzingTopic] = useState<Topic | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // New Subject Form
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectColor, setNewSubjectColor] = useState('#3B82F6');

  // New Topic Form
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicTargetMinutes, setNewTopicTargetMinutes] = useState(120);

  const colors = [
    '#3B82F6', // Blue
    '#A855F7', // Purple
    '#10B981', // Emerald
    '#EAB308', // Amber
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#F97316', // Orange
  ];

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    onAddSubject(newSubjectName.trim(), newSubjectColor);
    setNewSubjectName('');
    setShowAddSubjectModal(false);
  };

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;
    onAddTopic({
      name: newTopicName.trim(),
      subjectName: selectedSubjectForTopic,
      targetMinutes: Number(newTopicTargetMinutes) || 120,
      confidenceScore: 70,
    });
    setNewTopicName('');
    setShowAddTopicModal(false);
  };

  const handleOpenAiBreakdown = async (topic: Topic) => {
    setAnalyzingTopic(topic);
    setIsLoadingAi(true);
    try {
      const breakdown = await aiService.getTopicBreakdown(topic.name, topic.subjectName);
      setAiBreakdown(breakdown);
    } catch {
      // Fallback
      setAiBreakdown({
        summary: `Core principles in ${topic.name}. Focus on deriving formulas from fundamentals.`,
        keyFormulasOrConcepts: ['Fundamental definitions', 'Conservation laws', 'Equilibrium conditions'],
        commonExamPitfalls: ['Rushing unit conversions', 'Missing sign conventions'],
        highYieldRecommendation: 'Practice 3 standard exam-style problems with step-by-step reasoning.',
      });
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Curriculum & Topics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Track syllabus coverage, time investment, and high-yield concept breakdowns.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setShowAddSubjectModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs sm:text-sm transition-all"
          >
            <Plus size={16} />
            <span>Add Course</span>
          </button>
          <button
            onClick={() => {
              setSelectedSubjectForTopic(subjects[0]?.name || 'Physics');
              setShowAddTopicModal(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#7C3AED] hover:bg-purple-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all"
          >
            <Plus size={16} />
            <span>Add Topic</span>
          </button>
        </div>
      </div>

      {/* Subject Cards & Topic Lists */}
      <div className="space-y-6">
        {subjects.map((subject) => {
          const subjectTopics = topics.filter(
            t => t.subjectName.toLowerCase() === subject.name.toLowerCase()
          );

          const totalStudied = subjectTopics.reduce((sum, t) => sum + t.studiedMinutes, 0);
          const totalTarget = subjectTopics.reduce((sum, t) => sum + t.targetMinutes, 0);

          return (
            <GlassCard key={subject.id} className="space-y-4">
              {/* Subject Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <span 
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: subject.colorHex }}
                  />
                  <div>
                    <h3 className="text-lg font-bold text-white">{subject.name}</h3>
                    <p className="text-xs text-slate-400">
                      {subjectTopics.length} Topics • {totalStudied}m of {totalTarget}m target ({totalTarget > 0 ? Math.round((totalStudied / totalTarget) * 100) : 0}%)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedSubjectForTopic(subject.name);
                      setShowAddTopicModal(true);
                    }}
                    className="p-2 rounded-xl text-purple-400 hover:text-purple-300 hover:bg-white/5 transition-colors"
                    title="Add Topic to this Subject"
                  >
                    <Plus size={16} />
                  </button>

                  {subjects.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`Delete subject "${subject.name}"?`)) {
                          onDeleteSubject(subject.id);
                        }
                      }}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-white/5 transition-colors"
                      title="Delete Subject"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Topics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {subjectTopics.length === 0 ? (
                  <div className="col-span-2 py-6 text-center text-xs text-slate-500">
                    No topics added to {subject.name} yet. Tap '+' to create one.
                  </div>
                ) : (
                  subjectTopics.map((top) => {
                    const progressPct = Math.min(100, Math.round((top.studiedMinutes / (top.targetMinutes || 1)) * 100));

                    return (
                      <div
                        key={top.id}
                        className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between gap-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-bold text-white">{top.name}</h4>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                              <span>{top.studiedMinutes}m / {top.targetMinutes}m</span>
                              <span>•</span>
                              <span className="text-emerald-400 font-semibold">{top.confidenceScore || 75}% confidence</span>
                            </div>
                          </div>

                          <button
                            onClick={() => onDeleteTopic(top.id)}
                            className="p-1 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                            title="Delete Topic"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${progressPct}%`,
                              backgroundColor: subject.colorHex,
                            }}
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-1 border-t border-white/5">
                          <button
                            onClick={() => handleOpenAiBreakdown(top)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-purple-300 hover:text-purple-200 transition-colors"
                          >
                            <Sparkles size={13} className="text-purple-400" />
                            <span>AI Study Breakdown</span>
                          </button>

                          <button
                            onClick={() => onStartStudyForTopic(top.subjectName, top.name)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-all"
                          >
                            <Play size={12} className="fill-white" />
                            <span>Study</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* AI Study Breakdown Modal */}
      {(analyzingTopic || isLoadingAi) && (
        <Modal
          isOpen={true}
          onClose={() => {
            setAnalyzingTopic(null);
            setAiBreakdown(null);
          }}
          title={analyzingTopic ? `AI Study Guide: ${analyzingTopic.name}` : 'Analyzing Topic...'}
          maxWidth="max-w-xl"
        >
          {isLoadingAi ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-10 h-10 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
              <p className="text-sm font-semibold text-slate-300">
                Synthesizing high-yield review concepts & exam traps...
              </p>
            </div>
          ) : aiBreakdown ? (
            <div className="space-y-4 text-sm">
              {/* Summary */}
              <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-200">
                <p className="font-medium text-xs sm:text-sm">{aiBreakdown.summary}</p>
              </div>

              {/* Core Concepts */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
                  <Lightbulb size={16} className="text-amber-400" />
                  <span>Key Formulas & Concepts to Retain</span>
                </div>
                <div className="space-y-1.5">
                  {aiBreakdown.keyFormulasOrConcepts.map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2">
                      <span className="w-5 h-5 rounded-md bg-purple-600/30 text-purple-300 flex items-center justify-center text-xs font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-xs text-slate-200 font-mono">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Common Exam Pitfalls */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                  <AlertOctagon size={16} />
                  <span>Common Exam Pitfalls</span>
                </div>
                <div className="space-y-1.5">
                  {aiBreakdown.commonExamPitfalls.map((pitfall, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-rose-500/5 border border-rose-500/20 text-xs text-rose-200/90 flex items-start gap-2">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{pitfall}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendation */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 text-xs text-emerald-200">
                <Target size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block mb-0.5">High-Yield Drill:</span>
                  <span>{aiBreakdown.highYieldRecommendation}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end">
                <button
                  onClick={() => {
                    const top = analyzingTopic;
                    setAnalyzingTopic(null);
                    setAiBreakdown(null);
                    if (top) onStartStudyForTopic(top.subjectName, top.name);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-purple-600 text-white font-bold text-sm shadow-md transition-all"
                >
                  <Play size={14} className="fill-white" />
                  <span>Start Focus on this Topic</span>
                </button>
              </div>
            </div>
          ) : null}
        </Modal>
      )}

      {/* Add Subject Modal */}
      <Modal
        isOpen={showAddSubjectModal}
        onClose={() => setShowAddSubjectModal(false)}
        title="Add New Course"
      >
        <form onSubmit={handleCreateSubject} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Course Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Organic Chemistry II"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Color Accent
            </label>
            <div className="flex items-center gap-3">
              {colors.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setNewSubjectColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    newSubjectColor === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-black' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setShowAddSubjectModal(false)}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#7C3AED] hover:bg-purple-600 text-white font-bold text-sm shadow-md transition-all"
            >
              Create Course
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Topic Modal */}
      <Modal
        isOpen={showAddTopicModal}
        onClose={() => setShowAddTopicModal(false)}
        title="Add Curriculum Topic"
      >
        <form onSubmit={handleCreateTopic} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Subject
            </label>
            <select
              value={selectedSubjectForTopic}
              onChange={(e) => setSelectedSubjectForTopic(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#14141C] border border-white/15 text-white text-sm focus:outline-none focus:border-purple-500"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.name}>{sub.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Topic Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Fourier Transform & Convolution"
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Target Study Minutes
            </label>
            <input
              type="number"
              min="30"
              max="600"
              value={newTopicTargetMinutes}
              onChange={(e) => setNewTopicTargetMinutes(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-sm focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setShowAddTopicModal(false)}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#7C3AED] hover:bg-purple-600 text-white font-bold text-sm shadow-md transition-all"
            >
              Add Topic
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
