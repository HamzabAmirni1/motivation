import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, ChevronRight, ChevronLeft, Sparkles, BookOpen } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

const CBT_DATA = {
  darija: {
    badge: 'العلاج المعرفي السلوكي (CBT)',
    title: 'قلب وفحص الأفكار (CBT Flip)',
    subtitle: 'فحص الأفكار السلبية والمقلقة بكل موضوعية واستبدالها بنظرة مريحة ومتوازنة',
    step1_title: 'الخطوة 1: شنو هي الفكرة السلبية لي شاغلة بالك دابا؟',
    step1_sub: 'اكتب الفكرة التلقائية كيما هي بلا زواق وبلا حكم على راسك.',
    step1_ph: 'مثال: أكيد غادي نخسر فالمشروع، ولا حتى واحد ما مسوق لمجهودي...',
    step2_title: 'الخطوة 2: شنو هو الإحساس ولا الشعور لي مرافقه هاد الفكرة؟',
    step2_sub: 'اختار ولا اكتب الإحساس لي كتحس بيه فقلبك بسبب هاد الفكرة.',
    step2_ph: 'أو اكتب إحساسك بكلماتك الخاصة...',
    step3_title: 'الخطوة 3: شنو هي الأدلة الواقعية الحقيقية؟',
    step3_sub: 'واش كاين دليل قاطع بنسبة 100% كيتبت هاد الفكرة؟ ولا كاين أدلة كتعارضها؟',
    step3_ph: 'مثال: ديجا نجحت فمواقف صعيبة قبل، وتدربت مزيان، القلق ما كيعنيش حتمية الفشل...',
    step4_title: 'الخطوة 4: كيفاش يشوف شي صاحب كيبغيك هاد الموقف؟',
    step4_sub: 'شنو هو التفسير البديل المنطقي لي يقدر يقترحه شخص عزيز عليك كيشوف بحياد؟',
    step4_ph: 'مثال: هادا مجرد تحدي عادي كايدوز منو أي واحد، ماشي نهاية العالم ولا حكم عليا...',
    step5_title: 'الخطوة 5: صاوب دابا فكرة متوازنة ومنصفة لراسك',
    step5_sub: 'اكتب خلاصة واقعية كتعترف بصعوبة اللحظة بلا ما تضخم العواقب.',
    step5_ph: 'مثال: غادي ندير جهدي كامل خطوة بخطوة، والنتيجة بسلامتها ونرضى بيها بكل هدوء...',
    emotions: ['قلقان 😟', 'حزين 😢', 'محبط 😔', 'معصب 😡', 'خايف 😨', 'حشمان 😳', 'مشوش 🌀'],
    prev: 'السابق',
    next: 'التالي',
    finish: 'حفظ الجلسة (+25 XP)',
    doneTitle: 'مزيان عليك! بدلتي زاوية الرؤية بوعي وذكاء',
    doneSub: 'ربحتي +25 XP لتفكيرك المرن والهادئ 🌱',
    again: 'فحص فكرة أخرى',
  },
  ar: {
    badge: 'العلاج المعرفي السلوكي (CBT)',
    title: 'قلب وفحص الأفكار (Cognitive Reframing)',
    subtitle: 'فحص موضوعي للأفكار السلبية المشوشة واستبدالها بنظرة أكثر توازناً وواقعية',
    step1_title: 'الخطوة 1: ما هي الفكرة السلبية أو المقلقة التي تراودك؟',
    step1_sub: 'اكتب الفكرة التلقائية كما تخطر في عقلك الآن دون تجميل.',
    step1_ph: 'مثال: سأفشل بالتأكيد في الامتحان، أو لن يقدر أحد مجهودي...',
    step2_title: 'الخطوة 2: ما هو الشعور المرافق لهذه الفكرة؟',
    step2_sub: 'اختر أو اكتب الشعور الذي تولد في صدرك بسبب هذه الفكرة.',
    step2_ph: 'أو اكتب شعورك بكلماتك الخاصة...',
    step3_title: 'الخطوة 3: ما هي الأدلة الواقعية؟',
    step3_sub: 'هل توجد حقائق مؤكدة تثبت صحة هذه الفكرة بنسبة 100%؟ أم هناك شواهد تعارضها؟',
    step3_ph: 'مثال: لقد نجحت سابقاً في مواقف صعبة، وتدربت جيداً، القلق لا يعني حتمية الفشل...',
    step4_title: 'الخطوة 4: ماذا لو نظر صديق حكيم لهذا الموقف؟',
    step4_sub: 'ما هو التفسير الآخر البديل والمحتمل الذي قد يقترحه شخص يحبك ويرى الأمور بحياد؟',
    step4_ph: 'مثال: هذا الموقف مجرد تحدٍ طبيعي يمر به الجميع، وليس حكماً نهائياً على قدراتي...',
    step5_title: 'الخطوة 5: صغ الآن فكرة متوازنة ومنصفة لنفسك',
    step5_sub: 'اكتب خلاصة متوازنة تعترف بصعوبة اللحظة دون تضخيم العواقب.',
    step5_ph: 'مثال: سأبذل ما في وسعي خطوة بخطوة، وأتقبل النتائج بكل هدوء وثقة...',
    emotions: ['قلق 😟', 'حزن 😢', 'إحباط 😔', 'غضب 😡', 'خوف 😨', 'خجل 😳', 'ارتباك 🌀'],
    prev: 'السابق',
    next: 'التالي',
    finish: 'حفظ الجلسة (+25 XP)',
    doneTitle: 'أحسنت! أعدت صياغة فكرتك بتوازن واقتدار',
    doneSub: 'كسبت +25 XP لتفكيرك الواعي والمرن 🌱',
    again: 'فحص فكرة أخرى',
  },
  fr: {
    badge: 'Thérapie Cognitive et Comportementale (TCC)',
    title: 'Recadrage Cognitif (CBT Flip)',
    subtitle: 'Examinez objectivement vos pensées automatiques pour adopter une perspective équilibrée',
    step1_title: 'Étape 1 : Quelle est la pensée négative ou inquiétante qui vous traverse l\'esprit ?',
    step1_sub: 'Écrivez votre pensée brute telle qu\'elle apparaît, sans filtre.',
    step1_ph: 'Exemple : Je vais sûrement échouer, ou personne n\'apprécie mes efforts...',
    step2_title: 'Étape 2 : Quelle est l\'émotion associée à cette pensée ?',
    step2_sub: 'Choisissez ou décrivez ce que vous ressentez au fond de vous.',
    step2_ph: 'Ou écrivez votre émotion avec vos propres mots...',
    step3_title: 'Étape 3 : Quelles sont les preuves objectives ?',
    step3_sub: 'Y a-t-il des faits 100% certains qui prouvent cette pensée ? Y a-t-il des contre-exemples ?',
    step3_ph: 'Exemple : J\'ai déjà surmonté des défis par le passé, être anxieux ne signifie pas échouer...',
    step4_title: 'Étape 4 : Quel serait l\'avis d\'un ami bienveillant ?',
    step4_sub: 'Quelle interprétation alternative proposerait une personne qui vous apprécie avec recul ?',
    step4_ph: 'Exemple : C\'est un défi normal auquel tout le monde fait face, cela ne définit pas ma valeur...',
    step5_title: 'Étape 5 : Formulez une pensée équilibrée et juste',
    step5_sub: 'Rédigez une synthèse réaliste qui reconnaît la difficulté sans dramatiser.',
    step5_ph: 'Exemple : Je ferai de mon mieux pas à pas, et j\'accueillerai les résultats avec sérénité...',
    emotions: ['Anxieux 😟', 'Triste 😢', 'Frustré 😔', 'En colère 😡', 'Effrayé 😨', 'Gêné 😳', 'Confus 🌀'],
    prev: 'Précédent',
    next: 'Suivant',
    finish: 'Enregistrer la séance (+25 XP)',
    doneTitle: 'Félicitations ! Vous avez recadré votre pensée avec sagesse',
    doneSub: 'Vous avez gagné +25 XP pour votre lucidité et votre souplesse d\'esprit 🌱',
    again: 'Examiner une autre pensée',
  },
  en: {
    badge: 'Cognitive Behavioral Therapy (CBT)',
    title: 'Cognitive Reframing (CBT Flip)',
    subtitle: 'Objectively examine negative thought spirals and reframe them into balanced reality',
    step1_title: 'Step 1: What negative or stressful thought is on your mind?',
    step1_sub: 'Write down your automatic thought exactly as it comes, without judgment.',
    step1_ph: 'Example: I will definitely fail this, or nobody truly appreciates my work...',
    step2_title: 'Step 2: What emotion accompanies this thought?',
    step2_sub: 'Select or write down the emotion felt in your chest or mind.',
    step2_ph: 'Or describe your emotion in your own words...',
    step3_title: 'Step 3: What is the factual evidence?',
    step3_sub: 'Are there 100% proven facts supporting this thought? Are there contrary facts?',
    step3_ph: 'Example: I have succeeded in tough spots before, feeling anxious is not proof of failure...',
    step4_title: 'Step 4: How would a compassionate friend see this?',
    step4_sub: 'What alternative perspective would someone who cares about you offer neutrally?',
    step4_ph: 'Example: This is a normal challenge anyone would face, it does not define my worth...',
    step5_title: 'Step 5: Formulate a balanced, compassionate thought',
    step5_sub: 'Write a realistic conclusion that acknowledges the challenge without catastrophic thinking.',
    step5_ph: 'Example: I will do my best one step at a time and trust myself with whatever comes...',
    emotions: ['Anxious 😟', 'Sad 😢', 'Frustrated 😔', 'Angry 😡', 'Afraid 😨', 'Ashamed 😳', 'Confused 🌀'],
    prev: 'Previous',
    next: 'Next',
    finish: 'Save Session (+25 XP)',
    doneTitle: 'Well done! You successfully reframed your thought',
    doneSub: 'You earned +25 XP for your mindful, flexible thinking 🌱',
    again: 'Examine another thought',
  }
}

