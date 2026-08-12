import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Tag, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { fetchPlans, type MembershipPlan } from '../../services/memberships.service';
import { useAuth } from '../../contexts/AuthContext';

export function PlansList() {
  const navigate = useNavigate();
  const { gym } = useAuth();
  const gymId = gym?.id;
  
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadPlans = async () => {
      if (!gymId) return;
      try {
        setLoading(true);
        const data = await fetchPlans(gymId);
        if (mounted) {
          setPlans(data || []);
        }
      } catch (err: any) {
        console.error('Failed to load plans:', err);
        if (mounted) toast.error('Failed to load membership plans');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadPlans();
    return () => { mounted = false; };
  }, [gymId]);

  return (
    <div className="pb-24 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#F4F1E8]">Membership Plans</h1>
          <p className="text-[#A7A39A] text-sm">Manage your gym's pricing packages</p>
        </div>
        <Button onClick={() => navigate('/app/memberships/add')}>
          <Plus className="w-5 h-5 mr-2" />
          Add Plan
        </Button>
      </div>

      {loading ? (
        <div className="p-12 flex flex-col items-center justify-center text-[#A7A39A]">
          <Loader2 className="w-8 h-8 animate-spin mb-4" />
          <p>Loading plans...</p>
        </div>
      ) : plans.length === 0 ? (
        <EmptyState icon={<Tag className="w-12 h-12" />} title="No plans created" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map(plan => (
            <div key={plan.id} className="bg-[#11110F] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 hover:border-[#D4AF37]/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-[#F4F1E8]">{plan.name}</h3>
                <Badge variant={plan.status === 'active' ? 'success' : 'default'}>
                  {plan.status}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#706D66]">Duration</span>
                  <span className="text-zinc-200 font-medium">{plan.duration_months} Months</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#706D66]">Price</span>
                  <span className="text-[#4D6B5A] font-semibold">₹{plan.price}</span>
                </div>
              </div>
              <div className="mt-5 flex gap-2">
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => navigate(`/app/memberships/edit/${plan.id}`)}>Edit</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
