/**
 * @fileoverview Serwis zarządzający pytaniami quizowymi
 * 
 * Ten serwis odpowiada za:
 * - Pobieranie losowych pytań z bazy danych z filtrowaniem po kategorii i trudności
 * - Mieszanie kolejności odpowiedzi dla każdego pytania
 * - Weryfikację poprawności odpowiedzi użytkownika
 * - Zarządzanie kategoriami pytań
 * - Statystyki dotyczące liczby pytań w poszczególnych kategoriach
 * 
 * @module services/questionService
 */

import { supabase } from '../lib/supabase';
import { FALLBACK_QUESTIONS } from '../data/fallbackQuestions';

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

export interface QuestionWithAnswers extends Question {
  answers: Array<{ text: string; isCorrect: boolean }>;
}

/**
 * Pobiera losowe pytania z bazy danych
 * @param count - liczba pytań do pobrania
 * @param categoryId - opcjonalne ID kategorii (jeśli null, losowe z wszystkich)
 * @param difficulty - opcjonalny poziom trudności
 * @returns tablica pytań z pomieszanymi odpowiedziami
 */
const FETCH_TIMEOUT_MS = 7000;

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => 0.5 - Math.random());
}

function mapQuestionWithAnswers(question: Question): QuestionWithAnswers {
  const answers = shuffleArray([
    { text: question.correct_answer, isCorrect: true },
    { text: question.wrong_answer_1, isCorrect: false },
    { text: question.wrong_answer_2, isCorrect: false },
    { text: question.wrong_answer_3, isCorrect: false },
  ]);

  return {
    ...question,
    answers,
  };
}

function getFallbackQuestions(count: number, reason: string): QuestionWithAnswers[] {
  console.warn(`⚠️ Using fallback questions (${reason}). Sprawdź dostęp do tabeli questions w Supabase.`);

  return shuffleArray(FALLBACK_QUESTIONS)
    .slice(0, Math.min(count, FALLBACK_QUESTIONS.length))
    .map((question) => ({
      ...question,
      answers: shuffleArray(question.answers),
    }));
}

export async function getRandomQuestions(
  count: number = 10,
  categoryId?: number,
  difficulty?: 'easy' | 'medium' | 'hard'
): Promise<QuestionWithAnswers[]> {
  try {
    console.log(`🔍 questionService: Fetching ${count} questions, category: ${categoryId || 'all'}, difficulty: ${difficulty || 'all'}`);
    
    let query = supabase
      .from('questions')
      .select('*')
      .eq('is_approved', true)
      .eq('is_active', true);

    // Filtruj po kategorii jeśli podano
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    // Filtruj po trudności jeśli podano
    if (difficulty) {
      query = query.eq('difficulty_level', difficulty);
    }

    console.log('📡 Executing Supabase query...');

    const supabasePromise = query;

    const { data, error } = await Promise.race([
      supabasePromise,
      new Promise<{ data: Question[] | null; error: Error | null }>((resolve) => {
        setTimeout(() => {
          resolve({ data: null, error: new Error('timeout fetching questions') });
        }, FETCH_TIMEOUT_MS);
      }),
    ]);

    if (error) {
      console.error('❌ Supabase error:', error);
      return getFallbackQuestions(count, error.message || 'Supabase error');
    }

    console.log(`📦 Received ${data?.length || 0} questions from database`);

    if (!data || data.length === 0) {
      return getFallbackQuestions(count, 'Brak zatwierdzonych pytań w bazie');
    }

    // Losowo wybierz pytania
    const selected = shuffleArray(data).slice(0, Math.min(count, data.length));

    console.log(`🎲 Selected ${selected.length} random questions`);

    const questionsWithAnswers = selected.map(mapQuestionWithAnswers);

    if (questionsWithAnswers.length < count) {
      const needed = count - questionsWithAnswers.length;
      const supplemental = getFallbackQuestions(needed, 'uzupełnienie puli pytań');
      return shuffleArray([...questionsWithAnswers, ...supplemental]);
    }

    return questionsWithAnswers;
  } catch (error) {
    console.error('Error in getRandomQuestions:', error);
    return getFallbackQuestions(count, error instanceof Error ? error.message : 'Nieznany błąd');
  }
}

/**
 * Sprawdza czy odpowiedź użytkownika jest poprawna
 * @param questionId - ID pytania
 * @param userAnswer - odpowiedź użytkownika
 * @returns true jeśli odpowiedź poprawna, false jeśli błędna
 */
export async function checkAnswer(
  questionId: string,
  userAnswer: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('correct_answer')
      .eq('id', questionId)
      .single();

    if (error) {
      console.error('Error checking answer:', error);
      throw error;
    }

    return data.correct_answer === userAnswer;
  } catch (error) {
    console.error('Error in checkAnswer:', error);
    throw error;
  }
}

/**
 * Pobiera wszystkie kategorie
 */
export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getCategories:', error);
    throw error;
  }
}

/**
 * Pobiera statystyki pytań (ile pytań w każdej kategorii)
 */
export async function getQuestionStats() {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('category_id, difficulty_level')
      .eq('is_approved', true)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching question stats:', error);
      throw error;
    }

    // Zlicz pytania po kategorii i trudności
    const stats = data.reduce((acc: any, q) => {
      const key = `cat_${q.category_id}`;
      if (!acc[key]) {
        acc[key] = { easy: 0, medium: 0, hard: 0, total: 0 };
      }
      acc[key][q.difficulty_level]++;
      acc[key].total++;
      return acc;
    }, {});

    return stats;
  } catch (error) {
    console.error('Error in getQuestionStats:', error);
    throw error;
  }
}
