import React from 'react';
import { useSession } from '../../context/SessionContext';
import { useLibrary } from '../../context/LibraryContext';
import { getIcon } from '../Icons';
import { Clock } from 'lucide-react';

const ActivitySidebar: React.FC = () => {
  const { library } = useLibrary();
  const recentActivity = library.slice(0, 10);

  const getTimeAgo = (dateStr: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const modeIcons: Record<string, string> = {
    STORY_GENERATOR: 'BookOpen',
    VIRAL_HOOKS: 'Zap',
    SCRIPT_REWRITER: 'Feather',
    VOICE_OVER: 'Mic',
    AI_PROMPTS: 'Image',
    SOCIAL_POSTS: 'Share2',
    CHARACTER_CREATOR: 'UserCircle',
  };

  return (
    <div className="w-72 hidden xl:flex flex-col gap-6 sticky top-24 h-[calc(100vh-120px)]">
      <div className="glass-panel rounded-2xl p-6 flex-1 flex flex-col overflow-hidden">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
          <Clock className="w-4 h-4 text-accent" />
          Recent Activity
        </h3>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6">
          {recentActivity.length > 0 ? (
            recentActivity.map((item) => (
              <div key={item.id} className="flex gap-4 group">
                <div className="relative">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-accent group-hover:bg-accent/10 transition-colors">
                    {getIcon(modeIcons[item.type] || 'Wand2', 'w-4 h-4')}
                  </div>
                  <div className="absolute top-8 left-4 w-px h-6 bg-border last:hidden"></div>
                </div>
                <div>
                  <p className="text-xs font-bold text-text-primary line-clamp-1">{item.title}</p>
                  <p className="text-[10px] text-text-muted mt-0.5">Generated {item.type.toLowerCase().replace('_', ' ')}</p>
                  <p className="text-[9px] text-accent font-medium mt-1">{getTimeAgo(item.createdAt)}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-xs text-text-muted">Your activity will appear here.</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="glass-panel rounded-2xl p-6 bg-linear-to-br from-gold/10 to-transparent border-gold/20">
        <h4 className="text-xs font-bold text-gold uppercase tracking-widest mb-2">Pro Tip</h4>
        <p className="text-[11px] text-text-muted leading-relaxed">
          Use the <strong>Character Creator</strong> before the <strong>Story Generator</strong> to build deeper, more consistent narratives.
        </p>
      </div>
    </div>
  );
};

export default ActivitySidebar;
