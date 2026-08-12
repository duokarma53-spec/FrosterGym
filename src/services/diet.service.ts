// @ts-nocheck
import { db } from './base.service';

export interface DietMeal {
  breakfast?: string;
  lunch?: string;
  dinner?: string;
}

export interface DietPlan {
  id: string;
  name: string;
  target?: string;
  calories: number;
  meals?: DietMeal;
  gym_id?: string;
}

export const dietService = {
  async fetchDietPlans(gymId: string) {
    
    const { data, error } = await db
      .from('diet_plans')
      .select('*')
      .eq('gym_id', gymId)
      .order('name', { ascending: true });
    return { data, error };
  },

  async createDietPlan(gymId: string, dietData: Omit<DietPlan, 'id' | 'gym_id'>) {
    
    const { data, error } = await db
      .from('diet_plans')
      .insert([{ gym_id: gymId, ...dietData }])
      .select()
      .single();
    return { data, error };
  },

  async assignDietPlan(gymId: string, memberId: string, dietPlanId: string) {
        // Check if existing
    const { data: existing } = await db.from('member_diet_plans').select('id').eq('member_id', memberId).eq('gym_id', gymId).maybeSingle();
    if (existing) {
      const { data, error } = await db.from('member_diet_plans').update({ diet_plan_id: dietPlanId }).eq('id', existing.id).select().single();
      return { data, error };
    }
    const { data, error } = await db.from('member_diet_plans').insert([{ gym_id: gymId, member_id: memberId, diet_plan_id: dietPlanId }]).select().single();
    return { data, error };
  },
  
  async getMemberDietPlan(gymId: string, memberId: string) {
        const { data, error } = await db.from('member_diet_plans').select('*, diet_plan:diet_plans(*)').eq('gym_id', gymId).eq('member_id', memberId).maybeSingle();
    return { data, error };
  }
};
