import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const isMissingSortOrderError = (err: unknown): boolean => {
  if (!err || typeof err !== 'object') return false;
  const maybeErr = err as { code?: string; message?: string };
  const msg = (maybeErr.message || '').toLowerCase();
  return maybeErr.code === '42703' || (msg.includes('sort_order') && msg.includes('column'));
};

export interface Target {
  id: string;
  name: string;
  target_hours: number;
  progress_minutes: number;
  priority: number;
  is_done: boolean;
  due_date: string | null;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

export const authService = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  },
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
};

export const targetsService = {
  async createTarget(name: string, targetHours: number, dueDate: string): Promise<Target> {
    if (targetHours > 10000) {
      throw new Error('Target hours cannot exceed 10000');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('targets')
      .insert({
        name,
        target_hours: targetHours,
        progress_minutes: 0,
        priority: 1,
        is_done: false,
        due_date: dueDate,
        sort_order: null,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating target:', error);
      throw new Error(error.message || 'Failed to create target');
    }
    return data;
  },

  async getTargets(): Promise<Target[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const orderedBySort = await supabase
      .from('targets')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true });

    if (!orderedBySort.error) {
      return orderedBySort.data || [];
    }

    // Fallback for environments where the migration adding sort_order has not run yet.
    if (isMissingSortOrderError(orderedBySort.error)) {
      const fallback = await supabase
        .from('targets')
        .select('*')
        .eq('user_id', user.id)
        .order('priority', { ascending: true })
        .order('created_at', { ascending: true });

      if (fallback.error) {
        throw new Error(fallback.error.message || 'Failed to load targets');
      }

      return (fallback.data || []).map(target => ({ ...target, sort_order: null }));
    }

    throw new Error(orderedBySort.error.message || 'Failed to load targets');
  },

  async getTarget(id: string): Promise<Target | null> {
    const { data, error } = await supabase
      .from('targets')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async updateProgress(id: string, incrementMinutes: number): Promise<Target> {
    const target = await this.getTarget(id);
    if (!target) throw new Error('Target not found');

    const newProgress = target.progress_minutes + incrementMinutes;
    const { data, error } = await supabase
      .from('targets')
      .update({
        progress_minutes: newProgress,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTarget(id: string): Promise<void> {
    const { error } = await supabase
      .from('targets')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async resetProgress(id: string): Promise<Target> {
    const { data, error } = await supabase
      .from('targets')
      .update({
        progress_minutes: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updatePriority(id: string, priority: number): Promise<Target> {
    const { data, error } = await supabase
      .from('targets')
      .update({
        priority,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async markAsDone(id: string, isDone: boolean): Promise<Target> {
    const { data, error } = await supabase
      .from('targets')
      .update({
        is_done: isDone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTargetsOrder(orderedIds: string[]): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const updates = orderedIds.map((id, index) =>
      supabase
        .from('targets')
        .update({
          sort_order: index,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
    );

    const results = await Promise.all(updates);
    const failed = results.find(r => r.error);
    if (!failed?.error) return;

    if (isMissingSortOrderError(failed.error)) {
      throw new Error('Manual ordering needs DB migration: add the sort_order column first.');
    }

    throw new Error(failed.error.message || 'Failed to reorder targets');
  },
};
