/**
 * Pula dostępnych avatarów dla użytkowników
 * 
 * Avatary to emoji/ikony Material Icons, które użytkownicy mogą wybrać
 */

export interface Avatar {
  id: string;
  icon: string; // Material Icon name
  name: string;
  category: 'animals' | 'food' | 'sports' | 'objects' | 'symbols';
}

export const AVATARS: Avatar[] = [
  // Animals
  { id: 'avatar_1', icon: 'pets', name: 'Pupil', category: 'animals' },
  { id: 'avatar_2', icon: 'flutter_dash', name: 'Ptak', category: 'animals' },
  { id: 'avatar_3', icon: 'cruelty_free', name: 'Królik', category: 'animals' },
  
  // Food
  { id: 'avatar_4', icon: 'fastfood', name: 'Burger', category: 'food' },
  { id: 'avatar_5', icon: 'local_pizza', name: 'Pizza', category: 'food' },
  { id: 'avatar_6', icon: 'icecream', name: 'Lody', category: 'food' },
  { id: 'avatar_7', icon: 'cake', name: 'Tort', category: 'food' },
  
  // Sports
  { id: 'avatar_8', icon: 'sports_soccer', name: 'Piłka', category: 'sports' },
  { id: 'avatar_9', icon: 'sports_basketball', name: 'Koszykówka', category: 'sports' },
  { id: 'avatar_10', icon: 'sports_esports', name: 'Gaming', category: 'sports' },
  
  // Objects
  { id: 'avatar_11', icon: 'rocket_launch', name: 'Rakieta', category: 'objects' },
  { id: 'avatar_12', icon: 'lightbulb', name: 'Żarówka', category: 'objects' },
  { id: 'avatar_13', icon: 'psychology', name: 'Mózg', category: 'objects' },
  { id: 'avatar_14', icon: 'school', name: 'Czapka', category: 'objects' },
  
  // Symbols
  { id: 'avatar_15', icon: 'star', name: 'Gwiazda', category: 'symbols' },
  { id: 'avatar_16', icon: 'favorite', name: 'Serce', category: 'symbols' },
  { id: 'avatar_17', icon: 'bolt', name: 'Błyskawica', category: 'symbols' },
  { id: 'avatar_18', icon: 'local_fire_department', name: 'Ogień', category: 'symbols' },
  { id: 'avatar_19', icon: 'emoji_events', name: 'Puchar', category: 'symbols' },
  { id: 'avatar_20', icon: 'military_tech', name: 'Medal', category: 'symbols' },
];

/**
 * Domyślny avatar dla nowych użytkowników
 */
export const DEFAULT_AVATAR_ID = 'avatar_1';

/**
 * Pobiera avatar po ID
 */
export function getAvatarById(id: string): Avatar | undefined {
  return AVATARS.find(avatar => avatar.id === id);
}

/**
 * Pobiera avatary według kategorii
 */
export function getAvatarsByCategory(category: Avatar['category']): Avatar[] {
  return AVATARS.filter(avatar => avatar.category === category);
}

/**
 * Konwertuje avatar ID na URL (dla Material Icon)
 */
export function avatarIdToUrl(avatarId: string): string {
  const avatar = getAvatarById(avatarId);
  return avatar ? avatar.icon : AVATARS[0].icon;
}
