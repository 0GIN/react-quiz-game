/**
 * @fileoverview Serwis zarządzający sklepem i inventory użytkowników
 * 
 * Ten serwis odpowiada za:
 * - Pobieranie przedmiotów ze sklepu z filtrowaniem
 * - Zakup przedmiotów za Flash Points
 * - Zarządzanie inventory użytkownika
 * - Aktywację boosterów
 * - Historię transakcji
 * 
 * @module services/shopService
 */

import { supabase } from '../lib/supabase';

/**
 * Przedmiot w sklepie
 */
export interface ShopItem {
  id: number;
  item_type: 'avatar' | 'title' | 'badge' | 'background' | 'booster' | 'frame';
  name: string;
  description: string | null;
  icon_url: string | null;
  image_url: string | null;
  price_fp: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  is_active: boolean;
  required_level: number;
  required_achievement_id: string | null;
  booster_type: string | null;
  booster_value: number | null;
  booster_duration_hours: number | null;
  created_at: string;
}

/**
 * Przedmiot w inventory z dodatkowymi danymi
 */
export interface InventoryItem extends ShopItem {
  inventory_id: number;
  is_equipped: boolean;
  is_active: boolean;
  activated_at: string | null;
  expires_at: string | null;
  purchased_at: string;
}

/**
 * Transakcja w sklepie
 */
export interface ShopTransaction {
  id: number;
  user_id: string;
  item_id: number;
  price_paid: number;
  transaction_type: 'purchase' | 'gift' | 'reward' | 'refund';
  created_at: string;
  item?: ShopItem;
}

/**
 * Filtry dla sklepu
 */
export interface ShopFilters {
  item_type?: ShopItem['item_type'];
  rarity?: ShopItem['rarity'];
  min_price?: number;
  max_price?: number;
  sort_by?: 'price_asc' | 'price_desc' | 'name' | 'rarity' | 'newest';
}

/**
 * Pobiera przedmioty ze sklepu z filtrowaniem
 */
