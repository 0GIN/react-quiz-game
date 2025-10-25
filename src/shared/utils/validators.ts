/**
 * @fileoverview Funkcje walidacji
 */

import { VALIDATION_RULES } from '@/constants';

/**
 * Waliduje nazwę użytkownika
 */
export function validateUsername(username: string): string | null {
  const rules = VALIDATION_RULES.username;

  if (!username) {
    return rules.errorMessages.required;
  }

  if (username.length < rules.minLength) {
    return rules.errorMessages.minLength;
  }

  if (username.length > rules.maxLength) {
    return rules.errorMessages.maxLength;
  }

  if (!rules.pattern.test(username)) {
    return rules.errorMessages.pattern;
  }

  return null;
}

/**
 * Waliduje email
 */
export function validateEmail(email: string): string | null {
  const rules = VALIDATION_RULES.email;

  if (!email) {
    return rules.errorMessages.required;
  }

  if (!rules.pattern.test(email)) {
    return rules.errorMessages.pattern;
  }

  return null;
}

/**
 * Waliduje hasło
 */
export function validatePassword(password: string): string | null {
  const rules = VALIDATION_RULES.password;

  if (!password) {
    return rules.errorMessages.required;
  }

  if (password.length < rules.minLength) {
    return rules.errorMessages.minLength;
  }

  if (password.length > rules.maxLength) {
    return rules.errorMessages.maxLength;
  }

  return null;
}

/**
 * Sprawdza, czy hasła są identyczne
 */
export function validatePasswordMatch(
  password: string,
  confirmPassword: string
): string | null {
  if (password !== confirmPassword) {
    return VALIDATION_RULES.password.errorMessages.mismatch;
  }
  return null;
}

/**
 * Waliduje bio
 */
export function validateBio(bio: string): string | null {
  const rules = VALIDATION_RULES.bio;

  if (bio.length > rules.maxLength) {
    return rules.errorMessages.maxLength;
  }

  return null;
}
