import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'

const STEPS_BY_LANG = {
  fr: [
    { title: 'Préparation et respiration', body: 'Installez-vous confortablement. Relâchez vos épaules et fermez doucement les yeux. Prenez 3 respirations profondes et lentes par le nez et expirez par la bouche.', emoji: '🧘' },
    { title: 'Visage et mâchoire', body: 'Contractez les muscles de votre front et serrez les yeux pendant 5 secondes... Puis relâchez complètement. Sentez la tension fondre et votre visage s\'adoucir.', emoji: '😌' },
    { title: 'Épaules et nuque', body: 'Montez vos épaules vers vos oreilles en serrant doucement pendant 5 secondes... Puis laissez-les retomber d\'un coup. Respirez profondément.', emoji: '💆' },
    { title: 'Mains et bras', body: 'Serrez fort les poings pendant 5 secondes... Ouvrez ensuite grand les doigts. Laissez le stress s\'évacuer par le bout de vos doigts.', emoji: '🤲' },
    { title: 'Ventre et dos', body: 'Inspirez profondément par le ventre et retenez 4 secondes... Expirez longuement et sentez votre dos s\'enfoncer paisiblement dans le siège.', emoji: '🌿' },
    { title: 'Jambes et pieds', body: 'Pointez vos orteils vers l\'avant et contractez vos mollets 5 secondes... Relâchez tout. Une douce chaleur se diffuse dans tout votre corps.', emoji: '👣' },
    { title: 'Sérénité totale', body: 'Restez dans cet état d\'apaisement complet. Votre corps se régénère. Vous pouvez retrouver ce calme à tout moment avec 3 respirations lentes.', emoji: '✨' }
  ],
  en: [
    { title: 'Preparation & Breathing', body: 'Sit or lie down in a quiet comfortable spot. Lower your shoulders and gently close your eyes. Take 3 slow, deep breaths through your nose and out through your mouth.', emoji: '🧘' },
    { title: 'Face & Jaw Tension', body: 'Squeeze your forehead, eyes, and jaw tightly for 5 seconds... Now release completely. Notice the lightness spreading across your features.', emoji: '😌' },
    { title: 'Shoulders & Neck', body: 'Raise your shoulders toward your ears and squeeze for 5 seconds... Now drop them suddenly. Feel the heavy burden lifting off your posture.', emoji: '💆' },
    { title: 'Hands & Arms', body: 'Make tight fists with both hands for 5 seconds... Now stretch your fingers wide and imagine all tension flowing right out of your fingertips.', emoji: '🤲' },
    { title: 'Abdomen & Back', body: 'Take a deep belly breath and hold for 4 seconds... Release a slow exhale and feel your spine gently sink into deep support.', emoji: '🌿' },
    { title: 'Legs & Feet', body: 'Point your toes forward and tighten your calves for 5 seconds... Release completely. Feel relaxing warmth travel from head to toe.', emoji: '👣' },
    { title: 'Inner Peace & Awareness', body: 'Rest in this stillness. You are safe, renewed, and grounded. Whenever life feels tense, return to this state with 3 mindful breaths.', emoji: '✨' }
  ],
  ar: [
    { title: 'الاستعداد والتنفس البداية', body: 'اجلس أو استلقِ في مكان هادئ ومريح. أرخِ كتفيك، وأغمض عينيك برفق. خذ 3 أنفاس عميقة وبطيئة من الأنف وأخرجها من الفم.', emoji: '🧘' },
    { title: 'شد وإرخاء الوجه والفك', body: 'شد عضلات وجهك وجبينك وأغلق عينيك بقوة لمدة 5 ثوانٍ... ثم أرخِها تماماً ودع كل انقباض يذوب. لاحظ شعور الخفة والراحة في ملامحك.', emoji: '😌' },
    { title: 'الكتفين والرقبة', body: 'ارفع كتفيك باتجاه أذنيك، واضغط بقوة خفيفة لمدة 5 ثوانٍ... والآن أنزلهما فجأة وأرخِ رقبتك تماماً. تنفس بهدوء مع نزول الحمل عن كاهلك.', emoji: '💆' },
    { title: 'اليدين والذراعين', body: 'اقبض يديك بقوة على شكل قبضة مشدودة لمدة 5 ثوانٍ... والآن افتح أصابعك بحرية ودع كل التوتر يتدفق خارجاً من أطراف أصابعك.', emoji: '🤲' },
    { title: 'البطن والظهر', body: 'خذ نفساً عميقاً في بطنك واحبسه 4 ثوانٍ مع شد خفيف... ثم أطلق زفيراً طويلاً وهادئاً وشاهد كيف يسترخي ظهرك ويغرق في المقعد براحة.', emoji: '🌿' },
    { title: 'القدمين والساقين', body: 'شد أصابع قدميك وساقيك للأمام لمدة 5 ثوانٍ... ثم أرخِهما بالكامل. استشعر دفء الاسترخاء يسري في جسمك بالكامل من الرأس حتى أصابع القدم.', emoji: '👣' },
    { title: 'السلام التام واليقظة', body: 'ابقَ في هذه السكينة لدقيقة واحدة. أنت آمن الآن وجسمك في حالة تجدد وتشافي. كلما شعرت بالضغط في يومك، يمكنك العودة لهذا الشعور بـ 3 أنفاس عميقة.', emoji: '✨' }
  ],
  darija: [
    { title: 'الاستعداد والتنفس البداية', body: 'جلس فـ بلاصة مريحة وهادية. رخي كتافك، سد عينيك شوية. خود 3 د النفسات عميقة وبطيئة من نيفك وخرجها من فمك.', emoji: '🧘' },
    { title: 'شد وإرخاء الوجه والفك', body: 'زير عضلات وجهك وجبهتك وسد عينيك مزيان 5 د الثواني... ودابا رخيهم فـ مرة وخلّي التوتر يذوب.', emoji: '😌' },
    { title: 'الكتاف والعنق', body: 'طلع كتافك جيهت ودنيك، زير شوية 5 ثواني... ودابا هبطهم فجأة ورخي عنقك كامل. حس بالحمل كينزل من عليك.', emoji: '💆' },
    { title: 'اليدين والدراعين', body: 'زير يديك بقوة على شكل قبضة 5 ثواني... ودابا سرح صباعك بحرية وخلي الضغط يخرج من صباع يديك.', emoji: '🤲' },
    { title: 'الكرش والظهر', body: 'عمر كرشك بالنفس مزيان حبسو 4 ثواني... وخرج الزفير بشوية وحس بظهرك كيرتاح ويغرق فـ الكرسي.', emoji: '🌿' },
    { title: 'الرجلين والساقين', body: 'زير صباع رجليك وساقيك للقدام 5 ثواني... ومن بعد رخيهم كاملين. حس بالراحة والسخونية كتمشى فـ جسمك كامل.', emoji: '👣' },
    { title: 'راحة تامة وصفاء', body: 'بقى فهاد الهدوء دقيقة. نتا دابا فأمان وجسمك كيرتاح. وقتما حسيتي بالستريس فـ نهارك، تقدر ترجع لهاد الإحساس بـ 3 د النفسات عميقة.', emoji: '✨' }
  ]
}

