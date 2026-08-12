// @ts-nocheck
import { db } from './base.service';

export interface Enquiry {
  id: string;
  name: string;
  phone: string;
  status: 'new' | 'hot' | 'cold' | 'converted';
  date: string;
  notes?: string;
  source?: string;
}

export const fetchEnquiries = async (gymId: string) => {
  
  const { data, error } = await db
    .from('enquiries')
    .select('*')
    .eq('gym_id', gymId)
    .order('date', { ascending: false });
  return { data, error };
};

export const addEnquiry = async (gymId: string, enquiryData: Omit<Enquiry, 'id' | 'status'>) => {
  
  const { data, error } = await db
    .from('enquiries')
    .insert([{ gym_id: gymId, status: 'new', ...enquiryData }])
    .select()
    .single();
  return { data, error };
};

export const convertEnquiry = async (gymId: string, enquiryId: string) => {
  
  const { data, error } = await db
    .from('enquiries')
    .update({ status: 'converted' })
    .eq('gym_id', gymId)
    .eq('id', enquiryId)
    .select()
    .single();
  return { data, error };
};

export const enquiriesService = {
  fetchEnquiries,
  addEnquiry,
  convertEnquiry
};

