import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { calculateLevel } from '../lib/gamification'

// SVG tree that evolves through 10 levels
function TreeSVG({ level }) {
  const lv = Math.min(10, Math.max(1, level))

  const trunkH  = 40 + lv * 8
  const canR1   = 20 + lv * 9
  const canR2   = lv >= 3 ? 15 + lv * 7 : 0
  const canR3   = lv >= 5 ? 12 + lv * 5 : 0
  const flowers = lv >= 7 ? Math.min(8, lv - 4) : 0
  const glow    = lv >= 8

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full" style={{ maxWidth:240 }}>
      <defs>
        <radialGradient id="canGrad1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.7"/>
        </radialGradient>
        <radialGradient id="canGrad2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#059669" stopOpacity="0.8"/>
        </radialGradient>
        <radialGradient id="canGrad3" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a7f3d0" stopOpacity="1"/>
          <stop offset="100%" stopColor="#6ee7b7" stopOpacity="0.9"/>
        </radialGradient>
        {glow && (
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        )}
      </defs>

      {/* Ground shadow */}
      <ellipse cx="150" cy="285" rx="55" ry="7" fill="rgba(110,231,183,0.12)"/>

      {/* Trunk */}
      <motion.path
        d={`M143 285 Q141 ${285-trunkH*0.6} 146 ${285-trunkH} Q150 ${280-trunkH} 154 ${285-trunkH} Q159 ${285-trunkH*0.6} 157 285 Z`}
        fill="#7c3d12"
        initial={{ scaleY:0 }} animate={{ scaleY:1 }}
        style={{ transformOrigin:'center bottom' }}
        transition={{ duration:0.8, ease:'easeOut' }}
      />

      {/* Canopy Layer 1 (bottom, largest) */}
      <motion.ellipse cx="150" cy={285 - trunkH - canR1*0.5}
        rx={canR1} ry={canR1 * 0.75}
        fill="url(#canGrad1)"
        filter={glow ? 'url(#glow)' : undefined}
        initial={{ scale:0, opacity:0 }} animate={{ scale:1, opacity:1 }}
        transition={{ duration:0.7, delay:0.3, ease:'backOut' }}
        style={{ transformOrigin:'150px center' }}
      />
      {/* Canopy Layer 2 */}
      {canR2 > 0 && (
        <motion.ellipse cx="150" cy={285 - trunkH - canR1 - canR2*0.3}
          rx={canR2} ry={canR2 * 0.8}
          fill="url(#canGrad2)"
          filter={glow ? 'url(#glow)' : undefined}
          initial={{ scale:0, opacity:0 }} animate={{ scale:1, opacity:1 }}
          transition={{ duration:0.7, delay:0.5, ease:'backOut' }}
          style={{ transformOrigin:'150px center' }}
        />
      )}
      {/* Canopy Layer 3 (top) */}
      {canR3 > 0 && (
        <motion.ellipse cx="150" cy={285 - trunkH - canR1 - canR2*0.6 - canR3*0.4}
          rx={canR3} ry={canR3 * 0.85}
          fill="url(#canGrad3)"
          filter={glow ? 'url(#glow)' : undefined}
          initial={{ scale:0, opacity:0 }} animate={{ scale:1, opacity:1 }}
          transition={{ duration:0.7, delay:0.7, ease:'backOut' }}
          style={{ transformOrigin:'150px center' }}
        />
      )}

      {/* Flowers */}
      {Array.from({ length: flowers }).map((_, i) => {
        const angle  = (i / flowers) * Math.PI * 2
        const radius = canR1 * 0.7
        const cx2    = 150 + Math.cos(angle) * radius
        const cy2    = (285 - trunkH - canR1 * 0.5) + Math.sin(angle) * radius * 0.5
        return (
          <motion.circle key={i} cx={cx2} cy={cy2} r={5}
            fill={i % 2 === 0 ? '#fda4af' : '#fcd34d'}
            initial={{ scale:0, opacity:0 }} animate={{ scale:1, opacity:1 }}
            transition={{ duration:0.4, delay: 0.9 + i * 0.08 }}
          />
        )
      })}

      {/* Level badge */}
      <motion.g initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1 }}>
        <circle cx="256" cy="30" r="20" fill="rgba(110,231,183,0.15)" stroke="#6ee7b7" strokeWidth="1"/>
        <text x="256" y="35" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#6ee7b7">Lv{lv}</text>
      </motion.g>
    </svg>
  )
}

export default function GrowthTree() {
  const { profile } = useAuth()
  const xp  = profile?.xp || 0
  const lv  = calculateLevel(xp)

  return (
    <div className="glass p-5 mb-5 flex flex-col items-center">
      <h2 className="font-bold text-lg mb-1 w-full" style={{ color:'var(--text)' }}>🌳 شجرة النمو ديالك</h2>
      <p className="text-xs mb-4 w-full" style={{ color:'var(--muted)' }}>كل ما كملتي مهام، شجرتك تكبر</p>

      <div className="relative flex items-center justify-center w-full" style={{ height:220 }}>
        <TreeSVG level={lv.level} />
      </div>

      <div className="w-full mt-3 flex items-center justify-center gap-4">
        <div className="text-center">
          <p className="text-2xl font-black gradient-text">{lv.emoji} {lv.title}</p>
          <p className="text-xs" style={{ color:'var(--muted)' }}>المرحلة الحالية</p>
        </div>
      </div>
    </div>
  )
}
