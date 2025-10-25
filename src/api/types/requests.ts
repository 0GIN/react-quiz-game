/**
 * @fileoverview Typy żądań API
 */

/**
 * Parametry logowania
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Parametry rejestracji
 */
export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

/**
 * Parametry aktualizacji profilu
 */
export interface UpdateProfileRequest {
  username?: string;
  bio?: string;
  avatar_url?: string;
}

/**
 * Parametry zapisania wyniku gry
 */
export interface SaveGameRequest {
  gameMode: string;
  categoryId?: number;
  questionsAnswered: number;
  correctAnswers: number;
  wrongAnswers: number;
  score: number;
  bestStreak: number;
  livesRemaining?: number;
  questions: Array<{
    questionId: string;
    answer: string;
    isCorrect: boolean;
    timeTaken?: number;
  }>;
}

/**
 * Parametry dodania pytania
 */
export interface CreateQuestionRequest {
  category_id: number;
  question_text: string;
  correct_answer: string;
  wrong_answer_1: string;
  wrong_answer_2: string;
  wrong_answer_3: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  points_value: number;
}
