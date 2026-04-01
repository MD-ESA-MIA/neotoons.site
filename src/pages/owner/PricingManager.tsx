import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, Check, X, CreditCard, DollarSign, Users, Zap, RefreshCw } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { PricingPlan } from '../../socialTypes';
import toast from 'react-hot-toast';

const PricingManager: React.FC = () => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<PricingPlan>>({
    name: '',
    price: '',
    interval: 'month',
    features: [],
    status: true,
    credits: 0
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await adminService.getPricingPlans();
      setPlans(data);
    } catch (err) {
      toast.error('Failed to load pricing plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        const updated = await adminService.updatePricingPlan(editingPlan.id, formData);
        setPlans(prev => prev.map(p => p.id === editingPlan.id ? updated : p));
        toast.success('Plan updated successfully');
      } else {
        const created = await adminService.createPricingPlan(formData);
        setPlans(prev => [...prev, created]);
        toast.success('Plan created successfully');
      }
      setIsModalOpen(false);
      setEditingPlan(null);
      setFormData({ name: '', price: '', interval: 'month', features: [], status: true, credits: 0 });
    } catch (err) {
      toast.error('Failed to save plan');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminService.deletePricingPlan(id);
      setPlans(prev => prev.filter(p => p.id !== id));
      toast.success('Plan deleted successfully');
      setShowDeleteConfirm(null);
    } catch (err) {
      toast.error('Failed to delete plan');
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
          <h1 className="text-2xl font-bold text-white">Pricing & Monetization</h1>
          <p className="text-slate-400">Manage subscription plans and credit systems.</p>
        </div>
        <button
          onClick={() => {
            setEditingPlan(null);
            setFormData({ name: '', price: '', interval: 'month', features: [], status: true, credits: 0 });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-slate-800/50 border ${plan.isPopular ? 'border-indigo-500' : 'border-white/10'} rounded-2xl p-6 relative overflow-hidden`}
          >
            {plan.isPopular && (
              <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold uppercase px-3 py-1 rounded-bl-lg">
                Popular
              </div>
            )}
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-500/10 rounded-xl">
                <Zap className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingPlan(plan);
                    setFormData(plan);
                    setIsModalOpen(true);
                  }}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(plan.id)}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/5 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold text-white">${plan.price}</span>
              <span className="text-slate-400 text-sm">/{plan.interval}</span>
            </div>
            <div className="space-y-3 mb-6">
              {plan.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                  <Check className="w-4 h-4 text-emerald-500" />
                  {feature}
                </div>
              ))}
            </div>
            <div className="pt-6 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <CreditCard className="w-4 h-4" />
                {plan.credits} Credits
              </div>
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${plan.status ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                {plan.status ? 'Active' : 'Inactive'}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-white/10 rounded-2xl p-8 w-full max-w-lg shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">{editingPlan ? 'Edit Pricing Plan' : 'Create New Plan'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Plan Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Price ($)</label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Interval</label>
                  <select
                    value={formData.interval}
                    onChange={(e) => setFormData({ ...formData, interval: e.target.value as any })}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="month">Monthly</option>
                    <option value="year">Yearly</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Credits</label>
                  <input
                    type="number"
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Features (comma separated)</label>
                <textarea
                  value={formData.features?.join(', ')}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value.split(',').map(f => f.trim()) })}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 h-24"
                  required
                />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                    className="w-4 h-4 rounded border-white/10 bg-slate-800 text-indigo-500"
                  />
                  <span className="text-sm text-slate-300">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                    className="w-4 h-4 rounded border-white/10 bg-slate-800 text-indigo-500"
                  />
                  <span className="text-sm text-slate-300">Popular Plan</span>
                </label>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
              >
                {editingPlan ? 'Update Plan' : 'Create Plan'}
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
                This action will permanently remove this pricing plan. This action cannot be undone.
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
                  Delete Plan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PricingManager;
