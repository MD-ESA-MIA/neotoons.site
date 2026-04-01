import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ToggleLeft, ToggleRight, Info, Save, RefreshCw } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Feature } from '../../socialTypes';
import toast from 'react-hot-toast';

const FeatureControl: React.FC = () => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const data = await adminService.getFeatures();
      setFeatures(data);
    } catch (err) {
      toast.error('Failed to load features');
    } finally {
      setLoading(false);
    }
  };

  const toggleFeature = async (id: string, currentStatus: boolean) => {
    try {
      setSaving(id);
      const updated = await adminService.updateFeature(id, { enabled: !currentStatus });
      setFeatures(prev => prev.map(f => f.id === id ? updated : f));
      toast.success(`${updated.name} ${updated.enabled ? 'enabled' : 'disabled'}`);
    } catch (err) {
      toast.error('Failed to update feature');
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const categories = Array.from(new Set(features.map(f => f.category || 'General')));

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Feature Management</h1>
          <p className="text-slate-400">Enable or disable system modules in real-time.</p>
        </div>
        <button 
          onClick={fetchFeatures}
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {categories.map(category => (
        <div key={category} className="space-y-4">
          <h2 className="text-lg font-semibold text-indigo-400 border-b border-white/10 pb-2">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.filter(f => (f.category || 'General') === category).map((feature) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 border border-white/10 rounded-xl p-5 hover:border-indigo-500/50 transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2 bg-indigo-500/10 rounded-lg">
                    <Info className="w-5 h-5 text-indigo-400" />
                  </div>
                  <button
                    onClick={() => toggleFeature(feature.id, feature.enabled)}
                    disabled={saving === feature.id}
                    className={`transition-colors ${saving === feature.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {feature.enabled ? (
                      <ToggleRight className="w-10 h-10 text-emerald-500" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-slate-500" />
                    )}
                  </button>
                </div>
                <h3 className="text-lg font-medium text-white mb-1">{feature.name}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${feature.enabled ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    {feature.enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeatureControl;
