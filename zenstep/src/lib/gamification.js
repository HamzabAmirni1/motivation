// ──────────────────────────────────────────
//  ZenStep Gamification & Achievement Engine
// ──────────────────────────────────────────

export const LEVELS = [
  { level: 1,  minXP: 0,    maxXP: 100,  title: 'Seedling',    titleAr: 'بذرة أمل',     emoji: '🌱', color: '#6ee7b7' },
  { level: 2,  minXP: 100,  maxXP: 250,  title: 'Sprout',      titleAr: 'برعم ناشئ',    emoji: '🌿', color: '#34d399' },
  { level: 3,  minXP: 250,  maxXP: 500,  title: 'Sapling',     titleAr: 'شجيرة واعدة',  emoji: '🌾', color: '#10b981' },
  { level: 4,  minXP: 500,  maxXP: 850,  title: 'Bloom',       titleAr: 'إزهار الهدوء', emoji: '🌸', color: '#a78bfa' },
  { level: 5,  minXP: 850,  maxXP: 1300, title: 'Flourishing', titleAr: 'نماء وسلام',   emoji: '🌻', color: '#fcd34d' },
  { level: 6,  minXP: 1300, maxXP: 1900, title: 'Radiant',     titleAr: 'إشراق داخلي',  emoji: '🌳', color: '#7dd3fc' },
  { level: 7,  minXP: 1900, maxXP: 2700, title: 'Enlightened', titleAr: 'يقظة ووعي',    emoji: '✨', color: '#f9a8d4' },
  { level: 8,  minXP: 2700, maxXP: 3700, title: 'Ascendant',   titleAr: 'سمو روحي',     emoji: '⭐', color: '#fbbf24' },
  { level: 9,  minXP: 3700, maxXP: 5000, title: 'Transcendent',titleAr: 'سكينة تامة',   emoji: '🌟', color: '#6ee7b7' },
  { level: 10, minXP: 5000, maxXP: Infinity, title: 'Zenmaster', titleAr: 'أسطورة زن', emoji: '🏆', color: '#a78bfa' },
];

export const ACHIEVEMENTS = [
  {
    id: 'first_step',
    title: 'أول خطوة',
    titleEn: 'First Step',
    description: 'أكملت أول نشاط أو تمرين في ZenStep',
    icon: '🌱',
    xpReward: 25,
    check: (stats) => (stats.completedExercises || 0) >= 1 || (stats.xp || 0) >= 10
  },
  {
    id: 'calm_mind',
    title: 'ذهن هادئ',
    titleEn: 'Calm Mind',
    description: 'أكملت 3 جلسات تنفس عميق بنجاح',
    icon: '🧘',
    xpReward: 40,
    check: (stats) => (stats.breathingCount || 0) >= 3
  },
  {
    id: 'mindful_explorer',
    title: 'مستكشف واعي',
    titleEn: 'Mindful Explorer',
    description: 'جربت أدوات الاسترخاء المتنوعة',
    icon: '🧭',
    xpReward: 50,
    check: (stats) => (stats.toolsUsedCount || 0) >= 3
  },
  {
    id: 'focus_master',
    title: 'بطل التركيز',
    titleEn: 'Focus Master',
    description: 'أتممت جلسة تركيز كاملة في Focus Mode',
    icon: '🎯',
    xpReward: 35,
    check: (stats) => (stats.focusSessions || 0) >= 1
  },
  {
    id: 'seven_day_streak',
    title: 'أسبوع متواصل',
    titleEn: 'Seven-Day Streak',
    description: 'حافظت على ستريك مستمر لمدة 7 أيام متتالية',
    icon: '🔥',
    xpReward: 100,
    check: (stats) => (stats.streak || 0) >= 7
  },
  {
    id: 'journal_beginner',
    title: 'بداية التدوين',
    titleEn: 'Journal Beginner',
    description: 'كتبت أول تدوينة في مذكرتك الخاصة',
    icon: '📖',
    xpReward: 30,
    check: (stats) => (stats.journalCount || 0) >= 1
  },
  {
    id: 'challenge_champion',
    title: 'بطل التحديات',
    titleEn: 'Challenge Champion',
    description: 'أكملت 5 تحديات يومية أو أسبوعية',
    icon: '🌟',
    xpReward: 60,
    check: (stats) => (stats.challengesCompleted || 0) >= 5
  },
  {
    id: 'zen_legend',
    title: 'أسطورة زن',
    titleEn: 'Zen Legend',
    description: 'وصلت إلى المستوى 5 في منصة ZenStep',
    icon: '👑',
    xpReward: 150,
    check: (stats) => (stats.level || 1) >= 5
  }
];

export function calculateLevel(xp) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getXPProgress(xp) {
  const currentLevel = calculateLevel(xp);
  const idx = LEVELS.findIndex(l => l.level === currentLevel.level);
  const isMax = idx === LEVELS.length - 1;

  if (isMax) return { current: xp - currentLevel.minXP, total: 1, percent: 100, nextLevel: null };

  const nextLevel  = LEVELS[idx + 1];
  const current    = xp - currentLevel.minXP;
  const total      = currentLevel.maxXP - currentLevel.minXP;
  const percent    = Math.min(100, Math.round((current / total) * 100));

  return { current, total, percent, nextLevel };
}

export function getXPReward(type, bonus = 0) {
  const base = {
    quest: 20,
    breathing: 15,
    grounding: 20,
    cbt: 25,
    focus: 20,
    stress_relief: 15,
    sleep: 15,
    game: 15,
    mood: 10,
    journal: 15,
    habit: 10
  };
  return (base[type] ?? 15) + bonus;
}

export function streakMultiplier(streak) {
  if (streak >= 30) return 2.0;
  if (streak >= 14) return 1.75;
  if (streak >= 7)  return 1.5;
  if (streak >= 3)  return 1.25;
  return 1.0;
}
