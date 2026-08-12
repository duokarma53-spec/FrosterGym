import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Download, Printer, Building2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  fetchReceiptSettings, fetchGymProfile, 
  type ReceiptSettings, type GymProfile 
} from '../../services/settings.service';

export function InvoiceView() {
  const { id } = useParams();
  const { gym } = useAuth();
  const gymId = gym?.id || '6d4277db-8b39-43c3-9f69-89a70348e085';

  const [settings, setSettings] = useState<ReceiptSettings | null>(null);
  const [profile, setProfile] = useState<GymProfile | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [r, p] = await Promise.all([
          fetchReceiptSettings(gymId),
          fetchGymProfile(gymId)
        ]);
        setSettings(r);
        setProfile(p as GymProfile);
      } catch (err) {
        console.error('Failed to load invoice settings:', err);
      }
    };
    if (gymId) load();
  }, [gymId]);

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
              <p className="text-sm text-[#706D66] mt-1">{profile?.address || '123 Fitness Street, Gym City'}</p>
              {profile?.phone && <p className="text-sm text-[#706D66]">{profile.phone}</p>}
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold">INVOICE</h2>
            <p className="text-sm text-[#706D66]">{settings?.invoicePrefix || 'INV-'}{id?.padStart(4, '0') || '0001'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-xs text-[#706D66] font-semibold uppercase">Billed To</p>
            <p className="text-sm font-bold mt-1">Rahul Sharma</p>
            <p className="text-sm text-zinc-600">+91 9876543210</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#706D66] font-semibold uppercase">Date</p>
            <p className="text-sm font-bold mt-1">{new Date().toLocaleDateString()}</p>
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
                <td className="px-4 py-4">1 Month Standard Plan</td>
                <td className="px-4 py-4 text-right font-medium">₹3,000</td>
              </tr>
              <tr>
                <td className="px-4 py-4 text-emerald-600">Special Discount</td>
                <td className="px-4 py-4 text-right text-emerald-600">-₹500</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-end text-sm">
          <div className="w-1/2 space-y-2">
            <div className="flex justify-between font-bold text-lg pt-4 border-t border-zinc-200">
              <span>Total Paid</span>
              <span className="text-[#8E7135]">₹2,500</span>
            </div>
            <p className="text-xs text-[#706D66] text-right mt-1">Paid via UPI</p>
          </div>
        </div>

        {settings?.footerMessage && (
          <div className="mt-12 pt-6 border-t border-zinc-200 text-center">
            <p className="text-sm text-zinc-500 italic">{settings.footerMessage}</p>
          </div>
        )}
      </div>

      <div className="flex gap-4 mt-6">
        <Button variant="secondary" className="flex-1 text-[#F4F1E8]">
          <Printer className="w-5 h-5 mr-2" />
          Print
        </Button>
        <Button className="flex-1">
          <Download className="w-5 h-5 mr-2" />
          Download PDF
        </Button>
      </div>
    </div>
  );
}
