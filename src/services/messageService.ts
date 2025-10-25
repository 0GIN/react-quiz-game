import { supabase } from '@/lib/supabase';

// Lista wulgaryzmów do zablokowania (rozszerz według potrzeb)
const BLOCKED_WORDS = [
  'kurwa', 'chuj', 'pizda', 'jebać', 'skurwysyn',
  // Dodaj więcej słów do filtrowania
];

// Rate limiting - max wiadomości na minutę
const RATE_LIMIT = 50;
const RATE_WINDOW_MS = 60000; // 1 minuta

// Przechowuj ostatnie wysłane wiadomości w pamięci
const messageSentTimes = new Map<string, number[]>();

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MessageWithUser extends Message {
  sender: {
    id: string;
    username: string;
    avatar_url: string;
    level: number;
  };
  receiver: {
    id: string;
    username: string;
    avatar_url: string;
    level: number;
  };
}

export interface Conversation {
  friend_id: string;
  friend_username: string;
  friend_avatar: string;
  friend_level: number;
  last_message: string;
  last_message_time: string;
  is_online: boolean;
  unread_count: number;
}

/**
 * Sprawdź czy użytkownicy są znajomymi
 */
async function checkFriendship(userId: string, friendId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('friendships')
      .select('id')
      .eq('status', 'accepted')
      .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    
    return !!data;
  } catch (error) {
    console.error('Error checking friendship:', error);
    return false;
  }
}

/**
 * Rate limiting - sprawdź czy użytkownik nie spamuje
 */
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userTimes = messageSentTimes.get(userId) || [];
  
  // Usuń stare czasy (poza oknem)
  const recentTimes = userTimes.filter(time => now - time < RATE_WINDOW_MS);
  
  // Sprawdź limit
  if (recentTimes.length >= RATE_LIMIT) {
    return false;
  }
  
  // Dodaj aktualny czas
  recentTimes.push(now);
  messageSentTimes.set(userId, recentTimes);
  
  return true;
}

/**
 * Filtruj wulgaryzmy i spam
 */
function filterContent(content: string): { valid: boolean; filtered: string; error?: string } {
  const trimmed = content.trim();
  
  // Sprawdź długość
  if (trimmed.length === 0) {
    return { valid: false, filtered: '', error: 'Wiadomość nie może być pusta' };
  }
  
  if (trimmed.length > 1000) {
    return { valid: false, filtered: '', error: 'Wiadomość jest za długa (max 1000 znaków)' };
  }
  
  // Sprawdź wulgaryzmy (case-insensitive)
  const lowerContent = trimmed.toLowerCase();
  for (const word of BLOCKED_WORDS) {
    if (lowerContent.includes(word)) {
      return { 
        valid: false, 
        filtered: '', 
        error: 'Wiadomość zawiera niedozwoloną treść' 
      };
    }
  }
  
  // Sprawdź spam (te same znaki powtórzone)
  if (/(.)\1{10,}/.test(trimmed)) {
    return { valid: false, filtered: '', error: 'Wykryto spam' };
  }
  
  return { valid: true, filtered: trimmed };
}

/**
 * Pobierz listę konwersacji użytkownika
 */
