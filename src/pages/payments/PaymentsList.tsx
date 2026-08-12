import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CreditCard, Download, Loader2 } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { fetchPayments, type Payment } from '../../services/payments.service';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

export function PaymentsList() {
  const navigate = useNavigate();
  const { gym } = useAuth();
  const gymId = gym?.id;
  
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let mounted = true;
    const loadPayments = async () => {
      if (!gymId) return;
      try {
        setLoading(true);
        const res = await fetchPayments(gymId, { search: search || undefined });
        if (mounted) {
          if (!res.data) throw new Error('Failed to fetch payments');
          setPayments(res.data || []);
        }
      } catch (err: any) {
        console.error('Failed to load payments:', err);
        if (mounted) toast.error('Failed to load payments');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      loadPayments();
    }, 300);

    return () => {
      mounted = false;
      clearTimeout(debounce);
    };
  }, [gymId, search]);

  return (
    <div className="pb-24 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F4F1E8]">Payments</h1>
          <p className="text-[#A7A39A] text-sm">View and manage all transactions</p>
        </div>
      </div>

      <div className="mb-6">
        <Input 
          placeholder="Search payments..." 
          icon={<Search className="w-5 h-5" />} 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-[#11110F] border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 flex items-center justify-center text-[#A7A39A]">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Loading payments...</span>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-8 text-center text-[#706D66]">
            No payments found
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {payments.map(payment => (
              <div key={payment.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-[#171613]/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#C9A24D]/10 text-[#C9A24D] flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[#F4F1E8]">{payment.member_name || 'Unknown Member'}</h3>
                    <p className="text-xs text-[#706D66]">{new Date(payment.payment_date).toLocaleDateString()} • {payment.payment_method}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#4D6B5A]">+₹{payment.amount}</p>
                    <p className="text-[10px] text-emerald-500/70 uppercase tracking-wider">{payment.status}</p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => navigate(`/app/payments/invoice/${payment.id}`)}>
                    <Download className="w-4 h-4 mr-1" />
                    Receipt
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
