import { useState, useEffect } from 'react';
import { Search, CheckCircle, Clock, AlertTriangle, User, CalendarCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database.types';

type Member = Database['public']['Tables']['members']['Row'];
type Membership = Database['public']['Tables']['memberships']['Row'];
type AttendanceRecord = Database['public']['Tables']['attendance']['Row'];

interface MemberWithStatus extends Member {
  currentMembership: Membership | null;
  hasCheckedInToday: boolean;
}

export function Attendance() {
  const { gym } = useAuth();
  const [search, setSearch] = useState('');
  const [members, setMembers] = useState<MemberWithStatus[]>([]);
  const [todaysAttendance, setTodaysAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState<string | null>(null);

  useEffect(() => {
    if (gym) {
      loadData();
    }
  }, [gym]);

  async function loadData() {
    setIsLoading(true);
    try {
      // 1. Fetch Today's Attendance for the Gym
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startOfDay = today.toISOString();
      const endOfDay = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString();

      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('*')
        .eq('gym_id', gym!.id)
        .gte('check_in_time', startOfDay)
        .lt('check_in_time', endOfDay);

      if (attendanceError) throw attendanceError;
      setTodaysAttendance((attendanceData || []) as AttendanceRecord[]);

      // 2. Fetch all members and their memberships
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select(`
          *,
          memberships (*)
        `)
        .eq('gym_id', gym!.id)
        .eq('status', 'active');

      if (membersError) throw membersError;

      const checkedInMemberIds = new Set((attendanceData || []).map((a: any) => a.member_id));

      const formattedMembers = (membersData as any[]).map(m => {
        const memberships = m.memberships || [];
        const active = memberships.find((ms: any) => ms.status === 'active' && new Date(ms.end_date) >= new Date());
        const current = active || memberships[0] || null;
        return {
          ...m,
          currentMembership: current,
          hasCheckedInToday: checkedInMemberIds.has(m.id)
        };
      });

      setMembers(formattedMembers);
    } catch (err: any) {
      console.error('Error loading attendance data:', err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleCheckIn = async (memberId: string) => {
    if (!gym || isCheckingIn) return;
    try {
      setIsCheckingIn(memberId);
      
      const { error } = await supabase.from('attendance').insert({
        gym_id: gym.id,
        member_id: memberId,
        status: 'present',
        check_in_time: new Date().toISOString()
      } as any);

      if (error) throw error;
      
      // Update local state immediately for speed
      setTodaysAttendance(prev => [...prev, { member_id: memberId } as AttendanceRecord]);
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, hasCheckedInToday: true } : m));
      
    } catch (err: any) {
      alert(err.message || 'Failed to check in');
    } finally {
      setIsCheckingIn(null);
    }
  };

  const getMembershipWarning = (member: MemberWithStatus) => {
    if (!member.currentMembership) return 'No Membership';
    if (new Date(member.currentMembership.end_date) < new Date()) return 'Membership Expired';
    return null;
  };

  // Fast filtering
  const filteredMembers = search.length >= 2 
    ? members.filter(m => 
        m.full_name.toLowerCase().includes(search.toLowerCase()) || 
        m.phone?.includes(search)
      ).slice(0, 10) // Only show top 10 results for speed
    : [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Quick Attendance</h1>
          <p className="text-gray-400">Search member to check in</p>
        </div>
        <div className="bg-surface border border-surface-highlight rounded-lg px-4 py-3 flex items-center gap-3">
          <CalendarCheck className="w-5 h-5 text-amber-500" />
          <div>
            <div className="text-xs text-gray-400">Today's Check-ins</div>
            <div className="text-xl font-bold text-white">{todaysAttendance.length}</div>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
        <input
          type="text"
          placeholder="Search by name or phone (type at least 2 characters)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-14 pr-4 py-4 bg-surface border-2 border-surface-highlight rounded-xl text-white text-lg focus:ring-0 focus:border-amber-500 outline-none transition-colors"
          autoFocus
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : search.length >= 2 ? (
        <div className="space-y-3">
          {filteredMembers.length > 0 ? (
            filteredMembers.map(member => {
              const warning = getMembershipWarning(member);
              return (
                <div key={member.id} className="bg-surface border border-surface-highlight rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {member.photo_url ? (
                      <img src={member.photo_url} alt="" className="w-12 h-12 rounded-full object-cover border border-surface-highlight" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center border border-surface-highlight">
                        <User className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-white">{member.full_name}</h3>
                      <p className="text-sm text-gray-400">{member.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                    {warning && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-500 rounded-md text-sm font-medium">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{warning}</span>
                      </div>
                    )}
                    
                    {member.hasCheckedInToday ? (
                      <div className="flex items-center gap-2 px-6 py-2.5 bg-green-500/10 text-green-500 rounded-lg font-bold">
                        <CheckCircle className="w-5 h-5" />
                        <span>Checked In</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleCheckIn(member.id)}
                        disabled={isCheckingIn === member.id}
                        className="flex-shrink-0 px-8 py-2.5 bg-amber-500 text-black rounded-lg font-bold hover:bg-amber-400 transition-colors disabled:opacity-50"
                      >
                        {isCheckingIn === member.id ? 'Saving...' : 'Check In'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-surface rounded-xl border border-surface-highlight border-dashed">
              <p className="text-gray-400">No members found matching "{search}"</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20">
          <Clock className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Type a name or phone number to check someone in.</p>
        </div>
      )}
    </div>
  );
}
