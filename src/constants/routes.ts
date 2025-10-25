/**
 * @fileoverview Definicje ścieżek routingu
 */

export const ROUTES = {
  HOME: '/',
  
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  
  // Game
  GAME_BLITZ: '/game-blitz',
  GAME_RESULT: '/game-result',
  RULES: '/rules',
  
  // Profile & Stats
  PROFILE: '/profile',
  PROFILE_USER: '/profile/:userId',
  RANKING: '/ranking',
  HISTORY: '/history',
  TOP_PLAYERS: '/top-players',
  
  // Shop
  SHOP: '/shop',
  
  // Social
  FRIENDS: '/friends',
  FIND_FRIENDS: '/find-friends',
  CHAT: '/chat',
  
  // Settings
  SETTINGS: '/settings',
  
  // Admin
  ADMIN: '/admin',
  ADD_QUESTION: '/add-question',
} as const;

export type RoutePath = typeof ROUTES[keyof typeof ROUTES];
