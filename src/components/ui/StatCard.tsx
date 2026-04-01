import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  trend?: string;
  className?: string;
  accentColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  value, 
  icon: Icon, 
  color = 'text-accent',
  trend,
  className,
  accentColor = '#7C3AED'
}) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={cn(
        "glass-panel p-6 rounded-2xl flex flex-col gap-4 relative group overflow-hidden transition-colors hover:border-accent/50",
        className
      )}
    >
      {/* Subtle Glow Effect */}
      <div 
        className="absolute -inset-px bg-linear-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
        style={{ 
          backgroundImage: `linear-gradient(to bottom right, ${accentColor}, transparent)` 
        }}
      />
      
      <div className="flex items-center justify-between relative z-10">
        <div className={cn("p-2.5 rounded-xl bg-white/5", color)}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">
            {trend}
          </span>
        )}
      </div>
      <div className="relative z-10">
        <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-1">{label}</p>
        <h3 className="text-2xl font-black text-white tracking-tight">{value}</h3>
      </div>
    </motion.div>
  );
};

export default StatCard;
