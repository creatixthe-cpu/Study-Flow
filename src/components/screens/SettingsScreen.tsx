import React, { useState } from 'react';
import { 
  Target, 
  Volume2, 
  ExternalLink
} from 'lucide-react';
import { UserProfile, ScreenId } from '../../types';
import { GlassCard } from '../common/GlassCard';
import { Modal } from '../common/Modal';

interface SettingsScreenProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onResetDemoData: () => void;
  onClearAllData: () => void;
  onNavigate: (screen: ScreenId) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  profile,
  onUpdateProfile,
  onResetDemoData,
  onClearAllData,
  onNavigate,
}) => {
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Edit profile form
  const [name, setName] = useState(profile.name);
  const [major, setMajor] = useState(profile.major);
  const [dailyGoal, setDailyGoal] = useState(profile.dailyGoalMinutes);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      name: name.trim() || 'Alex Rivera',
      major: major.trim() || 'Computer Science',
      dailyGoalMinutes: Number(dailyGoal) || 120,
    });
    setShowEditProfileModal(false);
  };

  const getInitials = (n: string) => {
    return n
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Personalize your goals, study session sound effects, and account configuration.
        </p>
      </div>

      {/* Student Profile Card */}
      <GlassCard className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-purple-600/30">
            {getInitials(profile.name)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{profile.name}</h2>
            <p className="text-xs sm:text-sm text-slate-400">{profile.major}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Daily Goal: {profile.dailyGoalMinutes}m
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                {profile.streakDays} Day Streak
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setName(profile.name);
            setMajor(profile.major);
            setDailyGoal(profile.dailyGoalMinutes);
            setShowEditProfileModal(true);
          }}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs sm:text-sm font-semibold transition-all self-start sm:self-auto"
        >
          Edit Profile
        </button>
      </GlassCard>

      {/* Study Session Preferences */}
      <GlassCard className="space-y-4">
        <h3 className="text-base font-bold text-white">Study Preferences</h3>

        <div className="space-y-3">
          {/* Sound Effects Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
                <Volume2 size={18} />
              </div>
              <div>
                <span className="text-sm font-semibold text-white block">Focus Sound Chimes</span>
                <span className="text-xs text-slate-400">Play pleasant sound upon timer completion & button clicks</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onUpdateProfile({ ...profile, soundEnabled: !profile.soundEnabled })}
              className={`w-12 h-6 rounded-full transition-colors p-0.5 ${
                profile.soundEnabled ? 'bg-[#7C3AED]' : 'bg-white/20'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  profile.soundEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Auto-start Breaks */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                <Target size={18} />
              </div>
              <div>
                <span className="text-sm font-semibold text-white block">Auto-Transition Breaks</span>
                <span className="text-xs text-slate-400">Automatically start break timer when focus block ends</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onUpdateProfile({ ...profile, autoStartBreaks: !profile.autoStartBreaks })}
              className={`w-12 h-6 rounded-full transition-colors p-0.5 ${
                profile.autoStartBreaks ? 'bg-[#7C3AED]' : 'bg-white/20'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  profile.autoStartBreaks ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </GlassCard>

      {/* App Exploration & Presentation */}
      <GlassCard className="space-y-3">
        <h3 className="text-base font-bold text-white">App Showcase</h3>

        <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <ExternalLink size={18} />
            </div>
            <div>
              <span className="text-sm font-semibold text-white block">Product Landing Page</span>
              <span className="text-xs text-slate-400">View the student landing page showcase</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all"
          >
            <span>View</span>
            <ExternalLink size={13} />
          </button>
        </div>
      </GlassCard>

      {/* Data Management */}
      <GlassCard className="space-y-4">
        <h3 className="text-base font-bold text-white">Data & Storage</h3>

        <div className="space-y-2">
          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <div>
              <span className="text-sm font-medium text-white block">Restore Sample Data</span>
              <span className="text-xs text-slate-400">Restore default demo courses, tasks, and sessions</span>
            </div>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all"
            >
              Reset Data
            </button>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-sm font-medium text-rose-400 block">Clear All Data</span>
              <span className="text-xs text-slate-400">Reset local browser state back to clean slate</span>
            </div>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 text-xs font-semibold transition-all"
            >
              Clear
            </button>
          </div>
        </div>
      </GlassCard>

      {/* About Box */}
      <div className="text-center py-4 space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-semibold">
          <span>StudyFlow Web App</span>
          <span>•</span>
          <span>v1.0.0 Frosted Glass Edition</span>
        </div>
        <p className="text-[11px] text-slate-600">
          Standalone React + TypeScript + Vite build running 100% in browser.
        </p>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        title="Edit Student Profile"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-sm focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Major / Degree / Focus
            </label>
            <input
              type="text"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              placeholder="e.g. Electrical Engineering & CS"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-sm focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Daily Study Goal (Minutes)
            </label>
            <input
              type="number"
              min="15"
              max="600"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-sm focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setShowEditProfileModal(false)}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#7C3AED] hover:bg-purple-600 text-white font-bold text-sm shadow-md transition-all"
            >
              Save Profile
            </button>
          </div>
        </form>
      </Modal>

      {/* Reset Confirm Modal */}
      {showResetConfirm && (
        <Modal
          isOpen={true}
          onClose={() => setShowResetConfirm(false)}
          title="Reset to Sample Demo Data?"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-300">
              This will reload sample coursework tasks, courses (Physics, Math, CS, Chemistry), and initial session records.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onResetDemoData();
                  setShowResetConfirm(false);
                }}
                className="px-5 py-2 rounded-xl bg-[#7C3AED] hover:bg-purple-600 text-white font-bold text-sm shadow-md transition-all"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Clear Confirm Modal */}
      {showClearConfirm && (
        <Modal
          isOpen={true}
          onClose={() => setShowClearConfirm(false)}
          title="Clear All App Data?"
        >
          <div className="space-y-4">
            <p className="text-sm text-rose-300">
              Are you sure you want to clear all data? All study tasks, logged sessions, and custom topics will be reset.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearAllData();
                  setShowClearConfirm(false);
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-md transition-all"
              >
                Clear Everything
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
