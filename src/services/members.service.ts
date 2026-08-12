// @ts-nocheck
import { db, type ServiceResult, type PaginatedResult } from './base.service';

export interface MemberWithMembership {
  id: string;
  gym_id: string;
  member_id: string;
  full_name: string;
  phone: string;
  email: string | null;
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  emergency_contact: string | null;
  photo_url: string | null;
  notes: string | null;
  status: 'active' | 'inactive' | 'expired' | 'blocked' | 'frozen';
  deleted_at: string | null;
  occupation: string | null;
  goal: string | null;
  blood_group: string | null;
  referral_source: string | null;
  created_at: string;
  updated_at: string;
  current_membership?: {
    id: string;
    plan_id: string | null;
    plan_name?: string;
    start_date: string;
    end_date: string;
    status: string;
    original_amount: number;
    discount_amount: number;
    final_amount: number;
    paid_amount: number;
    due_amount: number;
  } | null;
}

export interface CreateMemberInput {
  full_name: string;
  phone: string;
  email?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  emergency_contact?: string;
  occupation?: string;
  goal?: string;
  blood_group?: string;
  referral_source?: string;
  status?: 'active' | 'inactive';
}

export type MemberFilter = 'all' | 'active' | 'inactive' | 'expired' | 'blocked' | 'frozen' | 'expiring_3' | 'expiring_7' | 'expiring_15' | 'due' | 'paid' | 'partially_paid' | 'unpaid' | 'birthday_today';
export type MemberSort = 'newest' | 'oldest' | 'expiry_soonest' | 'due_highest' | 'due_lowest';

const d = (offset: number) => new Date(Date.now() + offset * 86400000).toISOString().split('T')[0];
const today = new Date();
const todayStr = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;


export const fetchMembers = async (gymId: string, options?: { search?: string; filter?: MemberFilter; sort?: MemberSort; page?: number; pageSize?: number }): Promise<PaginatedResult<MemberWithMembership>> => {
  

  const page = options?.page || 1;
  const pageSize = options?.pageSize || 10;
  
  let query = db.from('members').select('*', { count: 'exact' }).eq('gym_id', gymId).is('deleted_at', null);

  if (options?.search) {
    query = query.or(`full_name.ilike.%${options.search}%,phone.ilike.%${options.search}%,member_id.ilike.%${options.search}%`);
  }

  if (options?.filter && options.filter !== 'all') {
    if (['active', 'inactive', 'expired', 'blocked', 'frozen'].includes(options.filter)) {
      query = query.eq('status', options.filter);
    } else if (options.filter === 'birthday_today') {
      const todayDate = new Date();
      const monthStr = String(todayDate.getMonth() + 1).padStart(2, '0');
      const dayStr = String(todayDate.getDate()).padStart(2, '0');
      query = query.like('date_of_birth', `%-${monthStr}-${dayStr}`);
    }
  }

  if (options?.sort) {
    if (options.sort === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else if (options.sort === 'oldest') {
      query = query.order('created_at', { ascending: true });
    }
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, count, error } = await query.range((page - 1) * pageSize, page * pageSize - 1);
  
  if (error) return { data: [], total: 0, page, pageSize };

  const members = data as any as MemberWithMembership[];

  if (members.length > 0) {
    const memberIds = members.map(m => m.id);
    
    // Fetch latest membership for each member
    const { data: membershipsData } = await db.from('memberships')
      .select('*')
      .in('member_id', memberIds)
      .order('end_date', { ascending: false });

    if (membershipsData) {
      members.forEach(member => {
        const memberMemberships = membershipsData.filter((m: any) => m.member_id === member.id);
        if (memberMemberships.length > 0) {
          member.current_membership = memberMemberships[0] as any;
        } else {
          member.current_membership = null;
        }
      });
    }

    if (options?.filter && ['expiring_3', 'expiring_7', 'expiring_15', 'due', 'paid', 'partially_paid', 'unpaid'].includes(options.filter)) {
      let filteredMembers = members;
      
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);

      switch (options.filter) {
        case 'expiring_3':
        case 'expiring_7':
        case 'expiring_15': {
          const days = options.filter === 'expiring_3' ? 3 : options.filter === 'expiring_7' ? 7 : 15;
          const maxDate = new Date();
          maxDate.setDate(maxDate.getDate() + days);
          maxDate.setHours(23, 59, 59, 999);
          
          filteredMembers = filteredMembers.filter(m => {
            if (m.status !== 'active' || !m.current_membership?.end_date) return false;
            const endDate = new Date(m.current_membership.end_date);
            return endDate >= todayDate && endDate <= maxDate;
          });
          break;
        }
        case 'due':
          filteredMembers = filteredMembers.filter(m => m.current_membership && m.current_membership.due_amount > 0);
          break;
        case 'paid':
          filteredMembers = filteredMembers.filter(m => m.current_membership && m.current_membership.due_amount === 0);
          break;
        case 'partially_paid':
          filteredMembers = filteredMembers.filter(m => m.current_membership && m.current_membership.paid_amount > 0 && m.current_membership.due_amount > 0);
          break;
        case 'unpaid':
          filteredMembers = filteredMembers.filter(m => m.current_membership && m.current_membership.paid_amount === 0);
          break;
      }

      if (options?.sort) {
        filteredMembers.sort((a, b) => {
          switch (options.sort) {
            case 'expiry_soonest':
              if (!a.current_membership?.end_date) return 1;
              if (!b.current_membership?.end_date) return -1;
              return new Date(a.current_membership.end_date).getTime() - new Date(b.current_membership.end_date).getTime();
            case 'due_highest':
              return (b.current_membership?.due_amount || 0) - (a.current_membership?.due_amount || 0);
            case 'due_lowest':
              return (a.current_membership?.due_amount || 0) - (b.current_membership?.due_amount || 0);
            default:
              return 0;
          }
        });
      }

      return { 
        data: filteredMembers, 
        total: filteredMembers.length,
        page, 
        pageSize 
      };
    } else if (options?.sort && ['expiry_soonest', 'due_highest', 'due_lowest'].includes(options.sort)) {
       members.sort((a, b) => {
        switch (options.sort) {
          case 'expiry_soonest':
            if (!a.current_membership?.end_date) return 1;
            if (!b.current_membership?.end_date) return -1;
            return new Date(a.current_membership.end_date).getTime() - new Date(b.current_membership.end_date).getTime();
          case 'due_highest':
            return (b.current_membership?.due_amount || 0) - (a.current_membership?.due_amount || 0);
          case 'due_lowest':
            return (a.current_membership?.due_amount || 0) - (b.current_membership?.due_amount || 0);
          default:
            return 0;
        }
      });
    }
  }

  return { data: members, total: count || 0, page, pageSize };
};