export default function StressRelief({ onXPEarned }) {
  const { addXP, recordExerciseSession } = useAuth()
  const { t, lang, dir } = useLanguage()
  const [currentStep, setCurrentStep] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  const steps = STEPS_BY_LANG[lang] || STEPS_BY_LANG.ar

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(s => s + 1)
    } else {
      setIsCompleted(true)
      addXP(20, 'stress_relief')
      recordExerciseSession('stress_relief', 300, 20, 'تمرين استرخاء العضلات التدريجي')
      onXPEarned?.(20)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1)
  }

  const step = steps[currentStep]

  return (
    <div className="glass p-6 md:p-8 rounded-[2rem] border border-white/5 space-y-6" dir={dir}>
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2 chip">
          <Heart size={14} /> {t('stress_tag', 'استرخاء العضلات التدريجي (PMR)')}
        </div>
        <h3 className="text-xl font-bold text-white">
          {t('stress_main_title', 'تفريغ التوتر الجسدي والذهني')}
        </h3>
        <p className="text-xs text-[var(--muted)] mt-1">
          {t('stress_main_desc', 'تقنية علمية معتمدة لإفراغ التوتر الجسدي وإعادة ضبط الجهاز العصبي')}
        </p>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center gap-1.5">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === currentStep ? 'w-8 bg-[#6ee7b7]' : i < currentStep ? 'w-3 bg-[#6ee7b7]/40' : 'w-3 bg-white/10'
            }`}
          />
        ))}
      </div>

      {/* Step Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="p-8 rounded-3xl bg-black/20 border border-white/5 text-center space-y-4"
        >
          <div className="text-5xl">{step.emoji}</div>
          <h4 className="font-bold text-lg text-white">{step.title}</h4>
          <p className="text-sm leading-relaxed text-[var(--subtle)] max-w-md mx-auto">
            {step.body}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div className="flex gap-3 justify-between items-center pt-2">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="btn-ghost px-4 py-2.5 text-xs font-bold disabled:opacity-20 flex items-center gap-1"
        >
          <ChevronRight size={16} />
          <span>{t('stress_prev', 'السابق')}</span>
        </button>

        <span className="text-xs text-[var(--muted)] font-semibold">
          {currentStep + 1} / {steps.length}
        </span>

        <button
          onClick={handleNext}
          className="btn-zen px-6 py-2.5 text-xs font-bold flex items-center gap-1 shadow-lg"
        >
          <span>{currentStep === steps.length - 1 ? t('stress_finish', 'إنهاء التمرين ✓') : t('stress_next', 'التالي')}</span>
          <ChevronLeft size={16} />
        </button>
      </div>

      {isCompleted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-2xl text-center bg-[#6ee7b7]/10 border border-[#6ee7b7]/30"
        >
          <CheckCircle2 size={24} className="mx-auto mb-1 text-[#6ee7b7]" />
          <h4 className="font-bold text-[#6ee7b7] text-sm">
            {t('stress_done_title', 'رائع جداً! جسمك دابا مسترخي')}
          </h4>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            {t('stress_done_sub', 'ربحتي +20 XP وأفرغتي شحنات التوتر من عضلاتك 🌱')}
          </p>
        </motion.div>
      )}
    </div>
  )
}
