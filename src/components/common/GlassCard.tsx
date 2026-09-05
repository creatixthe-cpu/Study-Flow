import React from 'react';
import clsx from 'clsx';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  elevated?: boolean;
  interactive?: boolean;
  className?: string;
  glow?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  elevated = false,
  interactive = false,
  glow = false,
  className,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'rounded-[24px] transition-all duration-200 backdrop-blur-md',
        elevated ? 'bg-white/8 border border-white/15' : 'bg-white/5 border border-white/10',
        interactive && 'hover:bg-white/8 hover:border-white/20 hover:shadow-lg cursor-pointer',
        glow && 'shadow-[0_0_30px_-5px_rgba(124,58,237,0.25)] border-purple-500/30',
        'p-6 text-white',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
