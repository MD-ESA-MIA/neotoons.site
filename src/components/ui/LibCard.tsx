import React from 'react';
import { LibraryItem, AppMode } from '../../types';
import { getIcon } from '../Icons';
import { MoreVertical, Clock, Trash2, ExternalLink } from 'lucide-react';
import Badge from './Badge';

interface LibCardProps {
  item: LibraryItem;
  onDelete?: (id: string) => void;
  onClick?: (item: LibraryItem) => void;
}

const LibCard: React.FC<LibCardProps> = ({ item, onDelete, onClick }) => {
  const modeIcons: Record<string, string> = {
    [AppMode.STORY]: 'BookOpen',
    [AppMode.HOOKS]: 'Zap',
    [AppMode.REWRITE]: 'Feather',
    [AppMode.VOICEOVER]: 'Mic',
    [AppMode.PROMPTS]: 'Image',
    [AppMode.SOCIAL]: 'Share2',
    [AppMode.CHARACTER]: 'UserCircle',
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div 
      onClick={() => onClick?.(item)}
      className="group glass-panel p-5 rounded-2xl hover:border-accent/40 transition-all cursor-pointer flex flex-col gap-4 relative overflow-hidden"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            {getIcon(modeIcons[item.type] || 'Wand2', 'w-5 h-5')}
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-primary line-clamp-1">{item.title}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="muted" className="text-[9px]">{item.type.replace('_', ' ')}</Badge>
              <div className="flex items-center gap-1 text-[10px] text-text-muted">
                <Clock className="w-3 h-3" />
                {formatDate(item.createdAt)}
              </div>
            </div>
          </div>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(item.id);
          }}
          className="p-2 rounded-lg hover:bg-rose-500/10 text-text-muted hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      <p className="text-xs text-text-muted line-clamp-3 leading-relaxed">
        {item.content.replace(/[#*`]/g, '')}
      </p>

      <div className="flex items-center justify-end mt-auto pt-2">
        <div className="text-[10px] font-bold text-accent uppercase tracking-widest flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          View Full <ExternalLink className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
};

export default LibCard;
