import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Animate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsFading(true);
          setTimeout(onComplete, 400);
          return 100;
        }
        return prev + 5;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-[#050505] select-none transition-opacity duration-500 ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background ambient radial gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-purple-600/15 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full bg-indigo-600/10 blur-[80px] pointer-events-none" />

      {/* Top subtle bar */}
      <div className="w-full flex justify-end pt-4">
        <button
          onClick={() => {
            setIsFading(true);
            setTimeout(onComplete, 300);
          }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-400 hover:text-white transition-all border border-white/10"
        >
          <span>Skip</span>
          <ArrowRight size={12} />
        </button>
      </div>

      {/* Center Brand Identity */}
      <div className="flex flex-col items-center text-center space-y-6 max-w-sm px-4">
        {/* Glowing App Icon */}
        <div className="relative group">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-purple-600 to-indigo-600 opacity-60 blur-xl group-hover:opacity-100 transition duration-1000 animate-pulse" />
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-purple-600/50 border border-white/20">
            <span>S</span>
          </div>
        </div>

        {/* Title & Tagline */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            StudyFlow
            <span className="text-xs uppercase font-extrabold tracking-widest px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              PRO
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            Deep work focus & curriculum mastery
          </p>
        </div>

        {/* Loading Progress Line */}
        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full transition-all duration-75 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Bottom Creator / Copyright Section */}
      <div className="pb-8 flex flex-col items-center gap-2 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-slate-300 shadow-sm backdrop-blur-md">
          <Sparkles size={13} className="text-purple-400 animate-pulse" />
          <span className="text-xs font-semibold tracking-wider text-slate-200">
            Made by Sunny
          </span>
        </div>
        <p className="text-[10px] text-slate-500 font-medium tracking-wide">
          © {new Date().getFullYear()} StudyFlow • All rights reserved
        </p>
      </div>
    </div>
  );
};
