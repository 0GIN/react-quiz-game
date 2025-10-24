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
    const { data, error } = await query;

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    console.log(`📦 Received ${data?.length || 0} questions from database`);

    if (!data || data.length === 0) {
      throw new Error('No questions found with the specified criteria');
    }

    // Losowo wybierz pytania
    const shuffled = data.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));

    console.log(`🎲 Selected ${selected.length} random questions`);

    // Przetworz pytania - pomieszaj odpowiedzi
    const questionsWithAnswers: QuestionWithAnswers[] = selected.map((q) => {
      const answers = [
        { text: q.correct_answer, isCorrect: true },
        { text: q.wrong_answer_1, isCorrect: false },
        { text: q.wrong_answer_2, isCorrect: false },
        { text: q.wrong_answer_3, isCorrect: false },
      ];

      // Pomieszaj odpowiedzi
      const shuffledAnswers = answers.sort(() => 0.5 - Math.random());

      return {
        ...q,
        answers: shuffledAnswers,
      };
    });

    return questionsWithAnswers;
  } catch (error) {
    console.error('Error in getRandomQuestions:', error);
    throw error;
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
