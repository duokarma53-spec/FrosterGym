import { useState, useEffect } from 'react';
import { Search, CheckCircle, Clock, AlertTriangle, User, CalendarCheck, Ban, Snowflake } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database.types';

type Member = Database['public']['Tables']['members']['Row'];
type Membership = Database['public']['Tables']['memberships']['Row'];
type AttendanceRecord = Database['public']['Tables']['attendance']['Row'];
type MemberFreeze = Database['public']['Tables']['member_freezes']['Row'];

interface MemberWithStatus extends Member {
  currentMembership: Membership | null;
  hasCheckedInToday: boolean;
  member_freezes: MemberFreeze[];
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

      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select(`
          *,
          memberships (*),
          member_freezes (*)
        `)
        .eq('gym_id', gym!.id);

      if (membersError) throw membersError;

      const checkedInMemberIds = new Set((attendanceData || []).map((a: any) => a.member_id));

      const formattedMembers = (membersData as any[]).map(m => {
        const memberships = m.memberships || [];
        const active = memberships.find((ms: any) => ms.status === 'active' && new Date(ms.end_date) >= new Date());
        const current = active || memberships[0] || null;
        return {
          ...m,
          currentMembership: current,
          hasCheckedInToday: checkedInMemberIds.has(m.id),
          member_freezes: m.member_freezes || []
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
      
      setTodaysAttendance(prev => [...prev, { member_id: memberId } as AttendanceRecord]);
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, hasCheckedInToday: true } : m));
      
    } catch (err: any) {
      alert(err.message || 'Failed to check in');
    } finally {
      setIsCheckingIn(null);
    }
  };

  const isCurrentlyFrozen = (freezes: MemberFreeze[]) => {
    if (!freezes || freezes.length === 0) return false;
    const now = new Date();
    now.setHours(0,0,0,0);
    return freezes.some(f => {
      const from = new Date(f.freeze_from);
      const to = new Date(f.freeze_to);
      return now >= from && now <= to;
    });
  };

  const getActiveFreezeDate = (freezes: MemberFreeze[]) => {
    if (!freezes || freezes.length === 0) return null;
    const now = new Date();
    now.setHours(0,0,0,0);
    const active = freezes.find(f => {
      const from = new Date(f.freeze_from);
      const to = new Date(f.freeze_to);
      return now >= from && now <= to;
    });
    return active ? active.freeze_to : null;
  };

  const getMembershipWarning = (member: MemberWithStatus) => {
    if (member.is_blocked) {
      return { type: 'blocked', text: 'Member is blocked.' };
    }
    
    if (isCurrentlyFrozen(member.member_freezes)) {
      const untilDate = getActiveFreezeDate(member.member_freezes);
      return { type: 'frozen', text: `Membership is currently frozen until ${untilDate}.` };
    }

    if (!member.currentMembership) return { type: 'expired', text: 'No Membership' };
    if (new Date(member.currentMembership.end_date) < new Date()) return { type: 'expired', text: 'Membership Expired' };
    
    return null;
  };

  const filteredMembers = search.length >= 2 
    ? members.filter(m => 
        m.full_name.toLowerCase().includes(search.toLowerCase()) || 
        m.phone?.includes(search)
      ).slice(0, 10)
    : [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Quick Attendance</h1>
          <p className="text-gray-400">Search member to check in</p>
        </div>
        <div className="bg-surface border border-surface-highlight rounded-xl px-5 py-3 flex items-center gap-4 shadow-lg shadow-black/20">
          <CalendarCheck className="w-6 h-6 text-primary-500" />
          <div>
            <div className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Today's Check-ins</div>
            <div className="text-2xl font-bold text-white">{todaysAttendance.length}</div>
          </div>
        </div>
      </div>

      <div className="relative shadow-2xl shadow-black/20">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
        <input
          type="text"
          placeholder="Search by name or phone (type at least 2 characters)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-14 pr-4 py-4 bg-surface border border-surface-highlight rounded-xl text-white text-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-gray-500"
          autoFocus
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : search.length >= 2 ? (
        <div className="space-y-3">
          {filteredMembers.length > 0 ? (
            filteredMembers.map(member => {
              const warning = getMembershipWarning(member);

              return (
                <div key={member.id} className="bg-surface border border-surface-highlight rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-surface-highlight/80">
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
                      <p className="text-sm text-gray-400 font-mono">{member.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                    {warning && (
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold border ${
                        warning.type === 'blocked' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                        warning.type === 'frozen' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                        'bg-orange-500/10 text-orange-400 border-orange-500/20'
                      }`}>
                        {warning.type === 'blocked' ? <Ban className="w-4 h-4" /> : 
                         warning.type === 'frozen' ? <Snowflake className="w-4 h-4" /> : 
                         <AlertTriangle className="w-4 h-4" />}
                        <span>{warning.text}</span>
                      </div>
                    )}
                    
                    {member.hasCheckedInToday ? (
                      <div className="flex items-center gap-2 px-6 py-2.5 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl font-bold">
                        <CheckCircle className="w-5 h-5" />
                        <span>Checked In</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleCheckIn(member.id)}
                        disabled={isCheckingIn === member.id || !!warning}
                        className={`flex-shrink-0 px-8 py-2.5 rounded-xl font-bold transition-colors disabled:opacity-50 ${
                          warning ? 'bg-surface-highlight text-gray-400 cursor-not-allowed' : 'bg-primary-500 text-black hover:bg-primary-600'
                        }`}
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
        <div className="text-center py-24 bg-surface/30 border border-surface-highlight rounded-2xl border-dashed">
          <Clock className="w-12 h-12 text-surface-highlight mx-auto mb-4" />
          <p className="text-gray-400 font-medium">Type a name or phone number to check someone in.</p>
        </div>
      )}
    </div>
  );
}
