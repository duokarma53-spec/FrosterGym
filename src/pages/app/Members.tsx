import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Loader2, Plus, User as UserIcon, Phone, Search, Camera, X, 
  Filter, IdCard, MessageCircle, MoreVertical, Ban, 
  Snowflake, CheckCircle2, PhoneCall
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import type { Database } from '../../types/database.types';

type Member = Database['public']['Tables']['members']['Row'];
type MembershipPlan = Database['public']['Tables']['membership_plans']['Row'];
type Membership = Database['public']['Tables']['memberships']['Row'];
type MemberFreeze = Database['public']['Tables']['member_freezes']['Row'];

type MemberWithDetails = Member & { 
  memberships: Membership[];
  member_freezes: MemberFreeze[];
};

export function Members() {
  const { gym } = useAuth();
  const navigate = useNavigate();
  
  // Data State
  const [members, setMembers] = useState<MemberWithDetails[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const [filterRegistered, setFilterRegistered] = useState('all'); // all, today, week, month
  const [filterGender, setFilterGender] = useState('all'); // all, male, female, other, prefer_not_to_say
  const [filterBlocked, setFilterBlocked] = useState('all'); // all, blocked, unblocked
  const [filterFrozen, setFilterFrozen] = useState('all'); // all, frozen, unfrozen
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, expired
  
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  // Modals & Action States
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeActionsMenu, setActiveActionsMenu] = useState<string | null>(null);
  
  // Specific Modals
  const [idCardMember, setIdCardMember] = useState<MemberWithDetails | null>(null);
  const [blockModalMember, setBlockModalMember] = useState<MemberWithDetails | null>(null);
  const [freezeModalMember, setFreezeModalMember] = useState<MemberWithDetails | null>(null);
  
  // Form States for Modals
  const [blockReason, setBlockReason] = useState('');
  const [freezeFrom, setFreezeFrom] = useState('');
  const [freezeTo, setFreezeTo] = useState('');
  const [freezeReason, setFreezeReason] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Add Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    full_name: '', phone: '', gender: 'male', date_of_birth: '',
    email: '', address: '', photo_url: '', selected_plan_id: '',
  });

  const fetchData = async () => {
    if (!gym) return;
    setLoading(true);
    try {
      let query = supabase
        .from('members')
        .select('*, memberships(*), member_freezes(*)')
        .eq('gym_id', gym.id)
        .order('created_at', { ascending: false });

      if (searchQuery.trim()) {
        query = query.or(`full_name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%,member_id.ilike.%${searchQuery}%`);
      }

      const [membersRes, plansRes] = await Promise.all([
        query,
        supabase.from('membership_plans').select('*').eq('gym_id', gym.id).eq('status', 'active').order('name')
      ]);

      if (membersRes.error) throw membersRes.error;
      if (plansRes.error) throw plansRes.error;

      setMembers((membersRes.data || []) as MemberWithDetails[]);
      setPlans(plansRes.data || []);
    } catch (err: any) {
      console.error(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => { fetchData(); }, 300);
    return () => clearTimeout(timer);
  }, [gym, searchQuery]);

  useEffect(() => {
    if (!gym) return;
    // Realtime subscriptions
    const membersSub = supabase.channel('members_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members', filter: `gym_id=eq.${gym.id}` }, () => {
        fetchData();
      }).subscribe();

    const freezesSub = supabase.channel('freezes_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'member_freezes', filter: `gym_id=eq.${gym.id}` }, () => {
        fetchData();
      }).subscribe();

    return () => {
      supabase.removeChannel(membersSub);
      supabase.removeChannel(freezesSub);
    };
  }, [gym]);

  // Click outside to close actions menu
  useEffect(() => {
    const handleClickOutside = () => setActiveActionsMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const isCurrentlyFrozen = (freezes: MemberFreeze[]) => {
    if (!freezes || freezes.length === 0) return false;
    const now = new Date();
    now.setHours(0,0,0,0);
    return freezes.some(f => {
      const from = new Date(f.freeze_from);
      const to = new Date(f.freeze_to);
      return now >= from && now <= to;
    });
  };

  const getMembershipStatusInfo = (member: MemberWithDetails) => {
    if (member.is_blocked) {
      return { status: 'Blocked', color: 'bg-red-500/10 text-red-500 border-red-500/20' };
    }
    
    if (isCurrentlyFrozen(member.member_freezes)) {
      return { status: 'Frozen', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
    }

    const activeMs = member.memberships?.find(ms => ms.status === 'active');
    if (!activeMs) return { status: 'No Plan', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
    
    const end = new Date(activeMs.end_date);
    const now = new Date();
    
    if (end < now) {
      return { status: 'Expired', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' };
    }
    return { status: 'Active', color: 'bg-green-500/10 text-green-400 border-green-500/20' };
  };

  const filteredMembers = members.filter(m => {
    // 1. Gender Filter
    if (filterGender !== 'all' && m.gender !== filterGender) return false;
    
    // 2. Blocked Filter
    if (filterBlocked === 'blocked' && !m.is_blocked) return false;
    if (filterBlocked === 'unblocked' && m.is_blocked) return false;

    // 3. Frozen Filter
    const frozen = isCurrentlyFrozen(m.member_freezes);
    if (filterFrozen === 'frozen' && !frozen) return false;
    if (filterFrozen === 'unfrozen' && frozen) return false;

    // 4. Status Filter
    if (filterStatus !== 'all') {
      const ms = m.memberships?.find(ms => ms.status === 'active');
      const isExpired = ms ? new Date(ms.end_date) < new Date() : true;
      if (filterStatus === 'active' && isExpired) return false;
      if (filterStatus === 'expired' && !isExpired) return false;
    }

    // 5. Registered Date Filter
    if (filterRegistered !== 'all' && m.created_at) {
      const created = new Date(m.created_at);
      const now = new Date();
      if (filterRegistered === 'today') {
        if (created.toDateString() !== now.toDateString()) return false;
      } else if (filterRegistered === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        if (created < weekAgo) return false;
      } else if (filterRegistered === 'month') {
        if (created.getMonth() !== now.getMonth() || created.getFullYear() !== now.getFullYear()) return false;
      }
    }

    return true;
  });

  const paginatedMembers = filteredMembers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Computed Stats
  const totalMembers = members.length;
  let activeCount = 0;
  let expiredCount = 0;
  let blockedCount = 0;
  let frozenCount = 0;

  members.forEach(m => {
    if (m.is_blocked) blockedCount++;
    else if (isCurrentlyFrozen(m.member_freezes)) frozenCount++;
    else {
      const ms = m.memberships?.find(ms => ms.status === 'active');
      if (ms && new Date(ms.end_date) >= new Date()) activeCount++;
      else expiredCount++;
    }
  });

  // Action Handlers
  const handleBlockToggle = async () => {
    if (!blockModalMember || !gym) return;
    setIsSubmittingAction(true);
    try {
      const isBlocking = !blockModalMember.is_blocked;
      const { error } = await supabase.from('members').update({
        is_blocked: isBlocking,
        blocked_at: isBlocking ? new Date().toISOString() : null,
        blocked_reason: isBlocking ? blockReason : null
      }).eq('id', blockModalMember.id);
      
      if (error) throw error;
      setBlockModalMember(null);
      setBlockReason('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleFreeze = async () => {
    if (!freezeModalMember || !gym) return;
    if (!freezeFrom || !freezeTo) return alert("Select dates");
    if (new Date(freezeFrom) > new Date(freezeTo)) return alert("Start date must be before end date");
    
    setIsSubmittingAction(true);
    try {
      // Find active membership to attach if exists
      const activeMs = freezeModalMember.memberships?.find(ms => ms.status === 'active');
      const { error } = await supabase.from('member_freezes').insert({
        gym_id: gym.id,
        member_id: freezeModalMember.id,
        membership_id: activeMs?.id || null,
        freeze_from: freezeFrom,
        freeze_to: freezeTo,
        reason: freezeReason
      });
      if (error) throw error;
      setFreezeModalMember(null);
      setFreezeFrom('');
      setFreezeTo('');
      setFreezeReason('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Rest of add member logic...
  const generateMemberId = () => 'M-' + Math.floor(10000 + Math.random() * 90000);
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return setFormError('Photo size must be less than 2MB');
    const reader = new FileReader();
    reader.onloadend = () => setFormData(prev => ({ ...prev, photo_url: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gym) return;
    if (!formData.selected_plan_id) return setFormError('Please select a membership plan.');
    if (!formData.photo_url) return setFormError('Profile photo is required.');
    
    setIsSubmitting(true);
    setFormError(null);
    try {
      const member_id_code = generateMemberId();
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .insert({
          gym_id: gym.id,
          member_id: member_id_code,
          full_name: formData.full_name,
          phone: formData.phone,
          gender: formData.gender,
          date_of_birth: formData.date_of_birth || null,
          email: formData.email || null,
          address: formData.address || null,
          photo_url: formData.photo_url,
          status: 'active'
        }).select().single();
      if (memberError) throw memberError;

      const selectedPlan = plans.find(p => p.id === formData.selected_plan_id);
      if (selectedPlan && memberData) {
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + selectedPlan.duration_months);
        endDate.setDate(endDate.getDate() + selectedPlan.duration_days);

        const { error: membershipError } = await supabase.from('memberships').insert({
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
        if (membershipError) throw membershipError;
      }
      setShowAddForm(false);
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Members</h1>
          <p className="text-sm text-gray-400 mt-1">Manage gym members, freezes, and memberships.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-primary-500 hover:bg-primary-600 text-black font-semibold rounded-lg px-4 py-2 flex items-center justify-center gap-2 transition-colors w-full sm:w-auto shrink-0 shadow-lg shadow-primary-500/20"
        >
          <Plus className="w-5 h-5" />
          Add Member
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-surface border border-surface-highlight rounded-xl p-4 flex flex-col justify-center">
          <div className="text-gray-400 text-xs uppercase font-semibold mb-1">Total</div>
          <div className="text-2xl font-bold text-white">{totalMembers}</div>
        </div>
        <div className="bg-surface border border-surface-highlight rounded-xl p-4 flex flex-col justify-center">
          <div className="text-green-500/80 text-xs uppercase font-semibold mb-1">Active</div>
          <div className="text-2xl font-bold text-green-400">{activeCount}</div>
        </div>
        <div className="bg-surface border border-surface-highlight rounded-xl p-4 flex flex-col justify-center">
          <div className="text-orange-500/80 text-xs uppercase font-semibold mb-1">Expired</div>
          <div className="text-2xl font-bold text-orange-400">{expiredCount}</div>
        </div>
        <div className="bg-surface border border-surface-highlight rounded-xl p-4 flex flex-col justify-center">
          <div className="text-blue-500/80 text-xs uppercase font-semibold mb-1">Frozen</div>
          <div className="text-2xl font-bold text-blue-400">{frozenCount}</div>
        </div>
        <div className="bg-surface border border-surface-highlight rounded-xl p-4 flex flex-col justify-center">
          <div className="text-red-500/80 text-xs uppercase font-semibold mb-1">Blocked</div>
          <div className="text-2xl font-bold text-red-500">{blockedCount}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-surface border border-surface-highlight rounded-xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search name, phone, or ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-surface-highlight rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${showFilters ? 'bg-primary-500/10 text-primary-400 border-primary-500/30' : 'bg-background text-gray-300 border-surface-highlight hover:bg-surface-highlight'}`}
          >
            <Filter className="w-4 h-4" />
            Advanced Filters
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-surface-highlight/50">
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase font-semibold tracking-wider">Status</label>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full bg-background border border-surface-highlight rounded-md px-3 py-1.5 text-sm text-white focus:border-primary-500 outline-none">
                <option value="all">All</option>
                <option value="active">Active Plan</option>
                <option value="expired">Expired Plan</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase font-semibold tracking-wider">Registered</label>
              <select value={filterRegistered} onChange={e => setFilterRegistered(e.target.value)} className="w-full bg-background border border-surface-highlight rounded-md px-3 py-1.5 text-sm text-white focus:border-primary-500 outline-none">
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase font-semibold tracking-wider">Blocked</label>
              <select value={filterBlocked} onChange={e => setFilterBlocked(e.target.value)} className="w-full bg-background border border-surface-highlight rounded-md px-3 py-1.5 text-sm text-white focus:border-primary-500 outline-none">
                <option value="all">All</option>
                <option value="unblocked">Not Blocked</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase font-semibold tracking-wider">Frozen</label>
              <select value={filterFrozen} onChange={e => setFilterFrozen(e.target.value)} className="w-full bg-background border border-surface-highlight rounded-md px-3 py-1.5 text-sm text-white focus:border-primary-500 outline-none">
                <option value="all">All</option>
                <option value="unfrozen">Not Frozen</option>
                <option value="frozen">Currently Frozen</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase font-semibold tracking-wider">Gender</label>
              <select value={filterGender} onChange={e => setFilterGender(e.target.value)} className="w-full bg-background border border-surface-highlight rounded-md px-3 py-1.5 text-sm text-white focus:border-primary-500 outline-none">
                <option value="all">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer Not To Say</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="bg-surface border border-surface-highlight rounded-xl overflow-hidden relative">
        {loading && members.length === 0 ? (
           <div className="flex items-center justify-center py-20">
             <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
           </div>
        ) : filteredMembers.length === 0 ? (
          <div className="py-20 text-center">
            <UserIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No members found</p>
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left text-sm text-gray-300 whitespace-nowrap">
              <thead className="bg-surface-highlight/30 text-gray-400 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Member Info</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-highlight/50">
                {paginatedMembers.map(member => {
                  const statusInfo = getMembershipStatusInfo(member);
                  return (
                    <tr key={member.id} className={`hover:bg-surface-highlight/20 transition-colors ${member.is_blocked ? 'opacity-75' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-gray-400 font-bold border overflow-hidden shrink-0 ${member.is_blocked ? 'border-red-500/50' : 'border-surface-highlight'}`}>
                            {member.photo_url ? (
                              <img src={member.photo_url} alt={member.full_name} className="w-full h-full object-cover" />
                            ) : (
                              member.full_name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{member.full_name}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-2">
                              <span>{member.member_id}</span>
                              {member.is_blocked && <Ban className="w-3 h-3 text-red-500" />}
                              {isCurrentlyFrozen(member.member_freezes) && <Snowflake className="w-3 h-3 text-blue-400" />}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-gray-400 text-xs">
                          <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer" onClick={() => window.open(`tel:${member.phone}`)}>
                            <Phone className="w-3 h-3" /> {member.phone}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <UserIcon className="w-3 h-3" /> {member.gender ? member.gender.charAt(0).toUpperCase() + member.gender.slice(1).replace(/_/g, ' ') : 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${statusInfo.color}`}>
                          {statusInfo.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block text-left">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveActionsMenu(activeActionsMenu === member.id ? null : member.id);
                            }}
                            className="p-1.5 hover:bg-surface-highlight rounded-md text-gray-400 hover:text-white transition-colors"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          
                          {activeActionsMenu === member.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-surface border border-surface-highlight rounded-xl shadow-2xl z-50 py-1 overflow-hidden">
                              <button onClick={() => navigate(`/members/${member.id}`)} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-surface-highlight hover:text-white flex items-center gap-2">
                                <UserIcon className="w-4 h-4" /> Profile
                              </button>
                              <button onClick={() => setIdCardMember(member)} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-surface-highlight hover:text-white flex items-center gap-2">
                                <IdCard className="w-4 h-4" /> View ID Card
                              </button>
                              <div className="h-px bg-surface-highlight my-1" />
                              <button onClick={() => window.open(`https://wa.me/${member.phone.replace(/\D/g,'')}`)} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-surface-highlight hover:text-green-400 flex items-center gap-2">
                                <MessageCircle className="w-4 h-4" /> WhatsApp
                              </button>
                              <button onClick={() => window.open(`tel:${member.phone}`)} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-surface-highlight hover:text-blue-400 flex items-center gap-2">
                                <PhoneCall className="w-4 h-4" /> Call Member
                              </button>
                              <div className="h-px bg-surface-highlight my-1" />
                              {!member.is_blocked && (
                                <button onClick={() => setFreezeModalMember(member)} className="w-full text-left px-4 py-2 text-sm text-blue-400 hover:bg-blue-500/10 flex items-center gap-2">
                                  <Snowflake className="w-4 h-4" /> Freeze Member
                                </button>
                              )}
                              <button onClick={() => setBlockModalMember(member)} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${member.is_blocked ? 'text-green-500 hover:bg-green-500/10' : 'text-red-500 hover:bg-red-500/10'}`}>
                                {member.is_blocked ? <CheckCircle2 className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                {member.is_blocked ? 'Unblock Member' : 'Block Member'}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="p-4 border-t border-surface-highlight flex justify-between items-center bg-surface-highlight/10 text-sm text-gray-400">
          <div>Showing page {page}</div>
          <div className="flex gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg bg-background border border-surface-highlight hover:bg-surface-highlight disabled:opacity-50 transition-colors text-white"
            >
              Previous
            </button>
            <button 
              disabled={paginatedMembers.length < PAGE_SIZE}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 rounded-lg bg-background border border-surface-highlight hover:bg-surface-highlight disabled:opacity-50 transition-colors text-white"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ID Card Modal */}
      {idCardMember && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl w-[350px] overflow-hidden shadow-2xl flex flex-col">
            <div className="h-24 bg-primary-500 relative">
              <button onClick={() => setIdCardMember(null)} className="absolute top-2 right-2 p-1 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 pb-8 pt-0 flex flex-col items-center -mt-12">
              <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-gray-200 mb-4 shadow-lg">
                {idCardMember.photo_url ? (
                  <img src={idCardMember.photo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-full h-full p-4 text-gray-400" />
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900 text-center">{idCardMember.full_name}</h2>
              <p className="text-primary-600 font-semibold mb-6">{idCardMember.member_id}</p>
              
              <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 mb-6">
                <QRCode value={idCardMember.id} size={140} level="H" />
              </div>
              
              <div className="w-full space-y-2 text-sm">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">Phone</span>
                  <span className="font-medium text-gray-900">{idCardMember.phone}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">Blood Group</span>
                  <span className="font-medium text-gray-900">{idCardMember.blood_group || 'N/A'}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-gray-500">Emergency</span>
                  <span className="font-medium text-red-500">{idCardMember.emergency_contact || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Block/Unblock Modal */}
      {blockModalMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-surface border border-surface-highlight rounded-xl w-full max-w-md shadow-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              {blockModalMember.is_blocked ? 'Unblock Member' : 'Block Member'}
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              {blockModalMember.is_blocked 
                ? `Are you sure you want to unblock ${blockModalMember.full_name}? They will be able to access the gym again.` 
                : `Are you sure you want to block ${blockModalMember.full_name}? They will be denied entry at attendance.`}
            </p>
            
            {!blockModalMember.is_blocked && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Reason for blocking (Optional)</label>
                <textarea 
                  value={blockReason}
                  onChange={e => setBlockReason(e.target.value)}
                  className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2 text-white focus:border-red-500 min-h-[100px]"
                  placeholder="e.g. Unpaid dues, misbehavior..."
                />
              </div>
            )}
            
            <div className="flex justify-end gap-3">
              <button onClick={() => setBlockModalMember(null)} className="px-4 py-2 text-gray-400 hover:text-white font-medium">Cancel</button>
              <button 
                onClick={handleBlockToggle}
                disabled={isSubmittingAction}
                className={`px-6 py-2 rounded-lg font-semibold flex items-center gap-2 ${blockModalMember.is_blocked ? 'bg-green-500 text-black hover:bg-green-600' : 'bg-red-500 text-white hover:bg-red-600'}`}
              >
                {isSubmittingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {blockModalMember.is_blocked ? 'Yes, Unblock' : 'Yes, Block'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Freeze Modal */}
      {freezeModalMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-surface border border-surface-highlight rounded-xl w-full max-w-md shadow-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-2">Freeze Membership</h2>
            <p className="text-gray-400 text-sm mb-6">Temporarily suspend {freezeModalMember.full_name}'s membership.</p>
            
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">From Date</label>
                  <input type="date" value={freezeFrom} onChange={e => setFreezeFrom(e.target.value)} className="w-full bg-background border border-surface-highlight rounded-lg px-3 py-2 text-white [color-scheme:dark]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">To Date</label>
                  <input type="date" value={freezeTo} onChange={e => setFreezeTo(e.target.value)} className="w-full bg-background border border-surface-highlight rounded-lg px-3 py-2 text-white [color-scheme:dark]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Reason (Optional)</label>
                <textarea 
                  value={freezeReason}
                  onChange={e => setFreezeReason(e.target.value)}
                  className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2 text-white focus:border-blue-500"
                  placeholder="e.g. Medical, Vacation..."
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button onClick={() => setFreezeModalMember(null)} className="px-4 py-2 text-gray-400 hover:text-white font-medium">Cancel</button>
              <button 
                onClick={handleFreeze}
                disabled={isSubmittingAction || !freezeFrom || !freezeTo}
                className="px-6 py-2 rounded-lg font-semibold flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
              >
                {isSubmittingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Freeze Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Form - Simplified inclusion since it was in old component */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface border border-surface-highlight rounded-xl w-full max-w-2xl shadow-2xl my-8">
            <div className="p-6 border-b border-surface-highlight flex justify-between items-center sticky top-0 bg-surface rounded-t-xl z-10">
              <h2 className="text-lg font-bold text-white">Add New Member</h2>
              <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleAddMember} className="p-6 space-y-6">
              {formError && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">{formError}</div>}
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center space-y-2 shrink-0">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-surface-highlight bg-background flex items-center justify-center">
                      {formData.photo_url ? <img src={formData.photo_url} className="w-full h-full object-cover" /> : <UserIcon className="w-12 h-12 text-gray-500" />}
                    </div>
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 p-2 bg-primary-500 rounded-full text-black shadow-lg"><Camera className="w-5 h-5" /></button>
                  </div>
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handlePhotoUpload}/>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm text-gray-300 mb-1">Full Name *</label><input required value={formData.full_name} onChange={e=>setFormData({...formData, full_name: e.target.value})} className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2 text-white" /></div>
                    <div><label className="block text-sm text-gray-300 mb-1">Phone *</label><input required type="tel" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2 text-white" /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm text-gray-300 mb-1">Gender</label><select value={formData.gender} onChange={e=>setFormData({...formData, gender: e.target.value})} className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2 text-white"><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option><option value="prefer_not_to_say">Prefer Not To Say</option></select></div>
                    <div><label className="block text-sm text-gray-300 mb-1">Membership Plan *</label><select required value={formData.selected_plan_id} onChange={e=>setFormData({...formData, selected_plan_id: e.target.value})} className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2 text-white"><option value="">Select...</option>{plans.map(p=><option key={p.id} value={p.id}>{p.name} - ₹{p.price}</option>)}</select></div>
                  </div>
                </div>
              </div>
              <div className="pt-6 flex justify-end gap-3 border-t border-surface-highlight">
                <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 text-gray-400">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-primary-500 text-black px-6 py-2 rounded-lg font-bold flex items-center gap-2">
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />} Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
