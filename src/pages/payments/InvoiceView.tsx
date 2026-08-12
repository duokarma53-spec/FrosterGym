import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Download, Printer, Building2, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { 
  fetchReceiptSettings, fetchGymProfile, 
  type ReceiptSettings, type GymProfile 
} from '../../services/settings.service';

export function InvoiceView() {
  const { id } = useParams();
  const { gym } = useAuth();
  const gymId = gym?.id;

  const [settings, setSettings] = useState<ReceiptSettings | null>(null);
  const [profile, setProfile] = useState<GymProfile | null>(null);
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!gymId || !id) return;
      try {
        const [r, p, paymentRes] = await Promise.all([
          fetchReceiptSettings(gymId),
          fetchGymProfile(gymId),
          supabase.from('payments').select('*, members(full_name, phone)').eq('id', id).single()
        ]) as [ReceiptSettings | null, GymProfile | null, any];
        setSettings(r);
        setProfile(p as GymProfile);
        if (paymentRes.data) {
          setPayment(paymentRes.data);
        }
      } catch (err) {
        console.error('Failed to load invoice details:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [gymId, id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#A7A39A]" />
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="p-8 text-center text-[#706D66]">
        Invoice not found.
      </div>
    );
  }

  return (
    <div className="pb-24 animate-in zoom-in-95 duration-300">
      <PageHeader title="Invoice Details" showBack />

      <div className="bg-white text-zinc-900 rounded-2xl p-6 sm:p-8 mt-6">
        <div className="flex justify-between items-start border-b border-zinc-200 pb-6 mb-6">
          <div className="flex items-center gap-4">
            {settings?.showGymLogo !== false && (
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {profile?.logo_url ? (
                  <img src={profile.logo_url} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-8 h-8 text-gray-400" />
                )}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-black text-[#8E7135] uppercase tracking-tighter">
                {profile?.name || 'Froster Gym'}
              </h1>
              <p className="text-sm text-[#706D66] mt-1">{profile?.address || ''}</p>
              {profile?.phone && <p className="text-sm text-[#706D66]">{profile.phone}</p>}
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold">INVOICE</h2>
            <p className="text-sm text-[#706D66]">{settings?.invoicePrefix || 'INV-'}{id?.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-xs text-[#706D66] font-semibold uppercase">Billed To</p>
            <p className="text-sm font-bold mt-1">{payment.members?.full_name || 'Unknown Member'}</p>
            <p className="text-sm text-zinc-600">{payment.members?.phone || ''}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#706D66] font-semibold uppercase">Date</p>
            <p className="text-sm font-bold mt-1">{new Date(payment.payment_date).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="border border-zinc-200 rounded-lg overflow-hidden mb-6">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-4 py-3 font-semibold">Description</th>
                <th className="px-4 py-3 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              <tr>
                <td className="px-4 py-4 capitalize">{payment.type} Payment - {payment.payment_method}</td>
                <td className="px-4 py-4 text-right font-medium">₹{payment.amount}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-end text-sm">
          <div className="w-1/2 space-y-2">
            <div className="flex justify-between font-bold text-base pt-2 border-t border-zinc-900">
              <span>Total Paid</span>
              <span>₹{payment.amount}</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-zinc-200 text-center">
          <p className="text-xs text-[#706D66]">
            {settings?.footerMessage || 'Thank you for your business!'}
          </p>
        </div>
      </div>

      <div className="fixed bottom-20 left-0 right-0 px-4 pt-4 pb-safe bg-gradient-to-t from-zinc-950 to-transparent lg:static lg:bg-none lg:px-0 lg:p-0">
        <div className="flex gap-4">
          <Button variant="secondary" fullWidth className="lg:w-auto text-[#706D66]" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button fullWidth className="lg:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
