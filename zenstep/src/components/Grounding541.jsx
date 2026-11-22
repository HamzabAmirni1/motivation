import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

const GROUNDING_DATA = {
  darija: {
    title: '🌍 تمرين التجذير (5-4-3-2-1)',
    subtitle: 'كيعاونك تهدى وترجع للحظة الحالية بكل صفاء',
    steps: [
      { n: 5, sense: 'شوف', verb: 'كتشوف', color: '#6ee7b7', emoji: '👀', hint: 'دور حداك وشوف 5 حوايج مختلفة' },
      { n: 4, sense: 'لمس', verb: 'كتلمس', color: '#7dd3fc', emoji: '✋', hint: 'لمس 4 سطوح مختلفة فالمكان' },
      { n: 3, sense: 'سمع', verb: 'كتسمع', color: '#a78bfa', emoji: '👂', hint: 'صفي ذهنك واسمع 3 أصوات' },
      { n: 2, sense: 'شم', verb: 'كتشم', color: '#fcd34d', emoji: '👃', hint: 'لاحظ 2 ديال الروائح حداك' },
      { n: 1, sense: 'دوق', verb: 'كتدوق', color: '#fda4af', emoji: '👅', hint: 'فكر في طعم حاجة واحدة دابا' },
    ],
    doneTitle: 'مزيان عليك! 🌿',
    doneSub: 'كملتي تمرين 5-4-3-2-1 بنجاح. راك أكثر هدوءاً وتركيزاً دابا.',
    againBtn: '← مرة أخرى',
    nextBtn: 'التالي ←',
    finishBtn: 'كملت التمرين ✓',
    inputPlaceholder: 'اكتب شي حاجة كتحس بيها...',
  },
  ar: {
    title: '🌍 تمرين التجذير الحسي (5-4-3-2-1)',
    subtitle: 'يساعدك على تهدئة التوتر والعودة للحظة الحالية بهدوء',
    steps: [
      { n: 5, sense: 'بصر', verb: 'تراها', color: '#6ee7b7', emoji: '👀', hint: 'انظر حولك ولاحظ 5 أشياء تراها بالعين' },
      { n: 4, sense: 'لمس', verb: 'تلمسها', color: '#7dd3fc', emoji: '✋', hint: 'المس 4 أسطح أو ملامس مختلفة من حولك' },
      { n: 3, sense: 'سمع', verb: 'تسمعها', color: '#a78bfa', emoji: '👂', hint: 'أصغِ باهتمام ولاحظ 3 أصوات في محيطك' },
      { n: 2, sense: 'شم', verb: 'تشمها', color: '#fcd34d', emoji: '👃', hint: 'لاحظ رائحتين مميزتين في الهواء' },
      { n: 1, sense: 'تذوق', verb: 'تتذوقه', color: '#fda4af', emoji: '👅', hint: 'ركز على مذاق واحد في فمك أو رشفة ماء' },
    ],
    doneTitle: 'أحسنت صنعاً! 🌿',
    doneSub: 'أكملت تمرين 5-4-3-2-1 بنجاح. جهازك العصبي في حالة توازن الآن.',
    againBtn: '← تكرار التمرين',
    nextBtn: 'التالي ←',
    finishBtn: 'إكمال التمرين ✓',
    inputPlaceholder: 'اكتب ما تلاحظه هنا...',
  },
  fr: {
    title: '🌍 Technique d\'ancrage (5-4-3-2-1)',
    subtitle: 'Vous aide à apaiser l\'anxiété et revenir au moment présent',
    steps: [
      { n: 5, sense: 'Vue', verb: 'que vous voyez', color: '#6ee7b7', emoji: '👀', hint: 'Regardez autour de vous et notez 5 objets distincts' },
      { n: 4, sense: 'Toucher', verb: 'que vous touchez', color: '#7dd3fc', emoji: '✋', hint: 'Touchez 4 textures ou surfaces différentes' },
      { n: 3, sense: 'Ouïe', verb: 'que vous entendez', color: '#a78bfa', emoji: '👂', hint: 'Écoutez attentivement et identifiez 3 sons' },
      { n: 2, sense: 'Odorat', verb: 'que vous sentez', color: '#fcd34d', emoji: '👃', hint: 'Remarquez 2 odeurs dans votre environnement' },
      { n: 1, sense: 'Goût', verb: 'que vous goûtez', color: '#fda4af', emoji: '👅', hint: 'Concentre-vous sur une saveur en bouche ou de l\'eau' },
    ],
    doneTitle: 'Bravo ! 🌿',
    doneSub: 'Vous avez complété l\'ancrage 5-4-3-2-1 avec succès. Vous êtes plus calme et présent.',
    againBtn: '← Recommencer',
    nextBtn: 'Suivant →',
    finishBtn: 'Terminer l\'exercice ✓',
    inputPlaceholder: 'Écrivez ce que vous observez...',
  },
  en: {
    title: '🌍 5-4-3-2-1 Sensory Grounding',
    subtitle: 'Helps calm rapid thoughts and anchor your mind in the present moment',
    steps: [
      { n: 5, sense: 'See', verb: 'you see', color: '#6ee7b7', emoji: '👀', hint: 'Look around you and observe 5 distinct objects' },
      { n: 4, sense: 'Touch', verb: 'you feel', color: '#7dd3fc', emoji: '✋', hint: 'Touch 4 different surfaces or textures nearby' },
      { n: 3, sense: 'Hear', verb: 'you hear', color: '#a78bfa', emoji: '👂', hint: 'Listen closely and notice 3 ambient sounds' },
      { n: 2, sense: 'Smell', verb: 'you smell', color: '#fcd34d', emoji: '👃', hint: 'Notice 2 distinct scents in the air' },
      { n: 1, sense: 'Taste', verb: 'you taste', color: '#fda4af', emoji: '👅', hint: 'Focus on 1 taste in your mouth or take a sip of water' },
    ],
    doneTitle: 'Well done! 🌿',
    doneSub: 'You successfully completed the 5-4-3-2-1 grounding exercise.',
    againBtn: '← Repeat Exercise',
    nextBtn: 'Next →',
    finishBtn: 'Finish Exercise ✓',
    inputPlaceholder: 'Type what you observe...',
  }
}

