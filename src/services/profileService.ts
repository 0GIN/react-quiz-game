/**
 * @fileoverview Serwis zarządzający profilami użytkowników
 * 
 * Ten serwis odpowiada za:
 * - Pobieranie i aktualizację profili użytkowników
 * - Zarządzanie customizacją profilu (avatar, tytuł, odznaki, tło)
 * - Showcase osiągnięć (wybór 5 do wyświetlenia)
 * - Ustawienia prywatności profilu
 * - Statystyki profilu i licznik odwiedzin
 * 
 * @module services/profileService
 */

import { supabase } from '../lib/supabase';

/**
 * Profil użytkownika z customizacją
 */
export interface UserProfile {
  user_id: string;
  selected_avatar_id: number | null;
  selected_title_id: number | null;
  selected_badge_ids: number[];
  profile_background_id: number | null;
  avatar_frame_id: number | null;
  profile_banner_color: string;
  showcased_achievement_ids: string[];
  is_profile_public: boolean;
  show_stats: boolean;
  show_achievements: boolean;
  show_game_history: boolean;
  allow_friend_requests: boolean;
  bio: string;
  favorite_category_id: number | null;
  discord_username: string | null;
  twitter_username: string | null;
  profile_views: number;
  created_at: string;
  updated_at: string;
}

/**
 * Profil z dodatkowymi danymi użytkownika
 */
export interface FullUserProfile extends UserProfile {
  user: {
    id: string;
    username: string;
    email: string;
    avatar_url: string;
    flash_points: number;
    level: number;
    experience: number;
    total_games_played: number;
    total_wins: number;
    total_losses: number;
    total_correct_answers: number;
    total_questions_answered: number;
    current_streak: number;
    best_streak: number;
  };
  selected_avatar?: ShopItemBasic;
  selected_title?: ShopItemBasic;
  selected_badges?: ShopItemBasic[];
  profile_background?: ShopItemBasic;
  avatar_frame?: ShopItemBasic;
}

/**
 * Podstawowe dane przedmiotu ze sklepu
 */
interface ShopItemBasic {
  id: number;
  name: string;
  icon_url: string | null;
  image_url: string | null;
  rarity: string;
}

/**
 * Pobiera pełny profil użytkownika
 * @param userId - ID użytkownika
 * @param viewerId - ID użytkownika oglądającego (do sprawdzenia uprawnień)
 * @returns Profil użytkownika z danymi z users i shop_items
 */
