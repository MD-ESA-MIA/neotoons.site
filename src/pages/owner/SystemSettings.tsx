import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Globe, 
  Palette, 
  Mail, 
  Flag, 
  Save,
  Image as ImageIcon,
  Layout,
  Loader2,
  Cpu,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  CreditCard,
  Coins,
  History,
  Zap
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { SystemSettings as ISystemSettings, SystemChangeLog } from '../../socialTypes';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { io } from 'socket.io-client';

const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState<ISystemSettings | null>(null);
  const [changeLogs, setChangeLogs] = useState<SystemChangeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('General');
  const [showKey, setShowKey] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();

    // Socket listener for real-time updates
    const socket = io();
    socket.on('system_settings_updated', (updatedSettings: ISystemSettings) => {
      setSettings(updatedSettings);
      toast('System settings updated by another admin', { icon: '🔄' });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'Change Logs') {
      fetchChangeLogs();
    }
  }, [activeTab]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await adminService.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchChangeLogs = async () => {
    try {
      setLoadingLogs(true);
      const logs = await adminService.getChangeLogs();
      setChangeLogs(logs);
    } catch (error) {
      console.error('Error fetching change logs:', error);
      toast.error('Failed to load change logs');
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    try {
      setSaving(true);
      const updated = await adminService.updateSettings(settings);
      setSettings(updated);
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateGeneral = (field: keyof ISystemSettings['general'], value: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      general: {
        ...settings.general,
        [field]: value
      }
    });
  };

  const toggleFeature = (feature: keyof ISystemSettings['features']) => {
    if (!settings) return;
    setSettings({
      ...settings,
      features: {
        ...settings.features,
        [feature]: !settings.features[feature]
      }
    });
  };

  const safeFormatDate = (dateStr: string | undefined, formatStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return format(date, formatStr);
    } catch (e) {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-white tracking-tight">System Settings</h1>
          <p className="text-white/40">Configure global platform settings, branding, and feature flags.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Navigation Tabs (Vertical) */}
        <div className="space-y-2">
            { [
              { label: 'General', icon: Globe },
              { label: 'Branding', icon: Palette },
              { label: 'Monetization', icon: CreditCard },
              { label: 'Smart Routing', icon: Zap },
              { label: 'Email Service', icon: Mail },
              { label: 'Feature Flags', icon: Flag },
              { label: 'Layout & UI', icon: Layout },
              { label: 'Change Logs', icon: History },
            ].map((tab) => (
              <button 
                key={tab.label}
                onClick={() => setActiveTab(tab.label)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === tab.label ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Settings Form */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-[#0A0A0B] border border-white/5 p-8 rounded-3xl space-y-8">
              {activeTab === 'General' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-white">General Configuration</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Platform Name</label>
                      <input 
                        type="text" 
                        value={settings.general.siteName}
                        onChange={(e) => updateGeneral('siteName', e.target.value)}
                        className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Support Email</label>
                      <input 
                        type="email" 
                        value={settings.general.supportEmail}
                        onChange={(e) => updateGeneral('supportEmail', e.target.value)}
                        className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all" 
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Platform Domain</label>
                      <div className="flex gap-2">
                        <div className="flex-1 flex items-center bg-white/5 border border-white/5 rounded-xl px-4">
                          <span className="text-white/20 text-sm">https://</span>
                          <input 
                            type="text" 
                            value={settings.general.domain}
                            onChange={(e) => updateGeneral('domain', e.target.value)}
                            className="flex-1 bg-transparent border-none py-3 px-1 text-sm text-white focus:outline-none" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Branding' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-white">Branding & Assets</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Platform Logo URL</label>
                      <input 
                        type="text" 
                        value={settings.branding.logoUrl}
                        onChange={(e) => setSettings({...settings, branding: {...settings.branding, logoUrl: e.target.value}})}
                        className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all" 
                      />
                      <div className="w-full aspect-video bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center overflow-hidden">
                        {settings.branding.logoUrl ? (
                          <img src={settings.branding.logoUrl} alt="Logo Preview" className="max-h-full object-contain" />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-white/10" />
                        )}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Favicon URL</label>
                      <input 
                        type="text" 
                        value={settings.branding.faviconUrl}
                        onChange={(e) => setSettings({...settings, branding: {...settings.branding, faviconUrl: e.target.value}})}
                        className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all" 
                      />
                      <div className="w-full aspect-video bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center overflow-hidden">
                        {settings.branding.faviconUrl ? (
                          <img src={settings.branding.faviconUrl} alt="Favicon Preview" className="w-8 h-8 object-contain" />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-white/10" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {activeTab === 'Monetization' && settings.monetization && (
              <div className="space-y-8">
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-indigo-400" />
                    Stripe Pricing Configuration
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Pro Plan Price ID</label>
                      <input 
                        type="text" 
                        value={settings.monetization.stripePriceProMonthly}
                        onChange={(e) => setSettings({
                          ...settings, 
                          monetization: { ...settings.monetization!, stripePriceProMonthly: e.target.value }
                        })}
                        placeholder="price_..."
                        className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Studio Plan Price ID</label>
                      <input 
                        type="text" 
                        value={settings.monetization.stripePriceStudioMonthly}
                        onChange={(e) => setSettings({
                          ...settings, 
                          monetization: { ...settings.monetization!, stripePriceStudioMonthly: e.target.value }
                        })}
                        placeholder="price_..."
                        className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Premium Plan Price ID</label>
                      <input 
                        type="text" 
                        value={settings.monetization.stripePricePremiumMonthly}
                        onChange={(e) => setSettings({
                          ...settings, 
                          monetization: { ...settings.monetization!, stripePricePremiumMonthly: e.target.value }
                        })}
                        placeholder="price_..."
                        className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all" 
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Coins className="w-5 h-5 text-amber-400" />
                    Monthly Credit Allocation
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Free Plan Credits</label>
                      <input 
                        type="number" 
                        value={settings.monetization.freeCreditsPerMonth}
                        onChange={(e) => setSettings({
                          ...settings, 
                          monetization: { ...settings.monetization!, freeCreditsPerMonth: parseInt(e.target.value) }
                        })}
                        className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Pro Plan Credits</label>
                      <input 
                        type="number" 
                        value={settings.monetization.proCreditsPerMonth}
                        onChange={(e) => setSettings({
                          ...settings, 
                          monetization: { ...settings.monetization!, proCreditsPerMonth: parseInt(e.target.value) }
                        })}
                        className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Studio Plan Credits</label>
                      <input 
                        type="number" 
                        value={settings.monetization.studioCreditsPerMonth}
                        onChange={(e) => setSettings({
                          ...settings, 
                          monetization: { ...settings.monetization!, studioCreditsPerMonth: parseInt(e.target.value) }
                        })}
                        className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Premium Plan Credits</label>
                      <input 
                        type="number" 
                        value={settings.monetization.premiumCreditsPerMonth}
                        onChange={(e) => setSettings({
                          ...settings, 
                          monetization: { ...settings.monetization!, premiumCreditsPerMonth: parseInt(e.target.value) }
                        })}
                        className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Feature Flags' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white">Feature Flags</h3>
                <div className="space-y-4">
                  {[
                    { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Disable all platform features for maintenance.' },
                    { key: 'registrationEnabled', label: 'Public Registration', desc: 'Allow new users to sign up without an invite.' },
                    { key: 'aiGenerationEnabled', label: 'AI Generation', desc: 'Enable AI-powered content generation features.' },
                    { key: 'battleSystemEnabled', label: 'Battle System', desc: 'Enable the story battle and voting system.' },
                  ].map((flag) => (
                    <div key={flag.key} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-white">{flag.label}</p>
                        <p className="text-[10px] text-white/40 leading-relaxed">{flag.desc}</p>
                      </div>
                      <button 
                        onClick={() => toggleFeature(flag.key as keyof ISystemSettings['features'])}
                        className={`w-10 h-5 rounded-full relative transition-all ${settings.features[flag.key as keyof ISystemSettings['features']] ? 'bg-indigo-500' : 'bg-white/10'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${settings.features[flag.key as keyof ISystemSettings['features']] ? 'left-6' : 'left-1'}`}></div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'Smart Routing' && settings.smartRouting && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Smart Routing Rules
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white">Prefer Cheaper Models</p>
                      <p className="text-[10px] text-white/40 leading-relaxed">Always try to use the most cost-effective model first.</p>
                    </div>
                    <button 
                      onClick={() => setSettings({
                        ...settings,
                        smartRouting: { ...settings.smartRouting!, preferCheaperModels: !settings.smartRouting!.preferCheaperModels }
                      })}
                      className={`w-10 h-5 rounded-full relative transition-all ${settings.smartRouting.preferCheaperModels ? 'bg-indigo-500' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${settings.smartRouting.preferCheaperModels ? 'left-6' : 'left-1'}`}></div>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white">Fallback on Failure</p>
                      <p className="text-[10px] text-white/40 leading-relaxed">Automatically try another model if the primary one fails.</p>
                    </div>
                    <button 
                      onClick={() => setSettings({
                        ...settings,
                        smartRouting: { ...settings.smartRouting!, fallbackOnFailure: !settings.smartRouting!.fallbackOnFailure }
                      })}
                      className={`w-10 h-5 rounded-full relative transition-all ${settings.smartRouting.fallbackOnFailure ? 'bg-indigo-500' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${settings.smartRouting.fallbackOnFailure ? 'left-6' : 'left-1'}`}></div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Change Logs' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">System Change Logs</h3>
                  <button 
                    onClick={fetchChangeLogs}
                    disabled={loadingLogs}
                    className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-all"
                  >
                    <Loader2 className={`w-4 h-4 ${loadingLogs ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {changeLogs.length === 0 ? (
                    <div className="text-center py-12 text-white/20">
                      <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p>No changes logged yet.</p>
                    </div>
                  ) : (
                    changeLogs.map((log) => (
                      <div key={log.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold">
                              {log.adminName.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">{log.adminName}</p>
                              <p className="text-[10px] text-white/40">{safeFormatDate(log.timestamp, 'MMM d, yyyy HH:mm:ss')}</p>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 bg-white/5 text-white/40 text-[9px] font-bold rounded uppercase tracking-wider">
                            {log.action}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
                          <div className="space-y-1">
                            <p className="text-white/20 uppercase tracking-widest font-bold">Before</p>
                            <pre className="p-2 bg-black/40 rounded-lg text-rose-400/80 overflow-x-auto">
                              {JSON.stringify(log.before, null, 2)}
                            </pre>
                          </div>
                          <div className="space-y-1">
                            <p className="text-white/20 uppercase tracking-widest font-bold">After</p>
                            <pre className="p-2 bg-black/40 rounded-lg text-emerald-400/80 overflow-x-auto">
                              {JSON.stringify(log.after, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ))
                  ).reverse()}
                </div>
              </div>
            )}

            {(activeTab === 'Email Service' || activeTab === 'Layout & UI') && (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                  <Settings className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-white font-bold">Coming Soon</h4>
                  <p className="text-xs text-white/40">This configuration section is currently under development.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;

