import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { updateProfile } from '../store/slices/authSlice';
import { 
  User, 
  Settings, 
  Shield, 
  Bell, 
  Globe, 
  Link as LinkIcon, 
  MapPin, 
  Twitter, 
  Instagram, 
  Github, 
  Linkedin,
  Camera,
  Check,
  X,
  AlertCircle,
  Trash2,
  Eye,
  CreditCard,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const EditProfile: React.FC = () => {
  const { user: currentUser, token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState<'public' | 'account' | 'security' | 'billing' | 'data'>('public');

  const checkUsernameAvailability = async (username: string) => {
    try {
      const response = await fetch(`/api/users/check-username?username=${username}`);
      const data = await response.json();
      return data.available;
    } catch (err) {
      return false;
    }
  };

  const deleteAccount = async () => {
    try {
      const response = await fetch('/api/user/account', { 
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        toast.success("Account deleted");
        navigate('/login');
      }
    } catch (err) {
      toast.error("Failed to delete account");
    }
  };

  const handleDownloadData = async () => {
    try {
      const response = await fetch('/api/user/data', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `neotoons-data-${currentUser?.username}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Data download started");
      }
    } catch (err) {
      toast.error("Failed to download data");
    }
  };

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);
  const [formData, setFormData] = useState<any>(null);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({ 
        ...currentUser,
        socialLinks: currentUser.socialLinks || {},
        notificationSettings: currentUser.notificationSettings || { email: true, push: true, marketing: false },
        privacySettings: currentUser.privacySettings || { profilePublic: true, showActivity: true }
      });
    }
  }, [currentUser]);

  if (!formData) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev: any) => ({
        ...prev,
        [parent]: {
          ...(prev[parent] || {}),
          [child]: value
        }
      }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    }

    if (name === 'username') {
      handleUsernameCheck(value);
    }
  };

  const handleUsernameCheck = async (username: string) => {
    if (username === currentUser?.username) {
      setUsernameAvailable(null);
      return;
    }
    if (username.length < 3) {
      setUsernameAvailable(false);
      return;
    }
    
    setIsCheckingUsername(true);
    const available = await checkUsernameAvailability(username);
    setUsernameAvailable(available);
    setIsCheckingUsername(false);
  };

  const handleToggleChange = (parent: string, child: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [parent]: {
        ...(prev[parent] || {}),
        [child]: !(prev[parent]?.[child] ?? false)
      }
    }));
  };

  const handleSave = async () => {
    try {
      // Validation
      if (formData.username.length < 3 || formData.username.length > 20) {
        toast.error("Username must be between 3 and 20 characters");
        return;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        toast.error("Username can only contain letters, numbers, and underscores");
        return;
      }

      await dispatch(updateProfile(formData) as any);
      toast.success("Profile updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    }
  };

  const getDaysUntilUsernameChange = () => {
    if (!currentUser?.lastUsernameChange) return 0;
    const lastChange = new Date(currentUser.lastUsernameChange);
    const now = new Date();
    const diffDays = Math.ceil((now.getTime() - lastChange.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, 7 - diffDays);
  };

  const daysLeft = getDaysUntilUsernameChange();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Edit Profile</h1>
          <p className="text-text-muted text-sm">Manage your public presence and account settings.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-border text-xs font-bold text-white hover:bg-white/10 transition-all"
          >
            <Eye className="w-4 h-4" /> Preview
          </button>
          <button 
            onClick={() => navigate(`/workspace/profile/${currentUser?.id}`)}
            className="px-4 py-2 rounded-xl bg-white/5 border border-border text-xs font-bold text-text-muted hover:text-white transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="btn-primary py-2 px-6 text-xs"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-border px-4">
        {[
          { id: 'public', label: 'Public Profile', icon: Globe },
          { id: 'account', label: 'Account Settings', icon: Settings },
          { id: 'billing', label: 'Billing & Plan', icon: CreditCard },
          { id: 'security', label: 'Security', icon: Shield },
          { id: 'data', label: 'Data & Privacy', icon: Shield }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative flex items-center gap-2 ${activeTab === tab.id ? 'text-accent' : 'text-text-muted hover:text-white'}`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {activeTab === tab.id && <motion.div layoutId="profile-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {activeTab === 'public' && (
          <div className="space-y-8">
            {/* Visuals */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">Visual Identity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Profile Photo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-3xl bg-white/5 border border-border overflow-hidden relative group">
                      <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      <button className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Camera className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex-1">
                      <input 
                        type="text" 
                        name="avatar"
                        value={formData.avatar || ''}
                        onChange={handleInputChange}
                        placeholder="Avatar URL"
                        className="w-full bg-card border border-border rounded-xl py-2.5 px-4 text-xs text-white focus:outline-hidden focus:border-accent"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Cover Photo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-20 rounded-3xl bg-white/5 border border-border overflow-hidden relative group">
                      <img src={formData.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
                      <button className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Camera className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex-1">
                      <input 
                        type="text" 
                        name="coverPhoto"
                        value={formData.coverPhoto || ''}
                        onChange={handleInputChange}
                        placeholder="Cover Photo URL"
                        className="w-full bg-card border border-border rounded-xl py-2.5 px-4 text-xs text-white focus:outline-hidden focus:border-accent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="bg-card border border-border rounded-[32px] p-8 space-y-6 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Display Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    className="w-full bg-bg border border-border rounded-xl py-3 px-4 text-sm text-white focus:outline-hidden focus:border-accent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Username</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      name="username"
                      value={formData.username || ''}
                      onChange={handleInputChange}
                      disabled={daysLeft > 0}
                      className={`w-full bg-bg border rounded-xl py-3 px-4 text-sm text-white focus:outline-hidden transition-all ${
                        daysLeft > 0 ? 'opacity-50 cursor-not-allowed border-border' :
                        usernameAvailable === true ? 'border-emerald-500/50' : 
                        usernameAvailable === false ? 'border-rose-500/50' : 'border-border'
                      }`}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      {isCheckingUsername && <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>}
                      {usernameAvailable === true && <Check className="w-4 h-4 text-emerald-500" />}
                      {usernameAvailable === false && <X className="w-4 h-4 text-rose-500" />}
                    </div>
                  </div>
                  {daysLeft > 0 ? (
                    <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest ml-1">
                      You can change your username again in {daysLeft} days.
                    </p>
                  ) : (
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest ml-1">
                      Only letters, numbers, and underscores. 3-20 chars.
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Bio</label>
                <textarea 
                  name="bio"
                  value={formData.bio || ''}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full bg-bg border border-border rounded-xl py-3 px-4 text-sm text-white focus:outline-hidden focus:border-accent resize-none"
                  placeholder="Tell the community about yourself..."
                />
              </div>
            </div>

            {/* Links & Location */}
            <div className="bg-card border border-border rounded-[32px] p-8 space-y-6 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">Links & Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Website</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input 
                      type="text" 
                      name="website"
                      value={formData.website || ''}
                      onChange={handleInputChange}
                      className="w-full bg-bg border border-border rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-hidden focus:border-accent"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input 
                      type="text" 
                      name="location"
                      value={formData.location || ''}
                      onChange={handleInputChange}
                      className="w-full bg-bg border border-border rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-hidden focus:border-accent"
                      placeholder="e.g. Tokyo, Japan"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Twitter Username</label>
                  <div className="relative">
                    <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input 
                      type="text" 
                      name="socialLinks.twitter"
                      value={formData.socialLinks?.twitter || ''}
                      onChange={handleInputChange}
                      className="w-full bg-bg border border-border rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-hidden focus:border-accent"
                      placeholder="username"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Instagram Username</label>
                  <div className="relative">
                    <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input 
                      type="text" 
                      name="socialLinks.instagram"
                      value={formData.socialLinks?.instagram || ''}
                      onChange={handleInputChange}
                      className="w-full bg-bg border border-border rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-hidden focus:border-accent"
                      placeholder="username"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'account' && (
          <div className="space-y-8">
            <div className="bg-card border border-border rounded-[32px] p-8 space-y-6 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">Account Details</h3>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  className="w-full bg-bg border border-border rounded-xl py-3 px-4 text-sm text-white focus:outline-hidden focus:border-accent"
                />
              </div>
            </div>

            <div className="bg-card border border-border rounded-[32px] p-8 space-y-6 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">Notifications</h3>
              <div className="space-y-4">
                {[
                  { id: 'email', label: 'Email Notifications', desc: 'Receive updates about your account via email.' },
                  { id: 'push', label: 'Push Notifications', desc: 'Get real-time alerts on your device.' },
                  { id: 'marketing', label: 'Marketing Emails', desc: 'Receive news about features and promotions.' }
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-bg border border-border">
                    <div>
                      <p className="text-sm font-bold text-white">{item.label}</p>
                      <p className="text-xs text-text-muted">{item.desc}</p>
                    </div>
                    <button 
                      onClick={() => handleToggleChange('notificationSettings', item.id)}
                      className={`w-12 h-6 rounded-full transition-all relative ${formData.notificationSettings[item.id] ? 'bg-accent' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.notificationSettings[item.id] ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-[32px] p-8 space-y-6 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">Privacy</h3>
              <div className="space-y-4">
                {[
                  { id: 'profilePublic', label: 'Public Profile', desc: 'Allow anyone to see your profile and stories.' },
                  { id: 'showActivity', label: 'Show Activity', desc: 'Let others see when you are online or active.' }
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-bg border border-border">
                    <div>
                      <p className="text-sm font-bold text-white">{item.label}</p>
                      <p className="text-xs text-text-muted">{item.desc}</p>
                    </div>
                    <button 
                      onClick={() => handleToggleChange('privacySettings', item.id)}
                      className={`w-12 h-6 rounded-full transition-all relative ${formData.privacySettings[item.id] ? 'bg-accent' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.privacySettings[item.id] ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 border border-rose-500/20 bg-rose-500/5 rounded-[32px] space-y-4">
              <h3 className="text-sm font-bold text-rose-500 uppercase tracking-widest">Danger Zone</h3>
              <p className="text-xs text-text-muted">Once you delete your account, there is no going back. Please be certain.</p>
              <button 
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete your account? This action is irreversible.")) {
                    deleteAccount();
                  }
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition-all"
              >
                <Trash2 className="w-4 h-4" /> Delete Account
              </button>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-8">
            <div className="bg-card border border-border rounded-[32px] p-8 space-y-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Current Plan</h3>
                <div className="px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-[10px] font-bold text-accent uppercase tracking-widest">
                  {currentUser?.plan} Plan
                </div>
              </div>
              
              <div className="p-6 rounded-2xl bg-white/5 border border-border flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">
                    {currentUser?.plan === 'studio' ? 'Studio Creator' : currentUser?.plan === 'pro' ? 'Pro Content' : 'Free Tier'}
                  </p>
                  <p className="text-xs text-text-muted">
                    {currentUser?.plan === 'studio' ? 'Unlimited generations & premium features' : 'Standard features with monthly limits'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-widest">Usage This Month</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-text-muted">Generations</span>
                    <span className="text-white">{currentUser?.generationCount} / {currentUser?.plan === 'studio' ? '∞' : '100'}</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent" 
                      style={{ width: `${Math.min((currentUser?.generationCount || 0) / (currentUser?.plan === 'studio' ? 1000 : 100) * 100, 100)}%` }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-[32px] p-8 space-y-6 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">Payment Methods</h3>
              <div className="p-4 rounded-xl border border-border bg-white/2 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-6 bg-white/10 rounded-md flex items-center justify-center text-[8px] font-bold text-white uppercase">Visa</div>
                  <div>
                    <p className="text-xs font-bold text-white">•••• •••• •••• 4242</p>
                    <p className="text-[10px] text-text-muted">Expires 12/28</p>
                  </div>
                </div>
                <button className="text-[10px] font-bold text-accent hover:underline">Edit</button>
              </div>
              <button className="text-xs font-bold text-text-muted hover:text-white transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Payment Method
              </button>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="bg-card border border-border rounded-[32px] p-8 space-y-6 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Change Password</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Current Password</label>
                <input 
                  type="password" 
                  className="w-full bg-bg border border-border rounded-xl py-3 px-4 text-sm text-white focus:outline-hidden focus:border-accent"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">New Password</label>
                  <input 
                    type="password" 
                    className="w-full bg-bg border border-border rounded-xl py-3 px-4 text-sm text-white focus:outline-hidden focus:border-accent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Confirm New Password</label>
                  <input 
                    type="password" 
                    className="w-full bg-bg border border-border rounded-xl py-3 px-4 text-sm text-white focus:outline-hidden focus:border-accent"
                  />
                </div>
              </div>
              <button className="btn-primary py-3 px-8 text-xs mt-4">Update Password</button>
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-8">
            <div className="bg-card border border-border rounded-[32px] p-8 space-y-6 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">Your Data</h3>
              <p className="text-xs text-text-muted">Download a copy of your information or manage how your data is used on the platform.</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-bg border border-border">
                  <div>
                    <p className="text-sm font-bold text-white">Download Your Information</p>
                    <p className="text-xs text-text-muted">Get a JSON file of your posts, stories, and profile data.</p>
                  </div>
                  <button 
                    onClick={handleDownloadData}
                    className="px-4 py-2 rounded-xl bg-accent/10 border border-accent/20 text-[10px] font-bold text-accent uppercase tracking-widest hover:bg-accent/20 transition-all"
                  >
                    Download
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-bg border border-border">
                  <div>
                    <p className="text-sm font-bold text-white">Ad Personalization</p>
                    <p className="text-xs text-text-muted">Allow us to use your activity to show you more relevant content.</p>
                  </div>
                  <button 
                    onClick={() => handleToggleChange('privacySettings', 'adPersonalization')}
                    className={`w-12 h-6 rounded-full transition-all relative ${formData.privacySettings.adPersonalization ? 'bg-accent' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.privacySettings.adPersonalization ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-8 border border-rose-500/20 bg-rose-500/5 rounded-[32px] space-y-4">
              <h3 className="text-sm font-bold text-rose-500 uppercase tracking-widest">Danger Zone</h3>
              <p className="text-xs text-text-muted">Once you delete your account, there is no going back. All your data will be permanently removed.</p>
              <button 
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete your account? This action is irreversible.")) {
                    deleteAccount();
                  }
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition-all"
              >
                <Trash2 className="w-4 h-4" /> Delete Account
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPreview(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-bg border border-border rounded-[40px] overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="h-32 bg-linear-to-r from-accent to-indigo-600 relative">
                {formData.coverPhoto && <img src={formData.coverPhoto} className="w-full h-full object-cover opacity-50" />}
                <button 
                  onClick={() => setShowPreview(false)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="px-8 pb-8 relative">
                <div className="w-24 h-24 rounded-3xl bg-card border-4 border-card shadow-xl overflow-hidden -mt-12 mb-4">
                  <img src={formData.avatar} className="w-full h-full object-cover" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-white">{formData.name}</h2>
                  <p className="text-sm text-accent font-bold">@{formData.username}</p>
                  <p className="text-sm text-text-muted">{formData.bio}</p>
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-6 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                  {formData.location && <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {formData.location}</div>}
                  {formData.website && <div className="flex items-center gap-1.5"><LinkIcon className="w-3 h-3" /> {formData.website}</div>}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EditProfile;
