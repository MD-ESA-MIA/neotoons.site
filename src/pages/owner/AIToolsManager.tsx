import React, { useMemo, useState, useEffect } from 'react';
import { 
  Zap, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Code,
  Cpu,
  Coins,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useConfig } from '../../context/ConfigContext';
import { pluginService, Plugin } from '../../services/appServices';
import { AIModel } from '../../types';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
] as const;

const CATEGORY_OPTIONS = ['Writing', 'Marketing', 'Social', 'Video', 'Image', 'Audio', 'Coding', 'Productivity'];

const getCategoryChipClass = (category?: string) => {
  const key = (category || '').toLowerCase();
  if (key.includes('writing') || key.includes('story')) return 'border-cyan-300/30 bg-cyan-500/15 text-cyan-100';
  if (key.includes('marketing') || key.includes('social')) return 'border-emerald-300/30 bg-emerald-500/15 text-emerald-100';
  if (key.includes('video') || key.includes('audio')) return 'border-amber-300/30 bg-amber-500/15 text-amber-100';
  if (key.includes('image') || key.includes('design')) return 'border-rose-300/30 bg-rose-500/15 text-rose-100';
  if (key.includes('coding') || key.includes('dev')) return 'border-violet-300/30 bg-violet-500/15 text-violet-100';
  return 'border-white/20 bg-white/5 text-white/70';
};

