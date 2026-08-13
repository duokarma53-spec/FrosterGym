import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2, Plus, Edit2, Archive, ArchiveRestore } from 'lucide-react';
import type { Database } from '../../types/database.types';

type MembershipPlan = Database['public']['Tables']['membership_plans']['Row'];

export function MembershipPlans() {
  const { gym } = useAuth();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    duration_months: 1,
    duration_days: 0,
    price: 0,
    description: '',
    pt_included: false,
    diet_included: false,
  });

  const fetchPlans = async () => {
    if (!gym) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('membership_plans')
        .select('*')
        .eq('gym_id', gym.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlans(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load membership plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [gym]);

  const handleOpenForm = (plan?: MembershipPlan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        duration_months: plan.duration_months,
        duration_days: plan.duration_days,
        price: plan.price,
        description: plan.description || '',
        pt_included: plan.pt_included || false,
        diet_included: plan.diet_included || false,
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: '',
        duration_months: 1,
        duration_days: 0,
        price: 0,
        description: '',
        pt_included: false,
        diet_included: false,
      });
    }
    setFormError(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPlan(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gym) return;
    setIsSubmitting(true);
    setFormError(null);

    try {
      if (editingPlan) {
        const { error } = await supabase
          .from('membership_plans')
          .update({
            name: formData.name,
            duration_months: formData.duration_months,
            duration_days: formData.duration_days,
            price: formData.price,
            description: formData.description,
            pt_included: formData.pt_included,
            diet_included: formData.diet_included,
          })
          .eq('id', editingPlan.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('membership_plans')
          .insert({
            gym_id: gym.id,
            name: formData.name,
            duration_months: formData.duration_months,
            duration_days: formData.duration_days,
            price: formData.price,
            description: formData.description,
            pt_included: formData.pt_included,
            diet_included: formData.diet_included,
            status: 'active',
          });
        if (error) throw error;
      }
      
      await fetchPlans();
      handleCloseForm();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (plan: MembershipPlan) => {
    try {
      const newStatus = plan.status === 'active' ? 'inactive' : 'active';
      const { error } = await supabase
        .from('membership_plans')
        .update({ status: newStatus })
        .eq('id', plan.id);
      
      if (error) throw error;
      await fetchPlans();
    } catch (err: any) {
      alert(err.message || 'Failed to update plan status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
        <p className="text-red-400">{error}</p>
        <button onClick={fetchPlans} className="mt-4 text-sm text-white underline hover:text-gray-300">Try Again</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Membership Plans</h1>
          <p className="text-sm text-gray-400 mt-1">Manage the plans available to your members.</p>
        </div>
        <button 
          onClick={() => handleOpenForm()}
          className="bg-primary-500 hover:bg-primary-600 text-black font-semibold rounded-lg px-4 py-2 flex items-center justify-center gap-2 transition-colors w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          Add Plan
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-surface-highlight rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-surface-highlight flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">{editingPlan ? 'Edit Plan' : 'Create New Plan'}</h2>
              <button onClick={handleCloseForm} className="text-gray-400 hover:text-white">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-400">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Plan Name *</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" 
                  placeholder="e.g. Standard 3 Months"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Duration (Months) *</label>
                  <input 
                    required
                    type="number" 
                    min="0"
                    value={formData.duration_months}
                    onChange={(e) => setFormData({...formData, duration_months: parseInt(e.target.value) || 0})}
                    className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Duration (Days) *</label>
                  <input 
                    required
                    type="number" 
                    min="0"
                    value={formData.duration_days}
                    onChange={(e) => setFormData({...formData, duration_days: parseInt(e.target.value) || 0})}
                    className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Price (₹) *</label>
                <input 
                  required
                  type="number" 
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                  className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 min-h-[80px]" 
                  placeholder="Details about this plan..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <label className="flex items-center gap-3 p-3 border border-surface-highlight rounded-lg cursor-pointer hover:bg-surface-highlight transition-colors">
                  <input 
                    type="checkbox"
                    checked={formData.pt_included}
                    onChange={(e) => setFormData({...formData, pt_included: e.target.checked})}
                    className="w-4 h-4 rounded border-gray-600 text-amber-500 focus:ring-amber-500 bg-background"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">PT Included</span>
                    <span className="text-xs text-gray-400">Personal Training</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-surface-highlight rounded-lg cursor-pointer hover:bg-surface-highlight transition-colors">
                  <input 
                    type="checkbox"
                    checked={formData.diet_included}
                    onChange={(e) => setFormData({...formData, diet_included: e.target.checked})}
                    className="w-4 h-4 rounded border-gray-600 text-green-500 focus:ring-green-500 bg-background"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">Diet Plan Included</span>
                    <span className="text-xs text-gray-400">Nutrition Plan</span>
                  </div>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={handleCloseForm}
                  className="px-4 py-2 text-gray-400 hover:text-white font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-primary-500 hover:bg-primary-600 text-black font-semibold rounded-lg px-6 py-2 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingPlan ? 'Update Plan' : 'Save Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {plans.length === 0 ? (
        <div className="bg-surface border border-surface-highlight rounded-xl p-12 text-center">
          <p className="text-gray-400 mb-4">No membership plans found.</p>
          <button 
            onClick={() => handleOpenForm()}
            className="text-primary-400 hover:text-primary-300 underline font-medium"
          >
            Create your first plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {plans.map(plan => (
            <div key={plan.id} className={`bg-surface border ${plan.status === 'active' ? 'border-surface-highlight' : 'border-red-900/50 opacity-75'} rounded-xl p-5 flex flex-col`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {plan.duration_months} Months {plan.duration_days > 0 ? `+ ${plan.duration_days} Days` : ''}
                  </p>
                  <div className="flex gap-2 mt-2">
                    {plan.pt_included && (
                      <span className="text-[10px] font-bold uppercase bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded">PT</span>
                    )}
                    {plan.diet_included && (
                      <span className="text-[10px] font-bold uppercase bg-green-500/10 text-green-500 px-2 py-0.5 rounded">Diet</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-primary-400">₹{plan.price}</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-500 flex-1 line-clamp-2 mb-4">
                {plan.description || 'No description provided.'}
              </p>

              <div className="pt-4 border-t border-surface-highlight flex justify-between items-center">
                <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${plan.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {plan.status.toUpperCase()}
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleOpenForm(plan)}
                    className="p-1.5 text-gray-400 hover:text-white bg-background rounded transition-colors"
                    title="Edit Plan"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleToggleStatus(plan)}
                    className="p-1.5 text-gray-400 hover:text-white bg-background rounded transition-colors"
                    title={plan.status === 'active' ? "Deactivate Plan" : "Activate Plan"}
                  >
                    {plan.status === 'active' ? <Archive className="w-4 h-4" /> : <ArchiveRestore className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
