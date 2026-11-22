import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, VolumeX, Play, Pause, Clock, Sparkles, Heart } from 'lucide-react'
import { SOUND_TRACKS, playSound, stopCurrentSound, setMasterVolume } from '../services/soundEngine'

const SLEEP_TIMERS = [
  { label: 'إيقاف', minutes: 0 },
  { label: '15 دقيقة', minutes: 15 },
  { label: '30 دقيقة', minutes: 30 },
  { label: '45 دقيقة', minutes: 45 },
  { label: '60 دقيقة', minutes: 60 },
];

export default function SoundsPage() {
  const [activeTrack, setActiveTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.6)
  const [timerMinutes, setTimerMinutes] = useState(0)
  const [timerRemaining, setTimerRemaining] = useState(0)
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('zs_fav_sounds') || '["rain","ocean"]')
    } catch { return ['rain'] }
  })

  const timerRef = useRef(null)

  const toggleFavorite = (trackId) => {
    setFavorites(prev => {
      const updated = prev.includes(trackId) ? prev.filter(id => id !== trackId) : [...prev, trackId]
      localStorage.setItem('zs_fav_sounds', JSON.stringify(updated))
      return updated
    })
  }

  const handleTrackSelect = (track) => {
    if (activeTrack?.id === track.id && isPlaying) {
      stopCurrentSound()
      setIsPlaying(false)
    } else {
      setActiveTrack(track)
      playSound(track.id, volume)
      setIsPlaying(true)
    }
  }

  const handleVolumeChange = (newVol) => {
    setVolume(newVol)
    setMasterVolume(newVol)
  }

  // Sleep Timer countdown
  useEffect(() => {
    if (timerMinutes > 0 && isPlaying) {
      setTimerRemaining(timerMinutes * 60)
      if (timerRef.current) clearInterval(timerRef.current)
      
      timerRef.current = setInterval(() => {
        setTimerRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            stopCurrentSound()
            setIsPlaying(false)
            setTimerMinutes(0)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
      setTimerRemaining(0)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [timerMinutes, isPlaying])

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      stopCurrentSound()
    }
  }, [])

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-2 chip">
          <Sparkles size={14} /> أصوات الاسترخاء الطبيعية
        </div>
        <h1 className="text-3xl md:text-4xl font-black gradient-text mb-2">واحة الهدوء الصوتي</h1>
        <p style={{ color: 'var(--subtle)' }} className="text-sm max-w-md mx-auto">
          أصوات طبيعية ونغمات تأمل نقية لتصفية الذهن، التخلص من التوتر، والمساعدة على النوم المريح.
        </p>
      </motion.div>

      {/* Main Active Player Bar */}
      {activeTrack && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 rounded-[2rem] border border-[#6ee7b7]/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg relative"
              style={{ background: `${activeTrack.color}22`, border: `2px solid ${activeTrack.color}` }}
            >
              {activeTrack.icon}
              {isPlaying && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6ee7b7] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#6ee7b7]"></span>
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white">{activeTrack.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${activeTrack.color}15`, color: activeTrack.color }}>
                  {activeTrack.nameEn}
                </span>
              </div>
              <p className="text-xs text-[var(--muted)] mt-1">{activeTrack.desc}</p>
              {timerRemaining > 0 && (
                <p className="text-[10px] text-[#fcd34d] font-bold mt-1 flex items-center gap-1">
                  <Clock size={12} /> ينتهي بعد: {Math.floor(timerRemaining / 60)}:{(timerRemaining % 60).toString().padStart(2, '0')}
                </p>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6 w-full md:w-auto justify-end">
            {/* Volume slider */}
            <div className="flex items-center gap-2">
              <button onClick={() => handleVolumeChange(volume === 0 ? 0.5 : 0)} className="text-[var(--subtle)] hover:text-white">
                {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={e => handleVolumeChange(parseFloat(e.target.value))}
                className="w-24 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#6ee7b7]"
              />
            </div>

            {/* Play/Pause Button */}
            <button
              onClick={() => handleTrackSelect(activeTrack)}
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-black font-black transition-transform active:scale-95 shadow-xl"
              style={{ background: 'linear-gradient(135deg, #6ee7b7, #34d399)' }}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
            </button>
          </div>
        </motion.div>
      )}

      {/* Sleep Timer Selector */}
      <div className="glass p-5 rounded-2xl border border-white/5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--subtle)]">
          <Clock size={16} className="text-[#fcd34d]" />
          <span>مؤقت النوم الذكي (إيقاف تلقائي):</span>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {SLEEP_TIMERS.map(t => (
            <button
              key={t.minutes}
              onClick={() => setTimerMinutes(t.minutes)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${timerMinutes === t.minutes ? 'bg-[#fcd34d] text-black shadow-md' : 'glass text-[var(--subtle)] hover:text-white'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tracks Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {SOUND_TRACKS.map(track => {
          const isSelected = activeTrack?.id === track.id
          const isFav = favorites.includes(track.id)
          return (
            <motion.div
              key={track.id}
              whileHover={{ scale: 1.02, y: -2 }}
              className="glass p-6 rounded-[2rem] border transition-all relative overflow-hidden flex flex-col justify-between"
              style={{
                borderColor: isSelected ? `${track.color}66` : 'rgba(255,255,255,0.06)',
                background: isSelected ? `${track.color}11` : 'rgba(22,28,45,0.75)'
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner"
                  style={{ background: `${track.color}15`, border: `1px solid ${track.color}33` }}
                >
                  {track.icon}
                </div>

                <button
                  onClick={() => toggleFavorite(track.id)}
                  className={`p-2 rounded-xl transition-all ${isFav ? 'text-red-400 bg-red-400/10' : 'text-[var(--muted)] hover:text-white'}`}
                >
                  <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
                </button>
              </div>

              <div className="mb-6">
                <h3 className="font-bold text-base text-white mb-1">{track.name}</h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed">{track.desc}</p>
              </div>

              <button
                onClick={() => handleTrackSelect(track)}
                className="w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all"
                style={{
                  background: isSelected && isPlaying ? 'rgba(248,113,113,0.15)' : `${track.color}22`,
                  color: isSelected && isPlaying ? '#f87171' : track.color,
                  border: `1px solid ${isSelected && isPlaying ? '#f8717144' : track.color + '44'}`
                }}
              >
                {isSelected && isPlaying ? (
                  <>
                    <Pause size={14} />
                    <span>إيقاف الصوت</span>
                  </>
                ) : (
                  <>
                    <Play size={14} />
                    <span>تشغيل الصوت</span>
                  </>
                )}
              </button>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
