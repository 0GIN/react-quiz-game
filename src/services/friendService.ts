import { supabase } from '@/lib/supabase';

export interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  requested_at: string;
  accepted_at: string | null;
  friend_data: {
    id: string;
    username: string;
    avatar_url: string;
    level: number;
    flash_points: number;
    last_login: string | null;
  };
}

export interface FriendRequest {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending';
  requested_at: string;
  requester_data: {
    id: string;
    username: string;
    avatar_url: string;
    level: number;
    flash_points: number;
  };
}

export interface UserSearchResult {
  id: string;
  username: string;
  avatar_url: string;
  level: number;
  flash_points: number;
  total_games_played: number;
  friendship_status: 'none' | 'pending' | 'accepted' | 'blocked';
}

/**
 * Wyszukaj użytkowników po nazwie
 */
export async function searchUsers(searchTerm: string, currentUserId: string): Promise<UserSearchResult[]> {
  try {
    // Pobierz użytkowników pasujących do wyszukiwania
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, avatar_url, level, flash_points, total_games_played')
      .ilike('username', `%${searchTerm}%`)
      .neq('id', currentUserId)
      .limit(20);

    if (usersError) throw usersError;
    if (!users || users.length === 0) return [];

    // Pobierz status znajomości dla każdego użytkownika (obie strony)
    const userIds = users.map(u => u.id);
    
    // Gdzie jesteś user_id
    const { data: friendshipsAsUser, error: error1 } = await supabase
      .from('friendships')
      .select('user_id, friend_id, status')
      .eq('user_id', currentUserId)
      .in('friend_id', userIds);

    if (error1) throw error1;

    // Gdzie jesteś friend_id
    const { data: friendshipsAsFriend, error: error2 } = await supabase
      .from('friendships')
      .select('user_id, friend_id, status')
      .eq('friend_id', currentUserId)
      .in('user_id', userIds);

    if (error2) throw error2;

    // Mapowanie statusów - sprawdź obie strony
    const friendshipMap = new Map<string, string>();
    
    (friendshipsAsUser || []).forEach(f => {
      friendshipMap.set(f.friend_id, f.status);
    });
    
    (friendshipsAsFriend || []).forEach(f => {
      friendshipMap.set(f.user_id, f.status);
    });

    return users.map(user => ({
      ...user,
      friendship_status: (friendshipMap.get(user.id) as any) || 'none'
    }));

  } catch (error) {
    console.error('❌ Error searching users:', error);
    throw error;
  }
}

/**
 * Pobierz listę znajomych
 */
export async function getFriends(userId: string): Promise<Friend[]> {
  try {
    // Pobierz znajomości gdzie jesteś user_id
    const { data: asFriend, error: error1 } = await supabase
      .from('friendships')
      .select(`
        id,
        user_id,
        friend_id,
        status,
        requested_at,
        accepted_at,
        friend_data:users!friendships_friend_id_fkey(
          id,
          username,
          avatar_url,
          level,
          flash_points,
          last_login
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'accepted')
      .order('accepted_at', { ascending: false });

    if (error1) throw error1;

    // Pobierz znajomości gdzie jesteś friend_id
    const { data: asUser, error: error2 } = await supabase
      .from('friendships')
      .select(`
        id,
        user_id,
        friend_id,
        status,
        requested_at,
        accepted_at,
        friend_data:users!friendships_user_id_fkey(
          id,
          username,
          avatar_url,
          level,
          flash_points,
          last_login
        )
      `)
      .eq('friend_id', userId)
      .eq('status', 'accepted')
      .order('accepted_at', { ascending: false });

    if (error2) throw error2;

    // Połącz obie listy i usuń duplikaty
    const allFriends = [...(asFriend || []), ...(asUser || [])] as any[];
    
    // Deduplikacja po ID znajomego
    const uniqueFriends = allFriends.reduce((acc, friendship) => {
      const friendId = friendship.user_id === userId 
        ? friendship.friend_id 
        : friendship.user_id;
      
      if (!acc.some((f: any) => 
        (f.user_id === userId ? f.friend_id : f.user_id) === friendId
      )) {
        acc.push(friendship);
      }
      return acc;
    }, [] as any[]);

    return uniqueFriends;
  } catch (error) {
    console.error('❌ Error getting friends:', error);
    throw error;
  }
}

/**
 * Pobierz oczekujące zaproszenia (otrzymane)
 */
export async function getPendingRequests(userId: string): Promise<FriendRequest[]> {
  try {
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        id,
        user_id,
        friend_id,
        status,
        requested_at,
        requester_data:users!friendships_user_id_fkey(
          id,
          username,
          avatar_url,
          level,
          flash_points
        )
      `)
      .eq('friend_id', userId)
      .eq('status', 'pending')
      .order('requested_at', { ascending: false });

    if (error) throw error;

    return (data || []) as any;
  } catch (error) {
    console.error('❌ Error getting pending requests:', error);
    throw error;
  }
}

