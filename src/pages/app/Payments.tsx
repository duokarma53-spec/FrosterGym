import { useState, useEffect } from 'react';
import { Plus, Search, Receipt, User, DollarSign, X, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database.types';

type Payment = Database['public']['Tables']['payments']['Row'];
type Member = Database['public']['Tables']['members']['Row'];
type Membership = Database['public']['Tables']['memberships']['Row'];
type Plan = Database['public']['Tables']['membership_plans']['Row'];

interface PaymentWithDetails extends Payment {
  member: Member;
  membership?: (Membership & { plan?: Plan }) | null;
}

export function Payments() {
  const { gym } = useAuth();
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [memberships, setMemberships] = useState<(Membership & { plan?: Plan })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedMembership, setSelectedMembership] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (gym) {
      fetchPayments();
      fetchMembers();
    }
  }, [gym]);

  useEffect(() => {
    if (selectedMember) {
      fetchMemberMemberships(selectedMember);
    } else {
      setMemberships([]);
      setSelectedMembership('');
    }
  }, [selectedMember]);

  async function fetchMembers() {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('gym_id', gym!.id)
        .order('full_name');

      if (error) throw error;
      setMembers(data as Member[]);
    } catch (err: any) {
      console.error('Error fetching members:', err.message);
    }
  }

  async function fetchMemberMemberships(memberId: string) {
    try {
      // Need active memberships with due amounts preferably
      const { data, error } = await supabase
        .from('memberships')
        .select('*, membership_plans(*)')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const mapped = (data as any[]).map(m => ({
        ...m,
        plan: m.membership_plans
      }));
      setMemberships(mapped);

      // Auto-select the first active membership with due balance if available
      const activeWithDue = mapped.find(m => m.status === 'active' && m.due_amount > 0);
      if (activeWithDue) {
        setSelectedMembership(activeWithDue.id);
      } else if (mapped.length > 0) {
        setSelectedMembership(mapped[0].id);
      }
    } catch (err: any) {
      console.error('Error fetching memberships:', err.message);
    }
  }

  async function fetchPayments() {
    try {
      setIsLoading(true);
      const { data, error } = await (supabase
        .from('payments')
        .select(`
          *,
          members (*),
          memberships (
            *,
            membership_plans (*)
          )
        `)
        .eq('gym_id', gym!.id)
        .order('payment_date', { ascending: false }) as any);

      if (error) throw error;

      const formatted = (data || []).map((p: any) => ({
        ...p,
        member: p.members,
        membership: p.memberships ? {
          ...p.memberships,
          plan: p.memberships.membership_plans
        } : null
      }));

      setPayments(formatted);
    } catch (err: any) {
      console.error('Error fetching payments:', err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gym) return;
    if (parseFloat(amount) <= 0) {
      setError('Amount must be greater than zero.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const membership = memberships.find(m => m.id === selectedMembership);
      
      // 1. Insert Payment
      const { error: paymentError } = await (supabase
        .from('payments')
        .insert({
          gym_id: gym.id,
          member_id: selectedMember,
          membership_id: selectedMembership || null,
          amount: parseFloat(amount),
          payment_date: new Date(paymentDate).toISOString(),
          payment_method: paymentMethod,
          status: 'completed',
          notes: notes || null
        }) as any);

      if (paymentError) throw paymentError;

      // 2. Update Membership Dues if attached to a membership
      if (membership) {
        const newPaidAmount = Number(membership.paid_amount) + parseFloat(amount);
        const newDueAmount = Math.max(0, Number(membership.due_amount) - parseFloat(amount));

        const { error: membershipError } = await (supabase
          .from('memberships')
          .update({
            paid_amount: newPaidAmount,
            due_amount: newDueAmount
          })
          .eq('id', membership.id) as any);

        if (membershipError) throw membershipError;
      }

      setShowAddModal(false);
      resetForm();
      fetchPayments();
    } catch (err: any) {
      console.error('Error adding payment:', err.message);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedMember('');
    setSelectedMembership('');
    setAmount('');
    setPaymentMethod('Cash');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setError(null);
  };

  const filteredPayments = payments.filter(p => {
    const term = search.toLowerCase();
    return p.member?.full_name?.toLowerCase().includes(term) || 
           p.member?.phone?.includes(term);
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Payments</h1>
          <p className="text-gray-400">Manage member payments and dues</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-amber-500 text-gray-900 rounded-lg hover:bg-amber-400 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Add Payment</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by member name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-900/50 text-gray-400 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">Member</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Method</th>
                <th className="px-6 py-4 font-medium">Membership</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading payments...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <Receipt className="w-12 h-12 mb-2 opacity-20" />
                      <p>No payments found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {payment.member?.photo_url ? (
                          <img src={payment.member.photo_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="text-white font-medium">{payment.member?.full_name}</div>
                          <div className="text-sm text-gray-400">{payment.member?.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-bold">₹{payment.amount}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-300">
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">
                        {payment.payment_method}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {payment.membership ? (
                        <div>
                          <div className="text-gray-300">{payment.membership.plan?.name || 'Unknown Plan'}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(payment.membership.start_date).toLocaleDateString()} - {new Date(payment.membership.end_date).toLocaleDateString()}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">No specific plan</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm font-medium">
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Payment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl w-full max-w-lg border border-gray-700 overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Record Payment</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddPayment} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Member *
                </label>
                <select
                  required
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                >
                  <option value="">Select Member</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.full_name} ({m.phone})</option>
                  ))}
                </select>
              </div>

              {selectedMember && memberships.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Apply to Membership
                  </label>
                  <select
                    value={selectedMembership}
                    onChange={(e) => setSelectedMembership(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  >
                    <option value="">General Payment (No specific plan)</option>
                    {memberships.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.plan?.name} - Due: ₹{m.due_amount}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Amount *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      required
                      type="number"
                      min="1"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Payment Date *
                  </label>
                  <input
                    required
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Payment Method *
                </label>
                <select
                  required
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none"
                  placeholder="Optional notes..."
                ></textarea>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex justify-center items-center space-x-2 px-4 py-2.5 bg-amber-500 text-gray-900 rounded-lg hover:bg-amber-400 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
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
    </div>
  );
}
