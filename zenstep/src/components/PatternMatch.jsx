import { useReducer, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

const TILES = [
  { id:0, color:'#6ee7b7', label:'أخضر' },
  { id:1, color:'#a78bfa', label:'بنفسجي' },
  { id:2, color:'#7dd3fc', label:'أزرق' },
  { id:3, color:'#fda4af', label:'وردي' },
]
const INIT = { status:'idle', sequence:[], userSeq:[], score:0, active:null, high:0 }

function reducer(state, action) {
  switch (action.type) {
    case 'START': {
      const seq = [Math.floor(Math.random() * 4)]
      return { ...INIT, status:'showing', sequence: seq, score: state.high, high: state.high }
    }
    case 'NEXT_ROUND': {
      const seq = [...state.sequence, Math.floor(Math.random() * 4)]
      return { ...state, status:'showing', sequence: seq, userSeq:[] }
    }
    case 'SHOW_ACTIVE': return { ...state, active: action.tile }
    case 'HIDE_ACTIVE': return { ...state, active: null }
    case 'WAITING':     return { ...state, status:'waiting' }
    case 'PRESS': {
      const idx     = state.userSeq.length
      const correct = state.sequence[idx] === action.tile
      if (!correct) {
        const newHigh = Math.max(state.high, state.score)
        return { ...state, status:'fail', high: newHigh }
      }
      const newSeq  = [...state.userSeq, action.tile]
      const roundDone = newSeq.length === state.sequence.length
      const newScore  = roundDone ? state.score + state.sequence.length : state.score
      return {
        ...state,
        userSeq: newSeq,
        score:   newScore,
        status:  roundDone ? 'success' : 'waiting',
      }
    }
    default: return state
  }
}

export default function PatternMatch({ onXPEarned }) {
  const { addXP } = useAuth()
  const [state, dispatch] = useReducer(reducer, INIT)
  const showingRef  = useRef(false)

  const showSequence = useCallback(async (seq) => {
    if (showingRef.current) return
    showingRef.current = true
    await delay(600)
    for (const tile of seq) {
      dispatch({ type:'SHOW_ACTIVE', tile })
      await delay(550)
      dispatch({ type:'HIDE_ACTIVE' })
      await delay(300)
    }
    dispatch({ type:'WAITING' })
    showingRef.current = false
  }, [])

  useEffect(() => {
    if (state.status === 'showing') showSequence(state.sequence)
  }, [state.status, state.sequence, showSequence])

  useEffect(() => {
    if (state.status === 'success' && state.score > 0) {
      const t = setTimeout(() => dispatch({ type:'NEXT_ROUND' }), 800)
      return () => clearTimeout(t)
    }
  }, [state.status, state.score])

  useEffect(() => {
    if (state.status === 'fail' && state.high > 0) {
      addXP(Math.max(5, state.high))
      onXPEarned?.(Math.max(5, state.high))
    }
  }, [state.status])

  return (
    <div className="glass p-6">
      <h3 className="font-bold text-lg mb-1" style={{ color:'var(--text)' }}>🎮 Pattern-Match</h3>
      <p className="text-xs mb-4" style={{ color:'var(--muted)' }}>كرر النمط ديال الألوان. ركز وحفظ!</p>

      {/* Score bar */}
      <div className="flex justify-between mb-5">
        <div className="text-center glass px-4 py-2 rounded-xl">
          <p className="text-xl font-black gradient-text">{state.score}</p>
          <p className="text-xs" style={{ color:'var(--muted)' }}>النقاط</p>
        </div>
        <div className="text-center glass px-4 py-2 rounded-xl">
          <p className="text-xl font-black" style={{ color:'#fcd34d' }}>{state.high}</p>
          <p className="text-xs" style={{ color:'var(--muted)' }}>أعلى نقطة</p>
        </div>
        <div className="text-center glass px-4 py-2 rounded-xl">
          <p className="text-xl font-black" style={{ color:'#a78bfa' }}>{state.sequence.length}</p>
          <p className="text-xs" style={{ color:'var(--muted)' }}>المرحلة</p>
        </div>
      </div>

      {/* Tiles grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {TILES.map(tile => {
          const isActive  = state.active === tile.id
          const canPress  = state.status === 'waiting'
          return (
            <motion.button key={tile.id}
              whileTap={canPress ? { scale:0.93 } : {}}
              onClick={() => canPress && dispatch({ type:'PRESS', tile: tile.id })}
              animate={{ scale: isActive ? 1.08 : 1, opacity: isActive ? 1 : 0.7 }}
              transition={{ duration:0.15 }}
              className="rounded-2xl flex items-center justify-center font-bold text-sm transition-all"
              style={{
                height: 80,
                background: isActive
                  ? `${tile.color}`
                  : `${tile.color}22`,
                border: `2px solid ${tile.color}${isActive ? 'ff' : '44'}`,
                color: isActive ? '#0a0f1a' : tile.color,
                cursor: canPress ? 'pointer' : 'default',
                boxShadow: isActive ? `0 0 20px ${tile.color}88` : 'none',
              }}>
              {tile.label}
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {state.status === 'fail' && (
          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            className="mb-4 p-3 rounded-xl text-center"
            style={{ background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.2)' }}>
            <p className="font-bold" style={{ color:'#f87171' }}>غلطت 😅 — وصلت {state.score} نقطة!</p>
            {state.high > 0 && <p className="text-xs mt-1" style={{ color:'var(--muted)' }}>+{Math.max(5, state.high)} XP كسبتي</p>}
          </motion.div>
        )}
        {state.status === 'success' && (
          <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
            className="mb-4 p-3 rounded-xl text-center"
            style={{ background:'rgba(110,231,183,0.1)', border:'1px solid rgba(110,231,183,0.2)' }}>
            <p className="font-bold" style={{ color:'#6ee7b7' }}>✓ صح! المستوى التالي...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {(state.status === 'idle' || state.status === 'fail') && (
        <motion.button whileTap={{ scale:0.97 }} onClick={() => dispatch({ type:'START' })} className="btn-zen w-full">
          {state.status === 'fail' ? '🔄 مرة أخرى' : '▶ بدا اللعبة'}
        </motion.button>
      )}
      {state.status === 'showing' && (
        <div className="text-center py-2" style={{ color:'var(--muted)' }}>
          <p className="text-sm animate-pulse">🔍 حفظ النمط...</p>
        </div>
      )}
    </div>
  )
}

const delay = ms => new Promise(r => setTimeout(r, ms))