export async function getConversations(userId: string): Promise<Conversation[]> {
  try {
    // 1. Pobierz wszystkich znajomych
    const { data: friendships, error: friendsError } = await supabase
      .from('friendships')
      .select(`
        user_id,
        friend_id,
        friend:users!friendships_friend_id_fkey(id, username, avatar_url, level, last_login)
      `)
      .eq('user_id', userId)
      .eq('status', 'accepted');

    if (friendsError) throw friendsError;

    const friendsAsUser = friendships || [];

    // 2. Pobierz gdzie jesteśmy jako friend_id
    const { data: friendshipsReverse, error: friendsError2 } = await supabase
      .from('friendships')
      .select(`
        user_id,
        friend_id,
        user:users!friendships_user_id_fkey(id, username, avatar_url, level, last_login)
      `)
      .eq('friend_id', userId)
      .eq('status', 'accepted');

    if (friendsError2) throw friendsError2;

    const friendsAsFriend = friendshipsReverse || [];

    // 3. Połącz obie listy
    const allFriends = [
      ...friendsAsUser.map((f: any) => ({
        id: f.friend.id,
        username: f.friend.username,
        avatar_url: f.friend.avatar_url,
        level: f.friend.level,
        last_login: f.friend.last_login,
      })),
      ...friendsAsFriend.map((f: any) => ({
        id: f.user.id,
        username: f.user.username,
        avatar_url: f.user.avatar_url,
        level: f.user.level,
        last_login: f.user.last_login,
      })),
    ];

    // 4. Dla każdego znajomego pobierz ostatnią wiadomość i liczbę nieprzeczytanych
    const conversations: Conversation[] = await Promise.all(
      allFriends.map(async (friend) => {
        // Ostatnia wiadomość
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('content, created_at')
          .or(`and(sender_id.eq.${userId},receiver_id.eq.${friend.id}),and(sender_id.eq.${friend.id},receiver_id.eq.${userId})`)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Liczba nieprzeczytanych
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('sender_id', friend.id)
          .eq('receiver_id', userId)
          .eq('is_read', false);

        // Sprawdź czy online (ostatnie 5 minut)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        const isOnline = friend.last_login ? friend.last_login > fiveMinutesAgo : false;

        return {
          friend_id: friend.id,
          friend_username: friend.username,
          friend_avatar: friend.avatar_url || '😀',
          friend_level: friend.level,
          last_message: lastMessage?.content || '',
          last_message_time: lastMessage?.created_at || '',
          is_online: isOnline,
          unread_count: unreadCount || 0,
        };
      })
    );

    // Sortuj po czasie ostatniej wiadomości
    return conversations.sort((a, b) => {
      if (!a.last_message_time) return 1;
      if (!b.last_message_time) return -1;
      return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
    });
  } catch (error) {
    console.error('❌ Error getting conversations:', error);
    throw error;
  }
}

/**
 * Pobierz wiadomości w konwersacji (ostatnie 100)
 */
