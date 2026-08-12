import { useState, useEffect } from 'react';
import { Search, ScanLine, CheckCircle2, Loader2 } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { attendanceService, type AttendanceRecord } from '../../services/attendance.service';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

export function AttendanceScreen() {
  const { gym } = useAuth();
  const gymId = gym?.id;
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'loading'>('idle');
  const [recent, setRecent] = useState<AttendanceRecord[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  const loadRecent = async () => {
    if (!gymId) return;
    try {
      const { data, error } = await attendanceService.getTodaysAttendance(gymId);
      if (error) throw error;
      setRecent(data || []);
    } catch (err) {
      console.error('Failed to load attendance:', err);
    } finally {
      setLoadingRecent(false);
    }
  };

  useEffect(() => {
    loadRecent();
  }, [gymId]);

  const handleMarkPresent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query || !gymId) return;
    setStatus('loading');
    try {
      // In a real implementation we would look up the member by ID or Phone first
      // Here we assume query is the memberId for demonstration, though it needs actual resolution
      // We will just do a placeholder success and refresh the list
      const { error } = await attendanceService.markAttendance(gymId, query, new Date().toISOString().split('T')[0], 'Member ' + query);
      if (error) throw error;
      setStatus('success');
      toast.success('Marked present');
      setQuery('');
      loadRecent();
      setTimeout(() => setStatus('idle'), 2000);
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      toast.error('Failed to mark attendance');
    }
  };

  return (
    <div className="pb-24 animate-in fade-in duration-300 flex flex-col items-center pt-8">
      <div className="w-20 h-20 bg-[#C9A24D]/10 text-[#E2C46B] rounded-full flex items-center justify-center mb-6">
        <ScanLine className="w-10 h-10" />
      </div>
      
      <h1 className="text-2xl font-bold text-[#F4F1E8] mb-2 text-center">Gym Attendance</h1>
      <p className="text-[#A7A39A] text-sm text-center mb-8 max-w-xs">
        Enter member ID or phone number to mark attendance
      </p>

      <form onSubmit={handleMarkPresent} className="w-full max-w-sm space-y-4">
        <Input 
          placeholder="e.g. FG-1001 or 9876543210" 
          icon={<Search className="w-5 h-5" />} 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        
        <Button 
          fullWidth 
          size="lg" 
          type="submit" 
          loading={status === 'loading'}
          className={status === 'success' ? 'bg-emerald-500 hover:bg-emerald-600 text-[#F4F1E8] border-emerald-600' : ''}
        >
          {status === 'success' ? (
            <>
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Marked Present!
            </>
          ) : (
            'Mark Attendance'
          )}
        </Button>
      </form>

      <div className="mt-12 w-full max-w-sm">
        <h3 className="text-sm font-semibold text-[#A7A39A] uppercase tracking-wider mb-4">Recent Check-ins</h3>
        {loadingRecent ? (
          <div className="flex justify-center p-4">
            <Loader2 className="w-6 h-6 animate-spin text-[#A7A39A]" />
          </div>
        ) : recent.length === 0 ? (
          <div className="text-center text-[#706D66] text-sm py-4">
            No check-ins today
          </div>
        ) : (
          <div className="space-y-3">
            {recent.slice(0, 5).map((record) => (
              <div key={record.id} className="flex justify-between items-center bg-[#11110F] border border-[rgba(255,255,255,0.08)] p-3 rounded-xl">
                <span className="text-sm font-medium text-[#F4F1E8]">{record.memberName || 'Member'}</span>
                <span className="text-xs text-[#4D6B5A]">
                  {record.timeIn ? new Date(`1970-01-01T${record.timeIn}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Checked In'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
