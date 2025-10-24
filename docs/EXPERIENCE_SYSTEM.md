# Experience & Leveling System

## Overview
System doświadczenia (XP) w stylu MMORPG (inspirowany World of Warcraft), gdzie gracze zdobywają poziomy poprzez rozgrywanie gier.

## XP Mechanics

### Zdobywanie XP (Wygrana)
**Podstawowe nagrody:**
- **Base XP za wygraną**: 50 XP
- **Streak Bonus**: +10 XP za każdą wygraną z rzędu
  - 2 wygrane: 60 XP
  - 3 wygrane: 70 XP
  - 5 wygranych: 90 XP
- **Perfect Game Bonus**: +25 XP za 100% accuracy (wszystkie odpowiedzi poprawne)

**Przykład:**
- Wygrana bez streaka: 50 XP
- Wygrana z 3-win streakiem: 70 XP
- Wygrana bezbłędna z 3-win streakiem: 95 XP

### Tracenie XP (Przegrana)
- **XP Loss**: -20 XP za każdą przegraną
- **Minimum**: Nie można spaść poniżej 0 XP w obecnym poziomie
- **Bez degradacji levelu**: Przegrana nigdy nie spowoduje spadku poziomu

**Przykład:**
- Masz 30/100 XP → przegrywasz → 10/100 XP
- Masz 15/100 XP → przegrywasz → 0/100 XP (nie -5)

## Level Progression

### Formuła wymaganego XP
```
XP_Required = 100 + (Level - 1) × 50
```

### Tabela poziomów
| Level | XP Required | Total XP from Level 1 |
|-------|-------------|----------------------|
| 1→2   | 100 XP      | 100                 |
| 2→3   | 150 XP      | 250                 |
| 3→4   | 200 XP      | 450                 |
| 5→6   | 300 XP      | 1,100               |
| 10→11 | 550 XP      | 3,850               |
| 20→21 | 1,050 XP    | 14,350              |
| 50→51 | 2,550 XP    | 101,350             |

## Database Schema

### users table - XP columns
```sql
level INTEGER DEFAULT 1,                      -- Current level
experience INTEGER DEFAULT 0,                 -- Current XP in level
experience_to_next_level INTEGER DEFAULT 100, -- XP needed for next level
total_wins INTEGER DEFAULT 0,                 -- Total victories
total_losses INTEGER DEFAULT 0,               -- Total defeats
current_streak INTEGER DEFAULT 0,             -- Current win streak
best_streak INTEGER DEFAULT 0,                -- Best ever streak
```

## Backend Logic

### After game completion:
```javascript
function calculateXPReward(gameResult) {
  let xpChange = 0;
  
  if (gameResult.isWin) {
    // Base reward
    xpChange = 50;
    
    // Streak bonus
    const streakBonus = gameResult.currentStreak * 10;
    xpChange += streakBonus;
    
    // Perfect game bonus
    if (gameResult.accuracy === 100) {
      xpChange += 25;
    }
  } else {
    // Loss penalty
    xpChange = -20;
  }
  
  return applyXPChange(user, xpChange);
}

function applyXPChange(user, xpChange) {
  let newXP = user.experience + xpChange;
  let newLevel = user.level;
  let xpToNext = user.experience_to_next_level;
  
  // Handle XP loss (cannot go negative)
  if (newXP < 0) {
    newXP = 0;
  }
  
  // Handle level up
  while (newXP >= xpToNext && newLevel < 100) {
    newXP -= xpToNext;
    newLevel++;
    xpToNext = 100 + (newLevel - 1) * 50;
  }
  
  return {
    level: newLevel,
    experience: newXP,
    experience_to_next_level: xpToNext,
    leveledUp: newLevel > user.level
  };
}
```

## UI Components

### ExperienceBar Component
**Location**: Tuż pod Navbar, na całą szerokość ekranu

**Display:**
- Level number (złoty kolor, większy font)
- Current XP / Required XP (środek)
- Percentage (prawy róg, jasnoniebieski)
- Progress bar z gradientem i "shine" efektem

**Styling:**
- WoW-style gradient (cyan → dark blue)
- Inner shine effect na górze paska
- Text shadow dla czytelności
- Smooth transition przy zmianie wartości

**Props:**
```typescript
interface ExperienceBarProps {
  level: number
  currentXP: number
  xpToNextLevel: number
}
```

## Game Flow

### Sequence after game ends:
1. Calculate game result (win/loss, accuracy, streak)
2. Calculate XP change based on rules
3. Apply XP change to user
4. Check for level up
5. If level up:
   - Show level up notification
   - Update experience_to_next_level
   - Grant level up rewards (flash points, etc.)
6. Update user stats in database
7. Update UI (experience bar animates)

## Rewards for Leveling Up

### Per Level:
- **Flash Points**: 50 × Level
  - Level 2: 100 points
  - Level 10: 500 points
  - Level 20: 1,000 points
- **Achievement unlock** at milestones (5, 10, 25, 50, 100)
- **New content unlock** at specific levels:
  - Level 5: Access to Blitz mode
  - Level 10: Access to Master mode
  - Level 15: Custom avatar frames
  - Level 25: Premium shop items

## Statistics & Analytics

### Tracked metrics:
- Average XP per game
- XP gained today/week/month
- Games needed to next level (estimate)
- Win/Loss ratio impact on progression
- Fastest leveling players (leaderboard)

## Balance Considerations

### Current balance:
- **Win rate 50%**: Net gain ~15 XP per game (50 - 20 = 30 / 2)
- **Games to level up** (assuming 50% win rate, no streaks):
  - Level 1→2: ~7 games
  - Level 10→11: ~37 games
  - Level 20→21: ~70 games

### Adjustable parameters:
- Base win XP (currently 50)
- Loss penalty (currently -20)
- Streak bonus multiplier (currently 10 per win)
- Perfect game bonus (currently 25)
- Level formula slope (currently 50 per level)

## Future Enhancements

1. **Double XP Events** - special weekends/events
2. **XP Boosters** - purchasable with flash points
3. **Daily First Win Bonus** - extra XP for first win each day
4. **Difficulty Multipliers** - harder game modes = more XP
5. **Party Bonus** - bonus XP when playing with friends
6. **Rested XP** - WoW-style bonus XP after being offline
7. **Season Resets** - optional prestige system
