import { useState, useEffect } from 'react';
import { Search, Plus, Dumbbell, UserSquare2, Phone, Mail, BadgeCheck, Loader2, X, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database.types';

type TrainerRow = Database['public']['Tables']['trainers']['Row'];
type PTPlanRow = Database['public']['Tables']['pt_plans']['Row'];

export function PT() {
  const { gym } = useAuth();
  const [activeTab, setActiveTab] = useState<'trainers' | 'plans'>('trainers');
  const [search, setSearch] = useState('');
  
  // Data
  const [trainers, setTrainers] = useState<TrainerRow[]>([]);
  const [plans, setPlans] = useState<PTPlanRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [showTrainerModal, setShowTrainerModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Forms
  const [trainerForm, setTrainerForm] = useState({ name: '', phone: '', email: '', specialization: '', status: 'active', photo_url: '' });
  const [planForm, setPlanForm] = useState({ name: '', duration_months: 1, duration_days: 0, price: '', description: '', status: 'active' });

  useEffect(() => {
    if (gym) loadData();
  }, [gym]);

  async function loadData() {
    setIsLoading(true);
    try {
      const [trainersRes, plansRes] = await Promise.all([
        supabase.from('trainers').select('*').eq('gym_id', gym!.id).order('name'),
        supabase.from('pt_plans').select('*').eq('gym_id', gym!.id).order('name')
      ]);

      if (trainersRes.error) throw trainersRes.error;
      if (plansRes.error) throw plansRes.error;

      setTrainers(trainersRes.data as TrainerRow[]);
      setPlans(plansRes.data as PTPlanRow[]);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setTrainerForm({ ...trainerForm, photo_url: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleSaveTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gym) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from('trainers').insert({
        gym_id: gym.id,
        name: trainerForm.name,
        phone: trainerForm.phone || null,
        email: trainerForm.email || null,
        specialization: trainerForm.specialization || null,
        photo_url: trainerForm.photo_url || null,
        status: trainerForm.status
      } as any);

      if (error) throw error;
      setShowTrainerModal(false);
      setTrainerForm({ name: '', phone: '', email: '', specialization: '', status: 'active', photo_url: '' });
      await loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gym) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from('pt_plans').insert({
        gym_id: gym.id,
        name: planForm.name,
        duration_months: Number(planForm.duration_months),
        duration_days: Number(planForm.duration_days),
        price: Number(planForm.price),
        description: planForm.description || null,
        status: planForm.status
      } as any);

      if (error) throw error;
      setShowPlanModal(false);
      setPlanForm({ name: '', duration_months: 1, duration_days: 0, price: '', description: '', status: 'active' });
      await loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredTrainers = trainers.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));
  const filteredPlans = plans.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Personal Training</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your trainers and PT packages.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowPlanModal(true)} className="px-4 py-2 bg-surface text-white border border-surface-highlight font-medium rounded-lg hover:bg-surface-highlight transition-colors flex items-center gap-2">
            <Plus className="w-5 h-5" /> New Plan
          </button>
          <button onClick={() => setShowTrainerModal(true)} className="px-4 py-2 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400 transition-colors flex items-center gap-2">
            <Plus className="w-5 h-5" /> Add Trainer
          </button>
        </div>
      </div>

      <div className="flex border-b border-surface-highlight">
        <button
          onClick={() => setActiveTab('trainers')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'trainers' ? 'border-amber-500 text-amber-500' : 'border-transparent text-gray-400 hover:text-white'}`}
        >
          TRAINERS
        </button>
        <button
          onClick={() => setActiveTab('plans')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'plans' ? 'border-amber-500 text-amber-500' : 'border-transparent text-gray-400 hover:text-white'}`}
        >
          PT PLANS
        </button>
      </div>

      <div className="bg-surface border border-surface-highlight rounded-xl p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-surface-highlight rounded-lg text-white focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        ) : activeTab === 'trainers' ? (
          filteredTrainers.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-surface-highlight rounded-lg">
              <UserSquare2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No trainers found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTrainers.map(t => (
                <div key={t.id} className="bg-background border border-surface-highlight rounded-xl p-5">
                  <div className="flex items-center gap-4 mb-4">
                    {t.photo_url ? (
                      <img src={t.photo_url} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-surface-highlight" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-surface-highlight flex items-center justify-center text-xl font-bold text-gray-400">
                        {t.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-white leading-tight">{t.name}</h3>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${t.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {t.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-400">
                    {t.specialization && (
                      <div className="flex items-center gap-2">
                        <BadgeCheck className="w-4 h-4 text-amber-500" />
                        <span className="text-gray-300">{t.specialization}</span>
                      </div>
                    )}
                    {t.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {t.phone}</div>}
                    {t.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> {t.email}</div>}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          filteredPlans.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-surface-highlight rounded-lg">
              <Dumbbell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No PT plans found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlans.map(p => (
                <div key={p.id} className="bg-background border border-surface-highlight rounded-xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-white">{p.name}</h3>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${p.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-400'}`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-white mb-4">₹{p.price}</div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                    <div><span className="text-gray-500">Duration:</span> {p.duration_months}m {p.duration_days}d</div>
                  </div>
                  {p.description && <p className="text-sm text-gray-500">{p.description}</p>}
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Trainer Modal */}
      {showTrainerModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-xl w-full max-w-lg border border-surface-highlight overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-surface-highlight">
              <h2 className="text-xl font-bold text-white">Add Trainer</h2>
              <button onClick={() => setShowTrainerModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSaveTrainer} className="p-6 space-y-4">
              <div className="flex justify-center mb-6">
                <label className="relative cursor-pointer group">
                  <div className="w-24 h-24 rounded-full bg-background border-2 border-dashed border-surface-highlight flex flex-col items-center justify-center overflow-hidden">
                    {trainerForm.photo_url ? (
                      <img src={trainerForm.photo_url} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-gray-500 group-hover:text-amber-500 transition-colors" />
                        <span className="text-[10px] text-gray-500 mt-1">Upload Photo</span>
                      </>
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Trainer Name *</label>
                  <input required type="text" value={trainerForm.name} onChange={e => setTrainerForm({...trainerForm, name: e.target.value})} className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-white focus:border-amber-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                  <input type="tel" value={trainerForm.phone} onChange={e => setTrainerForm({...trainerForm, phone: e.target.value})} className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-white focus:border-amber-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <input type="email" value={trainerForm.email} onChange={e => setTrainerForm({...trainerForm, email: e.target.value})} className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-white focus:border-amber-500 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Specialization</label>
                  <input type="text" placeholder="e.g. Strength, Rehab, Yoga" value={trainerForm.specialization} onChange={e => setTrainerForm({...trainerForm, specialization: e.target.value})} className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-white focus:border-amber-500 outline-none" />
                </div>
              </div>

              <div className="flex space-x-3 pt-6">
                <button type="button" onClick={() => setShowTrainerModal(false)} className="flex-1 px-4 py-2.5 bg-background text-gray-300 rounded-lg border border-surface-highlight hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={isSaving} className="flex-1 flex justify-center items-center px-4 py-2.5 bg-amber-500 text-black rounded-lg hover:bg-amber-400 font-bold disabled:opacity-50">
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Trainer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PT Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-xl w-full max-w-lg border border-surface-highlight overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-surface-highlight">
              <h2 className="text-xl font-bold text-white">Add PT Plan</h2>
              <button onClick={() => setShowPlanModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSavePlan} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Plan Name *</label>
                <input required type="text" value={planForm.name} onChange={e => setPlanForm({...planForm, name: e.target.value})} className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-white focus:border-amber-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Duration (Months) *</label>
                  <input required type="number" min="0" value={planForm.duration_months} onChange={e => setPlanForm({...planForm, duration_months: parseInt(e.target.value) || 0})} className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-white focus:border-amber-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Duration (Days) *</label>
                  <input required type="number" min="0" value={planForm.duration_days} onChange={e => setPlanForm({...planForm, duration_days: parseInt(e.target.value) || 0})} className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-white focus:border-amber-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Price (₹) *</label>
                <input required type="number" min="0" step="0.01" value={planForm.price} onChange={e => setPlanForm({...planForm, price: e.target.value})} className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-white focus:border-amber-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea rows={3} value={planForm.description} onChange={e => setPlanForm({...planForm, description: e.target.value})} className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-white focus:border-amber-500 outline-none"></textarea>
              </div>

              <div className="flex space-x-3 pt-6">
                <button type="button" onClick={() => setShowPlanModal(false)} className="flex-1 px-4 py-2.5 bg-background text-gray-300 rounded-lg border border-surface-highlight hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={isSaving} className="flex-1 flex justify-center items-center px-4 py-2.5 bg-amber-500 text-black rounded-lg hover:bg-amber-400 font-bold disabled:opacity-50">
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
