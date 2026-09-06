import React from 'react';
import { 
  ArrowLeft, 
  Play, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  BookOpen, 
  BarChart3,
  Zap
} from 'lucide-react';
import { ScreenId } from '../../types';
import { GlassCard } from '../common/GlassCard';

interface LandingScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-purple-600/30 selection:text-purple-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-purple-600/30">
              <span className="text-white font-black text-lg">S</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-white">StudyFlow</span>
          </div>

          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-xs sm:text-sm transition-all shadow-sm"
          >
            <ArrowLeft size={16} />
            <span>Open Application</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-20">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-widest">
            <Sparkles size={14} className="text-purple-400" />
            <span>BUILT FOR SERIOUS STUDENTS</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Study smarter. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-purple-500">
              Actually see the progress.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-400 font-normal max-w-2xl mx-auto leading-relaxed">
            The premium study tracking companion with deep work focus timers, curriculum topic coverage, and data-backed retention accuracy.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigate('study')}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-[#7C3AED] hover:bg-purple-600 text-white font-bold text-sm shadow-xl shadow-purple-600/35 hover:scale-105 active:scale-95 transition-all"
            >
              <Play size={18} className="fill-white" />
              <span>Start Free Focus Session</span>
            </button>

            <button
              onClick={() => onNavigate('dashboard')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-semibold text-sm transition-all"
            >
              <span>Explore Dashboard</span>
            </button>
          </div>
        </div>

        {/* Live Interactive Preview Card */}
        <div className="max-w-3xl mx-auto">
          <div className="relative p-1 rounded-[32px] bg-gradient-to-b from-purple-500/30 via-white/10 to-transparent">
            <GlassCard className="!p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Electromagnetism Deep Work</h3>
                    <p className="text-xs text-purple-300 font-medium">Physics • Gauss's Law & Boundary Conditions</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>ACTIVE INTERVAL</span>
                </div>
              </div>

              {/* Big Metric Display */}
              <div className="grid grid-cols-3 gap-4 py-4 border-y border-white/10 text-center">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Time Left</span>
                  <span className="text-2xl sm:text-3xl font-black text-white font-mono mt-1 block">18:45</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Problem Accuracy</span>
                  <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono mt-1 block">92%</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Daily Streak</span>
                  <span className="text-2xl sm:text-3xl font-black text-orange-400 font-mono mt-1 block">🔥 5</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-purple-400" />
                  <span>Zero ads, zero data tracking, runs 100% locally</span>
                </div>
                <button
                  onClick={() => onNavigate('study')}
                  className="font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Try live timer →
                </button>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Crafted for High Academic Performance
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Everything you need to master tough STEM and humanities curricula.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <GlassCard className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                <Clock size={20} />
              </div>
              <h3 className="font-bold text-white text-base">Deep Work Intervals</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Scientifically calibrated 25-minute focus intervals and breaks with pleasant synthesized Web Audio chimes.
              </p>
            </GlassCard>

            <GlassCard className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <BookOpen size={20} />
              </div>
              <h3 className="font-bold text-white text-base">Curriculum Coverage</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Break courses down into granular topics. Track target vs studied minutes with progress bars.
              </p>
            </GlassCard>

            <GlassCard className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                <BarChart3 size={20} />
              </div>
              <h3 className="font-bold text-white text-base">Honest Retention Analytics</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Log question attempts and accuracy after every study session to pinpoint weak topics before exam day.
              </p>
            </GlassCard>

            <GlassCard className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-600/20 text-orange-400 border border-orange-500/30 flex items-center justify-center">
                <Zap size={20} />
              </div>
              <h3 className="font-bold text-white text-base">AI Concept Breakdown</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Instant high-yield summaries, key equations, and common exam pitfalls to accelerate understanding.
              </p>
            </GlassCard>
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="p-8 sm:p-12 rounded-[32px] bg-gradient-to-r from-purple-900/40 via-purple-600/20 to-indigo-900/40 border border-purple-500/30 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Ready to elevate your study routine?
          </h2>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            Get started right now in your browser. All data saves automatically.
          </p>
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-8 py-3.5 rounded-2xl bg-white text-purple-950 font-extrabold text-sm shadow-xl hover:bg-purple-50 transition-all hover:scale-105 active:scale-95"
          >
            Launch StudyFlow App
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-xs text-slate-400 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
          <Sparkles size={12} className="text-purple-400" />
          <span className="font-semibold text-xs text-white">Made by Sunny</span>
        </div>
        <p className="text-slate-500 text-[11px]">
          StudyFlow • Frosted Glass Web Edition • Powered by React & Vite
        </p>
      </footer>
    </div>
  );
};
