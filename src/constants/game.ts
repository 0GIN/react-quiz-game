/**
 * @fileoverview Stałe związane z grą
 */

export const GAME_MODES = {
  BLITZ: 'blitz',
  DUEL: 'duel',
  SQUAD: 'squad',
  MASTER: 'master',
} as const;

export const GAME_CONFIG = {
  BLITZ: {
    INITIAL_LIVES: 3,
    TIME_PER_QUESTION: 15, // sekundy
    QUESTIONS_COUNT: 10,
    POINTS_PER_CORRECT: 100,
    STREAK_BONUS: 50,
  },
  EXPERIENCE: {
    CORRECT_ANSWER: 10,
    WRONG_ANSWER: 0,
    GAME_COMPLETION: 50,
    PERFECT_GAME: 100,
  },
  FLASH_POINTS: {
    CORRECT_ANSWER: 10,
    STREAK_BONUS: 5,
    LEVEL_UP_BONUS: 100,
  },
} as const;

export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
} as const;

export const DIFFICULTY_MULTIPLIERS = {
  [DIFFICULTY_LEVELS.EASY]: 1,
  [DIFFICULTY_LEVELS.MEDIUM]: 1.5,
  [DIFFICULTY_LEVELS.HARD]: 2,
} as const;

export type GameMode = typeof GAME_MODES[keyof typeof GAME_MODES];
export type DifficultyLevel = typeof DIFFICULTY_LEVELS[keyof typeof DIFFICULTY_LEVELS];
