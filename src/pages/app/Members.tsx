import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2, Plus, User as UserIcon, Phone, ChevronRight, Search, Camera, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Database } from '../../types/database.types';

type Member = Database['public']['Tables']['members']['Row'];
type MembershipPlan = Database['public']['Tables']['membership_plans']['Row'];
type Membership = Database['public']['Tables']['memberships']['Row'];

type MemberWithMembership = Member & { memberships: Membership[] };

export function Members() {
  const { gym } = useAuth();
  const navigate = useNavigate();
  
  // Data State
  const [members, setMembers] = useState<MemberWithMembership[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    gender: 'Male',
    date_of_birth: '',
    email: '',
    address: '',
    photo_url: '', // Will hold base64
    selected_plan_id: '',
  });

  const fetchData = async () => {
    if (!gym) return;
    setLoading(true);
    try {
      let query = supabase
        .from('members')
        .select('*, memberships(*)')
        .eq('gym_id', gym.id)
        .order('created_at', { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

      if (searchQuery.trim()) {
        query = query.or(`full_name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`);
      }

      const [membersRes, plansRes] = await Promise.all([
        query,
        supabase
          .from('membership_plans')
          .select('*')
          .eq('gym_id', gym.id)
          .eq('status', 'active')
          .order('name')
      ]);

      if (membersRes.error) throw membersRes.error;
      if (plansRes.error) throw plansRes.error;

      let fetchedMembers = (membersRes.data || []) as MemberWithMembership[];

      // Filter by status locally since Supabase JS doesn't support deep filtering easily without a view
      if (statusFilter !== 'all') {
        fetchedMembers = fetchedMembers.filter(m => {
          // Find active membership
          const activeMembership = m.memberships?.find(ms => ms.status === 'active' && new Date(ms.end_date) >= new Date());
          if (statusFilter === 'active') return !!activeMembership;
          if (statusFilter === 'expired') return !activeMembership;
          return true;
        });
      }

      setMembers(fetchedMembers);
      setPlans(plansRes.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [gym, searchQuery, statusFilter, page]);

  const generateMemberId = () => {
    return 'M-' + Math.floor(10000 + Math.random() * 90000);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setFormError('Photo size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, photo_url: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gym) return;
    
    if (!formData.selected_plan_id) {
      setFormError('Please select a membership plan.');
      return;
    }

    if (!formData.photo_url) {
      setFormError('Profile photo is required.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      // 1. Insert Member
      const member_id_code = generateMemberId();
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .insert({
          gym_id: gym.id,
          member_id: member_id_code,
          full_name: formData.full_name,
          phone: formData.phone,
          gender: formData.gender || null,
          date_of_birth: formData.date_of_birth || null,
          email: formData.email || null,
          address: formData.address || null,
          photo_url: formData.photo_url,
          status: 'active'
        })
        .select()
        .single();

      if (memberError) throw memberError;

      // 2. Insert Membership
      const selectedPlan = plans.find(p => p.id === formData.selected_plan_id);
      if (selectedPlan && memberData) {
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + selectedPlan.duration_months);
        endDate.setDate(endDate.getDate() + selectedPlan.duration_days);

        const { error: membershipError } = await supabase
          .from('memberships')
          .insert({
            gym_id: gym.id,
            member_id: memberData.id,
            plan_id: selectedPlan.id,
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            status: 'active',
            original_amount: selectedPlan.price,
            discount_amount: 0,
            discount_type: 'fixed',
            final_amount: selectedPlan.price,
            paid_amount: 0,
            due_amount: selectedPlan.price
          });

        if (membershipError) {
          throw new Error('Member created, but membership failed: ' + membershipError.message);
        }
      }

      await fetchData();
      setShowAddForm(false);
      setFormData({
        full_name: '', phone: '', gender: 'Male', date_of_birth: '',
        email: '', address: '', photo_url: '', selected_plan_id: '',
      });
    } catch (err: any) {
      setFormError(err.message || 'Failed to save member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMembershipStatus = (member: MemberWithMembership) => {
    const activeMs = member.memberships?.find(ms => ms.status === 'active');
    if (!activeMs) return { label: 'No Plan', color: 'bg-gray-500/10 text-gray-400' };
    
    const end = new Date(activeMs.end_date);
    const now = new Date();
    
    if (end < now) {
      return { label: 'Expired', color: 'bg-red-500/10 text-red-400' };
    }
    
    const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 3600 * 24));
    if (daysLeft <= 7) {
      return { label: 'Expiring Soon', color: 'bg-amber-500/10 text-amber-400' };
    }
    
    return { label: 'Active', color: 'bg-green-500/10 text-green-400' };
  };

  if (loading && members.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Members</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your gym members and their memberships.</p>
        </div>
        <button 
          onClick={() => { setShowAddForm(true); setFormError(null); }}
          className="bg-primary-500 hover:bg-primary-600 text-black font-semibold rounded-lg px-4 py-2 flex items-center justify-center gap-2 transition-colors w-full sm:w-auto shrink-0"
        >
          <Plus className="w-5 h-5" />
          Add Member
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-surface border border-surface-highlight p-4 rounded-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-surface-highlight rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-primary-500"
          />
        </div>
        <div className="flex bg-background border border-surface-highlight rounded-lg p-1 overflow-x-auto">
          {(['all', 'active', 'expired'] as const).map(status => (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); setPage(1); }}
              className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                statusFilter === status 
                  ? 'bg-surface-highlight text-white' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button onClick={fetchData} className="mt-4 text-sm text-white underline hover:text-gray-300">Try Again</button>
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface border border-surface-highlight rounded-xl w-full max-w-2xl shadow-2xl my-8">
            <div className="p-6 border-b border-surface-highlight flex justify-between items-center sticky top-0 bg-surface rounded-t-xl z-10">
              <h2 className="text-lg font-bold text-white">Add New Member</h2>
              <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-white">&times;</button>
            </div>
            
            <form onSubmit={handleAddMember} className="p-6 space-y-6">
              {formError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                  {formError}
                </div>
              )}

              <div className="space-y-4 flex flex-col md:flex-row gap-6">
                
                {/* Photo Upload */}
                <div className="flex flex-col items-center space-y-2 shrink-0">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-surface-highlight bg-background flex items-center justify-center">
                      {formData.photo_url ? (
                        <img src={formData.photo_url} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-12 h-12 text-gray-500" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 p-2 bg-primary-500 rounded-full text-black hover:bg-primary-600 transition-colors shadow-lg"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                    {formData.photo_url && (
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, photo_url: ''})}
                        className="absolute top-0 right-0 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 font-medium">Profile Photo *</p>
                  <input 
                    type="file" 
                    accept="image/jpeg, image/png, image/webp" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                  />
                </div>

                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name *</label>
                      <input required type="text" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2 text-white focus:border-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone *</label>
                      <input required type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2 text-white focus:border-primary-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">Gender</label>
                      <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2 text-white focus:border-primary-500">
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">Date of Birth</label>
                      <input type="date" value={formData.date_of_birth} onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})} className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2 text-white [color-scheme:dark]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-surface-highlight space-y-4">
                <h3 className="text-sm font-semibold text-primary-500 uppercase tracking-wider">Membership Enrollment</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Membership Plan *</label>
                  <select required value={formData.selected_plan_id} onChange={(e) => setFormData({...formData, selected_plan_id: e.target.value})} className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-white focus:border-primary-500">
                    <option value="">Select a plan...</option>
                    {plans.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} — ₹{p.price} ({p.duration_months} Months {p.duration_days > 0 ? `+ ${p.duration_days} Days` : ''})
                      </option>
                    ))}
                  </select>
                  
                  {formData.selected_plan_id && (
                    <div className="mt-4 p-4 bg-background border border-surface-highlight rounded-lg flex flex-col gap-2">
                      {(() => {
                        const p = plans.find(plan => plan.id === formData.selected_plan_id);
                        if (!p) return null;
                        return (
                          <>
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-bold text-white text-lg">{p.name}</div>
                                <div className="text-sm text-gray-400">{p.duration_months} Months {p.duration_days > 0 ? `+ ${p.duration_days} Days` : ''}</div>
                              </div>
                              <div className="font-bold text-primary-500 text-lg">₹{p.price}</div>
                            </div>
                            {(p.pt_included || p.diet_included) && (
                              <div className="mt-2 pt-2 border-t border-surface-highlight flex gap-4">
                                {p.pt_included && <span className="text-sm text-amber-500 font-medium flex items-center gap-1">✓ PT Included</span>}
                                {p.diet_included && <span className="text-sm text-green-500 font-medium flex items-center gap-1">✓ Diet Plan Included</span>}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-3 sticky bottom-0 bg-surface border-t border-surface-highlight p-4 -mx-6 -mb-6 rounded-b-xl">
                <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 text-gray-400 hover:text-white font-medium transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-primary-500 hover:bg-primary-600 text-black font-semibold rounded-lg px-6 py-2 flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {members.length === 0 && !loading ? (
        <div className="bg-surface border border-surface-highlight rounded-xl p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface-highlight mb-4">
            <UserIcon className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-400 mb-4">No members found matching your criteria.</p>
        </div>
      ) : (
        <div className="bg-surface border border-surface-highlight rounded-xl overflow-hidden relative">
          {loading && (
             <div className="absolute inset-0 bg-surface/50 backdrop-blur-sm z-10 flex items-center justify-center">
               <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
             </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300 whitespace-nowrap">
              <thead className="bg-surface-highlight/50 text-gray-400 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Member</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Membership</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-highlight">
                {members.map(member => {
                  const status = getMembershipStatus(member);
                  return (
                    <tr key={member.id} className="hover:bg-surface-highlight/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-gray-400 font-bold border border-surface-highlight overflow-hidden shrink-0">
                            {member.photo_url ? (
                              <img src={member.photo_url} alt={member.full_name} className="w-full h-full object-cover" />
                            ) : (
                              member.full_name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-white">{member.full_name}</div>
                            <div className="text-xs text-gray-500">{member.member_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-gray-400 text-xs">
                          <div className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {member.phone}</div>
                          <div className="flex items-center gap-1.5"><UserIcon className="w-3 h-3" /> {member.gender}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${status.color}`}>
                          {status.label.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => navigate(`/members/${member.id}`)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-300 bg-surface-highlight hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          Profile
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-surface-highlight flex justify-between items-center bg-surface-highlight/20 text-sm text-gray-400">
            <div>Showing page {page}</div>
            <div className="flex gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1 rounded bg-surface-highlight hover:bg-gray-700 disabled:opacity-50 transition-colors text-white"
              >
                Previous
              </button>
              <button 
                disabled={members.length < PAGE_SIZE}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 rounded bg-surface-highlight hover:bg-gray-700 disabled:opacity-50 transition-colors text-white"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
