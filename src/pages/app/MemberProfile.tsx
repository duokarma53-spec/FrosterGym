import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2, ArrowLeft, User as UserIcon, Calendar, Phone, Mail, MapPin, CheckCircle, Clock, Dumbbell, Apple, Plus, Ban, Snowflake, X, Check } from 'lucide-react';
import type { Database } from '../../types/database.types';

type Member = Database['public']['Tables']['members']['Row'];
type MemberFreeze = Database['public']['Tables']['member_freezes']['Row'];
type Membership = Database['public']['Tables']['memberships']['Row'];
type Plan = Database['public']['Tables']['membership_plans']['Row'];
type Payment = Database['public']['Tables']['payments']['Row'];
type PTPlan = Database['public']['Tables']['pt_plans']['Row'];
type Trainer = Database['public']['Tables']['trainers']['Row'];
type PTMembership = Database['public']['Tables']['pt_memberships']['Row'];
type DietPlan = Database['public']['Tables']['diet_plans']['Row'];
type MemberDietPlan = Database['public']['Tables']['member_diet_plans']['Row'];

export function MemberProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { gym } = useAuth();
  
  const [member, setMember] = useState<(Member & { member_freezes?: MemberFreeze[] }) | null>(null);
  const [currentMembership, setCurrentMembership] = useState<(Membership & { membership_plans: Plan | null }) | null>(null);
  const [membershipHistory, setMembershipHistory] = useState<(Membership & { membership_plans: Plan | null })[]>([]);
  
  const [attendanceSummary, setAttendanceSummary] = useState<{ total: number; lastVisit: string | null }>({ total: 0, lastVisit: null });
  const [payments, setPayments] = useState<Payment[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  
  // PT & Diet State
  const [currentPT, setCurrentPT] = useState<(PTMembership & { pt_plans: PTPlan | null, trainers: Trainer | null }) | null>(null);
  const [currentDiet, setCurrentDiet] = useState<(MemberDietPlan & { diet_plans: DietPlan | null }) | null>(null);
  
  // Assignment Modal Data
  const [availableTrainers, setAvailableTrainers] = useState<Trainer[]>([]);
  const [availablePTPlans, setAvailablePTPlans] = useState<PTPlan[]>([]);
  const [availableDietPlans, setAvailableDietPlans] = useState<DietPlan[]>([]);
  
  const [showPTModal, setShowPTModal] = useState(false);
  const [showDietModal, setShowDietModal] = useState(false);
  
  const [ptForm, setPtForm] = useState({ trainer_id: '', pt_plan_id: '' });
  const [dietForm, setDietForm] = useState({ diet_plan_id: '' });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Renewal State
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [isRenewing, setIsRenewing] = useState(false);
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    gender: 'male',
    date_of_birth: '',
    email: '',
    address: '',
    photo_url: '',
    status: 'active'
  });

  // Record Payment State
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false);
  const [recordPaymentAmount, setRecordPaymentAmount] = useState('');
  const [recordPaymentMethod, setRecordPaymentMethod] = useState('cash');
  const [recordPaymentNotes, setRecordPaymentNotes] = useState('');
  const [recordPaymentDate, setRecordPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);

  const [invoiceToPrint, setInvoiceToPrint] = useState<any | null>(null);

  const fetchMemberData = async () => {
    if (!gym || !id) return;
    setLoading(true);
    try {
      // 1. Fetch Member
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('*, member_freezes(*)')
        .eq('id', id)
        .eq('gym_id', gym.id)
        .single();

      if (memberError) throw memberError;
      setMember(memberData);
      
      setFormData({
        full_name: memberData.full_name || '',
        phone: memberData.phone || '',
        gender: memberData.gender || 'male',
        date_of_birth: memberData.date_of_birth || '',
        email: memberData.email || '',
        address: memberData.address || ''
      });

      // 2. Fetch Memberships
      const { data: membershipsData, error: membershipError } = await supabase
        .from('memberships')
        .select('*, membership_plans(*)')
        .eq('member_id', id)
        .order('start_date', { ascending: false });

      if (membershipError) throw membershipError;
      
      const memberships = (membershipsData as any[]) || [];
      const active = memberships.find(m => m.status === 'active' && new Date(m.end_date) >= new Date());
      const current = active || memberships[0] || null; // Active or most recent
      
      setCurrentMembership(current);
      setMembershipHistory(memberships.filter(m => m.id !== current?.id));

      // 3. Fetch Attendance Summary
      const { count: totalVisits, error: countError } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('member_id', id);

      const { data: lastVisitData } = await supabase
        .from('attendance')
        .select('check_in_time')
        .eq('member_id', id)
        .order('check_in_time', { ascending: false })
        .limit(1)
        .single();

      if (!countError) {
        setAttendanceSummary({
          total: totalVisits || 0,
          lastVisit: lastVisitData?.check_in_time || null
        });
      }

      // 4. Fetch Payments
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*')
        .eq('member_id', id)
        .order('payment_date', { ascending: false });

      if (paymentsData) {
        setPayments(paymentsData as Payment[]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch member details');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMembership || !gym || !member) return;
    const amt = parseFloat(recordPaymentAmount);
    if (isNaN(amt) || amt <= 0) return alert("Amount must be greater than zero");
    
    setIsRecordingPayment(true);
    try {
      // 1. Insert Payment
      const { data: newPayment, error: paymentError } = await (supabase
        .from('payments')
        .insert({
          gym_id: gym.id,
          member_id: member.id,
          membership_id: currentMembership.id,
          amount: amt,
          payment_date: new Date(recordPaymentDate).toISOString(),
          payment_method: recordPaymentMethod,
          status: 'completed',
          notes: recordPaymentNotes || null
        })
        .select()
        .single() as any);
        
      if (paymentError) throw paymentError;

      // 2. Insert Invoice
      if (newPayment) {
        const invoiceNumber = `INV-${new Date(recordPaymentDate).getFullYear()}${(new Date(recordPaymentDate).getMonth() + 1).toString().padStart(2, '0')}-${newPayment.id.slice(0, 8).toUpperCase()}`;
        const { error: invoiceError } = await supabase.from('invoices').insert({
          gym_id: gym.id,
          invoice_number: invoiceNumber,
          member_id: member.id,
          membership_id: currentMembership.id,
          payment_id: newPayment.id,
          issue_date: new Date(recordPaymentDate).toISOString().split('T')[0],
          due_date: new Date(recordPaymentDate).toISOString().split('T')[0],
          subtotal: amt,
          tax_amount: 0,
          total_amount: amt,
          status: 'paid'
        });
        
        if (invoiceError) console.error('Invoice creation failed:', invoiceError.message);
      }
      
      // 3. Update Membership Dues
      const newPaidAmount = Number(currentMembership.paid_amount) + amt;
      const newDueAmount = Math.max(0, Number(currentMembership.due_amount) - amt);
      
      const { error: membershipError } = await supabase
        .from('memberships')
        .update({
          paid_amount: newPaidAmount,
          due_amount: newDueAmount
        })
        .eq('id', currentMembership.id);
        
      if (membershipError) throw membershipError;
      
      setShowRecordPaymentModal(false);
      setRecordPaymentNotes('');
      fetchMemberData();
    } catch (err: any) {
      alert(err.message || 'Failed to record payment');
    } finally {
      setIsRecordingPayment(false);
    }
  };

  const handleViewInvoice = async (payment: any) => {
    try {
      let { data: invoiceData } = await supabase
        .from('invoices')
        .select('*, memberships(*, membership_plans(*)), members(*)')
        .eq('payment_id', payment.id)
        .maybeSingle();

      if (!invoiceData) {
        const invoiceNumber = `INV-${new Date(payment.payment_date).getFullYear()}${(new Date(payment.payment_date).getMonth() + 1).toString().padStart(2, '0')}-${payment.id.slice(0, 8).toUpperCase()}`;
        const { data: newInvoice, error: createError } = await supabase
          .from('invoices')
          .insert({
            gym_id: gym!.id,
            invoice_number: invoiceNumber,
            member_id: member!.id,
            membership_id: payment.membership_id || null,
            payment_id: payment.id,
            issue_date: new Date(payment.payment_date).toISOString().split('T')[0],
            due_date: new Date(payment.payment_date).toISOString().split('T')[0],
            subtotal: payment.amount,
            tax_amount: 0,
            total_amount: payment.amount,
            status: 'paid'
          })
          .select('*, memberships(*, membership_plans(*)), members(*)')
          .single();

        if (createError) throw createError;
        invoiceData = newInvoice;
      }

      setInvoiceToPrint({
        ...invoiceData,
        payment
      });
    } catch (err: any) {
      alert(err.message || 'Failed to fetch invoice');
    }
  };

      // 5. Fetch Plans for Renewal
      const { data: plansData } = await supabase
        .from('membership_plans')
        .select('*')
        .eq('gym_id', gym.id)
        .eq('status', 'active');
        
      if (plansData) {
        setPlans(plansData as Plan[]);
      }

      // 6. Fetch PT Assignment
      const { data: ptData } = await supabase
        .from('pt_memberships')
        .select('*, trainers(*), pt_plans(*)')
        .eq('member_id', id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (ptData) setCurrentPT(ptData as any);

      // 7. Fetch Diet Assignment
      const { data: dietData } = await supabase
        .from('member_diet_plans')
        .select('*, diet_plans(*)')
        .eq('member_id', id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (dietData) setCurrentDiet(dietData as any);

    } catch (err: any) {
      setError(err.message || 'Failed to load member profile');
    } finally {
      setLoading(false);
    }
  };

  async function loadAssignmentData() {
    if (!gym) return;
    try {
      const [trainersRes, ptPlansRes, dietPlansRes] = await Promise.all([
        supabase.from('trainers').select('*').eq('gym_id', gym.id).eq('status', 'active'),
        supabase.from('pt_plans').select('*').eq('gym_id', gym.id).eq('status', 'active'),
        supabase.from('diet_plans').select('*').eq('gym_id', gym.id)
      ]);
      if (trainersRes.data) setAvailableTrainers(trainersRes.data as Trainer[]);
      if (ptPlansRes.data) setAvailablePTPlans(ptPlansRes.data as PTPlan[]);
      if (dietPlansRes.data) setAvailableDietPlans(dietPlansRes.data as DietPlan[]);
    } catch (err) {
      console.error('Failed to load assignment data', err);
    }
  }

  useEffect(() => {
    fetchMemberData();
  }, [gym, id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gym || !member) return;
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('members')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          gender: formData.gender,
          date_of_birth: formData.date_of_birth || null,
          email: formData.email || null,
          address: formData.address || null
        })
        .eq('id', member.id);
        
      if (error) throw error;
      
      setIsEditing(false);
      await fetchMemberData();
    } catch (err: any) {
      alert(err.message || 'Failed to update member');
    } finally {
      setIsSaving(false);
    }
  };

  const getMembershipStatusBadge = (ms: Membership) => {
    const end = new Date(ms.end_date);
    const now = new Date();
    
    if (ms.status !== 'active') return <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-500/10 text-gray-400">INACTIVE</span>;
    if (end < now) return <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-red-500/10 text-red-400">EXPIRED</span>;
    
    const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 3600 * 24));
    if (daysLeft <= 7) return <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500/10 text-amber-400">EXPIRING SOON</span>;
    
    return <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-green-500/10 text-green-400">ACTIVE</span>;
  };

  const handleRenew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gym || !member || !selectedPlanId) return;
    
    try {
      setIsRenewing(true);
      const plan = plans.find(p => p.id === selectedPlanId);
      if (!plan) throw new Error('Plan not found');
      
      const start = new Date();
      const end = new Date();
      end.setMonth(end.getMonth() + plan.duration_months);
      end.setDate(end.getDate() + plan.duration_days);

      const { error } = await supabase.from('memberships').insert({
        gym_id: gym.id,
        member_id: member.id,
        plan_id: plan.id,
        start_date: start.toISOString().split('T')[0],
        end_date: end.toISOString().split('T')[0],
        original_amount: plan.price,
        final_amount: plan.price,
        due_amount: plan.price,
        paid_amount: 0,
        status: 'active'
      } as any);

      if (error) throw error;
      
      setShowRenewModal(false);
      setSelectedPlanId('');
      await fetchMemberData();
    } catch (err: any) {
      alert(err.message || 'Failed to renew membership');
    } finally {
      setIsRenewing(false);
    }
  };

  const handleAssignPT = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gym || !member || !ptForm.trainer_id || !ptForm.pt_plan_id) return;
    
    try {
      setIsSaving(true);
      const plan = availablePTPlans.find(p => p.id === ptForm.pt_plan_id);
      if (!plan) throw new Error('Plan not found');
      
      const start = new Date();
      const end = new Date();
      end.setMonth(end.getMonth() + (plan.duration_months || 0));
      end.setDate(end.getDate() + (plan.duration_days || 0));

      const isIncluded = currentMembership?.membership_plans?.pt_included;
      const finalPrice = isIncluded ? 0 : plan.price;

      const { error } = await supabase.from('pt_memberships').insert({
        gym_id: gym.id,
        member_id: member.id,
        trainer_id: ptForm.trainer_id,
        pt_plan_id: plan.id,
        start_date: start.toISOString().split('T')[0],
        end_date: end.toISOString().split('T')[0],
        original_amount: finalPrice,
        final_amount: finalPrice,
        due_amount: finalPrice,
        paid_amount: 0,
        status: 'active'
      } as any);

      if (error) throw error;
      
      setShowPTModal(false);
      setPtForm({ trainer_id: '', pt_plan_id: '' });
      await fetchMemberData();
    } catch (err: any) {
      alert(err.message || 'Failed to assign PT');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssignDiet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gym || !member || !dietForm.diet_plan_id) return;
    
    try {
      setIsSaving(true);
      const start = new Date();
      
      const { error } = await supabase.from('member_diet_plans').insert({
        gym_id: gym.id,
        member_id: member.id,
        diet_plan_id: dietForm.diet_plan_id,
        start_date: start.toISOString().split('T')[0],
        status: 'active'
      } as any);

      if (error) throw error;
      
      setShowDietModal(false);
      setDietForm({ diet_plan_id: '' });
      await fetchMemberData();
    } catch (err: any) {
      alert(err.message || 'Failed to assign Diet Plan');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
        <p className="text-red-400">{error || 'Member not found'}</p>
        <button onClick={() => navigate('/members')} className="mt-4 text-sm text-white underline">Back to Members</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/members')}
          className="p-2 text-gray-400 hover:text-white bg-surface rounded-lg transition-colors border border-surface-highlight"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{member.full_name}</h1>
          <p className="text-sm text-gray-400 mt-1">ID: {member.member_id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Personal Info & Attendance */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface border border-surface-highlight rounded-xl p-6 relative">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="absolute top-6 right-6 text-sm font-medium text-primary-400 hover:text-primary-300"
              >
                Edit
              </button>
            ) : null}
            
            <div className="flex flex-col items-center mb-6">
              <div className="w-32 h-32 rounded-full bg-background flex items-center justify-center text-gray-400 font-bold text-3xl border-2 border-surface-highlight mb-4 overflow-hidden">
                {member.photo_url ? (
                  <img src={member.photo_url} alt={member.full_name} className="w-full h-full object-cover" />
                ) : (
                  member.full_name.charAt(0).toUpperCase()
                )}
              </div>
              <h2 className="text-xl font-bold text-white">{member.full_name}</h2>
              {(() => {
                if (member.is_blocked) return <span className="mt-2 px-2.5 py-1 rounded-md text-xs font-bold border bg-red-500/10 text-red-500 border-red-500/20 flex items-center gap-1"><Ban className="w-3 h-3"/>BLOCKED</span>;
                const now = new Date();
                now.setHours(0,0,0,0);
                const activeFreeze = member.member_freezes?.find(f => {
                  const from = new Date(f.freeze_from);
                  const to = new Date(f.freeze_to);
                  return now >= from && now <= to;
                });
                if (activeFreeze) return <span className="mt-2 px-2.5 py-1 rounded-md text-xs font-bold border bg-blue-500/10 text-blue-400 border-blue-500/20 flex items-center gap-1"><Snowflake className="w-3 h-3"/>FROZEN UNTIL {new Date(activeFreeze.freeze_to).toLocaleDateString()}</span>;
                const isExpired = currentMembership ? new Date(currentMembership.end_date) < new Date() : true;
                if (isExpired) return <span className="mt-2 px-2.5 py-1 rounded-md text-xs font-bold border bg-orange-500/10 text-orange-400 border-orange-500/20">EXPIRED</span>;
                return <span className="mt-2 px-2.5 py-1 rounded-md text-xs font-bold border bg-green-500/10 text-green-400 border-green-500/20">ACTIVE</span>;
              })()}
            </div>

            {!isEditing ? (
              <div className="space-y-4 pt-4 border-t border-surface-highlight">
                <div className="flex items-center gap-3 text-gray-300">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{member.phone}</span>
                </div>
                {member.email && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{member.email}</span>
                  </div>
                )}
                {member.date_of_birth && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{new Date(member.date_of_birth).toLocaleDateString()}</span>
                  </div>
                )}
                {member.address && (
                  <div className="flex items-start gap-3 text-gray-300">
                    <MapPin className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                    <span className="text-sm">{member.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-gray-300">
                  <UserIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{member.gender ? member.gender.charAt(0).toUpperCase() + member.gender.slice(1).replace(/_/g, ' ') : 'N/A'}</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-4 pt-4 border-t border-surface-highlight">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Full Name *</label>
                  <input required type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full bg-background border border-surface-highlight rounded md px-3 py-1.5 text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Phone *</label>
                  <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-background border border-surface-highlight rounded md px-3 py-1.5 text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-background border border-surface-highlight rounded md px-3 py-1.5 text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Date of Birth</label>
                  <input type="date" value={formData.date_of_birth} onChange={e => setFormData({...formData, date_of_birth: e.target.value})} className="w-full bg-background border border-surface-highlight rounded md px-3 py-1.5 text-white text-sm [color-scheme:dark]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Gender</label>
                  <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full bg-background border border-surface-highlight rounded md px-3 py-1.5 text-white text-sm">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer Not To Say</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Address</label>
                  <textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-background border border-surface-highlight rounded md px-3 py-1.5 text-white text-sm" rows={2} />
                </div>
                
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setIsEditing(false)} className="flex-1 px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors bg-background rounded-md">Cancel</button>
                  <button type="submit" disabled={isSaving} className="flex-1 px-3 py-1.5 text-sm font-semibold text-black bg-primary-500 hover:bg-primary-600 transition-colors rounded-md flex items-center justify-center">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="bg-surface border border-surface-highlight rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-primary-500" />
              <h3 className="text-lg font-bold text-white">Attendance Summary</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-surface-highlight">
                <span className="text-sm text-gray-400">Total Visits</span>
                <span className="text-lg font-bold text-white">{attendanceSummary.total}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-400">Last Visit</span>
                <span className="text-sm font-medium text-white">
                  {attendanceSummary.lastVisit ? new Date(attendanceSummary.lastVisit).toLocaleDateString() : 'No visits yet'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Memberships */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface border border-surface-highlight rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Current Membership</h3>
              <div className="flex gap-2">
                {currentMembership && Number(currentMembership.due_amount) > 0 && (
                  <button 
                    onClick={() => {
                      setRecordPaymentAmount(currentMembership.due_amount.toString());
                      setShowRecordPaymentModal(true);
                    }}
                    className="px-4 py-2 bg-green-500 text-black text-sm font-bold rounded-lg hover:bg-green-400 transition-colors"
                  >
                    Record Payment
                  </button>
                )}
                <button 
                  onClick={() => setShowRenewModal(true)}
                  className="px-4 py-2 bg-amber-500 text-black text-sm font-bold rounded-lg hover:bg-amber-400 transition-colors"
                >
                  Renew Membership
                </button>
              </div>
            </div>
            
            {currentMembership ? (
              <div className="bg-background border border-surface-highlight rounded-xl p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary-500" />
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="font-bold text-white text-xl">{currentMembership.membership_plans?.name || 'Unknown Plan'}</h4>
                    <p className="text-sm text-gray-400 mt-1">
                      ₹{currentMembership.final_amount} 
                    </p>
                  </div>
                  {getMembershipStatusBadge(currentMembership)}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Start Date</p>
                    <p className="text-sm font-medium text-white mt-1">{new Date(currentMembership.start_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">End Date</p>
                    <p className="text-sm font-medium text-white mt-1">{new Date(currentMembership.end_date).toLocaleDateString()}</p>
                  </div>
                  <div className="col-span-2 md:col-span-4 flex items-center gap-4 pt-2 border-t border-surface-highlight">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500 uppercase font-bold">PT Included</span>
                      <span className="text-sm font-medium text-amber-500">
                        {currentMembership.membership_plans?.pt_included ? '✓ Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500 uppercase font-bold">Diet Included</span>
                      <span className="text-sm font-medium text-green-500">
                        {currentMembership.membership_plans?.diet_included ? '✓ Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 bg-background border border-surface-highlight border-dashed rounded-xl">
                <p className="text-gray-400">No active membership found.</p>
              </div>
            )}
          </div>

          <div className="bg-surface border border-surface-highlight rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-bold text-white">Membership History</h3>
            </div>
            
            {membershipHistory.length > 0 ? (
              <div className="space-y-4">
                {membershipHistory.map(ms => (
                  <div key={ms.id} className="flex justify-between items-center p-4 bg-background border border-surface-highlight rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{ms.membership_plans?.name || 'Unknown Plan'}</span>
                        {getMembershipStatusBadge(ms)}
                      </div>
                      <div className="text-xs text-gray-400 mt-1 flex gap-2">
                        <span>{new Date(ms.start_date).toLocaleDateString()} &rarr; {new Date(ms.end_date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>₹{ms.final_amount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No previous memberships.</p>
              </div>
            )}
          </div>

          <div className="bg-surface border border-surface-highlight rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Snowflake className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-bold text-white">Freeze History</h3>
            </div>
            {member.member_freezes && member.member_freezes.length > 0 ? (
              <div className="space-y-4">
                {[...member.member_freezes].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(f => {
                  const now = new Date();
                  now.setHours(0,0,0,0);
                  const isCurrent = now >= new Date(f.freeze_from) && now <= new Date(f.freeze_to);
                  return (
                    <div key={f.id} className={`flex justify-between items-center p-4 bg-background border ${isCurrent ? 'border-blue-500/50' : 'border-surface-highlight'} rounded-lg`}>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">Frozen</span>
                          {isCurrent && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400">CURRENT</span>}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 flex gap-2">
                          <span>{new Date(f.freeze_from).toLocaleDateString()} &rarr; {new Date(f.freeze_to).toLocaleDateString()}</span>
                        </div>
                        {f.reason && <p className="text-sm text-gray-500 mt-2">{f.reason}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No freeze records.</p>
              </div>
            )}
          </div>
        </div>

        {/* Payments & Operations Column */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-surface border border-surface-highlight rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg font-bold text-white">Personal Training</h3>
              </div>
              <button 
                onClick={() => { loadAssignmentData(); setShowPTModal(true); }}
                className="p-2 bg-surface-highlight text-white rounded-lg hover:bg-amber-500 hover:text-black transition-colors"
                title="Assign PT"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {currentPT ? (
              <div className="bg-background border border-surface-highlight rounded-xl p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-white">{currentPT.pt_plans?.name || 'Unknown PT Plan'}</h4>
                  <span className="text-[10px] uppercase font-bold bg-green-500/10 text-green-500 px-2 py-0.5 rounded">Active</span>
                </div>
                <p className="text-sm text-amber-500 font-medium mb-3">Trainer: {currentPT.trainers?.name || 'Unknown'}</p>
                <div className="text-xs text-gray-400 flex gap-2">
                  <span>{new Date(currentPT.start_date).toLocaleDateString()}</span>
                  <span>&rarr;</span>
                  <span>{new Date(currentPT.end_date).toLocaleDateString()}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 bg-background border border-surface-highlight border-dashed rounded-xl gap-2">
                {currentMembership?.membership_plans?.pt_included ? (
                  <>
                    <span className="text-sm text-amber-500 font-medium flex items-center gap-1">✓ PT Included</span>
                    <p className="text-gray-500 text-sm">Trainer: Not Assigned</p>
                  </>
                ) : (
                  <p className="text-gray-500 text-sm">PT: Not Included</p>
                )}
              </div>
            )}
          </div>

          <div className="bg-surface border border-surface-highlight rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Apple className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg font-bold text-white">Diet Plan</h3>
              </div>
              <button 
                onClick={() => { loadAssignmentData(); setShowDietModal(true); }}
                className="p-2 bg-surface-highlight text-white rounded-lg hover:bg-green-500 hover:text-black transition-colors"
                title="Assign Diet"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {currentDiet ? (
              <div className="bg-background border border-surface-highlight rounded-xl p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-white">{currentDiet.diet_plans?.name || 'Unknown Diet Plan'}</h4>
                  <span className="text-[10px] uppercase font-bold bg-green-500/10 text-green-500 px-2 py-0.5 rounded">Active</span>
                </div>
                <div className="text-xs text-gray-400 flex gap-2">
                  <span>Assigned: {new Date(currentDiet.start_date).toLocaleDateString()}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 bg-background border border-surface-highlight border-dashed rounded-xl gap-2">
                {currentMembership?.membership_plans?.diet_included ? (
                  <>
                    <span className="text-sm text-green-500 font-medium flex items-center gap-1">✓ Diet Plan Included</span>
                    <p className="text-gray-500 text-sm">Diet Plan: Not Assigned</p>
                  </>
                ) : (
                  <p className="text-gray-500 text-sm">DIET: Not Included</p>
                )}
              </div>
            )}
          </div>
          
          <div className="bg-surface border border-surface-highlight rounded-xl p-6 md:col-span-2">
            <h3 className="text-lg font-bold text-white mb-6">Payment History</h3>
            {payments.length > 0 ? (
              <div className="space-y-4">
                {payments.map(payment => (
                  <div key={payment.id} className="flex justify-between items-center p-4 bg-background border border-surface-highlight rounded-lg">
                    <div>
                      <div className="font-bold text-white">₹{payment.amount}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(payment.payment_date).toLocaleDateString()} • {payment.payment_method}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-bold">
                        {payment.status.toUpperCase()}
                      </span>
                      <button
                        onClick={() => handleViewInvoice(payment)}
                        className="px-2.5 py-1 bg-surface-highlight hover:bg-amber-500 text-gray-300 hover:text-black rounded text-xs font-bold transition-colors"
                      >
                        Invoice
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No payment history.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Renew Modal */}
      {showRenewModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-xl w-full max-w-md border border-surface-highlight overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-surface-highlight">
              <h2 className="text-xl font-bold text-white">Renew Membership</h2>
              <button
                onClick={() => setShowRenewModal(false)}
                className="text-gray-400 hover:text-white transition-colors text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleRenew} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Select New Plan *</label>
                <select
                  required
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="">-- Choose a Plan --</option>
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-surface-highlight">
                <button
                  type="button"
                  onClick={() => setShowRenewModal(false)}
                  className="flex-1 px-4 py-2.5 bg-background text-gray-300 rounded-lg hover:text-white transition-colors font-medium border border-surface-highlight"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRenewing || !selectedPlanId}
                  className="flex-1 flex justify-center items-center px-4 py-2.5 bg-amber-500 text-black rounded-lg hover:bg-amber-400 transition-colors font-bold disabled:opacity-50"
                >
                  {isRenewing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Renewal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Assign PT Modal */}
      {showPTModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-xl w-full max-w-md border border-surface-highlight overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-surface-highlight">
              <h2 className="text-xl font-bold text-white">Assign Personal Training</h2>
              <button onClick={() => setShowPTModal(false)} className="text-gray-400 hover:text-white">
                <span className="text-2xl leading-none">&times;</span>
              </button>
            </div>
            
            <form onSubmit={handleAssignPT} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Select Trainer *</label>
                <select
                  required
                  value={ptForm.trainer_id}
                  onChange={(e) => setPtForm({...ptForm, trainer_id: e.target.value})}
                  className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="">-- Choose a Trainer --</option>
                  {availableTrainers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.specialization})</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Select PT Plan *</label>
                <select
                  required
                  value={ptForm.pt_plan_id}
                  onChange={(e) => setPtForm({...ptForm, pt_plan_id: e.target.value})}
                  className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="">-- Choose a Plan --</option>
                  {availablePTPlans.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-surface-highlight">
                <button type="button" onClick={() => setShowPTModal(false)} className="flex-1 px-4 py-2.5 bg-background text-gray-300 rounded-lg border border-surface-highlight hover:text-white transition-colors font-medium">Cancel</button>
                <button type="submit" disabled={isSaving || !ptForm.trainer_id || !ptForm.pt_plan_id} className="flex-1 flex justify-center items-center px-4 py-2.5 bg-amber-500 text-black rounded-lg hover:bg-amber-400 transition-colors font-bold disabled:opacity-50">
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Assign PT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Diet Modal */}
      {showDietModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-xl w-full max-w-md border border-surface-highlight overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-surface-highlight">
              <h2 className="text-xl font-bold text-white">Assign Diet Plan</h2>
              <button onClick={() => setShowDietModal(false)} className="text-gray-400 hover:text-white">
                <span className="text-2xl leading-none">&times;</span>
              </button>
            </div>
            
            <form onSubmit={handleAssignDiet} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Select Diet Plan *</label>
                <select
                  required
                  value={dietForm.diet_plan_id}
                  onChange={(e) => setDietForm({...dietForm, diet_plan_id: e.target.value})}
                  className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-green-500 outline-none"
                >
                  <option value="">-- Choose a Plan --</option>
                  {availableDietPlans.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-surface-highlight">
                <button type="button" onClick={() => setShowDietModal(false)} className="flex-1 px-4 py-2.5 bg-background text-gray-300 rounded-lg border border-surface-highlight hover:text-white transition-colors font-medium">Cancel</button>
                <button type="submit" disabled={isSaving || !dietForm.diet_plan_id} className="flex-1 flex justify-center items-center px-4 py-2.5 bg-green-500 text-black rounded-lg hover:bg-green-400 transition-colors font-bold disabled:opacity-50">
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Assign Diet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showRecordPaymentModal && currentMembership && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-surface-highlight rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-surface-highlight">
              <h2 className="text-xl font-bold text-white">Record Payment</h2>
              <button
                onClick={() => setShowRecordPaymentModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Membership Plan
                </label>
                <input 
                  disabled 
                  value={currentMembership.membership_plans?.name || 'Active Membership'}
                  className="w-full bg-background/50 border border-surface-highlight rounded-lg px-4 py-2.5 text-gray-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    step="0.01"
                    value={recordPaymentAmount}
                    onChange={(e) => setRecordPaymentAmount(e.target.value)}
                    className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Payment Date *
                  </label>
                  <input
                    required
                    type="date"
                    value={recordPaymentDate}
                    onChange={(e) => setRecordPaymentDate(e.target.value)}
                    className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Payment Method *
                </label>
                <select
                  required
                  value={recordPaymentMethod}
                  onChange={(e) => setRecordPaymentMethod(e.target.value)}
                  className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  value={recordPaymentNotes}
                  onChange={(e) => setRecordPaymentNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 resize-none"
                  placeholder="Optional notes..."
                ></textarea>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-surface-highlight">
                <button
                  type="button"
                  onClick={() => setShowRecordPaymentModal(false)}
                  className="flex-1 px-4 py-2.5 bg-background text-gray-300 rounded-lg hover:text-white transition-colors font-medium border border-surface-highlight"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRecordingPayment}
                  className="flex-1 flex justify-center items-center space-x-2 px-4 py-2.5 bg-amber-500 text-black rounded-lg hover:bg-amber-400 transition-colors font-bold disabled:opacity-50"
                >
                  {isRecordingPayment ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Save Payment</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Invoice Modal Overlay */}
      {invoiceToPrint && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-gray-900 rounded-xl w-full max-w-2xl shadow-2xl p-8 relative print:absolute print:inset-0 print:shadow-none print:p-0">
            <style>{`
              @media print {
                body * {
                  visibility: hidden;
                }
                .print-container, .print-container * {
                  visibility: visible;
                }
                .print-container {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%;
                }
              }
            `}</style>
            
            <button 
              onClick={() => setInvoiceToPrint(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 print:hidden"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="space-y-6 print-container">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-gray-200 pb-6">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900 uppercase">{gym?.name}</h1>
                  <p className="text-sm text-gray-500 mt-1">{gym?.address || 'Gym Address Not Configured'}</p>
                  <p className="text-sm text-gray-500">Phone: {gym?.phone || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold uppercase rounded-full">Paid</span>
                  <p className="text-sm font-semibold text-gray-800 mt-3">Invoice Number</p>
                  <p className="text-lg font-bold text-amber-600">{invoiceToPrint.invoice_number}</p>
                </div>
              </div>
              
              {/* Details */}
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <h3 className="font-bold text-gray-800 uppercase tracking-wider text-xs mb-2">Billed To</h3>
                  <p className="font-semibold">{invoiceToPrint.members?.full_name}</p>
                  <p className="text-gray-500">Phone: {invoiceToPrint.members?.phone}</p>
                  <p className="text-gray-500">Member ID: {invoiceToPrint.members?.member_id}</p>
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-gray-800 uppercase tracking-wider text-xs mb-2">Invoice Info</h3>
                  <p><span className="text-gray-500">Issue Date:</span> {new Date(invoiceToPrint.issue_date).toLocaleDateString()}</p>
                  <p><span className="text-gray-500">Payment Method:</span> {invoiceToPrint.payment?.payment_method?.toUpperCase() || 'CASH'}</p>
                </div>
              </div>
              
              {/* Table */}
              <div className="border-t border-b border-gray-200 py-4">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-xs uppercase font-bold text-gray-500">
                      <th className="py-2">Description</th>
                      <th className="py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-3">
                        <span className="font-semibold">{invoiceToPrint.memberships?.membership_plans?.name || 'Gym Membership'}</span>
                        {invoiceToPrint.memberships && (
                          <div className="text-xs text-gray-400 mt-0.5">
                            Validity: {new Date(invoiceToPrint.memberships.start_date).toLocaleDateString()} to {new Date(invoiceToPrint.memberships.end_date).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="py-3 text-right font-bold">₹{Number(invoiceToPrint.total_amount).toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {/* Totals */}
              <div className="flex justify-end text-sm">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal:</span>
                    <span className="font-semibold">₹{Number(invoiceToPrint.subtotal).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold">
                    <span>Total Paid:</span>
                    <span className="text-amber-600">₹{Number(invoiceToPrint.total_amount).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="text-center text-xs text-gray-400 pt-8 border-t border-gray-100">
                <p>Thank you for your business!</p>
                {gym?.settings && (gym.settings as any).receipt_footer && (
                  <p className="mt-1 font-medium text-gray-500">{(gym.settings as any).receipt_footer}</p>
                )}
              </div>
            </div>
            
            <div className="mt-8 flex justify-end gap-3 print:hidden">
              <button 
                onClick={() => setInvoiceToPrint(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Close
              </button>
              <button 
                onClick={() => window.print()}
                className="px-6 py-2 bg-amber-500 text-gray-900 rounded-lg hover:bg-amber-400 transition-colors font-bold flex items-center gap-2"
              >
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
