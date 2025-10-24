/**
 * @fileoverview Centralna definicja typów TypeScript
 * 
 * Skonsolidowane typy używane w całej aplikacji.
 * Zapobiega duplikacji i zapewnia spójność typów.
 * 
 * @module types
 */

/**
 * Użytkownik z pełnymi danymi profilu i statystykami
 */
export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url: string;
  flash_points: number;
  level: number;
  experience: number;
  experience_to_next_level: number;
  total_games_played: number;
  total_wins: number;
  total_losses: number;
  total_correct_answers: number;
  total_questions_answered: number;
  current_streak: number;
  best_streak: number;
  is_admin: boolean;
  created_at?: string;
  last_login?: string;
}

/**
 * Pytanie quizowe z bazowymi danymi
 */
export interface Question {
  id: string;
  category_id: number;
  question_text: string;
  correct_answer: string;
  wrong_answer_1: string;
  wrong_answer_2: string;
  wrong_answer_3: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  points_value: number;
  is_approved: boolean;
  is_active: boolean;
  created_at: string;
}

/**
 * Pytanie z pomieszanymi odpowiedziami (gotowe do wyświetlenia)
 */
export interface QuestionWithAnswers extends Question {
  answers: Array<{
    text: string;
    isCorrect: boolean;
  }>;
}

/**
 * Wynik pojedynczej gry
 */
export interface GameResult {
  gameMode: 'blitz' | 'duel' | 'squad' | 'master';
  questionsAnswered: number;
  correctAnswers: number;
  wrongAnswers: number;
  score: number;
  bestStreak: number;
  livesRemaining?: number;
  categoryId?: number;
  usedFallbackQuestions?: boolean;
  questions: Array<{
    questionId: string;
    answer: string;
    isCorrect: boolean;
    timeTaken?: number;
  }>;
}

/**
 * Statystyki po zakończeniu gry
 */
export interface GameStats {
  flashPointsEarned: number;
  experienceEarned: number;
  leveledUp: boolean;
  newLevel?: number;
}

/**
 * Typy misji dziennych
 */
export type MissionType =
  | 'win_games'           // Wygraj X gier
  | 'answer_category'     // Odpowiedz na X pytań z kategorii
  | 'perfect_game'        // Ukończ X gier bezbłędnie
  | 'play_games'          // Zagraj X gier
  | 'earn_flash_points';  // Zdobądź X FlashPoints

/**
 * Parametry śledzenia postępu misji
 */
export interface MissionProgress {
  missionType: MissionType;
  increment?: number;
  categoryId?: number;
}

/**
 * Misja dzienna z postępem użytkownika
 */
export interface DailyMission {
  id: string;
  mission_id: string;
  name: string;
  description: string;
  target_value: number;
  current_progress: number;
  reward_flash_points: number;
  reward_experience: number;
  is_completed: boolean;
  is_claimed: boolean;
}

/**
 * Poziom milestone'a osiągnięcia
 */
export type AchievementLevel = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

/**
 * Milestone osiągnięcia
 */
export interface AchievementMilestone {
  level: AchievementLevel;
  target: number;
  reward_fp: number;
  reward_xp: number;
  icon: string;
  name: string;
}

/**
 * Kategoria osiągnięcia
 */
export interface AchievementCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  milestones: AchievementMilestone[];
  getCurrentProgress: (user: any) => number;
}

/**
 * Kategoria pytań
 */
export interface Category {
  id: number;
  name: string;
  icon: string;
  is_active: boolean;
}

/**
 * Tryb gry
 */
export interface GameMode {
  id: number;
  code: string;
  name: string;
  description: string;
  icon: string;
  min_players: number;
  max_players: number;
  is_active: boolean;
}

/**
 * Gracz w rankingu
 */
export interface RankingPlayer {
  id: string;
  username: string;
  avatar_url: string;
  flash_points: number;
  level: number;
  total_wins: number;
  total_games_played: number;
}

/**
 * Odpowiedź API - sukces
 */
export interface ApiSuccessResponse<T = any> {
  success: true;
  data?: T;
}

/**
 * Odpowiedź API - błąd
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
}

/**
 * Odpowiedź API - generic
 */
export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;
