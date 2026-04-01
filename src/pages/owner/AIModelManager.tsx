import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Activity, 
  Database, 
  Zap, 
  Shield, 
  Globe,
  Save,
  X,
  AlertTriangle,
  Play,
  Loader2,
  DollarSign,
  Coins
} from 'lucide-react';
import { AIModel, SystemSettings } from '../../socialTypes';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

const AIModelManager: React.FC = () => {
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<AIModel | null>(null);
  const [testingModelId, setTestingModelId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<AIModel>>({
    name: '',
    modelId: '',
    provider: 'google',
    apiKey: '',
    baseUrl: '',
    maxTokens: 4096,
    pricingPer1kTokens: 0,
    status: 'active',
    isFree: true,
    fallbackPriority: 1,
    type: 'fast',
    allowedPlans: ['free', 'pro', 'studio', 'premium']
  });

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const data = await adminService.getAIModels();
      setModels(data);
    } catch (error) {
      toast.error("Failed to fetch AI models");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (model?: AIModel) => {
    if (model) {
      setEditingModel(model);
      setFormData(model);
    } else {
      setEditingModel(null);
      setFormData({
        name: '',
        modelId: '',
        provider: 'google',
        apiKey: '',
        baseUrl: '',
        maxTokens: 4096,
        pricingPer1kTokens: 0,
        status: 'active',
        isFree: true,
        fallbackPriority: models.length + 1,
        type: 'fast',
        allowedPlans: ['free', 'pro', 'studio', 'premium']
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.modelId || !formData.apiKey) {
      toast.error("Please fill in all required fields (Name, Model ID, API Key).");
      return;
    }

    try {
      if (editingModel) {
        const updated = await adminService.updateAIModel(editingModel.id, formData);
        setModels(models.map(m => m.id === editingModel.id ? updated : m));
        toast.success("Model updated successfully!");
      } else {
        const created = await adminService.createAIModel(formData);
        setModels([...models, created]);
        toast.success("Model added successfully!");
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to save model.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this model? This will affect any tools using it.")) {
      try {
        await adminService.deleteAIModel(id);
        setModels(models.filter(m => m.id !== id));
        toast.success("Model deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete model.");
      }
    }
  };

  const toggleStatus = async (model: AIModel) => {
    const newStatus = model.status === 'active' ? 'inactive' : 'active';
    try {
      const updated = await adminService.updateAIModel(model.id, { status: newStatus });
      setModels(models.map(m => m.id === model.id ? updated : m));
      toast.success(`Model ${newStatus === 'active' ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleTestAPI = async (model: AIModel) => {
    setTestingModelId(model.id);
    try {
      const result = await adminService.testAIModel(model);
      if (result.success) {
        toast.success(`API Test Success! Response: ${result.response.substring(0, 50)}...`);
        fetchModels(); // Refresh to get updated health status
      } else {
        toast.error("API Test Failed");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "API Test Failed");
    } finally {
      setTestingModelId(null);
    }
  };

  const filteredModels = models.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.modelId.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => a.fallbackPriority - b.fallbackPriority);

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'degraded': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'down': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      default: return 'text-text-muted bg-white/5 border-border';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">AI Model Manager</h1>
          <p className="text-text-muted">Configure and prioritize AI models for the platform router.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn-primary py-3 px-6 flex items-center gap-2 self-start"
        >
          <Plus className="w-5 h-5" />
          Add New Model
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-text-muted uppercase tracking-widest">Active Models</span>
          </div>
          <p className="text-3xl font-black text-white">{models.filter(m => m.status === 'active').length}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-text-muted uppercase tracking-widest">Healthy</span>
          </div>
          <p className="text-3xl font-black text-white">{models.filter(m => m.healthStatus === 'healthy').length}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-text-muted uppercase tracking-widest">Total Models</span>
          </div>
          <p className="text-3xl font-black text-white">{models.length}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <Database className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-text-muted uppercase tracking-widest">Providers</span>
          </div>
          <p className="text-3xl font-black text-white">{new Set(models.map(m => m.provider)).size}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input 
            type="text"
            placeholder="Search models by name, provider or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card border border-border rounded-xl py-3 pl-12 pr-4 text-sm text-text-primary focus:border-accent outline-hidden"
          />
        </div>
      </div>

      {/* Models Table */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-border">
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Priority</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Model Name</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Provider</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Pricing (1k)</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Health</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredModels.map((model) => (
                <tr key={model.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-mono text-accent font-bold">#{model.fallbackPriority}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-white">{model.name}</span>
                      <span className="text-[10px] text-text-muted font-mono">{model.modelId}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-text-muted capitalize">{model.provider}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      {model.isFree ? (
                        <span className="text-emerald-500 text-xs font-bold">FREE</span>
                      ) : (
                        <span className="text-white text-xs font-bold">${model.pricingPer1kTokens}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-widest ${getHealthColor(model.healthStatus)}`}>
                      <Activity className="w-3 h-3" />
                      {model.healthStatus}
                      {model.failureCount > 0 && <span className="ml-1 opacity-60">({model.failureCount})</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleStatus(model)}
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                        model.status === 'active' 
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                      }`}
                    >
                      {model.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {model.status === 'active' ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleTestAPI(model)}
                        disabled={testingModelId === model.id}
                        className="p-2 rounded-lg hover:bg-accent/10 text-text-muted hover:text-accent transition-colors disabled:opacity-50"
                        title="Test API"
                      >
                        {testingModelId === model.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => handleOpenModal(model)}
                        className="p-2 rounded-lg hover:bg-white/10 text-text-muted hover:text-white transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(model.id)}
                        className="p-2 rounded-lg hover:bg-rose-500/10 text-text-muted hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredModels.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-text-muted italic">
                    No models found. Add some to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-3xl bg-card border border-border rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-white">{editingModel ? 'Edit AI Model' : 'Add New AI Model'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-xl text-text-muted">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Display Name</label>
                <input 
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. GPT-4o"
                  className="w-full bg-bg border border-border rounded-xl py-3 px-4 text-sm text-text-primary focus:border-accent outline-hidden"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Provider</label>
                <select 
                  value={formData.provider}
                  onChange={(e) => setFormData({...formData, provider: e.target.value as any})}
                  className="w-full bg-bg border border-border rounded-xl py-3 px-4 text-sm text-text-primary focus:border-accent outline-hidden"
                >
                  <option value="google">Google</option>
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="grok">Grok (xAI)</option>
                  <option value="groq">Groq</option>
                  <option value="openrouter">OpenRouter</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Model ID (Technical)</label>
                <input 
                  type="text"
                  value={formData.modelId}
                  onChange={(e) => setFormData({...formData, modelId: e.target.value})}
                  placeholder="e.g. gpt-4o or gemini-1.5-pro"
                  className="w-full bg-bg border border-border rounded-xl py-3 px-4 text-sm text-text-primary focus:border-accent outline-hidden"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Model Type</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                  className="w-full bg-bg border border-border rounded-xl py-3 px-4 text-sm text-text-primary focus:border-accent outline-hidden"
                >
                  <option value="fast">Fast (Cheap/Speed)</option>
                  <option value="smart">Smart (Reasoning/Logic)</option>
                  <option value="creative">Creative (Writing/Art)</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">API Key</label>
                <div className="relative">
                  <input 
                    type="password"
                    value={formData.apiKey}
                    onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
                    placeholder="sk-..."
                    className="w-full bg-bg border border-border rounded-xl py-3 px-4 text-sm text-text-primary focus:border-accent outline-hidden"
                  />
                  <Shield className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Base URL (Optional)</label>
                <input 
                  type="text"
                  value={formData.baseUrl}
                  onChange={(e) => setFormData({...formData, baseUrl: e.target.value})}
                  placeholder="https://api.openai.com/v1"
                  className="w-full bg-bg border border-border rounded-xl py-3 px-4 text-sm text-text-primary focus:border-accent outline-hidden"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 md:col-span-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Max Tokens</label>
                  <input 
                    type="number"
                    value={formData.maxTokens}
                    onChange={(e) => setFormData({...formData, maxTokens: parseInt(e.target.value)})}
                    className="w-full bg-bg border border-border rounded-xl py-3 px-4 text-sm text-text-primary focus:border-accent outline-hidden"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Pricing per 1k Tokens ($)</label>
                  <input 
                    type="number"
                    step="0.0001"
                    value={formData.pricingPer1kTokens}
                    onChange={(e) => setFormData({...formData, pricingPer1kTokens: parseFloat(e.target.value)})}
                    className="w-full bg-bg border border-border rounded-xl py-3 px-4 text-sm text-text-primary focus:border-accent outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 md:col-span-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Fallback Priority</label>
                  <input 
                    type="number"
                    value={formData.fallbackPriority}
                    onChange={(e) => setFormData({...formData, fallbackPriority: parseInt(e.target.value)})}
                    className="w-full bg-bg border border-border rounded-xl py-3 px-4 text-sm text-text-primary focus:border-accent outline-hidden"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Is Free Model?</label>
                  <select 
                    value={formData.isFree ? 'true' : 'false'}
                    onChange={(e) => setFormData({...formData, isFree: e.target.value === 'true'})}
                    className="w-full bg-bg border border-border rounded-xl py-3 px-4 text-sm text-text-primary focus:border-accent outline-hidden"
                  >
                    <option value="true">Yes (0 credits)</option>
                    <option value="false">No (Deducts credits)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Allowed Plans</label>
                <div className="flex flex-wrap gap-3 mt-2">
                  {['free', 'pro', 'studio', 'premium'].map(plan => (
                    <label key={plan} className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox"
                        checked={formData.allowedPlans?.includes(plan)}
                        onChange={(e) => {
                          const current = formData.allowedPlans || [];
                          const updated = e.target.checked 
                            ? [...current, plan]
                            : current.filter(p => p !== plan);
                          setFormData({...formData, allowedPlans: updated});
                        }}
                        className="hidden"
                      />
                      <div className={`px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all ${
                        formData.allowedPlans?.includes(plan)
                          ? 'bg-accent border-accent text-white shadow-lg shadow-accent/20'
                          : 'bg-white/5 border-border text-text-muted group-hover:border-white/20'
                      }`}>
                        {plan}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-10">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-4 rounded-2xl border border-border text-white font-bold hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="flex-1 py-4 rounded-2xl bg-accent text-white font-bold shadow-lg shadow-accent/20 hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save Model
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AIModelManager;
