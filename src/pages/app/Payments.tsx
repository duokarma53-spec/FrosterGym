import { useState, useEffect } from 'react';
import { Plus, Search, Receipt, User, X, Check } from 'lucide-react';
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
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const [invoiceToPrint, setInvoiceToPrint] = useState<any | null>(null);

  useEffect(() => {
    if (gym) {
      fetchPayments();
      fetchMembers();
    }
  }, [gym]);

  // Auto-refresh when payments or memberships change
  useEffect(() => {
    if (!gym) return;
    const channel = supabase.channel('payments_realtime_' + gym.id)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments', filter: `gym_id=eq.${gym.id}` }, fetchPayments)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'memberships', filter: `gym_id=eq.${gym.id}` }, () => {
        if (selectedMember) fetchMemberMemberships(selectedMember);
        fetchPayments();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members', filter: `gym_id=eq.${gym.id}` }, fetchMembers)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [gym, selectedMember]);

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
      const { data: newPayment, error: paymentError } = await (supabase
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
        })
        .select()
        .single() as any);

      if (paymentError) throw paymentError;

      // 2. Insert Invoice
      if (newPayment) {
        const invoiceNumber = `INV-${new Date(paymentDate).getFullYear()}${(new Date(paymentDate).getMonth() + 1).toString().padStart(2, '0')}-${newPayment.id.slice(0, 8).toUpperCase()}`;
        const { error: invoiceError } = await supabase.from('invoices').insert({
          gym_id: gym.id,
          invoice_number: invoiceNumber,
          member_id: selectedMember,
          membership_id: selectedMembership || null,
          payment_id: newPayment.id,
          issue_date: new Date(paymentDate).toISOString().split('T')[0],
          due_date: new Date(paymentDate).toISOString().split('T')[0],
          subtotal: parseFloat(amount),
          tax_amount: 0,
          total_amount: parseFloat(amount),
          status: 'paid'
        });
        
        if (invoiceError) console.error('Invoice creation failed:', invoiceError.message);
      }

      // 3. Update Membership Dues if attached to a membership
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
            member_id: payment.member_id,
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

  const resetForm = () => {
    setSelectedMember('');
    setSelectedMembership('');
    setAmount('');
    setPaymentMethod('cash');
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
                <th className="px-6 py-4 font-medium text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading payments...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
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
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleViewInvoice(payment)}
                        className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-gray-900 rounded-lg text-xs font-semibold transition-colors"
                      >
                        View Invoice
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Payment Modal */}
      {/* ... */}
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
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">Rs</span>
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

      {/* Printable Invoice Modal Overlay */}
      {invoiceToPrint && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-gray-900 rounded-xl w-full max-w-2xl shadow-2xl p-8 relative print:absolute print:inset-0 print:shadow-none print:p-0">
            {/* Inject print style to hide parent layers and only display the printed card */}
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
