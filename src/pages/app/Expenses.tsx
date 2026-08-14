import { useState, useEffect } from 'react';
import { Plus, Search, Receipt, DollarSign, X, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database.types';

type Expense = Database['public']['Tables']['expenses']['Row'];

const CATEGORIES = [
  { value: 'rent', label: 'Rent' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'salary', label: 'Staff Salary' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'supplies', label: 'Supplies' },
  { value: 'other', label: 'Other' }
];

export function Expenses() {
  const { gym } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('month');
  
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].value);
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (gym) {
      fetchExpenses();
    }
  }, [gym, dateFilter]);

  async function fetchExpenses() {
    try {
      setIsLoading(true);
      let query = supabase
        .from('expenses')
        .select('*')
        .eq('gym_id', gym!.id)
        .order('expense_date', { ascending: false });

      if (dateFilter !== 'all') {
        const now = new Date();
        let startDate = new Date();
        
        if (dateFilter === 'today') {
          startDate.setHours(0, 0, 0, 0);
        } else if (dateFilter === 'week') {
          startDate.setDate(now.getDate() - now.getDay());
          startDate.setHours(0, 0, 0, 0);
        } else if (dateFilter === 'month') {
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
        } else if (dateFilter === 'year') {
          startDate.setMonth(0, 1);
          startDate.setHours(0, 0, 0, 0);
        }
        query = query.gte('expense_date', startDate.toISOString().split('T')[0]);
      }

      const { data, error } = await query;
      if (error) throw error;
      setExpenses(data || []);
    } catch (err: any) {
      console.error('Error fetching expenses:', err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gym) return;
    if (parseFloat(amount) <= 0) {
      setError('Amount must be greater than zero.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const { error: insertError } = await supabase
        .from('expenses')
        .insert({
          gym_id: gym.id,
          title,
          category,
          amount: parseFloat(amount),
          expense_date: new Date(expenseDate).toISOString().split('T')[0],
          payment_method: paymentMethod,
          notes: notes || null
        });

      if (insertError) throw insertError;

      setShowAddModal(false);
      resetForm();
      fetchExpenses();
    } catch (err: any) {
      console.error('Error adding expense:', err.message);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setCategory(CATEGORIES[0].value);
    setAmount('');
    setPaymentMethod('cash');
    setExpenseDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setError(null);
  };

  const filteredExpenses = expenses.filter(e => {
    const term = search.toLowerCase();
    return (
      e.title.toLowerCase().includes(term) ||
      e.category.toLowerCase().includes(term) ||
      (e.notes && e.notes.toLowerCase().includes(term))
    );
  });

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Expenses</h1>
          <p className="text-sm text-gray-400 mt-1">Manage and track your business expenses.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-primary-500 hover:bg-primary-600 text-black font-semibold rounded-lg px-4 py-2 flex items-center justify-center gap-2 transition-colors w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          Add Expense
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface border border-surface-highlight p-6 rounded-xl md:col-span-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-500/10 text-red-500 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-gray-400 font-medium">Total Expenses</h3>
          </div>
          <p className="text-3xl font-bold text-white">₹{totalExpenses.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider">{dateFilter === 'all' ? 'All Time' : `This ${dateFilter}`}</p>
        </div>
        
        <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 bg-surface border border-surface-highlight p-4 rounded-xl items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search expenses..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-background border border-surface-highlight rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-primary-500"
            />
          </div>
          <div className="flex bg-background border border-surface-highlight rounded-lg p-1 overflow-x-auto w-full sm:w-auto">
            {(['all', 'today', 'week', 'month', 'year'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setDateFilter(filter)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                  dateFilter === filter 
                    ? 'bg-surface-highlight text-white' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-surface border border-surface-highlight rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading expenses...</div>
        ) : filteredExpenses.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-surface-highlight rounded-full flex items-center justify-center mb-4">
              <Receipt className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-300 font-medium text-lg">No expenses found</p>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or add a new expense.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300 whitespace-nowrap">
              <thead className="bg-surface-highlight/50 text-gray-400 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Payment Method</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-highlight">
                {filteredExpenses.map(expense => (
                  <tr key={expense.id} className="hover:bg-surface-highlight/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        {new Date(expense.expense_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{expense.title}</div>
                      {expense.notes && <div className="text-xs text-gray-500 truncate max-w-xs">{expense.notes}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-surface-highlight rounded-md text-xs font-medium text-gray-300">
                        {CATEGORIES.find(c => c.value === expense.category)?.label || expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{expense.payment_method}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-white">₹{Number(expense.amount).toLocaleString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface border border-surface-highlight rounded-xl w-full max-w-md shadow-2xl my-8">
            <div className="p-6 border-b border-surface-highlight flex justify-between items-center sticky top-0 bg-surface rounded-t-xl z-10">
              <h2 className="text-lg font-bold text-white">Add Expense</h2>
              <button onClick={() => { setShowAddModal(false); resetForm(); }} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddExpense} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Expense Title *</label>
                <input 
                  required
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500" 
                  placeholder="e.g. Monthly Rent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Category *</label>
                  <select 
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Amount (₹) *</label>
                  <input 
                    required
                    type="number" 
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Payment Date *</label>
                  <input 
                    required
                    type="date" 
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-white [color-scheme:dark] focus:outline-none focus:border-primary-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Payment Method *</label>
                  <select 
                    required
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Notes (Optional)</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 min-h-[80px]" 
                  placeholder="Additional details..."
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                  className="px-4 py-2 text-gray-400 hover:text-white font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-primary-500 hover:bg-primary-600 text-black font-semibold rounded-lg px-6 py-2 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
