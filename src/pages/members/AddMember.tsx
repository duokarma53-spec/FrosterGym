import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Camera, User, Phone, Calendar, Check, Plus, Utensils, Target } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { useToast } from '../../components/ui/Toast';
import { Card } from '../../components/ui/Card';
import { createMember } from '../../services/members.service';
import { fetchPlans, assignMembership, type MembershipPlan } from '../../services/memberships.service';
import { dietService, type DietPlan } from '../../services/diet.service';
import { fetchPTPlans, fetchTrainers, assignPTMembership, type PTPlan, type Trainer } from '../../services/pt.service';

export function AddMember() {
  const navigate = useNavigate();
  const location = useLocation();
  const enquiryState = location.state?.enquiry;
  const { gym } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Form State - Personal Info
  const [fullName, setFullName] = useState(enquiryState?.name || '');
  const [gender, setGender] = useState('');
  
  // Form State - Contact Info
  const [phone, setPhone] = useState(enquiryState?.phone || '');

  // Plans, Diet, PT
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [ptPlans, setPtPlans] = useState<PTPlan[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  
  // Membership State
  const [planId, setPlanId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [discountValue, setDiscountValue] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('upi');

  // Diet State
  const [dietPlanId, setDietPlanId] = useState('');

  // PT State
  const [ptIncluded, setPtIncluded] = useState(false);
  const [ptPlanId, setPtPlanId] = useState('');
  const [trainerId, setTrainerId] = useState('');

  useEffect(() => {
    async function loadData() {
      if (!gym) return;
      try {
        const [activePlans, dietRes, ptRes, trainerRes] = await Promise.all([
          fetchPlans(gym.id),
          dietService.fetchDietPlans(gym.id),
          fetchPTPlans(gym.id),
          fetchTrainers(gym.id)
        ]);
        setPlans(activePlans);
        if (dietRes.data) setDietPlans(dietRes.data);
        if (ptRes) setPtPlans(ptRes);
        if (trainerRes) setTrainers(trainerRes);
      } catch (err) {
        console.error('Failed to load data', err);
      } finally {
        setInitialLoading(false);
      }
    }
    loadData();
  }, [gym]);

  // Derived Values
  const selectedPlan = plans.find(p => p.id === planId);
  const planAmount = selectedPlan ? selectedPlan.price : 0;
  
  const discountAmount = discountType === 'fixed' 
    ? discountValue 
    : (planAmount * discountValue) / 100;
    
  const finalAmount = Math.max(0, planAmount - discountAmount);
  const dueAmount = Math.max(0, finalAmount - paidAmount);

  // When plan changes, reset amounts
  useEffect(() => {
    if (selectedPlan) {
      setDiscountValue(0);
      setPaidAmount(selectedPlan.price);
    } else {
      setPaidAmount(0);
    }
  }, [planId, selectedPlan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !phone) {
      toast('error', 'Name and Phone are required');
      return;
    }
    
    if (!planId || !selectedPlan) {
      toast('error', 'Please select a Membership Plan');
      return;
    }
    
    if (ptIncluded && (!ptPlanId || !trainerId)) {
      toast('error', 'Please select a PT Plan and a Trainer');
      return;
    }

    if (!gym) return;

    setLoading(true);

    try {
      // 1. Create Member
      const memberResponse = await createMember(gym.id, {
        full_name: fullName,
        phone,
        gender: gender || undefined,
        status: 'active'
      });

      if (memberResponse.error || !memberResponse.data) {
        throw new Error(memberResponse.error || 'Failed to create member');
      }

      const member = memberResponse.data;

      // 2. Assign Membership
      const assignResponse = await assignMembership(gym.id, {
        member_id: member.id,
        plan_id: planId,
        start_date: startDate,
        original_amount: planAmount,
        discount_amount: discountAmount,
        final_amount: finalAmount,
        paid_amount: paidAmount,
        payment_method: paymentMethod
      });

      if (assignResponse.error) {
        throw new Error(assignResponse.error);
      }

      // 3. Assign Diet Plan
      if (dietPlanId) {
        await dietService.assignDietPlan(gym.id, member.id, dietPlanId);
      }

      // 4. Assign PT
      if (ptIncluded && ptPlanId && trainerId) {
        // Calculate end date based on PT plan duration
        const ptPlan = ptPlans.find(p => p.id === ptPlanId);
        const ptStartDate = new Date(startDate);
        const ptEndDate = new Date(ptStartDate);
        if (ptPlan && ptPlan.duration_months) {
            ptEndDate.setMonth(ptEndDate.getMonth() + ptPlan.duration_months);
        } else {
            ptEndDate.setMonth(ptEndDate.getMonth() + 1); // default 1 month
        }

        await assignPTMembership(gym.id, member.id, {
          trainer_id: trainerId,
          pt_plan_id: ptPlanId,
          start_date: startDate,
          end_date: ptEndDate.toISOString().split('T')[0],
          final_amount: ptPlan?.price || 0,
          status: 'active'
        });
      }

      toast('success', 'Member added successfully!');
      navigate(`/app/members/${member.id}`);

    } catch (err: any) {
      console.error(err);
      toast('error', err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="p-8 text-center text-[#A7A39A]">Loading...</div>;
  }

  return (
    <div className="pb-24 animate-in slide-in-from-bottom duration-300">
      <PageHeader title="Add New Member" showBack />

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        
        {/* Photo Upload Area (UI Only for now) */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-[#11110F] backdrop-blur-xl border-2 border-dashed border-[rgba(255,255,255,0.12)] flex items-center justify-center">
              <Camera className="w-8 h-8 text-zinc-600" />
            </div>
            <button type="button" className="absolute bottom-0 right-0 w-8 h-8 bg-[#C9A24D] rounded-full flex items-center justify-center border-2 border-zinc-950 text-[#F4F1E8] shadow-lg">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Section 1: Personal & Contact Details */}
        <Card className="space-y-4">
          <h2 className="text-sm font-semibold text-[#E2C46B] uppercase tracking-wider mb-2">Personal Details</h2>
          
          <Input 
            label="Full Name" 
            placeholder="e.g. Rahul Sharma" 
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            icon={<User className="w-5 h-5" />}
            required
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Phone Number" 
              type="tel"
              placeholder="e.g. 9876543210" 
              value={phone}
              onChange={e => setPhone(e.target.value)}
              icon={<Phone className="w-5 h-5" />}
              required
            />
            
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-300">Gender</label>
              <select 
                className="w-full h-[44px] bg-[#11110F] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 text-[#F4F1E8] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 appearance-none"
                value={gender}
                onChange={e => setGender(e.target.value)}
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Section 2: Membership & Payment */}
        <Card className="space-y-4">
          <h2 className="text-sm font-semibold text-[#E2C46B] uppercase tracking-wider mb-2">Membership Plan</h2>
          
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-300">Select Plan</label>
            <select 
              className="w-full h-[44px] bg-[#11110F] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 text-[#F4F1E8] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 appearance-none"
              value={planId}
              onChange={e => setPlanId(e.target.value)}
              required
            >
              <option value="">Select a membership plan</option>
              {plans.length === 0 && <option disabled>No active membership plans available.</option>}
              {plans.map(p => (
                <option key={p.id} value={p.id}>{p.name} — ₹{p.price} — {p.duration_months} Months</option>
              ))}
            </select>
          </div>

          {planId && selectedPlan && (
            <div className="space-y-4 animate-in zoom-in-95 duration-200 pt-2">
              <Input 
                label="Start Date" 
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                icon={<Calendar className="w-5 h-5" />}
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-zinc-300">Discount</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      className="w-full h-[44px] bg-[#11110F] border border-[rgba(255,255,255,0.08)] rounded-xl pl-4 pr-12 text-[#F4F1E8] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                      value={discountValue}
                      onChange={e => setDiscountValue(Number(e.target.value))}
                      min={0}
                    />
                    <button 
                      type="button"
                      className="absolute right-2 top-1.5 bottom-1.5 px-2 bg-[#171613]/80 rounded-lg text-xs font-semibold text-zinc-300 hover:text-[#F4F1E8] transition-colors"
                      onClick={() => setDiscountType(t => t === 'fixed' ? 'percentage' : 'fixed')}
                    >
                      {discountType === 'fixed' ? '₹' : '%'}
                    </button>
                  </div>
                </div>

                <Input 
                  label="Amount Paid Now" 
                  type="number"
                  value={paidAmount}
                  onChange={e => setPaidAmount(Number(e.target.value))}
                  min={0}
                  max={finalAmount}
                />
              </div>

              {/* Payment Summary Box */}
              <div className="bg-[#0B0B0A]/50 border border-[rgba(255,255,255,0.08)]/50 rounded-2xl p-4 space-y-2 mt-2">
                <div className="flex justify-between text-sm text-[#A7A39A]">
                  <span>Plan Amount</span>
                  <span>₹{planAmount}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-[#4D6B5A]">
                    <span>Discount ({discountType === 'percentage' ? `${discountValue}%` : 'Fixed'})</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-semibold text-[#F4F1E8] pt-2 border-t border-[rgba(255,255,255,0.08)]/50">
                  <span>Final Amount</span>
                  <span>₹{finalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-[#8E7135] pt-1">
                  <span>Due Amount</span>
                  <span>₹{dueAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="block text-sm font-medium text-zinc-300">Payment Method</label>
                <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                  {['upi', 'cash', 'card'].map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium capitalize flex-1 border transition-all ${
                        paymentMethod === method 
                        ? 'bg-[#C9A24D]/10 border-[#D4AF37]/50 text-[#E2C46B] shadow-sm shadow-[#D4AF37]/20' 
                        : 'bg-[#11110F] border-[rgba(255,255,255,0.08)] text-[#A7A39A] hover:bg-[#171613]'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Section 3: Add-ons (Diet & PT) */}
        <Card className="space-y-4">
          <h2 className="text-sm font-semibold text-[#E2C46B] uppercase tracking-wider mb-2">Optional Add-ons</h2>
          
          <div className="space-y-1.5 border-b border-[rgba(255,255,255,0.08)] pb-4">
            <label className="block text-sm font-medium text-zinc-300 flex items-center gap-2"><Utensils className="w-4 h-4"/> Diet Plan</label>
            <select 
              className="w-full h-[44px] bg-[#11110F] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 text-[#F4F1E8] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 appearance-none"
              value={dietPlanId}
              onChange={e => setDietPlanId(e.target.value)}
            >
              <option value="">No Diet Plan</option>
              {dietPlans.map(p => (
                <option key={p.id} value={p.id}>{p.name} - {p.calories} Cal</option>
              ))}
            </select>
          </div>

          <div className="space-y-3 pt-2">
            <label className="block text-sm font-medium text-zinc-300 flex items-center gap-2"><Target className="w-4 h-4"/> Personal Training</label>
            <div className="flex gap-2">
               <button type="button" onClick={() => setPtIncluded(false)} className={`flex-1 py-2 rounded-xl border text-sm font-medium ${!ptIncluded ? 'bg-[#4D6B5A]/20 border-[#4D6B5A]/50 text-[#4D6B5A]' : 'bg-[#11110F] border-[rgba(255,255,255,0.08)] text-[#A7A39A]'}`}>PT Not Included</button>
               <button type="button" onClick={() => setPtIncluded(true)} className={`flex-1 py-2 rounded-xl border text-sm font-medium ${ptIncluded ? 'bg-[#C9A24D]/10 border-[#D4AF37]/50 text-[#E2C46B]' : 'bg-[#11110F] border-[rgba(255,255,255,0.08)] text-[#A7A39A]'}`}>PT Included</button>
            </div>

            {ptIncluded && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-200 mt-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#706D66]">Trainer</label>
                  <select 
                    className="w-full h-[44px] bg-[#11110F] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 text-[#F4F1E8] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 appearance-none"
                    value={trainerId}
                    onChange={e => setTrainerId(e.target.value)}
                    required
                  >
                    <option value="">Select Trainer</option>
                    {trainers.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#706D66]">PT Plan</label>
                  <select 
                    className="w-full h-[44px] bg-[#11110F] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 text-[#F4F1E8] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 appearance-none"
                    value={ptPlanId}
                    onChange={e => setPtPlanId(e.target.value)}
                    required
                  >
                    <option value="">Select PT Plan</option>
                    {ptPlans.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - ₹{p.price}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Floating Action Button for Save */}
        <div className="fixed bottom-20 left-0 right-0 px-4 pt-4 pb-safe bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent z-40 lg:static lg:bg-none lg:px-0 lg:p-0 lg:pt-4">
          <Button type="submit" fullWidth size="lg" loading={loading} className="shadow-lg shadow-[#D4AF37]/20">
            <Check className="w-5 h-5 mr-2" />
            Save Member
          </Button>
        </div>
      </form>
    </div>
  );
}
