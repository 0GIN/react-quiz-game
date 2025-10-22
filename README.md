# react-quiz-game

A dynamic, social quiz duel platform created by Jan Ogiński and Szymon Mierzwicki. Built with **React, TypeScript, and Vite**.

## Table of Contents
* [About The Project](#about-the-project)
* [Key Features (Planned)](#key-features-planned)
* [Tech Stack](#tech-stack)
* [Example Game Flow](#example-game-flow)
* [Future Development](#future-development)
* [Authors](#authors)
* [React + Vite Setup](#react--vite-setup)

---

## About The Project

QuizRush is a dynamic, social web application focused on user competition through fast-paced quiz duels. The system (planned) will include a friends module, daily missions, and a point system to motivate regular play. It will allow users to log in, challenge friends to duels, and track their progress in the rankings.

The main goal of the project is to create an engaging entertainment platform that:
* Allows users to compete and test their knowledge in the form of duels.
* Builds a community through a system of friends and playing together.
* Engages users through a point system, daily missions, and rankings.
* Serves as a practical application of modern web technologies (React, TypeScript, Vite).

### Target Audience
* Fans of quiz games and trivia apps.
* Users looking for quick, competitive online entertainment.
* Any internet user who wants to test their knowledge and compare it with others in various categories (e.g., history, geography, pop culture, sports).

---

## Key Features (Planned)

### User Features
A logged-in user will be able to:
* Manage their profile and password.
* Add other users to their friends list and manage invitations.
* Challenge a friend to a duel (real-time or asynchronous) in a selected category.
* Join a quick, random duel with another player.
* Solve quizzes (with single or multiple-choice questions) as part of a duel, often with a time limit per answer.
* Receive immediate feedback on the duel's result.
* Undertake daily missions (e.g., "Win 3 duels," "Answer 5 geography questions correctly").
* Earn points for winning duels and completing missions.
* View global and friends' ranking systems.
* Browse their duel history and statistics.
* Suggest their own questions for a given quiz category.
* Report errors in questions.

### Administrator Features
An administrator (after logging into the admin panel) will have access to:
* Adding new quizzes (categories) and questions.
* Editing or deleting existing quizzes and questions.
* Managing the daily mission system (creating, editing).
* Viewing user statistics and results.
* Managing user accounts (e.g., blocking).
* Reviewing and accepting or rejecting questions submitted by users.

---

## Tech Stack

* **Frontend:** React, TypeScript, Vite
* **Backend:** (TBA - Required for the full functionality described above)
* **Database:** (TBA - Required for full functionality)

---

## Example Game Flow (Duel)

1.  A user registers or logs into the system.
2.  They check their online friends list or select the "Quick Duel" option.
3.  They send a challenge to a friend (or the system finds a random opponent) and choose a quiz category.
4.  Both players join the game.
5.  They receive the same set of questions, answering them under time pressure.
6.  After the quiz ends, the system compares the results (points and time) and announces the winner.
7.  The winner receives points for the ranking.
8.  The system checks if the duel contributed to progress in daily missions.

---

## Future Development

* Introduction of leagues and ranking seasons.
* Team game modes (e.g., 2 vs 2).
* Notification system (for friend requests, challenges, results).
* A shop where points can be exchanged for cosmetic items (avatars, profile backgrounds).
* Addition of different game modes (e.g., "Bomb," where time runs out faster).

---

## Authors

* **Jan Ogiński**
* **Szymon Mierzwicki**

---

## React + Vite Setup

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

### React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

### Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
