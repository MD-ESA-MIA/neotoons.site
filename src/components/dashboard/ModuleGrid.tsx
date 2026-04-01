import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MODES } from '../../constants';
import { getIcon } from '../Icons';
import { ArrowRight } from 'lucide-react';
import Badge from '../ui/Badge';

const ModuleGrid: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {MODES.map((mode) => (
        <div 
          key={mode.id}
          onClick={() => navigate(`/workspace/${mode.id.toLowerCase().split('_')[0]}`)}
          className="group glass-panel p-6 rounded-2xl hover:border-accent/40 transition-all cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${mode.color} flex items-center justify-center text-white shadow-lg`}>
              {getIcon(mode.iconName, "w-6 h-6")}
            </div>
            {mode.id === 'STORY_GENERATOR' && (
              <Badge variant="gold">Most Used</Badge>
            )}
          </div>
          
          <h3 className="text-lg font-bold text-text-primary mb-2 group-hover:text-accent transition-colors">
            {mode.title}
          </h3>
          <p className="text-sm text-text-muted mb-6 line-clamp-2">
            {mode.description}
          </p>
          
          <div className="flex items-center gap-2 text-xs font-bold text-text-muted group-hover:text-text-primary transition-colors">
            Open Module <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
          
          {/* Hover Glow */}
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-accent/5 blur-3xl rounded-full group-hover:bg-accent/10 transition-all"></div>
        </div>
      ))}
    </div>
  );
};

export default ModuleGrid;
