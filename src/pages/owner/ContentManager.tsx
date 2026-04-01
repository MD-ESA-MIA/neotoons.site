import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Layout, Type, FileText, Save, RefreshCw, Image as ImageIcon, Globe } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { CMSContent } from '../../socialTypes';
import toast from 'react-hot-toast';

const ContentManager: React.FC = () => {
  const [content, setContent] = useState<CMSContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCMS();
  }, []);

  const fetchCMS = async () => {
    try {
      setLoading(true);
      const data = await adminService.getCMSContent();
      setContent(data);
    } catch (err) {
      toast.error('Failed to load CMS content');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;
    try {
      setSaving(true);
      const updated = await adminService.updateCMSContent(content);
      setContent(updated);
      toast.success('CMS content updated successfully');
    } catch (err) {
      toast.error('Failed to save CMS content');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Management (CMS)</h1>
          <p className="text-slate-400">Update landing page text, hero sections, and global content.</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={fetchCMS}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-6 text-indigo-400">
              <Layout className="w-5 h-5" />
              <h2 className="text-lg font-bold">Hero Section</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Hero Title</label>
                <input
                  type="text"
                  value={content?.heroTitle || ''}
                  onChange={(e) => setContent(prev => prev ? { ...prev, heroTitle: e.target.value } : null)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all text-lg font-bold"
                  placeholder="Main headline..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Hero Description</label>
                <textarea
                  value={content?.heroDescription || ''}
                  onChange={(e) => setContent(prev => prev ? { ...prev, heroDescription: e.target.value } : null)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all h-32 leading-relaxed"
                  placeholder="Sub-headline description..."
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800/50 border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-6 text-indigo-400">
              <FileText className="w-5 h-5" />
              <h2 className="text-lg font-bold">About Section</h2>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">About NEO TOONS</label>
              <textarea
                value={content?.aboutSection || ''}
                onChange={(e) => setContent(prev => prev ? { ...prev, aboutSection: e.target.value } : null)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all h-48 leading-relaxed"
                placeholder="Tell your story..."
              />
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-800/50 border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-6 text-indigo-400">
              <Globe className="w-5 h-5" />
              <h2 className="text-lg font-bold">Global Footer</h2>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Footer Copyright Text</label>
              <input
                type="text"
                value={content?.footerText || ''}
                onChange={(e) => setContent(prev => prev ? { ...prev, footerText: e.target.value } : null)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
                placeholder="© 2026..."
              />
            </div>
          </motion.div>

          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6">
            <h3 className="text-indigo-400 font-bold mb-2 flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Live Preview
            </h3>
            <p className="text-xs text-slate-400 mb-4">Changes applied here will be visible to all users instantly upon saving.</p>
            <div className="p-4 bg-slate-900 rounded-xl border border-white/5 space-y-4">
              <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse" />
              <div className="h-20 w-full bg-white/5 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentManager;
