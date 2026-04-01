import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, Globe, FileText, Save, RefreshCw, X, Eye, ExternalLink } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { CustomPage } from '../../socialTypes';
import toast from 'react-hot-toast';

const PageManager: React.FC = () => {
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<CustomPage | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CustomPage>>({
    title: '',
    slug: '',
    content: '',
    status: 'draft'
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const data = await adminService.getPages();
      setPages(data);
    } catch (err) {
      toast.error('Failed to load pages');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPage) {
        const updated = await adminService.updatePage(editingPage.id, formData);
        setPages(prev => prev.map(p => p.id === editingPage.id ? updated : p));
        toast.success('Page updated successfully');
      } else {
        const created = await adminService.createPage(formData);
        setPages(prev => [...prev, created]);
        toast.success('Page created successfully');
      }
      setIsModalOpen(false);
      setEditingPage(null);
      setFormData({ title: '', slug: '', content: '', status: 'draft' });
    } catch (err) {
      toast.error('Failed to save page');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminService.deletePage(id);
      setPages(prev => prev.filter(p => p.id !== id));
      toast.success('Page deleted successfully');
      setShowDeleteConfirm(null);
    } catch (err) {
      toast.error('Failed to delete page');
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
          <h1 className="text-2xl font-bold text-white">Custom Pages</h1>
          <p className="text-slate-400">Manage static pages like Privacy Policy, Terms, and custom content.</p>
        </div>
        <button
          onClick={() => {
            setEditingPage(null);
            setFormData({ title: '', slug: '', content: '', status: 'draft' });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create New Page
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map((page) => (
          <motion.div
            key={page.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800/50 border border-white/10 rounded-2xl p-6 hover:border-indigo-500/50 transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-500/10 rounded-xl">
                <FileText className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    setEditingPage(page);
                    setFormData(page);
                    setIsModalOpen(true);
                  }}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(page.id)}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/5 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">{page.title}</h3>
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
              <Globe className="w-4 h-4" />
              /{page.slug}
            </div>
            <div className="pt-6 border-t border-white/10 flex items-center justify-between">
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${page.status === 'published' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                {page.status}
              </span>
              <a
                href={`/p/${page.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Preview
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-white/10 rounded-2xl p-8 w-full max-w-2xl shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">{editingPage ? 'Edit Page' : 'Create New Page'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Page Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Slug (URL)</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Content (Markdown Support)</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 h-64 font-mono leading-relaxed"
                  required
                  placeholder="# Welcome to our page..."
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-slate-300">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
              >
                {editingPage ? 'Update Page' : 'Create Page'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl text-center"
            >
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mx-auto mb-6">
                <Trash2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Are you sure?</h2>
              <p className="text-slate-400 text-sm mb-8">
                This action will permanently remove this page. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-red-600/20"
                >
                  Delete Page
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PageManager;
