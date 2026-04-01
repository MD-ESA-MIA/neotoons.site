import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-text-muted mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-muted max-w-xs mb-6">{description}</p>
      {action && (
        <button 
          onClick={action.onClick}
          className="btn-primary py-2 px-6 text-sm"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