const AIToolsManager: React.FC = () => {
  const { plugins } = useConfig();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editingPlugin, setEditingPlugin] = useState<Plugin | null>(null);
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [formData, setFormData] = useState<Partial<Plugin>>({
    name: '',
    slug: '',
    description: '',
    category: 'Writing',
    ai_model: '',
    prompt_template: '',
    max_tokens: 1000,
    credits_cost: 5,
    status: 'active',
    icon: 'Zap'
  });

  const filteredPlugins = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return plugins;

    return plugins.filter((plugin) => {
      const name = plugin.name?.toLowerCase() || '';
      const description = plugin.description?.toLowerCase() || '';
      const category = plugin.category?.toLowerCase() || '';
      const slug = plugin.slug?.toLowerCase() || '';
      return name.includes(query) || description.includes(query) || category.includes(query) || slug.includes(query);
    });
  }, [plugins, searchQuery]);

  useEffect(() => {
    fetchActiveModels();
  }, []);

  const fetchActiveModels = async () => {
    try {
      const response = await fetch('/api/ai-models/active');
      if (response.ok) {
        const data = await response.json();
        setAvailableModels(data);
        if (data.length > 0 && !formData.ai_model) {
          setFormData(prev => ({ ...prev, ai_model: data[0].id }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch active models:", error);
      toast.error("Failed to load AI models");
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleEdit = (plugin: Plugin) => {
    setEditingPlugin(plugin);
    setFormData(plugin);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingPlugin(null);
  };

  const setFormStatus = (status: 'active' | 'draft' | 'archived') => {
    setFormData((prev) => ({ ...prev, status }));
  };

  const setFormCategory = (category: string) => {
    setFormData((prev) => ({ ...prev, category }));
  };

  const handleDelete = async (id: string) => {
    const success = await pluginService.delete(id);
    if (success) {
      toast.success('Tool deleted successfully');
      setShowDeleteConfirm(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ai_model) {
      toast.error("Please select an AI model");
      return;
    }

    const pluginData = {
      ...formData,
      id: editingPlugin?.id || Date.now().toString(),
    } as Plugin;

    const success = await pluginService.save(pluginData);
    if (success) {
      toast.success(editingPlugin ? 'Tool updated successfully' : 'Tool created successfully');
      setShowAddModal(false);
      setEditingPlugin(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        category: 'Writing',
        ai_model: availableModels[0]?.id || '',
        prompt_template: '',
        max_tokens: 1000,
        credits_cost: 5,
        status: 'active',
        icon: 'Zap'
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-white tracking-tight">AI Tools Manager</h1>
          <p className="text-white/40">Manage your AI tools system. Create, configure, and monitor AI tools dynamically.</p>
        </div>
        <button 
          onClick={() => {
            setEditingPlugin(null);
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" /> Create New Tool
        </button>
      </div>

      <div className="bg-[#0A0A0B] border border-white/5 rounded-3xl overflow-hidden">
        {/* Search & Filters */}
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search AI tools..." 
              className="w-full bg-white/5 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-white/20"
            />
          </div>
        </div>

        {/* Tools List */}
        <div className="divide-y divide-white/5">
          {filteredPlugins.map((plugin) => (
            <div key={plugin.id} className="p-6 flex items-center justify-between group hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white">{plugin.name}</h4>
                    <span className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest ${getCategoryChipClass(plugin.category)}`}>
                      {plugin.category}
                    </span>
                  </div>
                  <p className="text-xs text-white/40 mt-0.5">{plugin.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-[9px] text-white/20 font-bold uppercase tracking-widest">
                      <Cpu className="w-3 h-3" /> {availableModels.find((model) => model.id === plugin.ai_model)?.name || plugin.ai_model}
                    </span>
                    <span className="w-1 h-1 bg-white/10 rounded-full"></span>
                    <span className="flex items-center gap-1 text-[9px] text-white/20 font-bold uppercase tracking-widest">
                      <Coins className="w-3 h-3" /> {plugin.credits_cost} Credits
                    </span>
                    <span className="w-1 h-1 bg-white/10 rounded-full"></span>
                    <span className="flex items-center gap-1 text-[9px] text-white/20 font-bold uppercase tracking-widest">
                      <Code className="w-3 h-3" /> /{plugin.slug}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${plugin.status === 'active' || plugin.status === true ? 'bg-emerald-500/10 text-emerald-500' : 'bg-white/5 text-white/40'}`}>
                    {plugin.status === 'active' || plugin.status === true ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleEdit(plugin)}
                    className="p-2 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setShowDeleteConfirm(plugin.id)}
                    className="p-2 hover:bg-white/5 rounded-xl text-white/40 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredPlugins.length === 0 && (
            <div className="p-10 text-center">
              <p className="text-sm font-semibold text-white/70">No matching tools found</p>
              <p className="mt-1 text-xs text-white/40">Try another keyword or clear search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0A0A0B] border border-white/10 rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <h2 className="text-2xl font-bold text-white mb-1">{editingPlugin ? 'Edit AI Tool' : 'Create AI Tool'}</h2>
              <p className="mb-6 text-xs uppercase tracking-[0.2em] text-white/40">Define identity, behavior, and generation policy</p>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white/50">Basic Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Tool Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-indigo-500/50 transition-all" 
                      placeholder="e.g. Video Script Generator" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Slug (URL)</label>
                    <input 
                      type="text" 
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-indigo-500/50 transition-all" 
                      placeholder="video-script" 
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Description</label>
                    <textarea 
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-indigo-500/50 transition-all h-20" 
                      placeholder="Describe what this tool does..."
                    ></textarea>
                  </div>
                  </div>
                </div>

                <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white/50">AI Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest">AI Model</label>
                    <div className="min-h-11 rounded-xl border border-white/10 bg-black/20 p-2">
                      {isLoadingModels ? (
                        <p className="inline-flex items-center gap-2 text-xs text-white/50">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading models...
                        </p>
                      ) : availableModels.length === 0 ? (
                        <p className="text-xs text-white/40">No active models available.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {availableModels.map((model) => (
                            <button
                              key={model.id}
                              type="button"
                              onClick={() => setFormData({ ...formData, ai_model: model.id })}
                              className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                                formData.ai_model === model.id
                                  ? 'border-indigo-300/60 bg-indigo-500/20 text-indigo-100'
                                  : 'border-white/10 bg-white/5 text-white/60 hover:border-white/25 hover:text-white'
                              }`}
                            >
                              {model.name} ({model.provider})
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Category</label>
                    <div className="mb-2 flex flex-wrap gap-2">
                      {CATEGORY_OPTIONS.map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => setFormCategory(category)}
                          className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest transition ${
                            formData.category === category
                              ? 'border-indigo-300/60 bg-indigo-500/20 text-indigo-100'
                              : 'border-white/10 bg-white/5 text-white/60 hover:border-white/25 hover:text-white'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                    <input 
                      type="text" 
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-indigo-500/50 transition-all" 
                      placeholder="Writing, Design, etc." 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Status</label>
                    <div className="flex flex-wrap gap-2 rounded-xl border border-white/10 bg-black/20 p-2">
                      {STATUS_OPTIONS.map((statusOption) => (
                        <button
                          key={statusOption.value}
                          type="button"
                          onClick={() => setFormStatus(statusOption.value)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                            formData.status?.toString() === statusOption.value
                              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-700/30'
                              : 'text-white/60 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {statusOption.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Max Tokens</label>
                    <input 
                      type="number" 
                      value={formData.max_tokens}
                      onChange={(e) => setFormData({ ...formData, max_tokens: parseInt(e.target.value) })}
                      className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-indigo-500/50 transition-all" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Credits Cost</label>
                    <input 
                      type="number" 
                      value={formData.credits_cost}
                      onChange={(e) => setFormData({ ...formData, credits_cost: parseInt(e.target.value) })}
                      className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-indigo-500/50 transition-all" 
                    />
                  </div>
                  </div>
                </div>

                <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white/50">Prompt Behavior</h3>
                  <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Prompt Template</label>
                    <textarea 
                      required
                      value={formData.prompt_template}
                      onChange={(e) => setFormData({ ...formData, prompt_template: e.target.value })}
                      className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-sm font-mono focus:outline-none focus:border-indigo-500/50 transition-all h-32" 
                      placeholder="Use {topic} or {input} as placeholders..."
                    ></textarea>
                  </div>
                </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20"
                  >
                    {editingPlugin ? 'Update Tool' : 'Create Tool'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              className="relative w-full max-w-md bg-[#0A0A0B] border border-white/10 rounded-3xl p-8 shadow-2xl text-center"
            >
              <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto mb-6">
                <Trash2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Are you sure?</h2>
              <p className="text-white/40 text-sm mb-8">
                This action will permanently remove this AI tool. This action cannot be undone.
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
                  className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-rose-500/20"
                >
                  Delete Tool
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIToolsManager;
