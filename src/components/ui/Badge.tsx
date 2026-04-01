import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'accent' | 'cyan' | 'gold' | 'muted' | 'rose';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'muted', 
  className 
}) => {
  const variants = {
    accent: 'bg-accent/10 text-accent border-accent/20',
    cyan: 'bg-cyan/10 text-cyan border-cyan/20',
    gold: 'bg-gold/10 text-gold border-gold/20',
    muted: 'bg-white/5 text-text-muted border-white/10',
    rose: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  };

  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
};

export default Badge;
