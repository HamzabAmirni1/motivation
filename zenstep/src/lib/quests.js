// ──────────────────────────────────────────────
//  Daily Quest Pool — ZenStep
// ──────────────────────────────────────────────

export const QUEST_POOL = [
  // الحركة
  { id:'q1',  title:'مشية د الصباح',        desc:'تمشى برا لواحد 10 دقيق',                category:'movement',    xp:20, icon:'🚶', diff:'easy', 
    details: 'خرج لزنقة آو ف الجردة وتشمى لواحد 10 دقيق. حاول تركز غير مع التنفس ديالك والجو اللي داير بيك. هاد المشية غادي تعطيك طاقة إيجابية وتبدأ بها نهارك مزيان.' },
  { id:'q2',  title:'تحدي 500 خطوة',        desc:'حاول تكمل 500 خطوة هاد النهار',          category:'movement',    xp:15, icon:'👟', diff:'easy',
    details: 'استعمل التلفون ديالك آو مكينة باش تحسب 500 خطوة. تقدر ديرهم غير ف الدار آو ف الخدمة. الهدف هو تحرك الجسم ديالك ولو بشوية.' },
  { id:'q3',  title:'استراحة تمدد',         desc:'دير حركات تمدد للجسم كامل لـ 5 دقيق',      category:'movement',    xp:10, icon:'🤸', diff:'easy',
    details: 'وقف وكسل يديك لفوق، تمدد لليمين ولليسار، وحاول تلمس رجليك. هاد الحركات تايحيدو التوتر من العضلات وتيحسنو الدورة الدموية.' },
  { id:'q4',  title:'نشط مع راسك',          desc:'شطح على أغنيتك المفضلة وخرج الطاقة 🎵',      category:'movement',    xp:15, icon:'💃', diff:'easy',
    details: 'دير أغنية كتعجبك وشطح بحرية! ميهمش كيف كتشطح، لمهم هو تحرك وتخرج داكشي اللي لداخل وتفرح راسك.' },
  { id:'q5',  title:'رياضة ف الدار',        desc:'دير حصة تدريبية خفيفة ف الدار',            category:'movement',    xp:30, icon:'💪', diff:'medium',
    details: 'دير شوية ديال الـ push-ups، squats، آو أي تمرين خفيف كتعرفه. 15 لـ 20 دقيقة كافية باش تحس بفرق ف المود ديالك.' },
  // الذهن
  { id:'q6',  title:'مذكرة الامتنان',       desc:'كتب 3 حوايج زوينين وقعو ليك اليوم',       category:'mindfulness', xp:20, icon:'📓', diff:'easy',
    details: 'خد ورقة آو المذكرة ديال التلفون وكتب 3 د الحاجات واخا يكونو صغار اللي وقعو اليوم وفرحوك آو ممتن ليهم. هاد التمرين تايعلمنا نشوفو الجانب لجميل ف الحياة.' },
  { id:'q7',  title:'تنفس بعمق',           desc:'دير حصة وحدة كاملة ديال التنفس لمنتظم',     category:'mindfulness', xp:15, icon:'💨', diff:'easy',
    details: 'استعمل أداة Breath-Sync ف الموقع. سد عينيك، تنفس من نيفك ف 4 ثواني، وحبس 4 ثواني، وخرج الهواء ف 4 ثواني. عاودها 5 المرات.' },
  { id:'q8',  title:'تأمل لـ 5 دقيق',       desc:'جلس ف بلاصة هادية وغمض عينيك 5 دقيق',     category:'mindfulness', xp:25, icon:'🧘', diff:'medium',
    details: 'جلس ف وضعية مريحة، غمض عينيك، وحاول تركز غير مع الهواء اللي داخل وخارج. إلا جاوك أفكار خليهم يدوزو ورجع ركز مع التنفس ديالك.' },
  { id:'q9',  title:'راحة دجيتال',          desc:'بعد على التلفون لواحد 30 دقيقة',           category:'mindfulness', xp:30, icon:'📵', diff:'medium',
    details: 'حط التلفون ف بيت آخر آو طرقه. استغل هاد 30 دقيقة باش تقرا كتاب، ترسم، آو غير تجلس مع راسك بلا تبرزيط ديال السوشل ميديا.' },
  { id:'q10', title:'تأمل الطبيعة',         desc:'جلس 10 دقيق كتشوف ف الطبيعة (شجر، سما...)', category:'mindfulness', xp:20, icon:'🍃', diff:'easy',
    details: 'إلا كان عندك محبق آو شجرة قريبة، جلس شوف فيها بتمعن. لاحظ الألوان، الأشكال، وكيفاش الريح تايحركهم. الطبيعة كتهدئ الأعصاب بشكل كبير.' },
  // العناية بالذات
  { id:'q11', title:'شرب 2 لتر د الماء',     desc:'بقى شرب الماء بزاف هاد النهار لمهم هو الهيدراتاسيون', category:'self-care',   xp:20, icon:'💧', diff:'easy',
    details: 'حاول تشرب كاس د الماء كل ساعة. الماء مهم بزاف للتركيز وللصحة النفسية والجسدية.' },
  { id:'q12', title:'جمع بلاصتك',           desc:'رتب الناموسية ديالك فاش تفيق',             category:'self-care',   xp:10, icon:'🛏️', diff:'easy',
    details: 'أول حاجة تبدأ بها نهارك هي تجمع فراشك. هاد الخطوة الصغيرة كتعطيك إحساس بالإنجاز وتخلي بيتك مرتب، الشيء اللي تيريح البال.' },
  { id:'q13', title:'وجبة صحية',            desc:'وجد آو كول وجبة وحدة صحية اليوم',          category:'self-care',   xp:20, icon:'🥗', diff:'easy',
    details: 'حاول تدخل الخضرة آو الفواكه ف الغداء آو العشاء ديالك. نقص من السكر والماكلة د الزنقة وجرب طيب شي حاجة خفيفة ومفيدة للذات.' },
  { id:'q14', title:'النعاس بكري',          desc:'حاول تنعس قبل 10:30 د الليل لراحة عقلك',      category:'self-care',   xp:25, icon:'😴', diff:'medium',
    details: 'طفي الضواو بكري، ونقص من التلفون قبل النعاس. النوم الكافي هو الأساس باش تقدر تواجه نهارك بطاقة وإيجابية.' },
  { id:'q15', title:'دوش بارد',             desc:'جرب دوش بارد لـ 30 ثانية باش تفيق مزيان',    category:'self-care',   xp:20, icon:'🚿', diff:'medium',
    details: 'ف لخر ديال الدوش، برد الماء شوية وبقى تحته 30 ثانية. هادشي تايحرك الدورة الدموية وتايحيد الخمول والكسل.' },
  // الاجتماعي
  { id:'q16', title:'تواصل مع أحبابك',      desc:'صيفط ميساج زوين لشي حد عزيز عليك',         category:'social',      xp:20, icon:'💌', diff:'easy',
    details: 'تواصل مع صديق آو فرد من العائلة اللي شحال ما هضرتي معه. كلمة وحدة زوينة تقدر تبدل ليك المود ديالك وديالهم.' },
  { id:'q17', title:'كلمة طيبة',            desc:'قول كلمة زوينة آو مدح شي حد اليوم',         category:'social',      xp:15, icon:'😊', diff:'easy',
    details: 'إلا شفتي شي حد داير مجهود آو لابس زوين، قولهالو بصدق. الكلمة الطيبة صدقة وتاتخلي طاقة زوينة ف المحيط ديالك.' },
  { id:'q18', title:'اتصل بصديق',           desc:'هضر مع شي صديق ف التلفون آو فيديو',        category:'social',      xp:30, icon:'📞', diff:'medium',
    details: 'الهضرة ف التلفون أحسن من الميساجات. اتصل بشي حد كترتاح ليه وشارك معه نهارك آو غير سول فيه.' },
  // العقل
  { id:'q19', title:'قلب الأفكار (CBT)',    desc:'حول فكرة سلبية لفكرة إيجابية باستعمال CBT',  category:'mental',      xp:25, icon:'🧠', diff:'medium',
    details: 'استعمل أداة CBT-Flip ف الموقع. إلا جاتك فكرة فحال "أنا فاشل"، قلبها لـ "أنا كنتعلم من الأخطاء ديالي". هاد الطريقة كاتبدل نظرتك للأمور.' },
  { id:'q20', title:'تمرين التثبيت',       desc:'طبق تقنية 5-4-3-2-1 باش ترجع لهنا ودابا',   category:'mental',      xp:20, icon:'🌍', diff:'easy',
    details: 'استعمل أداة Grounding ف الموقع. لاحظ: 5 حوايج كتشوفهم، 4 كتقيسهم، 3 كتسمعهم، 2 كتشمهم، و 1 كتذوقها. هاد التمرين تايحيد القلق والخلعة.' },
  { id:'q21', title:'لعبة الذاكرة',         desc:'وصل للمستوى 5 ف لعبة الأنماط',             category:'mental',      xp:15, icon:'🎮', diff:'easy',
    details: 'لعب لعبة Pattern-Match وحاول تركز مزيان. هاد الألعاب تايحفزو العقل وتايخليوك تنسى التوتر والضغط.' },
  // الإبداع
  { id:'q22', title:'رسم شي حاجة',         desc:'رسم أي حاجة جات ف بالك لـ 5 دقيق',         category:'creative',    xp:20, icon:'🎨', diff:'easy',
    details: 'خد ورقة وقلم ورسم أي حاجة: وردة، دار، آو غير خطوط عشوائية. الرسم طريقة زوينة باش تفرغ المشاعر ديالك بلا هضرة.' },
  { id:'q23', title:'كتب شي حاجة',          desc:'كتب 3 سطور كتوصف فيهوم شعورك هاد النهار',   category:'creative',    xp:25, icon:'✍️', diff:'medium',
    details: 'فرغ اللي ف قلبك ف الورقة. كتب كيفاش داز نهارك وشنو اللي ضرك آو شنو اللي عجبك. التدوين تايخلي الأفكار مرتبة ف الراس.' },
  { id:'q24', title:'طيب شي حاجة جديدة',    desc:'وجد شي أكلة عمرك ما جربتيها',              category:'creative',    xp:30, icon:'🍳', diff:'medium',
    details: 'دخل للكوزينة وجرب دير شي وصفة جديدة واخا تكون ساهلة. الإبداع ف الماكلة تايعطي إحساس بالقدرة على التجديد والتحكم.' },
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
