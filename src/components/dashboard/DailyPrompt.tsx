import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Quote, ArrowRight } from 'lucide-react';

const DAILY_PROMPTS = [
  "Write a horror story where the monster is kindness itself.",
  "A child discovers their imaginary friend is real — and terrified.",
  "In a world where memories are currency, you just found a fortune.",
  "The last person on Earth hears a knock at the door.",
  "You wake up with the ability to see the 'expiration date' of everything.",
];

const DailyPrompt: React.FC = () => {
  const navigate = useNavigate();
  const prompt = DAILY_PROMPTS[new Date().getDate() % DAILY_PROMPTS.length];

  const handleUsePrompt = () => {
    navigate('/workspace/story', { state: { initialPrompt: prompt } });
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border-l-4 border-l-accent">
      <div className="flex items-center gap-2 text-text-muted mb-4">
        <Quote className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-widest">Daily Inspiration</span>
      </div>
      <p className="text-lg font-medium text-text-primary italic mb-6 leading-relaxed">
        "{prompt}"
      </p>
      <button 
        onClick={handleUsePrompt}
        className="flex items-center gap-2 text-sm font-bold text-accent hover:text-accent-light transition-colors group"
      >
        Use This Prompt 
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

export default DailyPrompt;