export const fetchMemberById = async (gymId: string, memberId: string): Promise<ServiceResult<MemberWithMembership>> => {
    const { data, error } = await db.from('members').select(`*, current_membership:memberships(*)`).eq('id', memberId).eq('gym_id', gymId).single();
  return { data: data as any as MemberWithMembership, error: error?.message || null };
};

export const createMember = async (gymId: string, data: CreateMemberInput): Promise<ServiceResult<MemberWithMembership>> => {
    const member_id = await generateMemberId(gymId);
  const { data: result, error } = await db.from('members').insert({ ...data, gym_id: gymId, member_id }).select().single();
  return { data: result as any as MemberWithMembership, error: error?.message || null };
};

export const updateMember = async (gymId: string, memberId: string, data: Partial<CreateMemberInput>): Promise<ServiceResult<MemberWithMembership>> => {
    const { data: result, error } = await db.from('members').update(data).eq('id', memberId).eq('gym_id', gymId).select().single();
  return { data: result as any as MemberWithMembership, error: error?.message || null };
};

export const deleteMember = async (gymId: string, memberId: string): Promise<ServiceResult<boolean>> => {
    const { error } = await db.from('members').update({ deleted_at: new Date().toISOString() }).eq('id', memberId).eq('gym_id', gymId);
  return { data: !error, error: error?.message || null };
};

export const restoreMember = async (gymId: string, memberId: string): Promise<ServiceResult<boolean>> => {
    const { error } = await db.from('members').update({ deleted_at: null }).eq('id', memberId).eq('gym_id', gymId);
  return { data: !error, error: error?.message || null };
};

export const permanentDeleteMember = async (gymId: string, memberId: string): Promise<ServiceResult<boolean>> => {
    const { error } = await db.from('members').delete().eq('id', memberId).eq('gym_id', gymId);
  return { data: !error, error: error?.message || null };
};

export const blockMember = async (gymId: string, memberId: string): Promise<ServiceResult<boolean>> => {
    const { error } = await db.from('members').update({ status: 'blocked' }).eq('id', memberId).eq('gym_id', gymId);
  return { data: !error, error: error?.message || null };
};

export const unblockMember = async (gymId: string, memberId: string): Promise<ServiceResult<boolean>> => {
    const { error } = await db.from('members').update({ status: 'active' }).eq('id', memberId).eq('gym_id', gymId);
  return { data: !error, error: error?.message || null };
};

export const freezeMember = async (gymId: string, memberId: string, startDate: string, endDate: string, reason: string): Promise<ServiceResult<boolean>> => {
    const { error } = await db.from('members').update({ status: 'frozen' }).eq('id', memberId).eq('gym_id', gymId);
  return { data: !error, error: error?.message || null };
};

export const unfreezeMember = async (gymId: string, memberId: string): Promise<ServiceResult<boolean>> => {
    const { error } = await db.from('members').update({ status: 'active' }).eq('id', memberId).eq('gym_id', gymId);
  return { data: !error, error: error?.message || null };
};

export const generateMemberId = async (gymId: string): Promise<string> => {
    const { count } = await db.from('members').select('*', { count: 'exact', head: true }).eq('gym_id', gymId);
  return `FG-${1000 + (count || 0) + 1}`;
};

export const getDeletedMembers = async (gymId: string): Promise<MemberWithMembership[]> => {
    const { data, error } = await db.from('members').select('*').eq('gym_id', gymId).not('deleted_at', 'is', null);
  return (data || []) as any as MemberWithMembership[];
};


