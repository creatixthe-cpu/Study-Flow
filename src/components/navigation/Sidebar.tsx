import React from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Timer, 
  BarChart3, 
  BookOpen, 
  Settings, 
  Flame,
  Play,
  User,
  Sparkles
} from 'lucide-react';
import { ScreenId, AuthUser } from '../../types';

interface SidebarProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  streakDays: number;
  currentUser?: AuthUser | null;
  onOpenAuth?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onNavigate,
  streakDays,
  currentUser,
  onOpenAuth,
}) => {
  const navItems = [
    { id: 'dashboard' as ScreenId, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'planner' as ScreenId, label: 'Planner', icon: CalendarDays },
    { id: 'study' as ScreenId, label: 'Study Timer', icon: Timer },
    { id: 'analytics' as ScreenId, label: 'Analytics', icon: BarChart3 },
    { id: 'topics' as ScreenId, label: 'Topics', icon: BookOpen },
    { id: 'settings' as ScreenId, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col justify-between w-64 h-screen sticky top-0 bg-white/[0.03] border-r border-white/10 backdrop-blur-xl p-5 select-none z-30">
      <div className="flex flex-col gap-6">
        {/* Logo & Brand */}
        <div 
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-3 px-2 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform">
            <span className="text-white font-black text-xl">S</span>
          </div>
          <div>
            <div className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              StudyFlow
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Gen-Z Study Tracker</p>
          </div>
        </div>

        {/* User Account / Auth Widget */}
        <div 
          onClick={onOpenAuth}
          className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 cursor-pointer transition-all group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-xs shrink-0 overflow-hidden">
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt={currentUser.displayName || 'User'} className="w-full h-full object-cover" />
              ) : currentUser ? (
                <span>{(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}</span>
              ) : (
                <User size={15} />
              )}
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block truncate">
                {currentUser?.displayName || (currentUser?.phoneNumber ? `Student (${currentUser.phoneNumber.slice(-4)})` : 'Sign In')}
              </span>
              <span className="text-[10px] text-slate-400 block truncate">
                {currentUser ? (currentUser.email || currentUser.phoneNumber || 'Authenticated') : 'Google / Phone OTP'}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-purple-400 group-hover:text-purple-300 shrink-0">
            {currentUser ? 'Edit' : 'Login →'}
          </span>
        </div>

        {/* Streak Counter Banner */}
        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Flame size={16} className="animate-pulse" />
            </div>
            <span className="text-xs font-semibold text-slate-300">Study Streak</span>
          </div>
          <span className="text-sm font-extrabold text-orange-400">{streakDays} days</span>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5 mt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-medium transition-all duration-200 text-left ${
                  isActive
                    ? 'bg-[#7C3AED] text-white shadow-lg shadow-purple-600/25 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <Icon size={19} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Quick Launch CTA & Creator Badge */}
      <div className="mt-auto pt-4 border-t border-white/10 space-y-3">
        <button
          onClick={() => onNavigate('study')}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-white font-semibold text-sm transition-all duration-200 shadow-md group"
        >
          <Play size={16} className="fill-purple-400 text-purple-400 group-hover:scale-110 transition-transform" />
          <span>Quick Focus Timer</span>
        </button>

        {/* Clean subtle copyright/creator branding */}
        <div className="flex items-center justify-center gap-1.5 py-1 text-[11px] text-slate-400">
          <Sparkles size={11} className="text-purple-400" />
          <span className="font-semibold tracking-wide text-slate-300">Made by Sunny</span>
        </div>
      </div>
    </aside>
  );
};
