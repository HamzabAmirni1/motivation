// ──────────────────────────────────────────────
//  Daily Quest Pool — ZenStep
// ──────────────────────────────────────────────

export const QUEST_POOL = [
  // الحركة
  { id:'q1',  title:'مشية د الصباح',        desc:'تمشى برا لواحد 10 دقيق',                category:'movement',    xp:20, icon:'🚶', diff:'easy'   },
  { id:'q2',  title:'تحدي 500 خطوة',        desc:'حاول تكمل 500 خطوة هاد النهار',          category:'movement',    xp:15, icon:'👟', diff:'easy'   },
  { id:'q3',  title:'استراحة تمدد',         desc:'دير حركات تمدد للجسم كامل لـ 5 دقيق',      category:'movement',    xp:10, icon:'🤸', diff:'easy'   },
  { id:'q4',  title:'نشط مع راسك',          desc:'شطح على أغنيتك المفضلة وخرج الطاقة 🎵',      category:'movement',    xp:15, icon:'💃', diff:'easy'   },
  { id:'q5',  title:'رياضة ف الدار',        desc:'دير حصة تدريبية خفيفة ف الدار',            category:'movement',    xp:30, icon:'💪', diff:'medium' },
  // الذهن
  { id:'q6',  title:'مذكرة الامتنان',       desc:'كتب 3 حوايج زوينين وقعو ليك اليوم',       category:'mindfulness', xp:20, icon:'📓', diff:'easy'   },
  { id:'q7',  title:'تنفس بعمق',           desc:'دير حصة وحدة كاملة ديال التنفس لمنتظم',     category:'mindfulness', xp:15, icon:'💨', diff:'easy'   },
  { id:'q8',  title:'تأمل لـ 5 دقيق',       desc:'جلس ف بلاصة هادية وغمض عينيك 5 دقيق',     category:'mindfulness', xp:25, icon:'🧘', diff:'medium' },
  { id:'q9',  title:'راحة دجيتال',          desc:'بعد على التلفون لواحد 30 دقيقة',           category:'mindfulness', xp:30, icon:'📵', diff:'medium' },
  { id:'q10', title:'تأمل الطبيعة',         desc:'جلس 10 دقيق كتشوف ف الطبيعة (شجر، سما...)', category:'mindfulness', xp:20, icon:'🍃', diff:'easy'   },
  // العناية بالذات
  { id:'q11', title:'شرب 2 لتر د الماء',     desc:'بقى شرب الماء بزاف هاد النهار لمهم هو الهيدراتاسيون', category:'self-care',   xp:20, icon:'💧', diff:'easy'   },
  { id:'q12', title:'جمع بلاصتك',           desc:'رتب الناموسية ديالك فاش تفيق',             category:'self-care',   xp:10, icon:'🛏️', diff:'easy'   },
  { id:'q13', title:'وجبة صحية',            desc:'وجد آو كول وجبة وحدة صحية اليوم',          category:'self-care',   xp:20, icon:'🥗', diff:'easy'   },
  { id:'q14', title:'النعاس بكري',          desc:'حاول تنعس قبل 10:30 د الليل لراحة عقلك',      category:'self-care',   xp:25, icon:'😴', diff:'medium' },
  { id:'q15', title:'دوش بارد',             desc:'جرب دوش بارد لـ 30 ثانية باش تفيق مزيان',    category:'self-care',   xp:20, icon:'🚿', diff:'medium' },
  // الاجتماعي
  { id:'q16', title:'تواصل مع أحبابك',      desc:'صيفط ميساج زوين لشي حد عزيز عليك',         category:'social',      xp:20, icon:'💌', diff:'easy'   },
  { id:'q17', title:'كلمة طيبة',            desc:'قول كلمة زوينة آو مدح شي حد اليوم',         category:'social',      xp:15, icon:'😊', diff:'easy'   },
  { id:'q18', title:'اتصل بصديق',           desc:'هضر مع شي صديق ف التلفون آو فيديو',        category:'social',      xp:30, icon:'📞', diff:'medium' },
  // العقل
  { id:'q19', title:'قلب الأفكار (CBT)',    desc:'حول فكرة سلبية لفكرة إيجابية باستعمال CBT',  category:'mental',      xp:25, icon:'🧠', diff:'medium' },
  { id:'q20', title:'تمرين التثبيت',       desc:'طبق تقنية 5-4-3-2-1 باش ترجع لهنا ودابا',   category:'mental',      xp:20, icon:'🌍', diff:'easy'   },
  { id:'q21', title:'لعبة الذاكرة',         desc:'وصل للمستوى 5 ف لعبة الأنماط',             category:'mental',      xp:15, icon:'🎮', diff:'easy'   },
  // الإبداع
  { id:'q22', title:'رسم شي حاجة',         desc:'رسم أي حاجة جات ف بالك لـ 5 دقيق',         category:'creative',    xp:20, icon:'🎨', diff:'easy'   },
  { id:'q23', title:'كتب شي حاجة',          desc:'كتب 3 سطور كتوصف فيهوم شعورك هاد النهار',   category:'creative',    xp:25, icon:'✍️', diff:'medium' },
  { id:'q24', title:'طيب شي حاجة جديدة',    desc:'وجد شي أكلة عمرك ما جربتيها',              category:'creative',    xp:30, icon:'🍳', diff:'medium' },
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
