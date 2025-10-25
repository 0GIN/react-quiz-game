/**
 * @fileoverview Reguły walidacji formularzy
 */

export const VALIDATION_RULES = {
  username: {
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_]+$/,
    errorMessages: {
      required: 'Nazwa użytkownika jest wymagana',
      minLength: 'Nazwa użytkownika musi mieć co najmniej 3 znaki',
      maxLength: 'Nazwa użytkownika może mieć maksymalnie 20 znaków',
      pattern: 'Nazwa użytkownika może zawierać tylko litery, cyfry i podkreślenia',
    },
  },
  
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    errorMessages: {
      required: 'Email jest wymagany',
      pattern: 'Podaj poprawny adres email',
    },
  },
  
  password: {
    minLength: 6,
    maxLength: 100,
    errorMessages: {
      required: 'Hasło jest wymagane',
      minLength: 'Hasło musi mieć co najmniej 6 znaków',
      maxLength: 'Hasło może mieć maksymalnie 100 znaków',
      mismatch: 'Hasła muszą być identyczne',
    },
  },
  
  bio: {
    maxLength: 500,
    errorMessages: {
      maxLength: 'Bio może mieć maksymalnie 500 znaków',
    },
  },
} as const;
