// @ts-nocheck
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Phone, MessageCircle, RefreshCw, CreditCard, ChevronRight, Download, History, Dumbbell, Snowflake, X } from 'lucide-react';
import { supabase, supabaseConfigured } from '../../lib/supabase';
import { freezeMembership } from '../../services/memberships.service';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Avatar } from '../../components/ui/Avatar';
import { dietService, type DietPlan } from '../../services/diet.service';
import { Utensils, Target } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import type { Member, Membership, Payment } from '../../lib/database.types';

// Mock data
const DEMO_MEMBER = {
  id: 'm1',
  gym_id: 'demo-gym-id',
  member_id: 'FG-1001',
  full_name: 'Rahul Sharma',
  phone: '+91 9876543210',
  email: 'rahul@example.com',
  date_of_birth: '1995-05-15',
  gender: 'male',
  address: 'Mumbai, MH',
  emergency_contact: '9988776655',
  photo_url: null,
  notes: 'Prefers morning batches.',
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const DEMO_MEMBERSHIP = {
  id: 'ms1',
  plan_id: 'p1',
  start_date: '2023-08-01',
  end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Expires in 3 days
  status: 'active',
  original_amount: 3000,
  discount_amount: 0,
  discount_type: 'fixed',
  final_amount: 3000,
  paid_amount: 1500,
  due_amount: 1500,
};

const DEMO_PAYMENTS = [
  {
    id: 'pay1',
    amount: 1500,
    payment_date: '2023-08-01T10:00:00Z',
    payment_method: 'upi',
    status: 'completed',
  }
];

export function MemberProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { gym, isDemo } = useAuth();
  
  const [member, setMember] = useState<Member | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [memberDiet, setMemberDiet] = useState<any>(null);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [selectedDiet, setSelectedDiet] = useState('');
  const [isAssigningDiet, setIsAssigningDiet] = useState(false);
  const [memberPT, setMemberPT] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { toast } = useToast();
  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);
  const [freezeStartDate, setFreezeStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [freezeEndDate, setFreezeEndDate] = useState('');
  const [freezeReason, setFreezeReason] = useState('');
  const [isFreezing, setIsFreezing] = useState(false);

  const fetchProfile = async () => {
    if (!gym || !id) return;
    setLoading(true);
    try {
      if (isDemo || !supabaseConfigured) {
        setMember(DEMO_MEMBER as Member);
        setMembership(DEMO_MEMBERSHIP as Membership);
        setPayments(DEMO_PAYMENTS as Payment[]);
      } else {
        // Fetch Member
        const { data: memberData, error: memberError } = await supabase
          .from('members')
          .select('*')
          .eq('id', id)
          .single();
        if (memberError) throw memberError;
        setMember(memberData);

        // Fetch Membership (Latest active or most recent)
        const { data: membershipData, error: membershipError } = await supabase
          .from('memberships')
          .select('*')
          .eq('member_id', id)
          .order('end_date', { ascending: false })
          .limit(1);
        
        if (membershipError) throw membershipError;
        if (membershipData && membershipData.length > 0) {
          setMembership(membershipData[0]);
        }

        // Fetch Payments
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select('*')
          .eq('member_id', id)
          .order('payment_date', { ascending: false });
          
        if (paymentsError) throw paymentsError;
        setPayments(paymentsData || []);

        // Fetch Diet
        const dietRes = await dietService.getMemberDietPlan(gym.id, id);
        if (dietRes.data) setMemberDiet(dietRes.data);
        
        const dPlansRes = await dietService.fetchDietPlans(gym.id);
        if (dPlansRes.data) setDietPlans(dPlansRes.data);

        // Fetch PT
        const { data: ptData } = await supabase
          .from('pt_memberships')
          .select('*, trainer:trainers(name), pt_plan:pt_plans(name)')
          .eq('member_id', id)
          .eq('status', 'active')
          .maybeSingle();
        setMemberPT(ptData);
      }
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, gym, isDemo]);

  if (loading) return <LoadingState fullScreen />;
  if (error || !member) return <ErrorState title="Member not found" message={error?.message} onRetry={fetchProfile} />;

  const getStatusBadge = () => {
    if (member.status === 'inactive') return <Badge variant="default">Inactive</Badge>;
    if (!membership) return <Badge variant="warning">No Plan</Badge>;
    if (membership.status === 'expired') return <Badge variant="danger">Expired</Badge>;
    
    const endDate = new Date(membership.end_date);
    const daysLeft = Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 7 && daysLeft >= 0) return <Badge variant="warning">Expiring soon</Badge>;
    if (membership.status === 'frozen') return <Badge variant="info">Frozen</Badge>;
    return <Badge variant="success">Active</Badge>;
  };

  const handleAssignDiet = async () => {
    if (!gym || !selectedDiet || !id) return;
    setIsAssigningDiet(true);
    try {
      await dietService.assignDietPlan(gym.id, id, selectedDiet);
      toast('success', 'Diet plan assigned');
      const dietRes = await dietService.getMemberDietPlan(gym.id, id);
      if (dietRes.data) setMemberDiet(dietRes.data);
    } catch (err) {
      toast('error', 'Failed to assign diet plan');
    } finally {
      setIsAssigningDiet(false);
    }
  };

  const handleFreeze = async () => {
    if (!gym || !membership) return;
    if (!freezeStartDate || !freezeEndDate || !freezeReason) {
      toast('error', 'Please fill all freeze details');
      return;
    }
    
    setIsFreezing(true);
    try {
      const { error } = await freezeMembership(gym.id, membership.id, {
        start_date: freezeStartDate,
        end_date: freezeEndDate,
        reason: freezeReason,
      });
      if (error) throw new Error(error);
      
      toast('success', 'Membership frozen successfully');
      setIsFreezeModalOpen(false);
      fetchProfile();
    } catch (err: any) {
      toast('error', err.message || 'Failed to freeze membership');
    } finally {
      setIsFreezing(false);
    }
  };

  return (
    <div className="pb-24 animate-in fade-in duration-300">
      <PageHeader title="Member Profile" showBack />

      {/* Header Profile Info */}
      <div className="mt-6 flex flex-col items-center text-center">
        <Avatar name={member.full_name} src={member.photo_url || undefined} size="lg" className="w-24 h-24 mb-4 text-2xl" />
        <h1 className="text-2xl font-bold text-[#F4F1E8]">{member.full_name}</h1>
        <p className="text-sm text-[#A7A39A] mt-1">{member.member_id}</p>
        <div className="mt-3">
          {getStatusBadge()}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 mt-8">
        <Button 
          variant="secondary" 
          className="flex-1"
          onClick={() => window.open(`tel:${member.phone}`)}
        >
          <Phone className="w-5 h-5 mb-1 text-[#A7A39A]" />
          <span className="text-xs">Call</span>
        </Button>
        <Button 
          variant="secondary" 
          className="flex-1 text-[#4D6B5A] hover:text-emerald-300 hover:bg-[#4D6B5A]/20"
          onClick={() => {
            const msg = encodeURIComponent(`Hi ${member.full_name}, this is from Froster Gym.`);
            window.open(`https://wa.me/${member.phone.replace(/[^0-9]/g, '')}?text=${msg}`, '_blank');
          }}
        >
          <MessageCircle className="w-5 h-5 mb-1" />
          <span className="text-xs">WhatsApp</span>
        </Button>
        <Button 
          variant="secondary" 
          className="flex-1 text-[#E2C46B] hover:text-cyan-300 hover:bg-[#C9A24D]/10"
          onClick={() => navigate(`/app/members/${member.id}/renew`)}
        >
          <RefreshCw className="w-5 h-5 mb-1" />
          <span className="text-xs">Renew</span>
        </Button>
        <Button 
          variant="secondary" 
          className="flex-1 text-[#8E7135] hover:text-amber-300 hover:bg-[#8E7135]/20"
        >
          <CreditCard className="w-5 h-5 mb-1" />
          <span className="text-xs">Payment</span>
        </Button>
        <Button 
          variant="secondary" 
          className="flex-1 text-[#E2C46B] hover:text-blue-300 hover:bg-[#C9A24D]/10"
          onClick={() => setIsFreezeModalOpen(true)}
          disabled={!membership || membership.status !== 'active'}
        >
          <Snowflake className="w-5 h-5 mb-1" />
          <span className="text-xs">Freeze</span>
        </Button>
      </div>

      <div className="space-y-6 mt-8">
        
        {/* Current Membership */}
        {membership ? (
          <div className="bg-[#11110F] border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.08)] bg-[#11110F] flex justify-between items-center">
              <h3 className="text-sm font-semibold text-[#F4F1E8] uppercase tracking-wider flex items-center">
                <Dumbbell className="w-4 h-4 mr-2 text-[#C9A24D]" />
                Current Plan
              </h3>
              {membership.due_amount > 0 && (
                <span className="text-xs font-semibold text-[#8E7135] bg-[#8E7135]/20 px-2 py-1 rounded-full">
                  ₹{membership.due_amount} Due
                </span>
              )}
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[#706D66]">Plan</p>
                <p className="text-sm font-medium text-[#F4F1E8]">{membership.plan_id ? 'Standard Plan' : 'Custom Plan'}</p>
              </div>
              <div>
                <p className="text-xs text-[#706D66]">Amount</p>
                <p className="text-sm font-medium text-[#F4F1E8]">₹{membership.final_amount}</p>
              </div>
              <div>
                <p className="text-xs text-[#706D66]">Start Date</p>
                <p className="text-sm font-medium text-[#F4F1E8]">{new Date(membership.start_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-[#706D66]">Expiry Date</p>
                <p className="text-sm font-medium text-[#F4F1E8]">{new Date(membership.end_date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#11110F] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 text-center">
            <p className="text-sm text-[#A7A39A] mb-4">No active membership plan</p>
            <Button size="sm" onClick={() => navigate(`/app/members/${member.id}/renew`)}>Assign Plan</Button>
          </div>
        )}

        {/* Diet Plan */}
        <div className="bg-[#11110F] border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.08)] bg-[#11110F]">
            <h3 className="text-sm font-semibold text-[#F4F1E8] uppercase tracking-wider flex items-center">
              <Utensils className="w-4 h-4 mr-2 text-[#4D6B5A]" />
              Diet Plan
            </h3>
          </div>
          <div className="p-4">
            {memberDiet ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#706D66]">Plan Name</p>
                  <p className="text-sm font-medium text-[#F4F1E8]">{memberDiet.diet_plan?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-[#706D66]">Calories</p>
                  <p className="text-sm font-medium text-[#F4F1E8]">{memberDiet.diet_plan?.calories} kcal</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <select 
                  className="flex-1 h-[40px] bg-[#0B0B0A] border border-[rgba(255,255,255,0.08)] rounded-xl px-3 text-sm text-[#F4F1E8]"
                  value={selectedDiet}
                  onChange={e => setSelectedDiet(e.target.value)}
                >
                  <option value="">Select Diet Plan</option>
                  {dietPlans.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <Button size="sm" onClick={handleAssignDiet} loading={isAssigningDiet} disabled={!selectedDiet}>Assign</Button>
              </div>
            )}
          </div>
        </div>

        {/* Personal Training */}
        {memberPT && (
          <div className="bg-[#11110F] border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.08)] bg-[#11110F]">
              <h3 className="text-sm font-semibold text-[#F4F1E8] uppercase tracking-wider flex items-center">
                <Target className="w-4 h-4 mr-2 text-[#E2C46B]" />
                Personal Training
              </h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[#706D66]">Trainer</p>
                <p className="text-sm font-medium text-[#F4F1E8]">{memberPT.trainer?.name}</p>
              </div>
              <div>
                <p className="text-xs text-[#706D66]">Plan</p>
                <p className="text-sm font-medium text-[#F4F1E8]">{memberPT.pt_plan?.name || 'Custom'}</p>
              </div>
              <div>
                <p className="text-xs text-[#706D66]">Start Date</p>
                <p className="text-sm font-medium text-[#F4F1E8]">{new Date(memberPT.start_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-[#706D66]">End Date</p>
                <p className="text-sm font-medium text-[#F4F1E8]">{new Date(memberPT.end_date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Personal Details */}
        <div className="bg-[#11110F] border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.08)] bg-[#11110F]">
            <h3 className="text-sm font-semibold text-[#F4F1E8] uppercase tracking-wider">Personal Info</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#706D66]">Phone</span>
              <span className="text-sm text-zinc-200">{member.phone}</span>
            </div>
            {member.email && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#706D66]">Email</span>
                <span className="text-sm text-zinc-200">{member.email}</span>
              </div>
            )}
            {member.date_of_birth && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#706D66]">Date of Birth</span>
                <span className="text-sm text-zinc-200">{new Date(member.date_of_birth).toLocaleDateString()}</span>
              </div>
            )}
            {member.gender && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#706D66]">Gender</span>
                <span className="text-sm text-zinc-200 capitalize">{member.gender}</span>
              </div>
            )}
            {member.address && (
              <div className="flex flex-col gap-1">
                <span className="text-sm text-[#706D66]">Address</span>
                <span className="text-sm text-zinc-200">{member.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment History preview */}
        <div className="bg-[#11110F] border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden">
          <button className="w-full px-4 py-3 border-b border-[rgba(255,255,255,0.08)] bg-[#11110F] flex justify-between items-center hover:bg-[#171613]/50 transition-colors">
            <h3 className="text-sm font-semibold text-[#F4F1E8] uppercase tracking-wider flex items-center">
              <History className="w-4 h-4 mr-2 text-[#A7A39A]" />
              Payment History
            </h3>
            <ChevronRight className="w-4 h-4 text-[#706D66]" />
          </button>
          
          {payments.length === 0 ? (
            <div className="p-4 text-center text-sm text-[#706D66]">No payments recorded</div>
          ) : (
            <div className="divide-y divide-zinc-800/50">
              {payments.slice(0, 3).map((payment) => (
                <div key={payment.id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-[#F4F1E8]">₹{payment.amount}</p>
                    <p className="text-xs text-[#706D66] uppercase">{payment.payment_method}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#A7A39A]">{new Date(payment.payment_date).toLocaleDateString()}</p>
                    <span className="text-[10px] font-semibold text-[#4D6B5A] uppercase">{payment.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Invoice Actions */}
        {payments.length > 0 && (
          <Button variant="secondary" fullWidth className="text-zinc-300">
            <Download className="w-4 h-4 mr-2" />
            Download Latest Invoice
          </Button>
        )}

      </div>
      
      {/* Freeze Modal */}
      {isFreezeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0B0A]/60 backdrop-blur-sm">
          <div className="bg-[#0B0B0A] border border-[rgba(255,255,255,0.08)] rounded-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-[rgba(255,255,255,0.08)]">
              <h2 className="text-lg font-bold text-[#F4F1E8] flex items-center gap-2">
                <Snowflake className="w-5 h-5 text-[#E2C46B]" />
                Freeze Membership
              </h2>
              <button onClick={() => setIsFreezeModalOpen(false)} className="text-[#706D66] hover:text-[#F4F1E8]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#A7A39A]">Start Date</label>
                <input 
                  type="date"
                  className="w-full h-11 bg-[#11110F] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 text-[#F4F1E8] focus:ring-2 focus:ring-[#D4AF37]/50 outline-none"
                  value={freezeStartDate}
                  onChange={e => setFreezeStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#A7A39A]">End Date</label>
                <input 
                  type="date"
                  className="w-full h-11 bg-[#11110F] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 text-[#F4F1E8] focus:ring-2 focus:ring-[#D4AF37]/50 outline-none"
                  value={freezeEndDate}
                  onChange={e => setFreezeEndDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#A7A39A]">Reason</label>
                <textarea 
                  className="w-full bg-[#11110F] border border-[rgba(255,255,255,0.08)] rounded-xl p-3 text-[#F4F1E8] focus:ring-2 focus:ring-[#D4AF37]/50 outline-none resize-none"
                  rows={3}
                  placeholder="Reason for freezing..."
                  value={freezeReason}
                  onChange={e => setFreezeReason(e.target.value)}
                />
              </div>
            </div>
            
            <div className="p-4 border-t border-[rgba(255,255,255,0.08)] flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setIsFreezeModalOpen(false)}>Cancel</Button>
              <Button 
                className="flex-1 bg-[#C9A24D] hover:bg-[#8E7135] border-none" 
                loading={isFreezing}
                onClick={handleFreeze}
              >
                Confirm Freeze
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

