import { useState, useEffect } from 'react';
import { Search, Plus, UserCheck, Phone, Mail, Shield, Loader2, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database.types';

type StaffRow = Database['public']['Tables']['staff']['Row'];

const AVAILABLE_PERMISSIONS = [
  'members', 'memberships', 'payments', 'attendance', 'pt', 'diet-plans', 'staff', 'expenses', 'reports', 'settings'
];

export function Staff() {
  const { gym } = useAuth();
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    phone: '',
    email: '',
    permissions: [] as string[]
  });

  useEffect(() => {
    if (gym) {
      loadStaff();
    }
  }, [gym]);

  async function loadStaff() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('gym_id', gym!.id)
        .order('name');
      
      if (error) throw error;
      setStaff(data as StaffRow[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gym) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase.from('staff').insert({
        gym_id: gym.id,
        name: formData.name,
        role: formData.role,
        phone: formData.phone,
        email: formData.email,
        permissions: formData.permissions
      });

      if (error) throw error;
      
      setShowModal(false);
      setFormData({ name: '', role: '', phone: '', email: '', permissions: [] });
      await loadStaff();
    } catch (err: any) {
      alert(err.message || 'Failed to save staff member');
    } finally {
      setIsSaving(false);
    }
  };

  const togglePermission = (perm: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm) 
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm]
    }));
  };

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    (s.phone && s.phone.includes(search)) ||
    s.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Staff Management</h1>
          <p className="text-sm text-gray-400 mt-1">Manage gym employees and access permissions.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Staff
        </button>
      </div>

      <div className="bg-surface border border-surface-highlight rounded-xl p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, role, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-surface-highlight rounded-lg text-white focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-400 bg-red-500/10 rounded-lg border border-red-500/20">
            {error}
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-surface-highlight rounded-lg">
            <UserCheck className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No staff members found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStaff.map((s) => (
              <div key={s.id} className="bg-background border border-surface-highlight rounded-xl p-5 hover:border-amber-500/50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-highlight flex items-center justify-center">
                      <span className="text-lg font-bold text-gray-300">{s.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <h3 className="text-white font-bold">{s.name}</h3>
                      <p className="text-xs text-amber-500 font-medium uppercase tracking-wider">{s.role}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {s.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Phone className="w-4 h-4 text-gray-500" /> {s.phone}
                    </div>
                  )}
                  {s.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Mail className="w-4 h-4 text-gray-500" /> {s.email}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-surface-highlight">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Shield className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-medium text-gray-400 uppercase">Permissions</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {s.permissions && s.permissions.length > 0 ? (
                      s.permissions.map(p => (
                        <span key={p} className="px-2 py-0.5 bg-surface-highlight text-gray-300 text-[10px] uppercase font-bold rounded">
                          {p}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500 italic">None</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-xl w-full max-w-lg border border-surface-highlight overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-surface-highlight">
              <h2 className="text-xl font-bold text-white">Add Staff Member</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Full Name *</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Role/Job Title *</label>
                  <input required type="text" placeholder="e.g. Receptionist, Manager" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500" />
                </div>
              </div>

              <div className="pt-4 border-t border-surface-highlight">
                <label className="block text-sm font-medium text-gray-300 mb-3">System Permissions</label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_PERMISSIONS.map(perm => (
                    <label key={perm} className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox"
                        checked={formData.permissions.includes(perm)}
                        onChange={() => togglePermission(perm)}
                        className="w-4 h-4 rounded border-gray-600 text-amber-500 focus:ring-amber-500 bg-background"
                      />
                      <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors uppercase">{perm.replace('-', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 bg-background text-gray-300 rounded-lg hover:text-white transition-colors font-medium border border-surface-highlight">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="flex-1 flex justify-center items-center px-4 py-2.5 bg-amber-500 text-black rounded-lg hover:bg-amber-400 transition-colors font-bold disabled:opacity-50">
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