/**
 * Pobierz wysłane zaproszenia
 */
export async function getSentRequests(userId: string): Promise<Friend[]> {
  try {
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        id,
        user_id,
        friend_id,
        status,
        requested_at,
        accepted_at,
        friend_data:users!friendships_friend_id_fkey(
          id,
          username,
          avatar_url,
          level,
          flash_points
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('requested_at', { ascending: false });

    if (error) throw error;

    return (data || []) as any;
  } catch (error) {
    console.error('❌ Error getting sent requests:', error);
    throw error;
  }
}

/**
 * Wyślij zaproszenie do znajomych
 */
export async function sendFriendRequest(userId: string, friendId: string): Promise<void> {
  try {
    // Sprawdź czy już nie istnieje zaproszenie w drugą stronę
    const { data: existing } = await supabase
      .from('friendships')
      .select('id, status')
      .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`)
      .single();

    if (existing) {
      throw new Error('Zaproszenie już istnieje');
    }

    const { error } = await supabase
      .from('friendships')
      .insert({
        user_id: userId,
        friend_id: friendId,
        status: 'pending'
      });

    if (error) throw error;

    console.log('✅ Friend request sent');
  } catch (error) {
    console.error('❌ Error sending friend request:', error);
    throw error;
  }
}

/**
 * Akceptuj zaproszenie do znajomych
 */
export async function acceptFriendRequest(requestId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('friendships')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (error) throw error;

    console.log('✅ Friend request accepted');
  } catch (error) {
    console.error('❌ Error accepting friend request:', error);
    throw error;
  }
}

/**
 * Odrzuć zaproszenie do znajomych
 */
export async function rejectFriendRequest(requestId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', requestId);

    if (error) throw error;

    console.log('✅ Friend request rejected');
  } catch (error) {
    console.error('❌ Error rejecting friend request:', error);
    throw error;
  }
}

/**
 * Usuń znajomego
 */
export async function removeFriend(userId: string, friendId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`);

    if (error) throw error;

    console.log('✅ Friend removed');
  } catch (error) {
    console.error('❌ Error removing friend:', error);
    throw error;
  }
}

/**
 * Zablokuj użytkownika
 */
export async function blockUser(userId: string, blockedUserId: string): Promise<void> {
  try {
    // Usuń istniejącą znajomość
    await removeFriend(userId, blockedUserId);

    // Dodaj blokadę
    const { error } = await supabase
      .from('friendships')
      .insert({
        user_id: userId,
        friend_id: blockedUserId,
        status: 'blocked'
      });

    if (error) throw error;

    console.log('✅ User blocked');
  } catch (error) {
    console.error('❌ Error blocking user:', error);
    throw error;
  }
}

/**
 * Sprawdź status online znajomego (mockup - wymaga realtime)
 */
