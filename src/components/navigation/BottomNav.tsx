import React from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Timer, 
  BarChart3, 
  BookOpen, 
  Settings 
} from 'lucide-react';
import { ScreenId } from '../../types';

interface BottomNavProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  onNavigate,
}) => {
  const navItems = [
    { id: 'dashboard' as ScreenId, label: 'Dash', icon: LayoutDashboard },
    { id: 'planner' as ScreenId, label: 'Plan', icon: CalendarDays },
    { id: 'study' as ScreenId, label: 'Timer', icon: Timer },
    { id: 'analytics' as ScreenId, label: 'Stats', icon: BarChart3 },
    { id: 'topics' as ScreenId, label: 'Topics', icon: BookOpen },
    { id: 'settings' as ScreenId, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#050505]/85 border-t border-white/10 backdrop-blur-2xl px-2 py-2 safe-area-pb">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 min-w-[52px] ${
                isActive
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div 
                className={`p-1.5 rounded-xl transition-all ${
                  isActive ? 'bg-[#7C3AED] text-white shadow-md shadow-purple-600/30' : ''
                }`}
              >
                <Icon size={18} />
              </div>
              <span className={`text-[10px] font-medium mt-1 ${isActive ? 'text-white font-bold' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
