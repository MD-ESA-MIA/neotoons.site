import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'motion/react';
import { Search, UserPlus, UserCheck, Shield, Award, MessageSquare } from 'lucide-react';
import { RootState } from '../store';
import { User } from '../socialTypes';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Members: React.FC = () => {
  const { token, user: currentUser } = useSelector((state: RootState) => state.auth);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchMembers = async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/users/members', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (error) {
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [token]);

  const handleFollow = async (userId: string) => {
    if (!token) return;
    try {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMembers(prev => prev.map(m => m.id === userId ? { ...m, followers: data.followers } : m));
        toast.success(data.message);
      }
    } catch (error) {
      toast.error('Action failed');
    }
  };

  const filteredMembers = members.filter(m => 
    m.username.toLowerCase().includes(search.toLowerCase()) ||
    m.displayName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Community Members</h1>
          <span className="text-sm text-white/40">{members.length} members total</span>
        </div>

        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-purple-500 transition-colors" />
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members by name or username..."
            className="w-full bg-[#1a1030] border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-purple-500/50 transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-[#1e1535] border border-white/10 rounded-xl p-4 flex gap-4 animate-pulse">
              <div className="w-12 h-12 bg-white/5 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/5 rounded w-1/2" />
                <div className="h-3 bg-white/5 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMembers.map((member) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#1e1535] border border-white/5 rounded-xl p-4 flex items-center justify-between hover:border-purple-500/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <Link to={`/workspace/profile/${member.id}`} className="relative">
                  <div className="w-14 h-14 rounded-full bg-purple-600/20 border border-purple-500/20 flex items-center justify-center text-xl font-bold text-white overflow-hidden">
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      member.displayName[0]
                    )}
                  </div>
                  {member.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#1e1535] rounded-full" />
                  )}
                </Link>
                <div>
                  <div className="flex items-center gap-1.5">
                    <Link to={`/workspace/profile/${member.id}`} className="font-bold text-white hover:text-purple-400 transition-colors">
                      {member.displayName}
                    </Link>
                    {member.role === 'admin' && <Shield className="w-3.5 h-3.5 text-rose-500" />}
                    {member.badge && <Award className="w-3.5 h-3.5 text-purple-500" />}
                  </div>
                  <p className="text-xs text-white/40">@{member.username}</p>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-white/30">
                    <span>{member.followers.length} followers</span>
                    <span>•</span>
                    <span>{member.following.length} following</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {currentUser?.id !== member.id && (
                  <>
                    <Link 
                      to={`/workspace/messages/${member.id}`}
                      className="p-2 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleFollow(member.id)}
                      className={`p-2 rounded-lg transition-all ${
                        member.followers.includes(currentUser?.id || '')
                          ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                          : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-600/20'
                      }`}
                    >
                      {member.followers.includes(currentUser?.id || '') ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filteredMembers.length === 0 && (
        <div className="text-center py-20 bg-[#1e1535] rounded-2xl border border-white/5">
          <p className="text-white/40">No members found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default Members;
