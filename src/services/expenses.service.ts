// @ts-nocheck
import { db } from './base.service';

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  description: string;
}

export const fetchExpenses = async (gymId: string, filters?: any) => {
  
  let query = db.from('expenses').select('*').eq('gym_id', gymId);
  if (filters?.month) {
    // Basic filter placeholder
  }
  const { data, error } = await query;
  return { data, error };
};

export const addExpense = async (gymId: string, expenseData: Omit<Expense, 'id'>) => {
  
  const { data, error } = await db
    .from('expenses')
    .insert([{ gym_id: gymId, ...expenseData }])
    .select()
    .single();
  return { data, error };
};

export const getExpenseCategories = async (gymId: string) => {
  
  return {
      data: ['Rent', 'Electricity', 'Equipment Repair', 'Salaries', 'Marketing', 'Other'],
      error: null
  };
};

export const expensesService = {
  fetchExpenses,
  addExpense,
  getExpenseCategories
};