export async function getProfile(
  userId: string,
  viewerId?: string
): Promise<{ success: boolean; data?: FullUserProfile; error?: string }> {
  try {
    console.log('📥 profileService: Fetching profile for', userId);

    // Pobierz profil
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('❌ Error fetching profile:', profileError);
      return { success: false, error: profileError.message };
    }

    // Wszystkie profile są publiczne - usunięto sprawdzanie is_profile_public

    // Pobierz dane użytkownika
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        id, username, email, avatar_url, flash_points, level, experience,
        total_games_played, total_wins, total_losses,
        total_correct_answers, total_questions_answered,
        current_streak, best_streak
      `)
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('❌ Error fetching user data:', userError);
      return { success: false, error: userError.message };
    }

    // Pobierz wybrane przedmioty ze sklepu
    const itemIds = [
      profileData.selected_avatar_id,
      profileData.selected_title_id,
      profileData.profile_background_id,
      profileData.avatar_frame_id,
      ...(profileData.selected_badge_ids || [])
    ].filter(id => id !== null);

    let shopItems: ShopItemBasic[] = [];
    if (itemIds.length > 0) {
      const { data: itemsData } = await supabase
        .from('shop_items')
        .select('id, name, icon_url, image_url, rarity')
        .in('id', itemIds);
      
      shopItems = itemsData || [];
    }

    // Złóż pełny profil
    const fullProfile: FullUserProfile = {
      ...profileData,
      user: userData,
      selected_avatar: shopItems.find(item => item.id === profileData.selected_avatar_id),
      selected_title: shopItems.find(item => item.id === profileData.selected_title_id),
      selected_badges: shopItems.filter(item => 
        profileData.selected_badge_ids?.includes(item.id)
      ),
      profile_background: shopItems.find(item => item.id === profileData.profile_background_id),
      avatar_frame: shopItems.find(item => item.id === profileData.avatar_frame_id),
    };

    // Zwiększ licznik odwiedzin (jeśli to nie właściciel)
    if (viewerId && viewerId !== userId) {
      await supabase.rpc('increment_profile_views', { profile_user_id: userId });
    }

    console.log('✅ Profile fetched successfully');
    return { success: true, data: fullProfile };

  } catch (error: any) {
    console.error('❌ profileService: Error in getProfile:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Aktualizuje customizację profilu
 */
export async function updateProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('📝 profileService: Updating profile for', userId);

    const { error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Error updating profile:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Profile updated successfully');
    return { success: true };

  } catch (error: any) {
    console.error('❌ profileService: Error in updateProfile:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Aktualizuje showcase osiągnięć (max 5)
 */
export async function updateShowcasedAchievements(
  userId: string,
  achievementIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    if (achievementIds.length > 5) {
      return { success: false, error: 'Maximum 5 achievements can be showcased' };
    }

    console.log('🏆 profileService: Updating showcased achievements');

    const { error } = await supabase
      .from('user_profiles')
      .update({
        showcased_achievement_ids: achievementIds,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Error updating achievements:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Showcased achievements updated');
    return { success: true };

  } catch (error: any) {
    console.error('❌ profileService: Error in updateShowcasedAchievements:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Aktualizuje ustawienia prywatności
 */
export async function updatePrivacySettings(
  userId: string,
  settings: {
    is_profile_public?: boolean;
    show_stats?: boolean;
    show_achievements?: boolean;
    show_game_history?: boolean;
    allow_friend_requests?: boolean;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🔒 profileService: Updating privacy settings');

    const { error } = await supabase
      .from('user_profiles')
      .update({
        ...settings,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Error updating privacy:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Privacy settings updated');
    return { success: true };

  } catch (error: any) {
    console.error('❌ profileService: Error in updatePrivacySettings:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Aktualizuje bio użytkownika
 */
export async function updateBio(
  userId: string,
  bio: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (bio.length > 500) {
      return { success: false, error: 'Bio must be 500 characters or less' };
    }

    console.log('📝 profileService: Updating bio');

    const { error } = await supabase
      .from('user_profiles')
      .update({
        bio,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Error updating bio:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Bio updated');
    return { success: true };

  } catch (error: any) {
    console.error('❌ profileService: Error in updateBio:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Załóż przedmiot (avatar, tytuł, etc.)
 */
export async function equipItem(
  userId: string,
  itemId: number,
  itemType: 'avatar' | 'title' | 'badge' | 'background' | 'frame'
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('👕 profileService: Equipping item', itemId, 'type:', itemType);

    // Sprawdź czy użytkownik posiada ten przedmiot
    const { data: inventoryItem } = await supabase
      .from('user_inventory')
      .select('id')
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .single();

    if (!inventoryItem) {
      return { success: false, error: 'Item not in inventory' };
    }

    // Mapowanie typu na pole w profilu
    const fieldMap: Record<typeof itemType, string> = {
      avatar: 'selected_avatar_id',
      title: 'selected_title_id',
      background: 'profile_background_id',
      frame: 'avatar_frame_id',
      badge: 'selected_badge_ids' // Specjalny przypadek
    };

    let updateData: any = {};

    if (itemType === 'badge') {
      // Odznaki - dodaj do array (max 5)
      const { data: currentProfile } = await supabase
        .from('user_profiles')
        .select('selected_badge_ids')
        .eq('user_id', userId)
        .single();

      const currentBadges = currentProfile?.selected_badge_ids || [];
      
      if (currentBadges.includes(itemId)) {
        return { success: false, error: 'Badge already equipped' };
      }

      if (currentBadges.length >= 5) {
        return { success: false, error: 'Maximum 5 badges can be equipped' };
      }

      updateData.selected_badge_ids = [...currentBadges, itemId];
    } else {
      updateData[fieldMap[itemType]] = itemId;
    }

    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Error equipping item:', error);
      return { success: false, error: error.message };
    }

    // Oznacz w inventory jako equipped
    await supabase
      .from('user_inventory')
      .update({ is_equipped: true })
      .eq('user_id', userId)
      .eq('item_id', itemId);

    console.log('✅ Item equipped successfully');
    return { success: true };

  } catch (error: any) {
    console.error('❌ profileService: Error in equipItem:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Zdejmij przedmiot
 */
export async function unequipItem(
  userId: string,
  itemId: number,
  itemType: 'avatar' | 'title' | 'badge' | 'background' | 'frame'
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('👔 profileService: Unequipping item', itemId);

    const fieldMap: Record<typeof itemType, string> = {
      avatar: 'selected_avatar_id',
      title: 'selected_title_id',
      background: 'profile_background_id',
      frame: 'avatar_frame_id',
      badge: 'selected_badge_ids'
    };

    let updateData: any = {};

    if (itemType === 'badge') {
      // Usuń z array
      const { data: currentProfile } = await supabase
        .from('user_profiles')
        .select('selected_badge_ids')
        .eq('user_id', userId)
        .single();

      const currentBadges = currentProfile?.selected_badge_ids || [];
      updateData.selected_badge_ids = currentBadges.filter((id: number) => id !== itemId);
    } else {
      updateData[fieldMap[itemType]] = null;
    }

    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Error unequipping item:', error);
      return { success: false, error: error.message };
    }

    // Oznacz w inventory jako not equipped
    await supabase
      .from('user_inventory')
      .update({ is_equipped: false })
      .eq('user_id', userId)
      .eq('item_id', itemId);

    console.log('✅ Item unequipped');
    return { success: true };

  } catch (error: any) {
    console.error('❌ profileService: Error in unequipItem:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Aktualizuje username użytkownika (z walidacją duplikatów)
 */
export async function updateUsername(
  userId: string,
  newUsername: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Walidacja
    if (!newUsername || newUsername.trim().length < 3) {
      return { success: false, error: 'Username musi mieć minimum 3 znaki' };
    }

    if (newUsername.length > 20) {
      return { success: false, error: 'Username może mieć maksymalnie 20 znaków' };
    }

    // Sprawdź czy username już istnieje
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('username', newUsername.trim())
      .neq('id', userId)
      .single();

    if (existing) {
      return { success: false, error: 'Ta nazwa użytkownika jest już zajęta' };
    }

    // Aktualizuj username
    const { error } = await supabase
      .from('users')
      .update({ username: newUsername.trim() })
      .eq('id', userId);

    if (error) {
      console.error('❌ Error updating username:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Username updated successfully');
    return { success: true };

  } catch (error: any) {
    console.error('❌ profileService: Error in updateUsername:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Aktualizuje avatar użytkownika
 */
export async function updateAvatar(
  userId: string,
  avatarUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('users')
      .update({ avatar_url: avatarUrl })
      .eq('id', userId);

    if (error) {
      console.error('❌ Error updating avatar:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Avatar updated successfully');
    return { success: true };

  } catch (error: any) {
    console.error('❌ profileService: Error in updateAvatar:', error);
    return { success: false, error: error.message };
  }
}

