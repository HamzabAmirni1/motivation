import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, ChevronRight, ChevronLeft, Sparkles, BookOpen } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const EMOTIONS = ['قلق 😟', 'حزن 😢', 'إحباط 😔', 'غضب 😡', 'خوف 😨', 'خجل 😳', 'ارتباك 🌀'];

export default function CBTFlip({ onXPEarned }) {
  const { addXP, recordExerciseSession } = useAuth()
  const [step, setStep] = useState(1)
  const [thought, setThought] = useState('')
  const [emotion, setEmotion] = useState('')
  const [evidence, setEvidence] = useState('')
  const [alternateView, setAlternateView] = useState('')
  const [balancedThought, setBalancedThought] = useState('')
  const [isCompleted, setIsCompleted] = useState(false)

  const handleFinish = () => {
    setIsCompleted(true)
    addXP(25, 'cbt')
    recordExerciseSession('cbt', 180, 25, `فكرة: ${thought.slice(0, 30)}... | البديل: ${balancedThought.slice(0, 30)}...`)
    onXPEarned?.(25)
  }

  const resetAll = () => {
    setStep(1)
    setThought('')
    setEmotion('')
    setEvidence('')
    setAlternateView('')
    setBalancedThought('')
    setIsCompleted(false)
  }

  return (
    <div className="glass p-6 md:p-8 rounded-[2rem] border border-white/5 space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2 chip-purple">
          <Sparkles size={14} /> العلاج المعرفي السلوكي (CBT)
        </div>
        <h3 className="text-xl font-bold text-white">قلب وفحص الأفكار (Cognitive Reframing)</h3>
        <p className="text-xs text-[var(--muted)] mt-1">
          فحص موضوعي للأفكار السلبية المشوشة واستبدالها بنظرة أكثر توازناً وواقعية
        </p>
      </div>

      {/* 5-Step Progress Bar */}
      <div className="flex justify-between items-center max-w-sm mx-auto">
        {[1, 2, 3, 4, 5].map(num => (
          <div key={num} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                num < step ? 'bg-[#6ee7b7] text-black' : num === step ? 'bg-[#a78bfa] text-white shadow-lg' : 'bg-white/5 text-[var(--muted)]'
              }`}
            >
              {num < step ? '✓' : num}
            </div>
            {num < 5 && (
              <div className={`h-0.5 w-6 sm:w-10 ${num < step ? 'bg-[#6ee7b7]' : 'bg-white/10'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="min-h-[220px] flex flex-col justify-center">
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
            <h4 className="font-bold text-sm text-white">الخطوة 1: ما هي الفكرة السلبية أو المقلقة التي تراودك؟</h4>
            <p className="text-xs text-[var(--muted)]">اكتب الفكرة التلقائية كما تخطر في عقلك الآن دون تجميل.</p>
            <textarea
              rows={3}
              value={thought}
              onChange={e => setThought(e.target.value)}
              placeholder="مثال: سأفشل بالتأكيد في الامتحان، أو لن يقدر أحد مجهودي..."
              className="zen-input resize-none"
            />
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
            <h4 className="font-bold text-sm text-white">الخطوة 2: ما هو الشعور المرافق لهذه الفكرة؟</h4>
            <p className="text-xs text-[var(--muted)]">اختر أو اكتب الشعور الذي تولد في صدرك بسبب هذه الفكرة.</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {EMOTIONS.map(em => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setEmotion(em)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    emotion === em ? 'bg-[#a78bfa] text-white shadow-md' : 'bg-white/5 text-[var(--subtle)] hover:bg-white/10'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={emotion}
              onChange={e => setEmotion(e.target.value)}
              placeholder="أو اكتب شعورك بكلماتك..."
              className="zen-input text-xs"
            />
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
            <h4 className="font-bold text-sm text-white">الخطوة 3: ما هي الأدلة الواقعية؟</h4>
            <p className="text-xs text-[var(--muted)]">هل توجد حقائق مؤكدة تثبت صحة هذه الفكرة بنسبة 100%؟ أم هناك شواهد تعارضها؟</p>
            <textarea
              rows={3}
              value={evidence}
              onChange={e => setEvidence(e.target.value)}
              placeholder="مثال: لقد نجحت سابقاً في مواقف صعبة، وتدربت جيداً، القلق لا يعني حتمية الفشل..."
              className="zen-input resize-none"
            />
          </motion.div>
        )}

        {step === 4 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
            <h4 className="font-bold text-sm text-white">الخطوة 4: ماذا لو نظر صديق حكيم لهذا الموقف؟</h4>
            <p className="text-xs text-[var(--muted)]">ما هو التفسير الآخر البديل والمحتمل الذي قد يقترحه شخص يحبك ويرى الأمور بحياد؟</p>
            <textarea
              rows={3}
              value={alternateView}
              onChange={e => setAlternateView(e.target.value)}
              placeholder="مثال: هذا الموقف مجرد تحدٍ طبيعي يمر به الجميع، وليس حكماً نهائياً على قدراتي..."
              className="zen-input resize-none"
            />
          </motion.div>
        )}

        {step === 5 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
            <h4 className="font-bold text-sm text-white">الخطوة 5: صغ الآن فكرة متوازنة ومنصفة لنفسك</h4>
            <p className="text-xs text-[var(--muted)]">اكتب خلاصة متوازنة تعترف بصعوبة اللحظة دون تضخيم العواقب.</p>
            <textarea
              rows={3}
              value={balancedThought}
              onChange={e => setBalancedThought(e.target.value)}
              placeholder="مثال: سأبذل ما في وسعي خطوة بخطوة، وأتقبل النتائج بكل هدوء وثقة..."
              className="zen-input resize-none"
            />
          </motion.div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-4 border-t border-white/5">
        <button
          onClick={() => setStep(s => Math.max(1, s - 1))}
          disabled={step === 1}
          className="btn-ghost px-4 py-2.5 text-xs font-bold disabled:opacity-20 flex items-center gap-1"
        >
          <ChevronRight size={16} />
          <span>السابق</span>
        </button>

        {step < 5 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={(step === 1 && !thought.trim()) || (step === 2 && !emotion.trim())}
            className="btn-zen px-6 py-2.5 text-xs font-bold flex items-center gap-1 disabled:opacity-40"
          >
            <span>التالي</span>
            <ChevronLeft size={16} />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            disabled={!balancedThought.trim()}
            className="btn-zen px-6 py-2.5 text-xs font-bold flex items-center gap-1 disabled:opacity-40 shadow-lg"
          >
            <span>حفظ الجلسة (+25 XP)</span>
            <CheckCircle2 size={16} />
          </button>
        )}
      </div>

      {isCompleted && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-2xl text-center bg-[#6ee7b7]/10 border border-[#6ee7b7]/30">
          <CheckCircle2 size={24} className="mx-auto mb-1 text-[#6ee7b7]" />
          <h4 className="font-bold text-[#6ee7b7] text-sm">أحسنت! أعدت صياغة فكرتك بتوازن واقتدار</h4>
          <p className="text-xs text-[var(--muted)] mt-0.5">كسبت +25 XP لتفكيرك الواعي والمرن 🌱</p>
          <button onClick={resetAll} className="btn-ghost text-xs mt-3 px-4 py-1.5">
            فحص فكرة أخرى
          </button>
        </motion.div>
      )}
    </div>
  )
}