export async function getMessages(
  userId: string,
  friendId: string,
  limit: number = 100
): Promise<MessageWithUser[]> {
  try {
    // Max 100 wiadomości (bezpieczeństwo)
    const safeLimit = Math.min(limit, 100);
    
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!messages_sender_id_fkey(id, username, avatar_url, level),
        receiver:users!messages_receiver_id_fkey(id, username, avatar_url, level)
      `)
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: false })
      .limit(safeLimit);

    if (error) throw error;

    // Odwróć kolejność (najstarsze najpierw)
    return ((data || []) as any).reverse();
  } catch (error) {
    console.error('❌ Error getting messages:', error);
    throw error;
  }
}

/**
 * Wyślij wiadomość
 */
export async function sendMessage(
  senderId: string,
  receiverId: string,
  content: string
): Promise<{ success: boolean; error?: string; message?: Message }> {
  try {
    // 1. Rate limiting
    if (!checkRateLimit(senderId)) {
      return { 
        success: false, 
        error: 'Wysyłasz wiadomości zbyt szybko. Poczekaj chwilę.' 
      };
    }

    // 2. Filtruj treść
    const filtered = filterContent(content);
    if (!filtered.valid) {
      return { success: false, error: filtered.error };
    }

    // 3. Sprawdź czy są znajomymi
    const areFriends = await checkFriendship(senderId, receiverId);
    if (!areFriends) {
      return { 
        success: false, 
        error: 'Możesz wysyłać wiadomości tylko do znajomych' 
      };
    }

    // 4. Wyślij wiadomość
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        content: filtered.filtered,
      })
      .select()
      .single();

    if (error) {
      // Sprawdź czy to błąd RLS (brak uprawnień)
      if (error.code === '42501') {
        return { 
          success: false, 
          error: 'Nie możesz wysłać wiadomości do tego użytkownika' 
        };
      }
      throw error;
    }

    return { success: true, message: data };
  } catch (error) {
    console.error('❌ Error sending message:', error);
    return { success: false, error: 'Nie udało się wysłać wiadomości' };
  }
}

/**
 * Oznacz wiadomości jako przeczytane
 */
export async function markAsRead(userId: string, friendId: string): Promise<void> {
  try {
    await supabase
      .from('messages')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('sender_id', friendId)
      .eq('receiver_id', userId)
      .eq('is_read', false);
  } catch (error) {
    console.error('❌ Error marking messages as read:', error);
  }
}

/**
 * Subskrybuj nowe wiadomości w czasie rzeczywistym
 */
export function subscribeToMessages(
  userId: string,
  friendId: string,
  onMessage: (message: Message) => void
) {
  const channel = supabase
    .channel(`messages:${userId}:${friendId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${userId}`,
      },
      (payload) => {
        const message = payload.new as Message;
        // Sprawdź czy wiadomość jest od wybranego znajomego
        if (message.sender_id === friendId) {
          console.log('📨 Nowa wiadomość:', payload);
          onMessage(message);
        }
      }
    )
    .subscribe((status) => {
      console.log('📡 Subscription status:', status);
    });

  return () => {
    console.log('🔌 Unsubscribing from messages');
    supabase.removeChannel(channel);
  };
}

/**
 * Pobierz liczbę wszystkich nieprzeczytanych wiadomości
 */
export async function getTotalUnreadCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('is_read', false);

    if (error) throw error;

    return count || 0;
  } catch (error) {
    console.error('❌ Error getting unread count:', error);
    return 0;
  }
}

/**
 * Pobierz ostatnie nieprzeczytane wiadomości dla powiadomień
 */
export async function getUnreadMessageNotifications(userId: string): Promise<Array<{
  id: string;
  sender_id: string;
  sender_username: string;
  sender_avatar: string;
  created_at: string;
  content: string;
}>> {
  try {
    // Pobierz unikalne konwersacje z nieprzeczytanymi wiadomościami
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        sender_id,
        content,
        created_at,
        sender:users!messages_sender_id_fkey(
          id,
          username,
          avatar_url
        )
      `)
      .eq('receiver_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Grupuj po nadawcy i weź tylko najnowszą wiadomość od każdego
    const uniqueSenders = new Map();
    (data || []).forEach((msg: any) => {
      if (!uniqueSenders.has(msg.sender_id)) {
        uniqueSenders.set(msg.sender_id, {
          id: msg.id,
          sender_id: msg.sender_id,
          sender_username: msg.sender.username,
          sender_avatar: msg.sender.avatar_url,
          created_at: msg.created_at,
          content: msg.content,
        });
      }
    });

    return Array.from(uniqueSenders.values());
  } catch (error) {
    console.error('❌ Error getting unread message notifications:', error);
    return [];
  }
}

/**
 * Usuń wszystkie wiadomości w konwersacji (dla użytkownika)
 */
export async function deleteConversation(
  userId: string,
  friendId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Usuń tylko wiadomości wysłane przez użytkownika
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('sender_id', userId)
      .eq('receiver_id', friendId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('❌ Error deleting conversation:', error);
    return { success: false, error: 'Nie udało się usunąć konwersacji' };
  }
}

/**
 * Zablokuj użytkownika (opcjonalnie - możesz to dodać później)
 */
export async function blockUser(
  userId: string,
  blockedUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Aktualizuj friendship na 'blocked'
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'blocked' })
      .or(`and(user_id.eq.${userId},friend_id.eq.${blockedUserId}),and(user_id.eq.${blockedUserId},friend_id.eq.${userId})`);

    if (error) throw error;

    // Usuń wszystkie wiadomości między tymi użytkownikami
    await supabase
      .from('messages')
      .delete()
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${blockedUserId}),and(sender_id.eq.${blockedUserId},receiver_id.eq.${userId})`);

    return { success: true };
  } catch (error) {
    console.error('❌ Error blocking user:', error);
    return { success: false, error: 'Nie udało się zablokować użytkownika' };
  }
}
