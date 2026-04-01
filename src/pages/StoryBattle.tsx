import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { 
  Swords, 
  Trophy, 
  Users, 
  Clock, 
  ChevronRight,
  Sparkles,
  Flame,
  TrendingUp
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import { StoryBattle as StoryBattleType } from '../socialTypes';

const safeParseJson = (json: string) => {
  try {
    return JSON.parse(json);
  } catch (e) {
    throw new Error('Invalid JSON response');
  }
};

const StoryBattle: React.FC = () => {
  const { user: currentUser, token } = useSelector((state: RootState) => state.auth);
  const [battles, setBattles] = useState<StoryBattleType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBattles = async () => {
    try {
      const res = await fetch('/api/battles');
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          throw new Error('Invalid response format');
        }
        const text = await res.text();
        const data = safeParseJson(text);
        setBattles(data);
      }
    } catch (err) {
      console.error("Failed to fetch battles", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBattles();
  }, []);

  const voteInBattle = async (battleId: string, option: 'A' | 'B') => {
    if (!currentUser) {
      toast.error("Please login to vote");
      return;
    }
    try {
      const res = await fetch('/api/battles/vote', {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ battleId, option }),
      });
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          throw new Error('Invalid response format');
        }
        const text = await res.text();
        const updatedBattle = safeParseJson(text);
        setBattles(prev => prev.map(b => b.id === battleId ? updatedBattle : b));
        toast.success("Vote cast!");
      }
    } catch (err) {
      toast.error("Failed to cast vote");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fade-in pb-20">
      {/* Hero Section */}
      <div className="relative rounded-[48px] overflow-hidden bg-linear-to-br from-rose-600 to-indigo-700 p-12 text-center space-y-6 shadow-2xl shadow-rose-500/20">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black uppercase tracking-[0.2em] text-white">
            <Flame className="w-4 h-4 text-orange-400" /> Viral Feature
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter">AI STORY BATTLES</h1>
          <p className="text-white/80 max-w-2xl mx-auto text-lg font-medium">
            The ultimate storytelling competition. Vote for your favorite AI-powered tales and help crown the next master creator.
          </p>
        </div>
      </div>

      {/* Active Battles */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Swords className="w-8 h-8 text-rose-500" /> Active Battles
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-widest">
              <TrendingUp className="w-4 h-4" /> 12.4k Votes Today
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12">
          {battles.length > 0 ? battles.map((battle) => (
            <div key={battle.id} className="relative">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-2xl border-8 border-bg">
                  <span className="text-2xl font-black text-rose-600 italic">VS</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Story A */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-card border border-border rounded-[40px] p-10 space-y-6 relative overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white font-bold overflow-hidden">
                        {battle.storyA.authorAvatar ? (
                          <img src={battle.storyA.authorAvatar} alt={battle.storyA.authorName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          battle.storyA.authorName[0]
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{battle.storyA.authorName}</p>
                        <p className="text-[10px] text-text-muted uppercase tracking-widest">Challenger A</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-white">{Math.round((battle.votesA.length / (battle.votesA.length + battle.votesB.length || 1)) * 100)}%</p>
                      <p className="text-[10px] text-text-muted uppercase tracking-widest">{battle.votesA.length} Votes</p>
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-white">{battle.storyA.title}</h3>
                  <div className="prose prose-invert prose-sm line-clamp-6 text-text-muted">
                    <ReactMarkdown>{battle.storyA.content}</ReactMarkdown>
                  </div>
                  <button 
                    onClick={() => voteInBattle(battle.id, 'A')}
                    className="w-full py-4 rounded-2xl bg-rose-500 text-white font-black text-lg shadow-xl shadow-rose-500/20 hover:bg-rose-600 transition-all uppercase tracking-widest"
                  >
                    Vote for A
                  </button>
                </motion.div>

                {/* Story B */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-card border border-border rounded-[40px] p-10 space-y-6 relative overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white font-bold overflow-hidden">
                        {battle.storyB.authorAvatar ? (
                          <img src={battle.storyB.authorAvatar} alt={battle.storyB.authorName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          battle.storyB.authorName[0]
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{battle.storyB.authorName}</p>
                        <p className="text-[10px] text-text-muted uppercase tracking-widest">Challenger B</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-white">{Math.round((battle.votesB.length / (battle.votesA.length + battle.votesB.length || 1)) * 100)}%</p>
                      <p className="text-[10px] text-text-muted uppercase tracking-widest">{battle.votesB.length} Votes</p>
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-white">{battle.storyB.title}</h3>
                  <div className="prose prose-invert prose-sm line-clamp-6 text-text-muted">
                    <ReactMarkdown>{battle.storyB.content}</ReactMarkdown>
                  </div>
                  <button 
                    onClick={() => voteInBattle(battle.id, 'B')}
                    className="w-full py-4 rounded-2xl bg-indigo-500 text-white font-black text-lg shadow-xl shadow-indigo-500/20 hover:bg-indigo-600 transition-all uppercase tracking-widest"
                  >
                    Vote for B
                  </button>
                </motion.div>
              </div>
            </div>
          )) : (
            <div className="bg-card border border-border rounded-[40px] p-20 text-center space-y-6">
              <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-text-muted mx-auto">
                <Swords className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white">No active battles</h3>
                <p className="text-text-muted max-w-md mx-auto">Check back later for new storytelling competitions or submit your story to be featured!</p>
              </div>
              <button className="btn-primary py-3 px-8">Submit Story</button>
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard Section */}
      <div className="bg-card border border-border rounded-[48px] p-12 space-y-8 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Trophy className="w-8 h-8 text-gold" /> Hall of Fame
          </h2>
          <button className="text-xs font-bold text-accent hover:underline flex items-center gap-2">
            View All Time <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/5 rounded-3xl p-6 flex items-center gap-4 border border-border hover:border-gold/30 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold font-black text-xl">
                #{i}
              </div>
              <div>
                <p className="text-sm font-black text-white">Creator Name</p>
                <p className="text-[10px] text-text-muted uppercase tracking-widest">12 Battle Wins</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoryBattle;
