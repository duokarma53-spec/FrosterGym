import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Save, Loader2, Store, Settings as SettingsIcon, LogOut, ShieldAlert, Bell } from 'lucide-react';

export function Settings() {
  const { gym, profile, signOut } = useAuth();
  
  // Protect route
  if (profile?.role !== 'owner') {
    return <Navigate to="/app" replace />;
  }

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State
  const [gymName, setGymName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  
  // JSONB Settings State
  const [currency, setCurrency] = useState('₹');
  const [receiptFooter, setReceiptFooter] = useState('');
  const [expiryWarningDays, setExpiryWarningDays] = useState('7');
  const [notifications, setNotifications] = useState({
    membership_expiry_reminders: true,
    payment_due_reminders: true,
    renewal_reminders: true,
    attendance_notifications: false
  });

  useEffect(() => {
    if (!gym) return;

    const loadSettings = (currentGym: any) => {
      setGymName(currentGym.name || '');
      setPhone(currentGym.phone || '');
      setEmail(currentGym.email || '');
      setAddress(currentGym.address || '');
      
      const settings = (currentGym.settings as any) || {};
      setCurrency(settings.currency || '₹');
      setReceiptFooter(settings.receipt_footer || '');
      setExpiryWarningDays(settings.expiry_warning_days?.toString() || '7');
      
      setNotifications({
        membership_expiry_reminders: settings.notifications?.membership_expiry_reminders ?? true,
        payment_due_reminders: settings.notifications?.payment_due_reminders ?? true,
        renewal_reminders: settings.notifications?.renewal_reminders ?? true,
        attendance_notifications: settings.notifications?.attendance_notifications ?? false
      });
    };

    loadSettings(gym);

    // Setup realtime subscription for gym updates
    const channel = supabase
      .channel('gym-settings-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'gyms',
          filter: `id=eq.${gym.id}`
        },
        (payload: any) => {
          loadSettings(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gym]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gym) return;
    
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      const { error: updateError } = await supabase
        .from('gyms')
        .update({
          name: gymName,
          phone,
          email,
          address
        })
        .eq('id', gym.id);

      if (updateError) throw updateError;
      
      setSuccess('Gym profile updated successfully!');
      
      // Auto-hide success message
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error saving profile:', err.message);
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gym) return;
    
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      // We fetch latest gym state to ensure we don't overwrite changes made in other tabs
      const { data: latestGym, error: fetchError } = await supabase
        .from('gyms')
        .select('settings')
        .eq('id', gym.id)
        .single();
        
      if (fetchError) throw fetchError;

      // Merge with existing settings
      const currentSettings = (latestGym.settings as any) || {};
      const newSettings = {
        ...currentSettings,
        currency,
        receipt_footer: receiptFooter,
        expiry_warning_days: parseInt(expiryWarningDays) || 7,
        notifications
      };

      const { error: updateError } = await supabase
        .from('gyms')
        .update({
          settings: newSettings
        })
        .eq('id', gym.id);

      if (updateError) throw updateError;
      
      setSuccess('Business configuration updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error saving config:', err.message);
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Gym Settings</h1>
        <p className="text-sm text-gray-400 mt-1">Manage your business profile and configuration.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-400 font-medium">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Gym Profile Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-surface border border-surface-highlight rounded-xl overflow-hidden">
            <div className="p-6 border-b border-surface-highlight flex items-center gap-2">
              <Store className="w-5 h-5 text-primary-500" />
              <h2 className="text-lg font-bold text-white">Gym Profile</h2>
            </div>
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Gym Name *</label>
                <input 
                  required
                  type="text" 
                  value={gymName}
                  onChange={(e) => setGymName(e.target.value)}
                  className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone Number</label>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Business Address</label>
                <textarea 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 min-h-[80px]" 
                />
              </div>
              <div className="pt-2 flex justify-end">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="bg-primary-500 hover:bg-primary-600 text-black font-semibold rounded-lg px-6 py-2 flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Profile
                </button>
              </div>
            </form>
          </div>

          {/* Business Configuration Form */}
          <div className="bg-surface border border-surface-highlight rounded-xl overflow-hidden">
            <div className="p-6 border-b border-surface-highlight flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-bold text-white">Business Configuration</h2>
            </div>
            <form onSubmit={handleSaveConfig} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Currency Symbol</label>
                  <input 
                    type="text" 
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500" 
                    placeholder="e.g. ₹ or $"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Expiry Warning (Days)</label>
                  <input 
                    type="number"
                    min="1"
                    value={expiryWarningDays}
                    onChange={(e) => setExpiryWarningDays(e.target.value)}
                    className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500" 
                  />
                  <p className="text-xs text-gray-500 mt-1">Days before a membership shows as "Expiring Soon".</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Receipt Footer Message</label>
                <textarea 
                  value={receiptFooter}
                  onChange={(e) => setReceiptFooter(e.target.value)}
                  className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 min-h-[80px]" 
                  placeholder="e.g. Thank you for your business! No refunds."
                />
              </div>
              <div className="pt-2 flex justify-end">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="bg-surface-highlight hover:bg-gray-700 text-white font-semibold rounded-lg px-6 py-2 flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Config
                </button>
              </div>
            </form>
          </div>

          {/* Notification Preferences Form */}
          <div className="bg-surface border border-surface-highlight rounded-xl overflow-hidden">
            <div className="p-6 border-b border-surface-highlight flex items-center gap-2">
              <Bell className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-bold text-white">Notification Preferences</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-3 bg-background border border-surface-highlight rounded-lg">
                <div>
                  <p className="text-sm font-medium text-white">Membership Expiry Reminders</p>
                  <p className="text-xs text-gray-400">Notify members before their plan expires.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={notifications.membership_expiry_reminders} onChange={(e) => setNotifications({...notifications, membership_expiry_reminders: e.target.checked})} />
                  <div className="w-11 h-6 bg-surface-highlight peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-3 bg-background border border-surface-highlight rounded-lg">
                <div>
                  <p className="text-sm font-medium text-white">Payment Due Reminders</p>
                  <p className="text-xs text-gray-400">Notify members when they have pending dues.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={notifications.payment_due_reminders} onChange={(e) => setNotifications({...notifications, payment_due_reminders: e.target.checked})} />
                  <div className="w-11 h-6 bg-surface-highlight peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-3 bg-background border border-surface-highlight rounded-lg">
                <div>
                  <p className="text-sm font-medium text-white">Renewal Reminders</p>
                  <p className="text-xs text-gray-400">Notify members to renew after expiry.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={notifications.renewal_reminders} onChange={(e) => setNotifications({...notifications, renewal_reminders: e.target.checked})} />
                  <div className="w-11 h-6 bg-surface-highlight peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-3 bg-background border border-surface-highlight rounded-lg">
                <div>
                  <p className="text-sm font-medium text-white">Attendance Notifications</p>
                  <p className="text-xs text-gray-400">Notify members when they check-in.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={notifications.attendance_notifications} onChange={(e) => setNotifications({...notifications, attendance_notifications: e.target.checked})} />
                  <div className="w-11 h-6 bg-surface-highlight peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>
              <div className="pt-2 flex justify-end">
                <button 
                  type="button"
                  onClick={handleSaveConfig}
                  disabled={isSaving}
                  className="bg-surface-highlight hover:bg-gray-700 text-white font-semibold rounded-lg px-6 py-2 flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Account Info Column */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-surface border border-surface-highlight rounded-xl p-6">
            <h3 className="font-bold text-white mb-4 text-lg">Account</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</p>
                <p className="text-sm text-gray-300 mt-1">{profile.email || 'No email attached'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Role</p>
                <p className="text-sm text-primary-400 font-medium capitalize mt-1">{profile.role}</p>
              </div>
              <div className="pt-4 border-t border-surface-highlight">
                <button 
                  onClick={signOut}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-surface border border-surface-highlight rounded-xl p-6">
             <h3 className="font-bold text-white mb-2 text-sm">Security Info</h3>
             <p className="text-xs text-gray-400">Settings are restricted to Gym Owners. Your current session is encrypted and authenticated safely via Supabase.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
