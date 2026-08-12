import { db } from './base.service';
import { supabase } from '../lib/supabase';

export interface GymProfile {
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  logo_url: string | null;
}

export interface OperatingHours {
  openingTime: string;
  closingTime: string;
  weeklyOff: string; // 'Monday', 'Tuesday', ..., 'Sunday', 'None'
}

export interface ReceiptSettings {
  invoicePrefix: string;
  showGymLogo: boolean;
  footerMessage: string;
}

export interface NotificationSettings {
  membershipExpiryAlerts: boolean;
  paymentDueAlerts: boolean;
  birthdayAlerts: boolean;
}

const DEFAULT_OPERATING_HOURS: OperatingHours = {
  openingTime: '06:00',
  closingTime: '22:00',
  weeklyOff: 'Sunday'
};

const DEFAULT_RECEIPT_SETTINGS: ReceiptSettings = {
  invoicePrefix: 'INV-',
  showGymLogo: true,
  footerMessage: 'Thank you for choosing Froster Gym.'
};

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  membershipExpiryAlerts: true,
  paymentDueAlerts: true,
  birthdayAlerts: true
};

// ─── GYM PROFILE ────────────────────────────────────────────────────────

export async function fetchGymProfile(gymId: string): Promise<GymProfile | null> {
  

  const { data, error } = await (db.from('gyms') as any).select('name, phone, email, address, logo_url').eq('id', gymId).single();
  if (error) throw error;
  return data;
}

export async function updateGymProfile(gymId: string, profile: Partial<GymProfile>): Promise<void> {
  
  const { error } = await (db.from('gyms') as any).update(profile).eq('id', gymId);
  if (error) throw error;
}

// ─── GENERIC GYM SETTINGS ───────────────────────────────────────────────

async function fetchGymSetting<T>(gymId: string, key: string, defaultValue: T): Promise<T> {
    
  const { data, error } = await (db.from('gym_settings') as any).select('value').eq('gym_id', gymId).eq('key', key).single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 is not found
    console.error(`Error fetching setting ${key}:`, error);
  }
  
  if (data?.value) {
    return { ...defaultValue, ...(data.value as object) } as T;
  }
  return defaultValue;
}

async function updateGymSetting<T>(gymId: string, key: string, value: T): Promise<void> {
  
  
  // Try to update first
  const { error: updateError } = await (db.from('gym_settings') as any).update({ value }).eq('gym_id', gymId).eq('key', key);
  
  if (updateError) {
    // If update fails, upsert
    const { error: insertError } = await (db.from('gym_settings') as any).upsert({
      gym_id: gymId,
      key,
      value
    }, { onConflict: 'gym_id, key' });
    
    if (insertError) throw insertError;
  }
}

// ─── SPECIFIC SETTINGS ──────────────────────────────────────────────────

export async function fetchOperatingHours(gymId: string): Promise<OperatingHours> {
  return fetchGymSetting<OperatingHours>(gymId, 'operating_hours', DEFAULT_OPERATING_HOURS);
}

export async function updateOperatingHours(gymId: string, hours: OperatingHours): Promise<void> {
  return updateGymSetting(gymId, 'operating_hours', hours);
}

export async function fetchReceiptSettings(gymId: string): Promise<ReceiptSettings> {
  return fetchGymSetting<ReceiptSettings>(gymId, 'receipt_settings', DEFAULT_RECEIPT_SETTINGS);
}

export async function updateReceiptSettings(gymId: string, settings: ReceiptSettings): Promise<void> {
  return updateGymSetting(gymId, 'receipt_settings', settings);
}

export async function fetchNotificationSettings(gymId: string): Promise<NotificationSettings> {
  return fetchGymSetting<NotificationSettings>(gymId, 'notification_settings', DEFAULT_NOTIFICATION_SETTINGS);
}

export async function updateNotificationSettings(gymId: string, settings: NotificationSettings): Promise<void> {
  return updateGymSetting(gymId, 'notification_settings', settings);
}

// ─── SECURITY ───────────────────────────────────────────────────────────

export async function updatePassword(newPassword: string): Promise<void> {
  
  
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });
  
  if (error) throw error;
}

export async function signOutCurrentSession(): Promise<void> {
  
  
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
