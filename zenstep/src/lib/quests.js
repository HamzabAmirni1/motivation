// ──────────────────────────────────────────────
//  Daily Quest Pool — ZenStep
// ──────────────────────────────────────────────

export const QUEST_POOL = [
  // Movement
  { id:'q1',  title:'Morning Walk',        desc:'Walk outside for 10 minutes',                category:'movement',    xp:20, icon:'🚶', diff:'easy'   },
  { id:'q2',  title:'500 Steps Challenge',  desc:'Count and complete 500 steps today',          category:'movement',    xp:15, icon:'👟', diff:'easy'   },
  { id:'q3',  title:'Stretch Break',        desc:'Do a 5-minute full-body stretch',              category:'movement',    xp:10, icon:'🤸', diff:'easy'   },
  { id:'q4',  title:'Dance It Out',         desc:'Dance freely to your favorite song 🎵',        category:'movement',    xp:15, icon:'💃', diff:'easy'   },
  { id:'q5',  title:'20-Min Workout',       desc:'Complete a home workout session',              category:'movement',    xp:30, icon:'💪', diff:'medium' },
  // Mindfulness
  { id:'q6',  title:'Gratitude Journal',    desc:'Write 3 things you are grateful for today',   category:'mindfulness', xp:20, icon:'📓', diff:'easy'   },
  { id:'q7',  title:'Breathe Deep',         desc:'Complete one full Breathe-Sync session',       category:'mindfulness', xp:15, icon:'💨', diff:'easy'   },
  { id:'q8',  title:'5-Min Meditation',     desc:'Sit quietly with your eyes closed 5 minutes', category:'mindfulness', xp:25, icon:'🧘', diff:'medium' },
  { id:'q9',  title:'Digital Detox',        desc:'Stay off your phone for 30 minutes',           category:'mindfulness', xp:30, icon:'📵', diff:'medium' },
  { id:'q10', title:'Nature Observation',   desc:'Spend 10 mins observing nature mindfully',     category:'mindfulness', xp:20, icon:'🍃', diff:'easy'   },
  // Self-Care
  { id:'q11', title:'Drink 2L of Water',    desc:'Stay hydrated — track your water intake',      category:'self-care',   xp:20, icon:'💧', diff:'easy'   },
  { id:'q12', title:'Make Your Bed',        desc:'Start the day with a small win',               category:'self-care',   xp:10, icon:'🛏️', diff:'easy'   },
  { id:'q13', title:'Eat One Healthy Meal', desc:'Prepare or choose one nutritious meal',        category:'self-care',   xp:20, icon:'🥗', diff:'easy'   },
  { id:'q14', title:'Sleep by 10:30 PM',   desc:'Commit to a healthy sleep schedule',           category:'self-care',   xp:25, icon:'😴', diff:'medium' },
  { id:'q15', title:'Cold Shower',          desc:'Try a 30-second cold shower for a boost',      category:'self-care',   xp:20, icon:'🚿', diff:'medium' },
  // Social
  { id:'q16', title:'Reach Out',            desc:'Send a kind message to someone you care about',category:'social',      xp:20, icon:'💌', diff:'easy'   },
  { id:'q17', title:'Genuine Compliment',   desc:'Give one heartfelt compliment today',          category:'social',      xp:15, icon:'😊', diff:'easy'   },
  { id:'q18', title:'Call a Friend',        desc:'Have a real voice or video conversation',       category:'social',      xp:30, icon:'📞', diff:'medium' },
  // Mental
  { id:'q19', title:'CBT Thought Flip',     desc:'Reframe one negative thought using CBT tool',  category:'mental',      xp:25, icon:'🧠', diff:'medium' },
  { id:'q20', title:'Grounding Exercise',   desc:'Complete the 5-4-3-2-1 grounding technique',   category:'mental',      xp:20, icon:'🌍', diff:'easy'   },
  { id:'q21', title:'Memory Game',          desc:'Beat level 5 in the Pattern-Match game',        category:'mental',      xp:15, icon:'🎮', diff:'easy'   },
  // Creative
  { id:'q22', title:'Draw Something',       desc:'Sketch or doodle anything for 5 minutes',      category:'creative',    xp:20, icon:'🎨', diff:'easy'   },
  { id:'q23', title:'Write a Haiku',        desc:'Write a 3-line haiku about your day',           category:'creative',    xp:25, icon:'✍️', diff:'medium' },
  { id:'q24', title:'Cook Something New',   desc:'Prepare a meal you have never made before',    category:'creative',    xp:30, icon:'🍳', diff:'medium' },
]

/**
 * Returns 3 quests deterministically for a given date (seeded shuffle).
 * Or returns the AI generated quests if they exist for today.
 * @param {Date} [date]
 */
export function getDailyQuests(date = new Date()) {
  const todayStr = date.toISOString().split('T')[0]
  try {
    const rawCustom = localStorage.getItem('zs_custom_quests')
    if (rawCustom) {
      const custom = JSON.parse(rawCustom)
      if (custom && custom.date === todayStr && custom.quests && custom.quests.length > 0) {
        return custom.quests
      }
    }
  } catch (e) {
    console.error("Error parsing custom quests", e)
  }

  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
  const seeded = [...QUEST_POOL].map((q, i) => ({ q, sort: ((seed * (i + 1) * 1664525 + 1013904223) >>> 0) }))
  seeded.sort((a, b) => a.sort - b.sort)
  return seeded.slice(0, 3).map(s => s.q)
}

/**
 * Returns today's date string (YYYY-MM-DD).
 */
export function todayStr() {
  return new Date().toISOString().split('T')[0]
}
