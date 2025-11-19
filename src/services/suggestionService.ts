/**
 * @fileoverview Serwis zarządzania propozycjami pytań
 * 
 * Użytkownicy mogą proponować nowe pytania.
 * Admini mogą je akceptować/edytować/odrzucać.
 */

import { supabase } from '@/lib/supabase';
import type { Category } from '@/types';

// ========================================
// TYPY
// ========================================

export interface SuggestedQuestion {
  id: string;
  author_id: string;
  category_id: number;
  question_text: string;
  correct_answer: string;
  wrong_answer_1: string;
  wrong_answer_2: string;
  wrong_answer_3: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  status: 'pending' | 'approved' | 'rejected' | 'edited';
  admin_comment?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  reward_fp: number;
  reward_xp: number;
  reward_claimed: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  author?: {
    id: string;
    username: string;
    avatar_url: string;
  };
  category?: Category;
  reviewer?: {
    id: string;
    username: string;
  };
}

export interface CreateSuggestionData {
  category_id: number;
  question_text: string;
  correct_answer: string;
  wrong_answer_1: string;
  wrong_answer_2: string;
  wrong_answer_3: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
}

export interface SuggestionStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

// ========================================
// CRUD OPERATIONS
// ========================================

/**
 * Utwórz nową propozycję pytania
 */
export async function createSuggestion(
  userId: string,
  data: CreateSuggestionData
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    console.log('📝 Creating suggestion:', data);

    const { data: suggestion, error } = await supabase
      .from('suggested_questions')
      .insert({
        author_id: userId,
        ...data,
      })
      .select('id')
      .single();

    if (error) {
      console.error('❌ Error creating suggestion:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Suggestion created:', suggestion.id);
    return { success: true, id: suggestion.id };
  } catch (error) {
    console.error('❌ Error in createSuggestion:', error);
    return { success: false, error: 'Nie udało się utworzyć propozycji' };
  }
}

/**
 * Pobierz propozycje użytkownika (jego własne)
 */
export async function getUserSuggestions(
  userId: string
): Promise<SuggestedQuestion[]> {
  try {
    const { data, error } = await supabase
      .from('suggested_questions')
      .select(`
        *,
        category:categories(id, name, icon_emoji)
      `)
      .eq('author_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []) as SuggestedQuestion[];
  } catch (error) {
    console.error('❌ Error getting user suggestions:', error);
    return [];
  }
}

/**
 * Pobierz wszystkie propozycje (dla adminów)
 */
export async function getAllSuggestions(
  status?: 'pending' | 'approved' | 'rejected'
): Promise<{ success: boolean; data?: SuggestedQuestion[]; error?: string }> {
  try {
    console.log('📋 getAllSuggestions - status filter:', status);
    
    let query = supabase
      .from('suggested_questions')
      .select(`
        *,
        author:users!suggested_questions_author_id_fkey(id, username, avatar_url),
        category:categories(id, name, icon_emoji),
        reviewer:users!suggested_questions_reviewed_by_fkey(id, username)
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    console.log('📋 getAllSuggestions result:', { data, error, count: data?.length });

    if (error) {
      console.error('❌ Error in getAllSuggestions:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: (data || []) as any };
  } catch (error) {
    console.error('❌ Exception in getAllSuggestions:', error);
    return { success: false, error: 'Błąd pobierania propozycji' };
  }
}

/**
 * Pobierz statystyki propozycji
 */
export async function getSuggestionStats(): Promise<SuggestionStats> {
  try {
    const { data, error } = await supabase.rpc('get_suggestion_stats');

    if (error) throw error;

    return data as SuggestionStats;
  } catch (error) {
    console.error('❌ Error getting suggestion stats:', error);
    return { total: 0, pending: 0, approved: 0, rejected: 0 };
  }
}

// ========================================
// ADMIN OPERATIONS
// ========================================

/**
 * Zatwierdź propozycję (tworzy pytanie w questions)
 */
export async function approveSuggestion(
  suggestionId: string,
  adminId: string,
  rewardFp: number = 50,
  rewardXp: number = 100
): Promise<{ success: boolean; questionId?: string; error?: string }> {
  try {
    console.log('✅ Approving suggestion:', suggestionId);

    const { data, error } = await supabase.rpc('approve_suggested_question', {
      p_suggestion_id: suggestionId,
      p_admin_id: adminId,
      p_reward_fp: rewardFp,
      p_reward_xp: rewardXp,
    });

    if (error) {
      console.error('❌ Error approving suggestion:', error);
      return { success: false, error: error.message };
    }

    if (!data.success) {
      return { success: false, error: data.error };
    }

    console.log('✅ Suggestion approved, question created:', data.question_id);
    return { success: true, questionId: data.question_id };
  } catch (error) {
    console.error('❌ Error in approveSuggestion:', error);
    return { success: false, error: 'Nie udało się zatwierdzić propozycji' };
  }
}

/**
 * Odrzuć propozycję
 */
export async function rejectSuggestion(
  suggestionId: string,
  adminId: string,
  comment?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('❌ Rejecting suggestion:', suggestionId);

    const { data, error } = await supabase.rpc('reject_suggested_question', {
      p_suggestion_id: suggestionId,
      p_admin_id: adminId,
      p_comment: comment || null,
    });

    if (error) {
      console.error('❌ Error rejecting suggestion:', error);
      return { success: false, error: error.message };
    }

    if (!data.success) {
      return { success: false, error: data.error };
    }

    console.log('✅ Suggestion rejected');
    return { success: true };
  } catch (error) {
    console.error('❌ Error in rejectSuggestion:', error);
    return { success: false, error: 'Nie udało się odrzucić propozycji' };
  }
}

/**
 * Edytuj propozycję (przed zatwierdzeniem)
 */
export async function updateSuggestion(
  suggestionId: string,
  updates: Partial<CreateSuggestionData>
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('✏️ Updating suggestion:', suggestionId);

    const { error } = await supabase
      .from('suggested_questions')
      .update({
        ...updates,
        status: 'edited',
        updated_at: new Date().toISOString(),
      })
      .eq('id', suggestionId)
      .eq('status', 'pending'); // Można edytować tylko pending

    if (error) {
      console.error('❌ Error updating suggestion:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Suggestion updated');
    return { success: true };
  } catch (error) {
    console.error('❌ Error in updateSuggestion:', error);
    return { success: false, error: 'Nie udało się zaktualizować propozycji' };
  }
}

/**
 * Usuń propozycję
 */
export async function deleteSuggestion(
  suggestionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('suggested_questions')
      .delete()
      .eq('id', suggestionId);

    if (error) {
      console.error('❌ Error deleting suggestion:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Error in deleteSuggestion:', error);
    return { success: false, error: 'Nie udało się usunąć propozycji' };
  }
}

// ========================================
// REALTIME SUBSCRIPTIONS
// ========================================

/**
 * Subskrybuj nowe propozycje (dla adminów)
 */
export function subscribeToNewSuggestions(
  callback: (suggestion: SuggestedQuestion) => void
) {
  const channel = supabase
    .channel('new-suggestions')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'suggested_questions',
      },
      async (payload) => {
        console.log('📬 New suggestion:', payload.new);
        
        // Pobierz pełne dane z relacjami
        const { data } = await supabase
          .from('suggested_questions')
          .select(`
            *,
            author:users!suggested_questions_author_id_fkey(id, username, avatar_url),
            category:categories(id, name, icon)
          `)
          .eq('id', (payload.new as any).id)
          .single();

        if (data) {
          callback(data as any);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