export default function Grounding541({ onXPEarned }) {
  const { addXP } = useAuth()
  const { lang, dir } = useLanguage()
  const content = GROUNDING_DATA[lang] || GROUNDING_DATA.ar

  const [step, setStep] = useState(0)
  const [inputs, setInputs] = useState(Array(5).fill().map(() => []))
  const [current, setCurrent] = useState('')
  const [done, setDone] = useState(false)
  const [earned, setEarned] = useState(false)

  const s = content.steps[step]

  function addItem() {
    if (!current.trim()) return
    const updated = inputs.map((arr, i) => i === step ? [...arr, current.trim()] : arr)
    setInputs(updated)
    setCurrent('')
  }

  function nextStep() {
    if (step < content.steps.length - 1) {
      setStep(sIdx => sIdx + 1)
    } else {
      setDone(true)
      if (!earned) {
        addXP(20)
        onXPEarned?.(20)
        setEarned(true)
      }
    }
  }

  function reset() {
    setStep(0)
    setInputs(Array(5).fill().map(() => []))
    setCurrent('')
    setDone(false)
    setEarned(false)
  }

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass p-6 text-center space-y-3" dir={dir}>
        <div className="text-5xl mb-2">🌿</div>
        <h3 className="font-bold text-xl gradient-text">{content.doneTitle}</h3>
        <p style={{ color: 'var(--subtle)' }} className="text-sm max-w-md mx-auto">{content.doneSub}</p>
        {earned && <div className="chip mb-2 mx-auto w-fit">+20 XP 🎉</div>}
        <button onClick={reset} className="btn-ghost">{content.againBtn}</button>
      </motion.div>
    )
  }

  return (
    <div className="glass p-6 md:p-8 rounded-[2rem] border border-white/5 space-y-4" dir={dir}>
      <div>
        <h3 className="font-bold text-lg text-white mb-1">{content.title}</h3>
        <p className="text-xs text-[var(--muted)]">{content.subtitle}</p>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2 mb-4 justify-center">
        {content.steps.map((st, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <motion.div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
              animate={{ scale: i === step ? 1.15 : 1 }}
              style={{
                background: i < step ? `${st.color}33` : i === step ? st.color : 'rgba(255,255,255,0.06)',
                color: i === step ? '#0a0f1a' : i < step ? st.color : 'var(--muted)',
                border: i === step ? `2px solid ${st.color}` : 'none'
              }}
            >
              {i < step ? '✓' : st.n}
            </motion.div>
            <span className="text-[10px] font-semibold" style={{ color: i === step ? st.color : 'var(--muted)' }}>
              {st.sense}
            </span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: dir === 'rtl' ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }}>
          <div className="p-5 rounded-2xl mb-4 text-center" style={{ background: `${s.color}11`, border: `1px solid ${s.color}33` }}>
            <span className="text-4xl block mb-2">{s.emoji}</span>
            <p className="font-bold text-base" style={{ color: s.color }}>{s.n} {s.verb}</p>
            <p className="text-xs mt-1 text-[var(--subtle)]">{s.hint}</p>
          </div>

          {/* Items entered */}
          <div className="flex flex-wrap gap-2 mb-3 min-h-[36px]">
            {inputs[step].map((item, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: `${s.color}22`, color: s.color, border: `1px solid ${s.color}44` }}
              >
                {item}
              </motion.span>
            ))}
          </div>

          {inputs[step].length < s.n && (
            <div className="flex gap-2 mb-4">
              <input
                className="zen-input text-xs"
                placeholder={`${s.hint}... (${inputs[step].length + 1}/${s.n})`}
                value={current}
                onChange={e => setCurrent(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addItem()}
              />
              <button onClick={addItem} className="btn-zen px-4 font-bold">+</button>
            </div>
          )}

          <button
            onClick={nextStep}
            disabled={inputs[step].length < s.n}
            className="btn-zen w-full py-3 font-bold text-xs disabled:opacity-40"
          >
            {step === content.steps.length - 1 ? content.finishBtn : content.nextBtn}
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
