import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLibrary } from '../../context/LibraryContext';
import { Sparkles } from 'lucide-react';

const WelcomeBanner: React.FC = () => {
  const { currentUser } = useAuth();
  const { library } = useLibrary();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-accent/20 via-accent/5 to-transparent border border-accent/20 p-8 mb-8">
      <div className="relative z-10">
        <div className="flex items-center gap-2 text-accent font-bold text-sm uppercase tracking-widest mb-2">
          <Sparkles className="w-4 h-4" />
          Welcome Back
        </div>
        <h2 className="text-3xl font-display font-bold text-text-primary mb-2">
          {getGreeting()}, {currentUser?.name} ✦
        </h2>
        <p className="text-text-muted max-w-md mb-6">
          Your creative engine is ready. What viral masterpiece will we build today?
        </p>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-text-primary">{library.length}</span>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Total Creations</span>
          </div>
          <div className="w-px h-8 bg-border"></div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-text-primary">{currentUser?.generationCount || 0}</span>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Generations</span>
          </div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[100px] rounded-full -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-cyan/10 blur-[60px] rounded-full mr-10 mb-10"></div>
    </div>
  );
};

export default WelcomeBanner;
