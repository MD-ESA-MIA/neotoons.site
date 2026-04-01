import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'motion/react';
import { 
  User as UserIcon, 
  MapPin, 
  Link as LinkIcon, 
  Calendar, 
  MessageSquare, 
  UserPlus, 
  UserCheck,
  Settings,
  Grid,
  Heart,
  Bookmark,
  Shield,
  Award,
  ArrowLeft
} from 'lucide-react';
import { RootState } from '../store';
import { User, Post } from '../socialTypes';
import PostCard from '../components/Feed/PostCard';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { token, user: currentUser } = useSelector((state: RootState) => state.auth);
  const [profile, setProfile] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'liked' | 'saved'>('posts');

  const fetchProfile = async () => {
    if (!token || !userId) return;
    try {
      const response = await fetch(`/api/users/${userId}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      toast.error('Failed to load profile');
    }
  };

  const fetchUserPosts = async () => {
    if (!token || !userId) return;
    try {
      const response = await fetch(`/api/posts/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUserPosts(data);
      }
    } catch (error) {
      console.error('Failed to load user posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchProfile();
    fetchUserPosts();
  }, [userId, token]);

  const handleFollow = async () => {
    if (!token || !userId) return;
    try {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(prev => prev ? { ...prev, followers: data.followers } : null);
        toast.success(data.message);
      }
    } catch (error) {
      toast.error('Action failed');
    }
  };

  if (loading && !profile) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
        <div className="h-48 bg-white/5 rounded-3xl" />
        <div className="flex gap-6 px-8 -mt-12">
          <div className="w-32 h-32 rounded-full bg-white/10 border-4 border-[#0d0a1a]" />
          <div className="flex-1 pt-14 space-y-4">
            <div className="h-8 bg-white/5 rounded w-1/3" />
            <div className="h-4 bg-white/5 rounded w-1/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return <div className="text-center py-20 text-white/40">User not found</div>;

  const isOwnProfile = currentUser?.id === profile.id;
  const isFollowing = profile.followers.includes(currentUser?.id || '');

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Back Button */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/5 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        </button>
        <h2 className="text-xl font-bold text-white">Profile</h2>
      </div>

      {/* Profile Header */}
      <div className="bg-[#1e1535] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
        <div className="h-48 bg-gradient-to-br from-purple-900/40 to-indigo-900/40 relative">
          {profile.coverImage && (
            <img src={profile.coverImage} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          )}
        </div>
        
        <div className="px-8 pb-8">
          <div className="flex justify-between items-end -mt-16 mb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-purple-600/20 border-4 border-[#1e1535] flex items-center justify-center text-4xl font-bold text-white overflow-hidden shadow-2xl">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  profile.displayName[0]
                )}
              </div>
              {profile.isOnline && (
                <div className="absolute bottom-2 right-2 w-5 h-5 bg-emerald-500 border-4 border-[#1e1535] rounded-full" />
              )}
            </div>

            <div className="flex gap-3">
              {isOwnProfile ? (
                <button className="flex items-center gap-2 px-6 py-2.5 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10 transition-all border border-white/5">
                  <Settings className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <>
                  <Link 
                    to={`/workspace/messages/${profile.id}`}
                    className="flex items-center gap-2 px-6 py-2.5 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10 transition-all border border-white/5"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </Link>
                  <button 
                    onClick={handleFollow}
                    className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold transition-all shadow-lg ${
                      isFollowing 
                        ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' 
                        : 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-600/20'
                    }`}
                  >
                    {isFollowing ? <><UserCheck className="w-4 h-4" /> Following</> : <><UserPlus className="w-4 h-4" /> Follow</>}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-white">{profile.displayName}</h1>
                {profile.role === 'admin' && <Shield className="w-5 h-5 text-rose-500" />}
                {profile.role === 'owner' && <Shield className="w-5 h-5 text-accent" />}
                {profile.badge && <Award className="w-5 h-5 text-purple-500" />}
              </div>
              <p className="text-white/40 font-medium">@{profile.username}</p>
            </div>

            <p className="text-white/70 max-w-2xl leading-relaxed">
              {profile.bio || "No bio yet. This storyteller is busy crafting their next masterpiece."}
            </p>

            <div className="flex flex-wrap gap-6 text-sm text-white/40">
              {profile.location && (
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {profile.location}</span>
              )}
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-purple-400 hover:underline">
                  <LinkIcon className="w-4 h-4" /> {profile.website.replace(/^https?:\/\//, '')}
                </a>
              )}
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Joined {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
            </div>

            <div className="flex gap-8 pt-4 border-t border-white/5">
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white">{profile.followers.length}</span>
                <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Followers</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white">{profile.following.length}</span>
                <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Following</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white">{userPosts.length}</span>
                <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Stories</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="space-y-6">
        <div className="flex border-b border-white/5">
          <button 
            onClick={() => setActiveTab('posts')}
            className={`px-6 py-4 text-sm font-bold transition-all relative ${activeTab === 'posts' ? 'text-purple-500' : 'text-white/40 hover:text-white'}`}
          >
            <div className="flex items-center gap-2">
              <Grid className="w-4 h-4" />
              Stories
            </div>
            {activeTab === 'posts' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />}
          </button>
          <button 
            onClick={() => setActiveTab('liked')}
            className={`px-6 py-4 text-sm font-bold transition-all relative ${activeTab === 'liked' ? 'text-purple-500' : 'text-white/40 hover:text-white'}`}
          >
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Liked
            </div>
            {activeTab === 'liked' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />}
          </button>
          <button 
            onClick={() => setActiveTab('saved')}
            className={`px-6 py-4 text-sm font-bold transition-all relative ${activeTab === 'saved' ? 'text-purple-500' : 'text-white/40 hover:text-white'}`}
          >
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4" />
              Saved
            </div>
            {activeTab === 'saved' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />}
          </button>
        </div>

        <div className="space-y-6">
          {activeTab === 'posts' && (
            userPosts.length > 0 ? (
              userPosts.map(post => <PostCard key={post.id} post={post} />)
            ) : (
              <div className="text-center py-20 bg-[#1e1535] rounded-3xl border border-white/5 space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                  <Grid className="w-8 h-8 text-white/10" />
                </div>
                <p className="text-white/40">No stories shared yet.</p>
              </div>
            )
          )}
          {activeTab !== 'posts' && (
            <div className="text-center py-20 bg-[#1e1535] rounded-3xl border border-white/5 space-y-4">
              <p className="text-white/40">This section is private or empty.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