export function isUserOnline(lastLogin: string | null): boolean {
  if (!lastLogin) return false;
  
  const lastLoginDate = new Date(lastLogin);
  const now = new Date();
  const diffMinutes = (now.getTime() - lastLoginDate.getTime()) / 1000 / 60;
  
  return diffMinutes < 5; // Online jeśli był aktywny w ciągu 5 minut
}

/**
 * Formatuj czas ostatniej aktywności
 */
export function formatLastSeen(lastLogin: string | null): string {
  if (!lastLogin) return 'Nigdy nie był online';
  
  const lastLoginDate = new Date(lastLogin);
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - lastLoginDate.getTime()) / 1000 / 60);
  
  if (diffMinutes < 5) return 'Online';
  if (diffMinutes < 60) return `${diffMinutes} min temu`;
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h temu`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} dni temu`;
}

/**
 * Pobierz propozycje znajomych (aktywni użytkownicy, podobny poziom)
 */
export async function getSuggestedFriends(currentUserId: string, limit: number = 10): Promise<UserSearchResult[]> {
  try {
    // Pobierz dane aktualnego użytkownika
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('level')
      .eq('id', currentUserId)
      .single();

    if (userError) throw userError;

    // Pobierz aktywnych użytkowników o podobnym poziomie (±5 leveli)
    const minLevel = Math.max(1, currentUser.level - 5);
    const maxLevel = currentUser.level + 5;

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, avatar_url, level, flash_points, total_games_played, last_login')
      .neq('id', currentUserId)
      .gte('level', minLevel)
      .lte('level', maxLevel)
      .not('last_login', 'is', null)
      .order('last_login', { ascending: false })
      .limit(limit * 2); // Pobierz więcej, bo będziemy filtrować

    if (usersError) throw usersError;
    if (!users || users.length === 0) {
      // Fallback: jeśli brak użytkowników o podobnym levelu, pokaż ostatnio aktywnych
      const { data: fallbackUsers, error: fallbackError } = await supabase
        .from('users')
        .select('id, username, avatar_url, level, flash_points, total_games_played, last_login')
        .neq('id', currentUserId)
        .not('last_login', 'is', null)
        .order('last_login', { ascending: false })
        .limit(limit * 2);

      if (fallbackError) throw fallbackError;
      if (!fallbackUsers) return [];
      users.push(...fallbackUsers);
    }

    // Pobierz istniejące znajomości (obie strony)
    const userIds = users.map(u => u.id);
    
    // Gdzie jesteś user_id
    const { data: friendshipsAsUser, error: error1 } = await supabase
      .from('friendships')
      .select('user_id, friend_id, status')
      .eq('user_id', currentUserId)
      .in('friend_id', userIds);

    if (error1) throw error1;

    // Gdzie jesteś friend_id
    const { data: friendshipsAsFriend, error: error2 } = await supabase
      .from('friendships')
      .select('user_id, friend_id, status')
      .eq('friend_id', currentUserId)
      .in('user_id', userIds);

    if (error2) throw error2;

    // Mapowanie statusów - sprawdź obie strony
    const friendshipMap = new Map<string, string>();
    
    (friendshipsAsUser || []).forEach(f => {
      friendshipMap.set(f.friend_id, f.status);
    });
    
    (friendshipsAsFriend || []).forEach(f => {
      friendshipMap.set(f.user_id, f.status);
    });

    // Filtruj tylko tych, którzy nie są znajomymi
    const suggestions = users
      .filter(user => !friendshipMap.has(user.id))
      .map(user => ({
        id: user.id,
        username: user.username,
        avatar_url: user.avatar_url,
        level: user.level,
        flash_points: user.flash_points,
        total_games_played: user.total_games_played,
        friendship_status: 'none' as const
      }))
      .slice(0, limit);

    return suggestions;

  } catch (error) {
    console.error('❌ Error getting suggested friends:', error);
    throw error;
  }
}
