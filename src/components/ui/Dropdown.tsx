import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DropdownOption {
  label: string;
  icon?: React.ReactNode;
}

interface DropdownProps {
  label?: string;
  options: (string | DropdownOption)[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  triggerClassName?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ label, options, value, onChange, className, triggerClassName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      if (isOpen) setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  const getOptionLabel = (option: string | DropdownOption) => 
    typeof option === 'string' ? option : option.label;

  const getOptionIcon = (option: string | DropdownOption) => 
    typeof option === 'string' ? null : option.icon;

  return (
    <div className={cn("space-y-2 relative", className)} ref={containerRef}>
      {label && (
        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full bg-bg border border-border rounded-xl py-2.5 px-4 text-xs flex items-center justify-between transition-all hover:border-accent/50",
          isOpen && "border-accent ring-1 ring-accent/20",
          triggerClassName
        )}
      >
        <span className="text-text-primary">{value}</span>
        <ChevronDown className={cn("w-4 h-4 text-text-muted transition-transform duration-200", isOpen && "rotate-180 text-accent")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 left-0 right-0 mt-2 bg-card/80 backdrop-blur-xl border border-border rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden min-w-[160px]"
          >
            <div className="p-1.5 max-h-60 overflow-y-auto custom-scrollbar">
              {options.map((option) => {
                const optLabel = getOptionLabel(option);
                const optIcon = getOptionIcon(option);
                const isActive = value.toLowerCase() === optLabel.toLowerCase();

                return (
                  <button
                    key={optLabel}
                    type="button"
                    onClick={() => {
                      onChange(optLabel.toLowerCase());
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all flex items-center justify-between group",
                      isActive 
                        ? "bg-accent/10 text-accent font-bold" 
                        : "text-text-muted hover:text-text-primary hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {optIcon && <span className={cn("transition-colors", isActive ? "text-accent" : "text-text-muted group-hover:text-white")}>{optIcon}</span>}
                      {optLabel}
                    </div>
                    {isActive && (
                      <motion.div 
                        layoutId="active-check"
                        className="w-1 h-1 rounded-full bg-accent"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dropdown;
