// ──────────────────────────────────────────────
//  ZenStep Gamification Engine
// ──────────────────────────────────────────────

export const LEVELS = [
  { level: 1,  minXP: 0,    maxXP: 100,  title: 'Seedling',    emoji: '🌱', color: '#6ee7b7' },
  { level: 2,  minXP: 100,  maxXP: 250,  title: 'Sprout',      emoji: '🌿', color: '#34d399' },
  { level: 3,  minXP: 250,  maxXP: 500,  title: 'Sapling',     emoji: '🌾', color: '#10b981' },
  { level: 4,  minXP: 500,  maxXP: 850,  title: 'Bloom',       emoji: '🌸', color: '#a78bfa' },
  { level: 5,  minXP: 850,  maxXP: 1300, title: 'Flourishing', emoji: '🌻', color: '#fcd34d' },
  { level: 6,  minXP: 1300, maxXP: 1900, title: 'Radiant',     emoji: '🌳', color: '#7dd3fc' },
  { level: 7,  minXP: 1900, maxXP: 2700, title: 'Enlightened', emoji: '✨', color: '#f9a8d4' },
  { level: 8,  minXP: 2700, maxXP: 3700, title: 'Ascendant',   emoji: '⭐', color: '#fbbf24' },
  { level: 9,  minXP: 3700, maxXP: 5000, title: 'Transcendent',emoji: '🌟', color: '#6ee7b7' },
  { level: 10, minXP: 5000, maxXP: Infinity, title: 'Zenmaster', emoji: '🏆', color: '#a78bfa' },
]

/**
 * Returns level details for a given XP value.
 * @param {number} xp
 */
export function calculateLevel(xp) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) return LEVELS[i]
  }
  return LEVELS[0]
}

/**
 * Returns XP progress within the current level (percentage 0–100).
 * @param {number} xp
 * @returns {{ current: number, total: number, percent: number, nextLevel: object|null }}
 */
export function getXPProgress(xp) {
  const currentLevel = calculateLevel(xp)
  const idx = LEVELS.findIndex(l => l.level === currentLevel.level)
  const isMax = idx === LEVELS.length - 1

  if (isMax) return { current: xp - currentLevel.minXP, total: 1, percent: 100, nextLevel: null }

  const nextLevel  = LEVELS[idx + 1]
  const current    = xp - currentLevel.minXP
  const total      = currentLevel.maxXP - currentLevel.minXP
  const percent    = Math.min(100, Math.round((current / total) * 100))

  return { current, total, percent, nextLevel }
}

/**
 * Returns XP reward for an activity type.
 * @param {'quest'|'breathing'|'grounding'|'cbt'|'game'|'mood'} type
 * @param {number} [bonus=0]
 */
export function getXPReward(type, bonus = 0) {
  const base = { quest: 20, breathing: 15, grounding: 20, cbt: 25, game: 10, mood: 5 }
  return (base[type] ?? 10) + bonus
}

/**
 * Daily streak bonus multiplier.
 * @param {number} streak
 */
export function streakMultiplier(streak) {
  if (streak >= 30) return 2.0
  if (streak >= 14) return 1.75
  if (streak >= 7)  return 1.5
  if (streak >= 3)  return 1.25
  return 1.0
}
