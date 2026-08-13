import { useState, useEffect } from 'react';
import { Target, Users, Calendar, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchPTMemberships, fetchTrainers } from '../../services/pt.service';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';

export function PTDashboard() {
  const { gym } = useAuth();
  const [ptMemberships, setPtMemberships] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddTrainerOpen, setIsAddTrainerOpen] = useState(false);
  const [isAssignPTOpen, setIsAssignPTOpen] = useState(false);

  useEffect(() => {
    const loadPTData = async () => {
      if (!gym?.id) return;
      try {
        const [ptData, trainerData] = await Promise.all([
          fetchPTMemberships(gym.id),
          fetchTrainers(gym.id)
        ]);
        setPtMemberships(ptData);
        setTrainers(trainerData);
      } catch (error) {
        console.error('Error fetching PT data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPTData();
  }, [gym?.id]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bebas tracking-wide text-white flex items-center gap-3">
            <Target className="w-8 h-8 text-[#d4af37]" />
            Personal Training
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Manage PT assignments and trainers</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setIsAddTrainerOpen(true)} variant="secondary" className="border-white/10 text-white hover:bg-white/5">
            <Users className="w-4 h-4 mr-2" />
            Add Trainer
          </Button>
          <Button onClick={() => setIsAssignPTOpen(true)} className="bg-[#d4af37] text-black hover:bg-[#b38b22]">
            <Plus className="w-4 h-4 mr-2" />
            Assign PT
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-[#111] border-white/5 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Target className="w-16 h-16 text-[#d4af37]" /></div>
          <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Active PT Clients</h3>
          <p className="text-4xl font-bebas text-white">{ptMemberships.filter(m => m.status === 'active').length}</p>
        </Card>
        <Card className="bg-[#111] border-white/5 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Users className="w-16 h-16 text-[#d4af37]" /></div>
          <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Total Trainers</h3>
          <p className="text-4xl font-bebas text-white">{trainers.length}</p>
        </Card>
        <Card className="bg-[#111] border-white/5 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Calendar className="w-16 h-16 text-[#d4af37]" /></div>
          <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Expiring This Month</h3>
          <p className="text-4xl font-bebas text-[#ff5722]">0</p>
        </Card>
      </div>

      <Card className="bg-[#111] border-white/5">
        <div className="p-6">
          <h3 className="text-lg font-medium text-white mb-6">Recent PT Assignments</h3>
          
          {loading ? (
            <div className="text-center text-gray-500 py-10">Loading PT data...</div>
          ) : ptMemberships.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No PT Clients</h3>
              <p className="text-gray-500 max-w-sm mx-auto mb-6">
                You haven't assigned any members to personal trainers yet.
              </p>
              <Button onClick={() => setIsAssignPTOpen(true)} className="bg-white/5 text-white hover:bg-white/10">
                Assign First Client
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {ptMemberships.map((pt) => (
                <div key={pt.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="text-white font-medium text-base mb-1">{pt.member?.full_name || 'Unknown Member'}</h4>
                    <p className="text-sm text-gray-400 flex items-center gap-2">
                      <Users className="w-3.5 h-3.5" />
                      {pt.trainer?.name || 'Unknown Trainer'}
                    </p>
                  </div>
                  <div className="flex flex-row sm:flex-col justify-between sm:justify-center items-center sm:items-end gap-2">
                    <div className="text-sm text-gray-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(pt.start_date).toLocaleDateString()} - {new Date(pt.end_date).toLocaleDateString()}
                    </div>
                    <Badge variant={pt.status === 'active' ? 'success' : 'default'}>
                      {pt.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Modal isOpen={isAddTrainerOpen} onClose={() => setIsAddTrainerOpen(false)} title="Add New Trainer">
        <div className="space-y-4">
          <Input label="Trainer Name" placeholder="e.g. John Doe" />
          <Input label="Specialization" placeholder="e.g. Weightlifting" />
          <Input label="Phone Number" placeholder="e.g. 9876543210" />
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setIsAddTrainerOpen(false)} className="border-white/10 text-white hover:bg-white/5">Cancel</Button>
            <Button onClick={() => setIsAddTrainerOpen(false)} className="bg-[#d4af37] text-black hover:bg-[#b38b22]">Save Trainer</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isAssignPTOpen} onClose={() => setIsAssignPTOpen(false)} title="Assign Personal Trainer">
        <div className="space-y-4">
          <Input label="Member ID or Name" placeholder="Search member..." />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#A7A39A]">Select Trainer</label>
            <select className="w-full h-12 rounded-xl bg-[#11110F] border border-[rgba(255,255,255,0.10)] text-[#F4F1E8] px-4 focus:outline-none focus:ring-2 focus:ring-[#C9A24D]/40 focus:border-[#C9A24D]">
              <option value="">Select a trainer</option>
              {trainers.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" />
            <Input label="End Date" type="date" />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setIsAssignPTOpen(false)} className="border-white/10 text-white hover:bg-white/5">Cancel</Button>
            <Button onClick={() => setIsAssignPTOpen(false)} className="bg-[#d4af37] text-black hover:bg-[#b38b22]">Assign PT</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
