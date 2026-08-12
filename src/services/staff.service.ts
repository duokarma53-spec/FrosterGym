// @ts-nocheck
import { db } from './base.service';

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  phone?: string;
  email?: string;
  permissions: string[];
}

export const fetchStaff = async (gymId: string) => {
  
  const { data, error } = await db
    .from('staff')
    .select('*')
    .eq('gym_id', gymId);
  return { data, error };
};

export const createStaff = async (gymId: string, staffData: Omit<StaffMember, 'id'>) => {
  
  const { data, error } = await db
    .from('staff')
    .insert([{ gym_id: gymId, ...staffData }])
    .select()
    .single();
  return { data, error };
};

export const updateStaffPermissions = async (gymId: string, staffId: string, permissions: string[]) => {
  
  const { data, error } = await db
    .from('staff')
    .update({ permissions })
    .eq('gym_id', gymId)
    .eq('id', staffId)
    .select()
    .single();
  return { data, error };
};

export const staffService = {
  fetchStaff,
  createStaff,
  updateStaffPermissions
};

