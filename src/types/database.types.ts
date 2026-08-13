export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      expenses: {
        Row: {
          id: string
          gym_id: string
          title: string
          category: string
          amount: number
          expense_date: string
          payment_method: string
          notes: string | null
          recorded_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          gym_id: string
          title: string
          category: string
          amount: number
          expense_date?: string
          payment_method: string
          notes?: string | null
          recorded_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          gym_id?: string
          title?: string
          category?: string
          amount?: number
          expense_date?: string
          payment_method?: string
          notes?: string | null
          recorded_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      gyms: {
        Row: {
          id: string
          name: string
          slug: string
          owner_id: string
          logo_url: string | null
          phone: string | null
          email: string | null
          address: string | null
          settings: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          owner_id: string
          logo_url?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          settings?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          owner_id?: string
          logo_url?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          settings?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          gym_id: string | null
          full_name: string
          email: string
          phone: string | null
          avatar_url: string | null
          role: string
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          gym_id?: string | null
          full_name?: string
          email?: string
          phone?: string | null
          avatar_url?: string | null
          role?: string
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          gym_id?: string | null
          full_name?: string
          email?: string
          phone?: string | null
          avatar_url?: string | null
          role?: string
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      staff_permissions: {
        Row: {
          id: string
          gym_id: string
          user_id: string
          module_name: string
          can_view: boolean
          can_create: boolean
          can_edit: boolean
          can_delete: boolean
          created_at: string
        }
        Insert: {
          id?: string
          gym_id: string
          user_id: string
          module_name: string
          can_view?: boolean
          can_create?: boolean
          can_edit?: boolean
          can_delete?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          gym_id?: string
          user_id?: string
          module_name?: string
          can_view?: boolean
          can_create?: boolean
          can_edit?: boolean
          can_delete?: boolean
          created_at?: string
        }
        Relationships: []
      }
      members: {
        Row: {
          id: string
          gym_id: string
          member_id: string
          full_name: string
          phone: string
          email: string | null
          date_of_birth: string | null
          gender: string | null
          address: string | null
          emergency_contact: string | null
          photo_url: string | null
          notes: string | null
          status: string
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
          branch_id: string | null
          custom_fields: Json | null
          referral_source: string | null
          occupation: string | null
          blood_group: string | null
          goal: string | null
        }
        Insert: {
          id?: string
          gym_id: string
          member_id: string
          full_name: string
          phone: string
          email?: string | null
          date_of_birth?: string | null
          gender?: string | null
          address?: string | null
          emergency_contact?: string | null
          photo_url?: string | null
          notes?: string | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
          branch_id?: string | null
          custom_fields?: Json | null
          referral_source?: string | null
          occupation?: string | null
          blood_group?: string | null
          goal?: string | null
        }
        Update: {
          id?: string
          gym_id?: string
          member_id?: string
          full_name?: string
          phone?: string
          email?: string | null
          date_of_birth?: string | null
          gender?: string | null
          address?: string | null
          emergency_contact?: string | null
          photo_url?: string | null
          notes?: string | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
          branch_id?: string | null
          custom_fields?: Json | null
          referral_source?: string | null
          occupation?: string | null
          blood_group?: string | null
          goal?: string | null
        }
        Relationships: []
      }
      membership_plans: {
        Row: {
          id: string
          gym_id: string
          name: string
          duration_months: number
          duration_days: number
          price: number
          description: string | null
          status: string
          created_at: string | null
          updated_at: string | null
          pt_included: boolean | null
          diet_included: boolean | null
        }
        Insert: {
          id?: string
          gym_id: string
          name: string
          duration_months?: number
          duration_days?: number
          price?: number
          description?: string | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
          pt_included?: boolean | null
          diet_included?: boolean | null
        }
        Update: {
          id?: string
          gym_id?: string
          name?: string
          duration_months?: number
          duration_days?: number
          price?: number
          description?: string | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
          pt_included?: boolean | null
          diet_included?: boolean | null
        }
        Relationships: []
      }
      memberships: {
        Row: {
          id: string
          gym_id: string
          member_id: string
          plan_id: string | null
          start_date: string
          end_date: string
          status: string
          original_amount: number
          discount_amount: number
          discount_type: string
          final_amount: number
          paid_amount: number
          due_amount: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          gym_id: string
          member_id: string
          plan_id?: string | null
          start_date: string
          end_date: string
          status?: string
          original_amount?: number
          discount_amount?: number
          discount_type?: string
          final_amount?: number
          paid_amount?: number
          due_amount?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          gym_id?: string
          member_id?: string
          plan_id?: string | null
          start_date?: string
          end_date?: string
          status?: string
          original_amount?: number
          discount_amount?: number
          discount_type?: string
          final_amount?: number
          paid_amount?: number
          due_amount?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          id: string
          gym_id: string
          member_id: string
          membership_id: string | null
          amount: number
          payment_date: string
          payment_method: string
          status: string
          reference_number: string | null
          notes: string | null
          processed_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          gym_id: string
          member_id: string
          membership_id?: string | null
          amount: number
          payment_date?: string
          payment_method: string
          status?: string
          reference_number?: string | null
          notes?: string | null
          processed_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          gym_id?: string
          member_id?: string
          membership_id?: string | null
          amount?: number
          payment_date?: string
          payment_method?: string
          status?: string
          reference_number?: string | null
          notes?: string | null
          processed_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      staff: {
        Row: {
          id: string
          gym_id: string
          name: string
          role: string
          phone: string | null
          email: string | null
          permissions: string[] | null
          created_at: string | null
        }
        Insert: {
          id?: string
          gym_id: string
          name: string
          role: string
          phone?: string | null
          email?: string | null
          permissions?: string[] | null
          created_at?: string | null
        }
        Update: {
          id?: string
          gym_id?: string
          name?: string
          role?: string
          phone?: string | null
          email?: string | null
          permissions?: string[] | null
          created_at?: string | null
        }
        Relationships: []
      }
      trainers: {
        Row: {
          id: string
          gym_id: string
          profile_id: string | null
          name: string
          phone: string | null
          email: string | null
          specialization: string | null
          photo_url: string | null
          status: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          gym_id: string
          profile_id?: string | null
          name: string
          phone?: string | null
          email?: string | null
          specialization?: string | null
          photo_url?: string | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          gym_id?: string
          profile_id?: string | null
          name?: string
          phone?: string | null
          email?: string | null
          specialization?: string | null
          photo_url?: string | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pt_plans: {
        Row: {
          id: string
          gym_id: string
          name: string
          duration_months: number | null
          duration_days: number | null
          price: number
          description: string | null
          status: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          gym_id: string
          name: string
          duration_months?: number | null
          duration_days?: number | null
          price?: number
          description?: string | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          gym_id?: string
          name?: string
          duration_months?: number | null
          duration_days?: number | null
          price?: number
          description?: string | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pt_memberships: {
        Row: {
          id: string
          gym_id: string
          member_id: string
          trainer_id: string
          pt_plan_id: string
          start_date: string
          end_date: string
          original_amount: number
          discount_amount: number
          final_amount: number
          paid_amount: number
          due_amount: number
          status: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          gym_id: string
          member_id: string
          trainer_id: string
          pt_plan_id: string
          start_date: string
          end_date: string
          original_amount?: number
          discount_amount?: number
          final_amount?: number
          paid_amount?: number
          due_amount?: number
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          gym_id?: string
          member_id?: string
          trainer_id?: string
          pt_plan_id?: string
          start_date?: string
          end_date?: string
          original_amount?: number
          discount_amount?: number
          final_amount?: number
          paid_amount?: number
          due_amount?: number
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      diet_plans: {
        Row: {
          id: string
          gym_id: string
          name: string
          description: string | null
          breakfast: string | null
          mid_morning: string | null
          lunch: string | null
          evening: string | null
          dinner: string | null
          notes: string | null
          created_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          gym_id: string
          name: string
          description?: string | null
          breakfast?: string | null
          mid_morning?: string | null
          lunch?: string | null
          evening?: string | null
          dinner?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          gym_id?: string
          name?: string
          description?: string | null
          breakfast?: string | null
          mid_morning?: string | null
          lunch?: string | null
          evening?: string | null
          dinner?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      member_diet_plans: {
        Row: {
          id: string
          gym_id: string
          member_id: string
          diet_plan_id: string
          start_date: string
          end_date: string | null
          assigned_by: string | null
          status: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          gym_id: string
          member_id: string
          diet_plan_id: string
          start_date?: string
          end_date?: string | null
          assigned_by?: string | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          gym_id?: string
          member_id?: string
          diet_plan_id?: string
          start_date?: string
          end_date?: string | null
          assigned_by?: string | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      attendance: {
        Row: {
          id: string
          gym_id: string
          member_id: string
          check_in_time: string
          check_out_time: string | null
          date: string
          created_at: string | null
        }
        Insert: {
          id?: string
          gym_id: string
          member_id: string
          check_in_time?: string
          check_out_time?: string | null
          date?: string
          created_at?: string | null
        }
        Update: {
          id?: string
          gym_id?: string
          member_id?: string
          check_in_time?: string
          check_out_time?: string | null
          date?: string
          created_at?: string | null
        }
        Relationships: []
      }
      membership_history: {
        Row: {
          id: string
          gym_id: string
          membership_id: string
          member_id: string
          action: string
          details: Json | null
          performed_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          gym_id: string
          membership_id: string
          member_id: string
          action: string
          details?: Json | null
          performed_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          gym_id?: string
          membership_id?: string
          member_id?: string
          action?: string
          details?: Json | null
          performed_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_gym_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_gym_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      user_belongs_to_gym: {
        Args: { check_gym_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
