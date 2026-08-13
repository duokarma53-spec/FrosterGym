import { useState, useEffect } from 'react';
import { Search, Plus, Apple, Loader2, X, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database.types';

type DietPlanRow = Database['public']['Tables']['diet_plans']['Row'];

export function DietPlans() {
  const { gym } = useAuth();
  const [plans, setPlans] = useState<DietPlanRow[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    breakfast: '',
    mid_morning: '',
    lunch: '',
    evening: '',
    dinner: '',
    notes: ''
  });

  useEffect(() => {
    if (gym) loadPlans();
  }, [gym]);

  async function loadPlans() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('diet_plans')
        .select('*')
        .eq('gym_id', gym!.id)
        .order('name');
      
      if (error) throw error;
      setPlans(data as DietPlanRow[]);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gym) return;
    setIsSaving(true);
    
    try {
      const { error } = await supabase.from('diet_plans').insert({
        gym_id: gym.id,
        name: formData.name,
        description: formData.description || null,
        breakfast: formData.breakfast || null,
        mid_morning: formData.mid_morning || null,
        lunch: formData.lunch || null,
        evening: formData.evening || null,
        dinner: formData.dinner || null,
        notes: formData.notes || null,
      });

      if (error) throw error;
      
      setShowModal(false);
      setFormData({ name: '', description: '', breakfast: '', mid_morning: '', lunch: '', evening: '', dinner: '', notes: '' });
      await loadPlans();
    } catch (err: any) {
      alert(err.message || 'Failed to save diet plan');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredPlans = plans.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Diet Plans</h1>
          <p className="text-sm text-gray-400 mt-1">Create and manage meal plans for members.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Diet Plan
        </button>
      </div>

      <div className="bg-surface border border-surface-highlight rounded-xl p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search diet plans..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-surface-highlight rounded-lg text-white focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-surface-highlight rounded-lg">
            <Apple className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No diet plans found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredPlans.map(plan => (
              <div key={plan.id} className="bg-background border border-surface-highlight rounded-xl p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-white leading-tight">{plan.name}</h3>
                </div>
                {plan.description && <p className="text-sm text-gray-400 mb-4">{plan.description}</p>}
                
                <div className="space-y-3 text-sm">
                  {plan.breakfast && (
                    <div className="bg-surface p-2.5 rounded border border-surface-highlight">
                      <span className="text-xs text-green-500 font-bold uppercase block mb-1">Breakfast</span>
                      <span className="text-gray-300">{plan.breakfast}</span>
                    </div>
                  )}
                  {plan.lunch && (
                    <div className="bg-surface p-2.5 rounded border border-surface-highlight">
                      <span className="text-xs text-green-500 font-bold uppercase block mb-1">Lunch</span>
                      <span className="text-gray-300">{plan.lunch}</span>
                    </div>
                  )}
                  {plan.dinner && (
                    <div className="bg-surface p-2.5 rounded border border-surface-highlight">
                      <span className="text-xs text-green-500 font-bold uppercase block mb-1">Dinner</span>
                      <span className="text-gray-300">{plan.dinner}</span>
                    </div>
                  )}
                  {(plan.mid_morning || plan.evening) && (
                    <div className="flex items-center gap-2 text-gray-500 pt-2 text-xs">
                      <FileText className="w-4 h-4" /> Contains Snacks
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-xl w-full max-w-2xl border border-surface-highlight overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-surface-highlight shrink-0">
              <h2 className="text-xl font-bold text-white">Create Diet Plan</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Plan Name *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-white focus:border-amber-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-white focus:border-amber-500 outline-none" />
              </div>

              <div className="pt-4 pb-2 border-b border-surface-highlight">
                <h3 className="text-sm font-bold text-amber-500 uppercase">Meals</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Breakfast</label>
                  <textarea rows={2} value={formData.breakfast} onChange={e => setFormData({...formData, breakfast: e.target.value})} className="w-full bg-background border border-surface-highlight rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Mid-Morning Snack</label>
                  <textarea rows={2} value={formData.mid_morning} onChange={e => setFormData({...formData, mid_morning: e.target.value})} className="w-full bg-background border border-surface-highlight rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Lunch</label>
                  <textarea rows={2} value={formData.lunch} onChange={e => setFormData({...formData, lunch: e.target.value})} className="w-full bg-background border border-surface-highlight rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Evening Snack</label>
                  <textarea rows={2} value={formData.evening} onChange={e => setFormData({...formData, evening: e.target.value})} className="w-full bg-background border border-surface-highlight rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Dinner</label>
                  <textarea rows={2} value={formData.dinner} onChange={e => setFormData({...formData, dinner: e.target.value})} className="w-full bg-background border border-surface-highlight rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 outline-none" />
                </div>
              </div>

              <div className="pt-4 border-t border-surface-highlight">
                <label className="block text-sm font-medium text-gray-300 mb-1">Additional Notes</label>
                <textarea rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-background border border-surface-highlight rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 outline-none" />
              </div>

              <div className="flex space-x-3 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 bg-background text-gray-300 rounded-lg border border-surface-highlight hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={isSaving} className="flex-1 flex justify-center items-center px-4 py-2.5 bg-amber-500 text-black rounded-lg hover:bg-amber-400 font-bold disabled:opacity-50">
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Diet Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
