import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  Star, 
  Plus, 
  Minus, 
  BookOpen
} from 'lucide-react';
import { Subject, Topic, StudySession } from '../../types';
import { GlassCard } from '../common/GlassCard';
import { Modal } from '../common/Modal';
import { soundService } from '../../services/sound';

interface StudyTimerScreenProps {
  subjects: Subject[];
  topics: Topic[];
  activeSubject?: string;
  activeTopic?: string;
  soundEnabled: boolean;
  onSessionComplete: (session: Omit<StudySession, 'id' | 'timestamp'>) => void;
}

type TimerMode = 'Focus' | 'Short Break' | 'Long Break';

export const StudyTimerScreen: React.FC<StudyTimerScreenProps> = ({
  subjects,
  topics,
  activeSubject,
  activeTopic,
  soundEnabled,
  onSessionComplete,
}) => {
  const [mode, setMode] = useState<TimerMode>('Focus');
  const [selectedSubject, setSelectedSubject] = useState(activeSubject || subjects[0]?.name || 'Physics');
  const [selectedTopic, setSelectedTopic] = useState(activeTopic || 'General');

  // Timer state
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Post session modal
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [questionsAttempted, setQuestionsAttempted] = useState(10);
  const [questionsCorrect, setQuestionsCorrect] = useState(9);
  const [notes, setNotes] = useState('');
  const [actualDuration, setActualDuration] = useState(25);

  const timerRef = useRef<number | null>(null);

  // Sync when activeSubject or activeTopic change
  useEffect(() => {
    if (activeSubject) setSelectedSubject(activeSubject);
    if (activeTopic) setSelectedTopic(activeTopic);
  }, [activeSubject, activeTopic]);

  // Set mode configuration
  const handleModeChange = (newMode: TimerMode, minutes: number) => {
    if (isRunning) {
      if (!confirm('Switching modes will reset your current timer. Continue?')) {
        return;
      }
    }
    setMode(newMode);
    setTotalSeconds(minutes * 60);
    setSecondsLeft(minutes * 60);
    setIsRunning(false);
    setIsPaused(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Timer Tick effect
  useEffect(() => {
    if (isRunning && !isPaused) {
      timerRef.current = window.setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            setIsPaused(false);
            if (soundEnabled) soundService.playSessionComplete();

            const completedMins = Math.max(1, Math.round(totalSeconds / 60));
            setActualDuration(completedMins);
            if (mode === 'Focus') {
              setShowEvaluationModal(true);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isPaused, totalSeconds, soundEnabled, mode]);

  const handleStart = () => {
    if (soundEnabled) soundService.playClick();
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    if (soundEnabled) soundService.playClick();
    setIsPaused(true);
  };

  const handleResume = () => {
    if (soundEnabled) soundService.playClick();
    setIsPaused(false);
  };

  const handleReset = () => {
    if (soundEnabled) soundService.playClick();
    setIsRunning(false);
    setIsPaused(false);
    setSecondsLeft(totalSeconds);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleFinishEarly = () => {
    if (soundEnabled) soundService.playClick();
    const elapsedSeconds = totalSeconds - secondsLeft;
    const elapsedMins = Math.max(1, Math.round(elapsedSeconds / 60));
    setActualDuration(elapsedMins);

    setIsRunning(false);
    setIsPaused(false);
    if (timerRef.current) clearInterval(timerRef.current);

    if (mode === 'Focus') {
      setShowEvaluationModal(true);
    } else {
      setSecondsLeft(totalSeconds);
    }
  };

  const handleSubmitEvaluation = () => {
    onSessionComplete({
      subject: selectedSubject,
      topic: selectedTopic,
      durationMinutes: actualDuration,
      qualityRating: rating,
      questionsAttempted,
      questionsCorrect,
      notes: notes.trim(),
    });

    setShowEvaluationModal(false);
    setSecondsLeft(totalSeconds);
    setNotes('');
  };

  // Formatted display
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progress = totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 0;

  const availableTopics = topics.filter(t => t.subjectName.toLowerCase() === selectedSubject.toLowerCase());

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 md:pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Deep Work Timer
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Block distractions. Build deep, durable understanding.
          </p>
        </div>

        {/* Status Chip */}
        <div className="self-start sm:self-auto">
          <span 
            className={`px-3 py-1 rounded-xl text-xs font-bold tracking-wider border uppercase transition-colors ${
              isRunning && !isPaused
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : isPaused
                ? 'bg-orange-500/15 border-orange-500/30 text-orange-400'
                : 'bg-white/5 border-white/10 text-slate-400'
            }`}
          >
            {isRunning && !isPaused ? 'ACTIVE' : isPaused ? 'PAUSED' : 'STANDBY'}
          </span>
        </div>
      </div>

      {/* Mode Selectors */}
      <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-white/5 border border-white/10">
        <button
          onClick={() => handleModeChange('Focus', 25)}
          className={`py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            mode === 'Focus'
              ? 'bg-[#7C3AED] text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Focus (25m)
        </button>
        <button
          onClick={() => handleModeChange('Short Break', 5)}
          className={`py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            mode === 'Short Break'
              ? 'bg-[#7C3AED] text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Short Break (5m)
        </button>
        <button
          onClick={() => handleModeChange('Long Break', 15)}
          className={`py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            mode === 'Long Break'
              ? 'bg-[#7C3AED] text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Long Break (15m)
        </button>
      </div>

      {/* Subject & Topic Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Subject
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              const firstTopic = topics.find(t => t.subjectName.toLowerCase() === e.target.value.toLowerCase());
              if (firstTopic) setSelectedTopic(firstTopic.name);
            }}
            className="w-full px-4 py-2.5 rounded-xl bg-[#121218] border border-white/15 text-white text-sm font-medium focus:outline-none focus:border-purple-500"
          >
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.name}>{sub.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Topic
          </label>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-[#121218] border border-white/15 text-white text-sm font-medium focus:outline-none focus:border-purple-500"
          >
            {availableTopics.length > 0 ? (
              availableTopics.map((top) => (
                <option key={top.id} value={top.name}>{top.name}</option>
              ))
            ) : (
              <option value="General">General Review</option>
            )}
          </select>
        </div>
      </div>

      {/* Circular Progress Meter Card */}
      <GlassCard className="flex flex-col items-center justify-center py-12 relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute w-72 h-72 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

        {/* Circular SVG Meter */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 300 300">
            {/* Background ring */}
            <circle
              cx="150"
              cy="150"
              r="135"
              fill="transparent"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="8"
            />
            {/* Animated progress stroke */}
            <circle
              cx="150"
              cy="150"
              r="135"
              fill="transparent"
              stroke="#7C3AED"
              strokeWidth="8"
              strokeDasharray="848"
              strokeDashoffset={848 - (848 * progress)}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Time and Info Center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-5xl sm:text-6xl font-black tracking-tighter text-white font-mono">
              {timeFormatted}
            </span>
            <div className="mt-2 flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-purple-300">
              <BookOpen size={13} />
              <span className="truncate max-w-[160px]">{selectedTopic}</span>
            </div>
            <span className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
              {selectedSubject}
            </span>
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex items-center gap-4 mt-10 z-10">
          <button
            onClick={handleReset}
            className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all"
            title="Reset Timer"
          >
            <RotateCcw size={18} />
          </button>

          {!isRunning ? (
            <button
              onClick={handleStart}
              className="flex items-center gap-2.5 px-8 py-4 rounded-3xl bg-[#7C3AED] hover:bg-purple-600 text-white font-bold text-base shadow-xl shadow-purple-600/30 hover:scale-105 active:scale-95 transition-all"
            >
              <Play size={20} className="fill-white" />
              <span>Start Focus</span>
            </button>
          ) : isPaused ? (
            <button
              onClick={handleResume}
              className="flex items-center gap-2.5 px-8 py-4 rounded-3xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-xl shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all"
            >
              <Play size={20} className="fill-white" />
              <span>Resume</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="flex items-center gap-2.5 px-8 py-4 rounded-3xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-base shadow-xl shadow-orange-600/30 hover:scale-105 active:scale-95 transition-all"
            >
              <Pause size={20} className="fill-white" />
              <span>Pause</span>
            </button>
          )}

          {isRunning && (
            <button
              onClick={handleFinishEarly}
              className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-emerald-400 hover:text-emerald-300 transition-all"
              title="Finish Early & Evaluate"
            >
              <CheckCircle size={18} />
            </button>
          )}
        </div>
      </GlassCard>

      {/* Post Session Evaluation Modal */}
      <Modal
        isOpen={showEvaluationModal}
        onClose={() => setShowEvaluationModal(false)}
        title="Session Evaluation & Retention Log"
      >
        <div className="space-y-5">
          <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center">
            <h4 className="text-sm font-bold text-purple-300">
              {actualDuration} Minutes Completed
            </h4>
            <p className="text-xs text-purple-200/80">
              {selectedSubject} • {selectedTopic}
            </p>
          </div>

          {/* Quality Rating */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Focus & Retention Quality
            </label>
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-2 rounded-xl transition-all ${
                    rating >= star ? 'text-amber-400 scale-110' : 'text-slate-600 hover:text-slate-400'
                  }`}
                >
                  <Star size={26} className={rating >= star ? 'fill-amber-400' : ''} />
                </button>
              ))}
            </div>
          </div>

          {/* Questions Attempted / Correct Counter */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-xs font-semibold text-slate-400">Questions Attempted</span>
              <div className="flex items-center justify-between mt-2">
                <button
                  type="button"
                  onClick={() => setQuestionsAttempted(Math.max(0, questionsAttempted - 1))}
                  className="p-1 rounded-lg bg-white/10 text-white hover:bg-white/20"
                >
                  <Minus size={16} />
                </button>
                <span className="text-xl font-bold text-white">{questionsAttempted}</span>
                <button
                  type="button"
                  onClick={() => setQuestionsAttempted(questionsAttempted + 1)}
                  className="p-1 rounded-lg bg-white/10 text-white hover:bg-white/20"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Correct</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                  {questionsAttempted > 0 ? `${Math.round((questionsCorrect / questionsAttempted) * 100)}%` : '0%'}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <button
                  type="button"
                  onClick={() => setQuestionsCorrect(Math.max(0, questionsCorrect - 1))}
                  className="p-1 rounded-lg bg-white/10 text-white hover:bg-white/20"
                >
                  <Minus size={16} />
                </button>
                <span className="text-xl font-bold text-emerald-400">{questionsCorrect}</span>
                <button
                  type="button"
                  onClick={() => setQuestionsCorrect(Math.min(questionsAttempted, questionsCorrect + 1))}
                  className="p-1 rounded-lg bg-white/10 text-white hover:bg-white/20"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Optional notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Synthesis & Reflection Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What core concept, proof, or problem structure did you master?"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setShowEvaluationModal(false)}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={handleSubmitEvaluation}
              className="px-5 py-2 rounded-xl bg-[#7C3AED] hover:bg-purple-600 text-white font-bold text-sm shadow-md transition-all"
            >
              Save Log
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
