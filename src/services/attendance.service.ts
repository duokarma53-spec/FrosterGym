// @ts-nocheck
import { db } from './base.service';

export interface AttendanceRecord {
  id: string;
  memberId: string;
  memberName: string;
  date: string;
  timeIn: string;
  timeOut?: string;
}

export const attendanceService = {
  async markAttendance(gymId: string, memberId: string, date: string, memberName: string = 'Unknown') {
    
    const { data, error } = await db
      .from('attendance')
      .insert([{ gym_id: gymId, member_id: memberId, date, member_name: memberName }])
      .select()
      .single();
    return { data, error };
  },

  async getTodaysAttendance(gymId: string) {
    
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await db
      .from('attendance')
      .select('*')
      .eq('gym_id', gymId)
      .eq('date', today);
    return { data, error };
  },

  async getMemberAttendanceHistory(gymId: string, memberId: string) {
    
    const { data, error } = await db
      .from('attendance')
      .select('*')
      .eq('gym_id', gymId)
      .eq('member_id', memberId)
      .order('date', { ascending: false });
    return { data, error };
  }
};

