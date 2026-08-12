import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { Save, Building2, UploadCloud } from 'lucide-react';
import { toast } from 'react-hot-toast'; // Assuming react-hot-toast is used, if not we'll handle it or change to custom Toast

export const SettingsScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const [gymName, setGymName] = useState('Froster Gym HQ');
  const [phone, setPhone] = useState('+91 9876543210');
  const [email, setEmail] = useState('admin@frostergym.com');
  const [address, setAddress] = useState('123 Fitness Street, Gym City');

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Simulate toast
      const event = new CustomEvent('show-toast', { detail: { message: 'Settings saved successfully', type: 'success' } });
      window.dispatchEvent(event);
      // fallback if using react-hot-toast
      if (typeof toast !== 'undefined' && toast.success) {
        toast.success('Settings saved successfully');
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto w-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <PageHeader 
          title="Settings" 
          subtitle="Manage your gym profile, billing, and branches" 
        />
        <Button 
          variant="primary" 
          icon={<Save className="w-4 h-4" />} 
          onClick={handleSave}
          loading={loading}
        >
          Save Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Navigation Sidebar */}
        <div className="md:col-span-1 space-y-2">
          <Card className="p-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-800 text-[#F4F1E8] font-medium transition-colors">
              <Building2 className="w-5 h-5 text-indigo-400" />
              Gym Profile
            </button>
          </Card>
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Gym Profile Section */}
          <Card>
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-xl font-semibold text-[#F4F1E8]">Gym Profile</h2>
              <p className="text-sm text-[#A7A39A] mt-1">Basic information about your business</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Logo Upload (Placeholder) */}
              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium text-gray-300">Gym Logo</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-gray-800 border-2 border-dashed border-gray-700 flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-[#706D66]" />
                  </div>
                  <Button variant="secondary" icon={<UploadCloud className="w-4 h-4" />}>
                    Upload Logo
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="Gym Name" 
                  value={gymName} 
                  onChange={(e) => setGymName(e.target.value)} 
                  placeholder="Enter gym name"
                />
                <Input 
                  label="Phone Number" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="Enter phone number"
                />
                <Input 
                  label="Email Address" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="Enter email address"
                  type="email"
                />
                <Input 
                  label="Address" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  placeholder="Enter complete address"
                />
              </div>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
