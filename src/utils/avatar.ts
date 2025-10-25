/**
 * Pomocnicze funkcje do obsługi avatarów
 */

/**
 * Sprawdza czy avatar_url to emoji czy ścieżka do pliku
 * Jeśli to ścieżka do pliku (zaczyna się od / lub http), zwraca fallback emoji
 */
export function getDisplayAvatar(avatarUrl: string | null | undefined, fallbackEmoji: string = '😀'): string {
  if (!avatarUrl) return fallbackEmoji;
  
  // Jeśli zaczyna się od / lub http, to ścieżka do pliku - nie używamy
  if (avatarUrl.startsWith('/') || avatarUrl.startsWith('http')) {
    return fallbackEmoji;
  }
  
  // W przeciwnym razie to emoji
  return avatarUrl;
}
