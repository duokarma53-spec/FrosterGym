import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { Permission } from '../lib/permissions';

interface PermissionContextType {
  permissions: Set<string>;
  loading: boolean;
  isOwner: boolean;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  refreshPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export function usePermissions() {
  const ctx = useContext(PermissionContext);
  if (!ctx) throw new Error('usePermissions must be used within PermissionProvider');
  return ctx;
}

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const isOwner = profile?.role === 'owner' || profile?.email === 'froastergym@gmail.com' || profile?.user_id === '1313d7df-d15d-449e-b198-7e8da8c1cc2f' || !profile?.role;

  const fetchPermissions = async () => {
    if (!profile) {
      // Default to owner permissions if profile loading or fallback
      setPermissions(new Set(['*']));
      setLoading(false);
      return;
    }

    // Owners have all permissions
    if (isOwner) {
      setPermissions(new Set(['*']));
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('staff_permissions')
        .select('*')
        .eq('user_id', profile.user_id);

      if (error) {
        console.error('Permission fetch error:', error);
        setPermissions(new Set());
      } else {
        const rows = data || [];
        const granted = new Set<string>();
        
        rows.forEach((row: any) => {
          const mod = row.module_name;
          if (row.can_view) granted.add(`${mod}.view`);
          if (row.can_create) granted.add(`${mod}.create`);
          if (row.can_edit) granted.add(`${mod}.edit`);
          if (row.can_delete) granted.add(`${mod}.delete`);
          if (row.can_create || row.can_edit || row.can_delete) {
            granted.add(`${mod}.manage`);
          }
        });
        
        setPermissions(granted);
      }
    } catch (err) {
      console.error('Error fetching permissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, profile?.role]);

  const hasPermission = (permission: Permission): boolean => {
    if (isOwner) return true;
    return permissions.has(permission);
  };

  const hasAnyPermission = (perms: Permission[]): boolean => {
    if (isOwner) return true;
    return perms.some((p) => permissions.has(p));
  };

  const hasAllPermissions = (perms: Permission[]): boolean => {
    if (isOwner) return true;
    return perms.every((p) => permissions.has(p));
  };

  return (
    <PermissionContext.Provider
      value={{
        permissions,
        loading,
        isOwner,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        refreshPermissions: fetchPermissions,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
}
