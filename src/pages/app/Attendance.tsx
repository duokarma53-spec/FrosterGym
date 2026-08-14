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
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 max-w-lg mx-auto space-y-6">
      <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center border border-amber-500/20 animate-pulse">
        <CalendarCheck className="w-10 h-10" />
      </div>
      
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">Biometric & QR Attendance</h1>
        <div className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase rounded-full tracking-widest">
          Coming Soon
        </div>
      </div>

      <p className="text-gray-400 text-sm leading-relaxed">
        We are designing an automated check-in ecosystem. Gym owners will soon be able to track check-ins via local biometric scan hardware integrations and member-facing QR digital passes.
      </p>

      <div className="w-full bg-surface border border-surface-highlight rounded-xl p-5 text-left space-y-4 shadow-xl">
        <h3 className="font-bold text-white text-sm uppercase tracking-wider text-amber-500">Upcoming Features</h3>
        <ul className="space-y-2.5 text-xs text-gray-400">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" />
            <span>Real-time QR scan check-in via Froster Member Pass</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" />
            <span>Biometric fingerprint reader SDK integration</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" />
            <span>Instant automated WhatsApp check-in alerts</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