export async function getShopItems(
  filters?: ShopFilters
): Promise<{ success: boolean; data?: ShopItem[]; error?: string }> {
  try {
    console.log('🛍️ shopService: Fetching shop items with filters:', filters);

    let query = supabase
      .from('shop_items')
      .select('*')
      .eq('is_active', true);

    // Filtrowanie
    if (filters?.item_type) {
      query = query.eq('item_type', filters.item_type);
    }

    if (filters?.rarity) {
      query = query.eq('rarity', filters.rarity);
    }

    if (filters?.min_price !== undefined) {
      query = query.gte('price_fp', filters.min_price);
    }

    if (filters?.max_price !== undefined) {
      query = query.lte('price_fp', filters.max_price);
    }

    // Sortowanie
    switch (filters?.sort_by) {
      case 'price_asc':
        query = query.order('price_fp', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price_fp', { ascending: false });
        break;
      case 'name':
        query = query.order('name', { ascending: true });
        break;
      case 'rarity':
        // Custom order: legendary > epic > rare > common
        query = query.order('rarity', { ascending: false });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching shop items:', error);
      return { success: false, error: error.message };
    }

    console.log(`✅ Fetched ${data?.length || 0} shop items`);
    return { success: true, data: data || [] };

  } catch (error: any) {
    console.error('❌ shopService: Error in getShopItems:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Pobiera inventory użytkownika
 */
export async function getUserInventory(
  userId: string
): Promise<{ success: boolean; data?: InventoryItem[]; error?: string }> {
  try {
    console.log('🎒 shopService: Fetching inventory for user', userId);

    const { data, error } = await supabase
      .from('user_inventory')
      .select(`
        id,
        is_equipped,
        is_active,
        activated_at,
        expires_at,
        purchased_at,
        shop_items (*)
      `)
      .eq('user_id', userId)
      .order('purchased_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching inventory:', error);
      return { success: false, error: error.message };
    }

    // Flatuj dane
    const inventory: InventoryItem[] = (data || []).map((item: any) => ({
      ...item.shop_items,
      inventory_id: item.id,
      is_equipped: item.is_equipped,
      is_active: item.is_active,
      activated_at: item.activated_at,
      expires_at: item.expires_at,
      purchased_at: item.purchased_at,
    }));

    console.log(`✅ Fetched ${inventory.length} items in inventory`);
    return { success: true, data: inventory };

  } catch (error: any) {
    console.error('❌ shopService: Error in getUserInventory:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Kupuje przedmiot
 */
export async function purchaseItem(
  userId: string,
  itemId: number
): Promise<{ success: boolean; remaining_fp?: number; error?: string }> {
  try {
    console.log('💰 shopService: Purchasing item', itemId, 'for user', userId);

    // Wywołaj funkcję SQL która obsługuje całą transakcję
    const { data, error } = await supabase.rpc('purchase_shop_item', {
      p_user_id: userId,
      p_item_id: itemId
    });

    if (error) {
      console.error('❌ Error purchasing item:', error);
      return { success: false, error: error.message };
    }

    const result = data as any;

    if (!result.success) {
      console.error('❌ Purchase failed:', result.error);
      return { success: false, error: result.error };
    }

    console.log('✅ Item purchased successfully. Remaining FP:', result.remaining_fp);
    return { 
      success: true, 
      remaining_fp: result.remaining_fp 
    };

  } catch (error: any) {
    console.error('❌ shopService: Error in purchaseItem:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Sprawdza czy użytkownik może kupić przedmiot
 */
export async function canAfford(
  userId: string,
  price: number
): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('users')
      .select('flash_points')
      .eq('id', userId)
      .single();

    return (data?.flash_points || 0) >= price;

  } catch (error) {
    console.error('❌ shopService: Error in canAfford:', error);
    return false;
  }
}

/**
 * Sprawdza czy użytkownik posiada przedmiot
 */
export async function hasItem(
  userId: string,
  itemId: number
): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('user_inventory')
      .select('id')
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .single();

    return !!data;

  } catch (error) {
    return false;
  }
}

/**
 * Aktywuje booster
 */
export async function activateBooster(
  userId: string,
  itemId: number
): Promise<{ success: boolean; expires_at?: string; error?: string }> {
  try {
    console.log('⚡ shopService: Activating booster', itemId);

    // Pobierz dane boostera
    const { data: item, error: itemError } = await supabase
      .from('shop_items')
      .select('booster_duration_hours')
      .eq('id', itemId)
      .eq('item_type', 'booster')
      .single();

    if (itemError || !item) {
      return { success: false, error: 'Booster not found' };
    }

    // Oblicz czas wygaśnięcia
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (item.booster_duration_hours || 1) * 60 * 60 * 1000);

    // Aktywuj w inventory
    const { error } = await supabase
      .from('user_inventory')
      .update({
        is_active: true,
        activated_at: now.toISOString(),
        expires_at: expiresAt.toISOString()
      })
      .eq('user_id', userId)
      .eq('item_id', itemId);

    if (error) {
      console.error('❌ Error activating booster:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Booster activated until', expiresAt.toISOString());
    return { success: true, expires_at: expiresAt.toISOString() };

  } catch (error: any) {
    console.error('❌ shopService: Error in activateBooster:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Pobiera aktywne boostery użytkownika
 */
export async function getActiveBoosters(
  userId: string
): Promise<{ success: boolean; data?: InventoryItem[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('user_inventory')
      .select(`
        id,
        is_equipped,
        is_active,
        activated_at,
        expires_at,
        purchased_at,
        shop_items (*)
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString());

    if (error) {
      console.error('❌ Error fetching active boosters:', error);
      return { success: false, error: error.message };
    }

    const boosters: InventoryItem[] = (data || []).map((item: any) => ({
      ...item.shop_items,
      inventory_id: item.id,
      is_equipped: item.is_equipped,
      is_active: item.is_active,
      activated_at: item.activated_at,
      expires_at: item.expires_at,
      purchased_at: item.purchased_at,
    }));

    return { success: true, data: boosters };

  } catch (error: any) {
    console.error('❌ shopService: Error in getActiveBoosters:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Pobiera historię transakcji użytkownika
 */
export async function getTransactionHistory(
  userId: string,
  limit: number = 20
): Promise<{ success: boolean; data?: ShopTransaction[]; error?: string }> {
  try {
    console.log('📜 shopService: Fetching transaction history');

    const { data, error } = await supabase
      .from('shop_transactions')
      .select(`
        *,
        shop_items (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Error fetching transactions:', error);
      return { success: false, error: error.message };
    }

    const transactions: ShopTransaction[] = (data || []).map((tx: any) => ({
      id: tx.id,
      user_id: tx.user_id,
      item_id: tx.item_id,
      price_paid: tx.price_paid,
      transaction_type: tx.transaction_type,
      created_at: tx.created_at,
      item: tx.shop_items
    }));

    console.log(`✅ Fetched ${transactions.length} transactions`);
    return { success: true, data: transactions };

  } catch (error: any) {
    console.error('❌ shopService: Error in getTransactionHistory:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Pobiera statystyki sklepu (dla użytkownika)
 */
export async function getUserShopStats(
  userId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { data: transactions } = await supabase
      .from('shop_transactions')
      .select('price_paid')
      .eq('user_id', userId)
      .eq('transaction_type', 'purchase');

    const { data: inventory } = await supabase
      .from('user_inventory')
      .select('id')
      .eq('user_id', userId);

    const totalSpent = transactions?.reduce((sum, tx) => sum + tx.price_paid, 0) || 0;
    const itemsOwned = inventory?.length || 0;

    return {
      success: true,
      data: {
        total_spent: totalSpent,
        items_owned: itemsOwned,
        total_purchases: transactions?.length || 0
      }
    };

  } catch (error: any) {
    console.error('❌ shopService: Error in getUserShopStats:', error);
    return { success: false, error: error.message };
  }
}
