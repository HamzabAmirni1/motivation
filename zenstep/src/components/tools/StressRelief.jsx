import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Sparkles, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const RELAXATION_STEPS = [
  {
    title: 'الاستعداد والتنفس البداية',
    body: 'اجلس أو استلقِ في مكان هادئ ومريح. أرخِ كتفيك، وأغمض عينيك برفق. خذ 3 أنفاس عميقة وبطيئة من الأنف وأخرجها من الفم.',
    emoji: '🧘'
  },
  {
    title: 'شد وإرخاء الوجه والفك',
    body: 'شد عضلات وجهك وجبينك وأغلق عينيك بقوة لمدة 5 ثوانٍ... ثم أرخِها تماماً ودع كل انقباض يذوب. لاحظ شعور الخفة والراحة في ملامحك.',
    emoji: '😌'
  },
  {
    title: 'الكتفين والرقبة',
    body: 'ارفع كتفيك باتجاه أذنيك، واضغط بقوة خفيفة لمدة 5 ثوانٍ... والآن أنزلهما فجأة وأرخِ رقبتك تماماً. تنفس بهدوء مع نزول الحمل عن كاهلك.',
    emoji: '💆'
  },
  {
    title: 'اليدين والذراعين',
    body: 'اقبض يديك بقوة على شكل قبضة مشدودة لمدة 5 ثوانٍ... والآن افتح أصابعك بحرية ودع كل التوتر يتدفق خارجاً من أطراف أصابعك.',
    emoji: '🤲'
  },
  {
    title: 'البطن والظهر',
    body: 'خذ نفساً عميقاً في بطنك واحبسه 4 ثوانٍ مع شد خفيف... ثم أطلق زفيراً طويلاً وهادئاً وشاهد كيف يسترخي ظهرك ويغرق في المقعد براحة.',
    emoji: '🌿'
  },
  {
    title: 'القدمين والساقين',
    body: 'شد أصابع قدميك وساقيك للأمام لمدة 5 ثوانٍ... ثم أرخِهما بالكامل. استشعر دفء الاسترخاء يسري في جسمك بالكامل من الرأس حتى أصابع القدم.',
    emoji: '👣'
  },
  {
    title: 'السلام التام واليقظة',
    body: 'ابقَ في هذه السكينة لدقيقة واحدة. أنت آمن الآن وجسمك في حالة تجدد وتشافي. كلما شعرت بالضغط في يومك، يمكنك العودة لهذا الشعور بـ 3 أنفاس عميقة.',
    emoji: '✨'
  }
];

export default function StressRelief({ onXPEarned }) {
  const { addXP, recordExerciseSession } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  const handleNext = () => {
    if (currentStep < RELAXATION_STEPS.length - 1) {
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

  const step = RELAXATION_STEPS[currentStep]

  return (
    <div className="glass p-6 md:p-8 rounded-[2rem] border border-white/5 space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2 chip">
          <Heart size={14} /> تفريغ التوتر العضلي (PMR)
        </div>
        <h3 className="text-xl font-bold text-white">استرخاء العضلات التدريجي</h3>
        <p className="text-xs text-[var(--muted)] mt-1">
          تقنية علمية معتمدة لإفراغ التوتر الجسدي وإعادة ضبط الجهاز العصبي
        </p>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center gap-1.5">
        {RELAXATION_STEPS.map((_, i) => (
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
          <span>السابق</span>
        </button>

        <span className="text-xs text-[var(--muted)] font-semibold">
          الخطوة {currentStep + 1} من {RELAXATION_STEPS.length}
        </span>

        <button
          onClick={handleNext}
          className="btn-zen px-6 py-2.5 text-xs font-bold flex items-center gap-1 shadow-lg"
        >
          <span>{currentStep === RELAXATION_STEPS.length - 1 ? 'إنهاء التمرين ✓' : 'التالي'}</span>
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
          <h4 className="font-bold text-[#6ee7b7] text-sm">أحسنت! أكملت جلسة الاسترخاء بنجاح</h4>
          <p className="text-xs text-[var(--muted)] mt-0.5">كسبت +20 XP لجسم وعقل أكثر هدوءاً 🌱</p>
        </motion.div>
      )}
    </div>
  )
}
