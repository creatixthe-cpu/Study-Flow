import React from 'react';
import { GlassCard } from './GlassCard';

interface StatMetricCardProps {
  title: string;
  value: string;
  subtext: string;
  icon?: React.ReactNode;
  progressFraction?: number; // 0 to 1
  accentColor?: string;
  className?: string;
}

export const StatMetricCard: React.FC<StatMetricCardProps> = ({
  title,
  value,
  subtext,
  icon,
  progressFraction,
  accentColor = '#7C3AED',
  className,
}) => {
  return (
    <GlassCard className={`flex flex-col justify-between ${className || ''}`}>
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </span>
          {icon && (
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center border"
              style={{
                backgroundColor: `${accentColor}1A`,
                borderColor: `${accentColor}33`,
                color: accentColor,
              }}
            >
              {icon}
            </div>
          )}
        </div>
        <div className="text-3xl font-extrabold tracking-tight text-white mb-1">
          {value}
        </div>
      </div>

      <div>
        {progressFraction !== undefined && (
          <div className="w-full bg-white/10 rounded-full h-1.5 mb-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${Math.min(100, Math.max(0, progressFraction * 100))}%`,
                backgroundColor: accentColor,
              }}
            />
          </div>
        )}
        <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
          {subtext}
        </div>
      </div>
    </GlassCard>
  );
};