export default function CBTFlip({ onXPEarned }) {
  const { addXP, recordExerciseSession } = useAuth()
  const { lang, dir } = useLanguage()
  const c = CBT_DATA[lang] || CBT_DATA.ar

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
    recordExerciseSession('cbt', 180, 25, `CBT: ${thought.slice(0, 30)}...`)
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
    <div className="glass p-6 md:p-8 rounded-[2rem] border border-white/5 space-y-6" dir={dir}>
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2 chip-purple">
          <Sparkles size={14} /> {c.badge}
        </div>
        <h3 className="text-xl font-bold text-white">{c.title}</h3>
        <p className="text-xs text-[var(--muted)] mt-1 max-w-lg mx-auto leading-relaxed">
          {c.subtitle}
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
          <motion.div initial={{ opacity: 0, x: dir === 'rtl' ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
            <h4 className="font-bold text-sm text-white">{c.step1_title}</h4>
            <p className="text-xs text-[var(--muted)]">{c.step1_sub}</p>
            <textarea
              rows={3}
              value={thought}
              onChange={e => setThought(e.target.value)}
              placeholder={c.step1_ph}
              className="zen-input resize-none text-xs"
            />
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: dir === 'rtl' ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
            <h4 className="font-bold text-sm text-white">{c.step2_title}</h4>
            <p className="text-xs text-[var(--muted)]">{c.step2_sub}</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {c.emotions.map(em => (
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
              placeholder={c.step2_ph}
              className="zen-input text-xs"
            />
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: dir === 'rtl' ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
            <h4 className="font-bold text-sm text-white">{c.step3_title}</h4>
            <p className="text-xs text-[var(--muted)]">{c.step3_sub}</p>
            <textarea
              rows={3}
              value={evidence}
              onChange={e => setEvidence(e.target.value)}
              placeholder={c.step3_ph}
              className="zen-input resize-none text-xs"
            />
          </motion.div>
        )}

        {step === 4 && (
          <motion.div initial={{ opacity: 0, x: dir === 'rtl' ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
            <h4 className="font-bold text-sm text-white">{c.step4_title}</h4>
            <p className="text-xs text-[var(--muted)]">{c.step4_sub}</p>
            <textarea
              rows={3}
              value={alternateView}
              onChange={e => setAlternateView(e.target.value)}
              placeholder={c.step4_ph}
              className="zen-input resize-none text-xs"
            />
          </motion.div>
        )}

        {step === 5 && (
          <motion.div initial={{ opacity: 0, x: dir === 'rtl' ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
            <h4 className="font-bold text-sm text-white">{c.step5_title}</h4>
            <p className="text-xs text-[var(--muted)]">{c.step5_sub}</p>
            <textarea
              rows={3}
              value={balancedThought}
              onChange={e => setBalancedThought(e.target.value)}
              placeholder={c.step5_ph}
              className="zen-input resize-none text-xs"
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
          <ChevronRight size={16} className={dir === 'ltr' ? 'rotate-180' : ''} />
          <span>{c.prev}</span>
        </button>

        {step < 5 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={(step === 1 && !thought.trim()) || (step === 2 && !emotion.trim())}
            className="btn-zen px-6 py-2.5 text-xs font-bold flex items-center gap-1 disabled:opacity-40"
          >
            <span>{c.next}</span>
            <ChevronLeft size={16} className={dir === 'ltr' ? 'rotate-180' : ''} />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            disabled={!balancedThought.trim()}
            className="btn-zen px-6 py-2.5 text-xs font-bold flex items-center gap-1 disabled:opacity-40 shadow-lg"
          >
            <span>{c.finish}</span>
            <CheckCircle2 size={16} />
          </button>
        )}
      </div>

      {isCompleted && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-2xl text-center bg-[#6ee7b7]/10 border border-[#6ee7b7]/30">
          <CheckCircle2 size={24} className="mx-auto mb-1 text-[#6ee7b7]" />
          <h4 className="font-bold text-[#6ee7b7] text-sm">{c.doneTitle}</h4>
          <p className="text-xs text-[var(--muted)] mt-0.5">{c.doneSub}</p>
          <button onClick={resetAll} className="btn-ghost text-xs mt-3 px-4 py-1.5">
            {c.again}
          </button>
        </motion.div>
      )}
    </div>
  )
}
