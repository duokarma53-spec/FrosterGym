import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { Check, Tag, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { createPlan } from '../../services/memberships.service';

export function AddPlan() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { gym } = useAuth();
  const gymId = gym?.id;

  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [includesPT, setIncludesPT] = useState(false);
  const [includesDiet, setIncludesDiet] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymId) return;

    if (!name || !duration || !price) {
      toast('error', 'Please fill all required fields');
      return;
    }

    setSaving(true);
    try {
      const { error } = await createPlan(gymId, {
        name,
        duration_months: parseInt(duration),
        duration_days: parseInt(duration) * 30,
        price: parseFloat(price),
        description,
        includes_pt: includesPT,
        includes_diet: includesDiet,
        status: 'active'
      });
      
      if (error) throw new Error(error);

      toast('success', 'Plan created successfully!');
      navigate('/app/memberships');
    } catch (err: any) {
      console.error(err);
      toast('error', err.message || 'Failed to create plan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pb-24 animate-in slide-in-from-right duration-300">
      <PageHeader title="Add New Plan" showBack />
      
      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="space-y-4">
          <Input 
            label="Plan Name" 
            placeholder="e.g. 6 Months Pro" 
            icon={<Tag className="w-5 h-5" />} 
            required 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Duration (Months)" 
              type="number" 
              placeholder="6" 
              icon={<Clock className="w-5 h-5" />} 
              required 
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
            <Input 
              label="Price (₹)" 
              type="number" 
              placeholder="15000" 
              required 
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#A7A39A]">Description (Optional)</label>
            <textarea 
              className="w-full bg-[#11110F] border border-[rgba(255,255,255,0.08)] rounded-xl p-4 text-[#F4F1E8] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
              rows={4}
              placeholder="Features included in this plan..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              type="button" 
              onClick={() => setIncludesPT(!includesPT)} 
              className={`py-3 rounded-xl border text-sm font-medium transition-colors ${includesPT ? 'bg-[#C9A24D]/10 border-[#D4AF37]/50 text-[#E2C46B]' : 'bg-[#11110F] border-[rgba(255,255,255,0.08)] text-[#A7A39A] hover:bg-[#1A1A18]'}`}
            >
              Includes PT
            </button>
            <button 
              type="button" 
              onClick={() => setIncludesDiet(!includesDiet)} 
              className={`py-3 rounded-xl border text-sm font-medium transition-colors ${includesDiet ? 'bg-[#C9A24D]/10 border-[#D4AF37]/50 text-[#E2C46B]' : 'bg-[#11110F] border-[rgba(255,255,255,0.08)] text-[#A7A39A] hover:bg-[#1A1A18]'}`}
            >
              Includes Diet Plan
            </button>
          </div>
        </div>

        <div className="fixed bottom-20 left-0 right-0 px-4 pt-4 pb-safe bg-[#11110F] border-t border-[rgba(255,255,255,0.05)] lg:static lg:bg-transparent lg:border-none lg:px-0 lg:p-0 z-10">
          <Button type="submit" fullWidth size="lg" loading={saving}>
            <Check className="w-5 h-5 mr-2" />
            Save Plan
          </Button>
        </div>
      </form>
    </div>
  );
}
