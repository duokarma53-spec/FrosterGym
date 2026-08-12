import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { 
  Save, Building2, UploadCloud, LogOut 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import {
  fetchGymProfile, updateGymProfile,
  fetchOperatingHours, updateOperatingHours,
  fetchReceiptSettings, updateReceiptSettings,
  fetchNotificationSettings, updateNotificationSettings,
  updatePassword, signOutCurrentSession,
  type GymProfile, type OperatingHours, type ReceiptSettings, type NotificationSettings
} from '../../services/settings.service';

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'None'];

export const SettingsScreen: React.FC = () => {
  const { gym } = useAuth();
  const gymId = gym?.id || '6d4277db-8b39-43c3-9f69-89a70348e085';
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // States
  const [profile, setProfile] = useState<Partial<GymProfile>>({
    name: '', phone: '', email: '', address: '', logo_url: ''
  });
  
  const [hours, setHours] = useState<OperatingHours>({
    openingTime: '06:00', closingTime: '22:00', weeklyOff: 'Sunday'
  });
  
  const [receipt, setReceipt] = useState<ReceiptSettings>({
    invoicePrefix: 'FG-', showGymLogo: true, footerMessage: ''
  });
  
  const [notifications, setNotifications] = useState<NotificationSettings>({
    membershipExpiryAlerts: true, paymentDueAlerts: true, birthdayAlerts: true
  });
  
  const [security, setSecurity] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });

  useEffect(() => {
    let mounted = true;
    const loadAll = async () => {
      try {
        const [p, h, r, n] = await Promise.all([
          fetchGymProfile(gymId),
          fetchOperatingHours(gymId),
          fetchReceiptSettings(gymId),
          fetchNotificationSettings(gymId)
        ]);
        if (mounted) {
          if (p) setProfile(p);
          if (h) setHours(h);
          if (r) setReceipt(r);
          if (n) setNotifications(n);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
        toast.error('Failed to load some settings');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (gymId) loadAll();
    return () => { mounted = false; };
  }, [gymId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (hours.closingTime <= hours.openingTime && hours.closingTime !== '00:00') {
        toast.error('Operating Hours: Closing time must be after opening time');
        setSaving(false);
        return;
      }
      
      await Promise.all([
        updateGymProfile(gymId, profile),
        updateOperatingHours(gymId, hours),
        updateReceiptSettings(gymId, receipt),
        updateNotificationSettings(gymId, notifications)
      ]);
      
      toast.success('Settings saved successfully');
    } catch (err: any) {
      console.error('Save error:', err);
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!security.currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    if (!security.newPassword || !security.confirmPassword) {
      toast.error('Please enter a new password');
      return;
    }
    if (security.newPassword !== security.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (security.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    try {
      await updatePassword(security.newPassword);
      setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to change password');
    }
  };

  const handleSignOutOther = async () => {
    try {
      await signOutCurrentSession();
      toast.success('Signed out. Please log in again.');
      // Will redirect automatically due to AuthContext listening to session
    } catch (err: any) {
      toast.error('Failed to sign out');
    }
  };

  if (loading) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <p className="text-gray-400">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto w-full max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="flex items-center justify-between sticky top-0 bg-[#11110F]/90 backdrop-blur-md z-10 py-4 -my-4 mb-2">
        <PageHeader 
          title="Settings" 
          subtitle="Manage your gym profile and preferences" 
        />
        <Button 
          variant="primary" 
          icon={<Save className="w-4 h-4" />} 
          onClick={handleSave}
          loading={saving}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <div className="flex flex-col space-y-8 pb-20">
        
        {/* GYM PROFILE */}
        <Card>
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-xl font-semibold text-[#F4F1E8] uppercase tracking-wide">Gym Profile</h2>
            <p className="text-sm text-[#A7A39A] mt-1">Basic information about your business</p>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-gray-300">Logo</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl bg-gray-800 border-2 border-dashed border-gray-700 flex items-center justify-center overflow-hidden">
                  {profile.logo_url ? (
                    <img src={profile.logo_url} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-8 h-8 text-[#706D66]" />
                  )}
                </div>
                <Button variant="secondary" icon={<UploadCloud className="w-4 h-4" />}>
                  Upload Logo
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Gym Name" 
                value={profile.name || ''} 
                onChange={(e) => setProfile({...profile, name: e.target.value})} 
              />
              <Input 
                label="Phone Number" 
                value={profile.phone || ''} 
                onChange={(e) => setProfile({...profile, phone: e.target.value})} 
              />
              <Input 
                label="Email Address" 
                value={profile.email || ''} 
                onChange={(e) => setProfile({...profile, email: e.target.value})} 
                type="email"
              />
              <Input 
                label="Address" 
                value={profile.address || ''} 
                onChange={(e) => setProfile({...profile, address: e.target.value})} 
              />
            </div>
          </div>
        </Card>

        {/* OPERATING HOURS */}
        <Card>
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-xl font-semibold text-[#F4F1E8] uppercase tracking-wide">Operating Hours</h2>
            <p className="text-sm text-[#A7A39A] mt-1">Set your gym's schedule</p>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input 
                label="Opening Time" 
                type="time"
                value={hours.openingTime} 
                onChange={(e) => setHours({...hours, openingTime: e.target.value})} 
              />
              <Input 
                label="Closing Time" 
                type="time"
                value={hours.closingTime} 
                onChange={(e) => setHours({...hours, closingTime: e.target.value})} 
              />
              
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#A7A39A]">Weekly Off Day</label>
                <select
                  value={hours.weeklyOff}
                  onChange={(e) => setHours({...hours, weeklyOff: e.target.value})}
                  className="w-full h-12 rounded-xl bg-[#11110F] border border-[rgba(255,255,255,0.10)] text-[#F4F1E8] px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A24D]/40 focus:border-[#C9A24D] transition-colors"
                >
                  {WEEK_DAYS.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* RECEIPT & INVOICE */}
        <Card>
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-xl font-semibold text-[#F4F1E8] uppercase tracking-wide">Receipt & Invoice</h2>
            <p className="text-sm text-[#A7A39A] mt-1">Customize how your invoices look</p>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Invoice Prefix" 
                value={receipt.invoicePrefix} 
                onChange={(e) => setReceipt({...receipt, invoicePrefix: e.target.value})}
                placeholder="e.g. FG-"
              />
              
              <div className="flex flex-col justify-end pb-1">
                <div className="flex items-center justify-between p-3 rounded-xl border border-[rgba(255,255,255,0.05)] bg-[#11110F]">
                  <div>
                    <h3 className="text-sm font-medium text-[#F4F1E8]">Show Gym Logo on Receipt</h3>
                  </div>
                  <button 
                    onClick={() => setReceipt({...receipt, showGymLogo: !receipt.showGymLogo})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${receipt.showGymLogo ? 'bg-[#C9A24D]' : 'bg-gray-700'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${receipt.showGymLogo ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-sm font-medium text-[#A7A39A]">Receipt Footer Message</label>
                <textarea
                  value={receipt.footerMessage}
                  onChange={(e) => setReceipt({...receipt, footerMessage: e.target.value})}
                  className="w-full h-24 rounded-xl bg-[#11110F] border border-[rgba(255,255,255,0.10)] text-[#F4F1E8] p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A24D]/40 focus:border-[#C9A24D] transition-colors resize-none"
                  placeholder="Thank you for your business!"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* NOTIFICATIONS */}
        <Card>
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-xl font-semibold text-[#F4F1E8] uppercase tracking-wide">Notifications</h2>
            <p className="text-sm text-[#A7A39A] mt-1">Manage system alerts and notifications</p>
          </div>
          <div className="p-6 space-y-4">
            {[
              { id: 'membershipExpiryAlerts', label: 'Membership Expiry Alerts' },
              { id: 'paymentDueAlerts', label: 'Payment Due Alerts' },
              { id: 'birthdayAlerts', label: 'Birthday Alerts' },
            ].map(item => (
              <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border border-[rgba(255,255,255,0.05)] bg-[#11110F]">
                <div>
                  <h3 className="text-sm font-medium text-[#F4F1E8]">{item.label}</h3>
                </div>
                <button 
                  onClick={() => setNotifications({...notifications, [item.id]: !(notifications as any)[item.id]})}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${(notifications as any)[item.id] ? 'bg-[#C9A24D]' : 'bg-gray-700'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${(notifications as any)[item.id] ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* SECURITY */}
        <Card>
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-xl font-semibold text-[#F4F1E8] uppercase tracking-wide">Security</h2>
            <p className="text-sm text-[#A7A39A] mt-1">Manage your account security and password</p>
          </div>
          <div className="p-6 space-y-8">
            <div className="space-y-4">
              <h3 className="text-md font-medium text-[#E2C46B]">Change Password</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input 
                  label="Current Password" 
                  type="password"
                  value={security.currentPassword}
                  onChange={(e) => setSecurity({...security, currentPassword: e.target.value})}
                />
                <Input 
                  label="New Password" 
                  type="password"
                  value={security.newPassword}
                  onChange={(e) => setSecurity({...security, newPassword: e.target.value})}
                />
                <Input 
                  label="Confirm New Password" 
                  type="password"
                  value={security.confirmPassword}
                  onChange={(e) => setSecurity({...security, confirmPassword: e.target.value})}
                />
              </div>
              <Button onClick={handleChangePassword}>
                Change Password
              </Button>
            </div>
            
            <div className="border-t border-gray-800 pt-6">
              <h3 className="text-md font-medium text-red-400 mb-2">Active Sessions</h3>
              <div className="flex items-center gap-3 bg-red-500/10 p-4 rounded-xl mb-4">
                <LogOut className="w-5 h-5 text-red-500" />
                <p className="text-sm text-[#706D66]">
                  Sign out the current active session. (Supabase securely manages session termination).
                </p>
              </div>
              <Button variant="secondary" className="w-full sm:w-auto text-red-400 border-red-500/20 hover:bg-red-500/10" onClick={handleSignOutOther}>
                Sign Out Other Sessions
              </Button>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
};

export default SettingsScreen;
