import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Shield, Bell, Volume2, Globe, Key, Download, Trash2, Trophy, Flame, Sparkles, CheckCircle2, Camera, Upload } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { calculateLevel, ACHIEVEMENTS } from '../lib/gamification'
import { supabase } from '../lib/supabase'
import { renderAvatarContent } from './Navbar'

const AVATAR_PRESETS = ['🌱', '🌿', '🌸', '🌻', '🧘', '🌊', '🌙', '⭐', '🦁', '🦉', '🦋', '✨'];

function isImageUrl(url) {
  return typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/') || url.startsWith('data:image'));
}

function resizeImageToDataUrl(file, maxSize = 256) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width)
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height)
            height = maxSize
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
        resolve(dataUrl)
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function ProfilePage() {
  const { user, profile, saveProfile, signOut } = useAuth()
  const { lang, setLang, t, languages } = useLanguage()
  const xp = profile?.xp || 0
  const lv = calculateLevel(xp)
  const streak = profile?.streak_count || 0

  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const getCleanInitialAvatar = () => {
    const av = profile?.avatar_url
    if (typeof av === 'string') {
      const trimmed = av.trim()
      if (isImageUrl(trimmed) || AVATAR_PRESETS.includes(trimmed)) {
        return trimmed
      }
    }
    return '🌱'
  }

  const [username, setUsername] = useState(profile?.username || '')
  const [selectedAvatar, setSelectedAvatar] = useState(getCleanInitialAvatar)

  useEffect(() => {
    if (profile?.username) setUsername(profile.username)
    if (profile?.avatar_url) {
      const trimmed = profile.avatar_url.trim()
      if (isImageUrl(trimmed) || AVATAR_PRESETS.includes(trimmed)) {
        setSelectedAvatar(trimmed)
      } else {
        setSelectedAvatar('🌱')
      }
    }
  }, [profile?.username, profile?.avatar_url])
  const [language, setLanguage] = useState(lang || profile?.language || 'ar')
  const [notifEnabled, setNotifEnabled] = useState(profile?.settings?.notifications ?? true)
  const [soundEnabled, setSoundEnabled] = useState(profile?.settings?.sounds ?? true)
  const [savedMsg, setSavedMsg] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [pwMsg, setPwMsg] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Unlocked achievements
  const unlocked = (() => {
    try {
      return JSON.parse(localStorage.getItem('zs_achievements') || '[]')
    } catch { return [] }
  })()

  const handleImageFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح')
      return
    }

    try {
      setUploading(true)
      const dataUrl = await resizeImageToDataUrl(file, 256)
      setSelectedAvatar(dataUrl)
      saveProfile({
        ...profile,
        avatar_url: dataUrl
      })
      setSavedMsg(t('common_saved', 'تم تحديث الصورة بنجاح ✓'))
      setTimeout(() => setSavedMsg(''), 2500)
    } catch (err) {
      console.warn('Image processing failed:', err)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSaveProfile = () => {
    setLang(language)
    saveProfile({
      ...profile,
      username: username.trim() || profile.username,
      avatar_url: selectedAvatar,
      language,
      settings: {
        ...profile.settings,
        notifications: notifEnabled,
        sounds: soundEnabled
      }
    })
    setSavedMsg(t('common_saved', 'تم حفظ التغييرات بنجاح ✓'))
    setTimeout(() => setSavedMsg(''), 2500)
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 6) {
      setPwMsg('كلمة السر يجب أن تكون من 6 أحرف على الأقل.')
      return
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) setPwMsg(error.message)
    else {
      setPwMsg('تم تحديث كلمة السر بنجاح ✓')
      setNewPassword('')
      setTimeout(() => setPwMsg(''), 3000)
    }
  }

  const exportData = () => {
    const data = {
      profile,
      moods: JSON.parse(localStorage.getItem('zs_moods') || '[]'),
      journal: JSON.parse(localStorage.getItem('zs_journal') || '[]'),
      habits: JSON.parse(localStorage.getItem('zs_habits') || '[]'),
      achievements: unlocked,
      stats: JSON.parse(localStorage.getItem('zs_stats') || '{}'),
      exportedAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `zenstep_data_${profile?.username || 'user'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDeleteAccount = async () => {
    // Clear local storage and sign out
    localStorage.clear()
    await signOut()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header Profile Summary */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="glass p-6 md:p-8 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
      >
        <div className="flex items-center gap-5 min-w-0">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-20 h-20 rounded-3xl flex items-center justify-center text-3xl shadow-2xl relative overflow-hidden shrink-0 select-none cursor-pointer group border border-white/10"
            style={{ background: 'linear-gradient(135deg, #6ee7b7, #a78bfa)', color: '#0d1117' }}
            title={t('profile_upload_gallery', 'اختر صورة من المعرض 📸')}
          >
            {renderAvatarContent({ username: profile?.username, avatar_url: selectedAvatar }, lv.emoji)}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold">
              <Camera size={22} className="text-white drop-shadow-md" />
            </div>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-black text-white truncate max-w-xs">{profile?.username || t('dash_friend', 'صاحبي')}</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#6ee7b7]/15 text-[#6ee7b7] shrink-0">
                Lv.{lv.level} • {(lang === 'ar' || lang === 'darija') ? (lv.titleAr || lv.title) : lv.title}
              </span>
            </div>
            <p className="text-xs text-[var(--muted)] mt-1">{user?.email || (lang === 'fr' ? 'Compte Local' : lang === 'en' ? 'Local Account' : 'حساب محلي')}</p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-xs text-[var(--subtle)]">
                <Sparkles size={14} className="text-[#6ee7b7]" />
                <span>{xp} XP {t('dash_xp', 'إجمالي')}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[var(--subtle)]">
                <Flame size={14} className="text-[#fcd34d]" />
                <span>{streak} {t('nav_streak_days', 'يوم متواصل')}</span>
              </div>
            </div>
          </div>
        </div>

        <button onClick={signOut} className="btn-ghost text-xs px-5 py-2.5 text-red-400 hover:bg-red-500/10 border-red-500/20">
          {t('nav_logout', 'تسجيل الخروج')}
        </button>
      </motion.div>

      {/* Badges Showcase */}
      <div className="glass p-6 md:p-8 rounded-[2rem] border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Trophy size={18} className="text-[#fcd34d]" />
            <span>{t('profile_achievements', 'الأوسمة والإنجازات')} ({unlocked.length} / {ACHIEVEMENTS.length})</span>
          </h2>
          <span className="text-xs text-[var(--muted)]">
            {lang === 'fr' ? 'Gagnez des badges en complétant vos exercices' : lang === 'en' ? 'Earn badges as you complete wellness exercises' : 'اكسب الأوسمة مع تقدمك في التمارين'}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ACHIEVEMENTS.map(ach => {
            const isUnlocked = unlocked.includes(ach.id)
            const achTitle = (lang === 'en' || lang === 'fr') ? (ach.titleEn || ach.title) : ach.title
            return (
              <div
                key={ach.id}
                className="p-4 rounded-2xl border transition-all text-center flex flex-col items-center justify-center gap-1.5"
                style={{
                  background: isUnlocked ? 'rgba(110,231,183,0.06)' : 'rgba(255,255,255,0.02)',
                  borderColor: isUnlocked ? 'rgba(110,231,183,0.3)' : 'rgba(255,255,255,0.05)',
                  opacity: isUnlocked ? 1 : 0.4
                }}
              >
                <span className="text-3xl mb-1">{ach.icon}</span>
                <p className="font-bold text-xs text-white">{achTitle}</p>
                <p className="text-[10px] text-[var(--muted)] leading-relaxed">{ach.description}</p>
                {isUnlocked && (
                  <span className="text-[9px] font-bold text-[#6ee7b7] mt-1 bg-[#6ee7b7]/10 px-2 py-0.5 rounded-full">
                    {lang === 'fr' ? '✓ Obtenu' : lang === 'en' ? '✓ Unlocked' : 'مكتمل ✓'}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Personal Details */}
        <div className="glass p-6 md:p-8 rounded-[2rem] border border-white/5 space-y-5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <User size={18} className="text-[#6ee7b7]" />
            <span>{t('profile_title', 'الملف الشخصي والمظهر')}</span>
          </h2>

          <div>
            <label className="block text-xs font-bold text-[var(--subtle)] mb-1.5">
              {t('profile_username', 'اسم المستخدم')}
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="zen-input text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--subtle)] mb-2">{t('profile_avatar', 'الأفاتار والصورة الشخصية')}</label>
            
            {/* Hidden Gallery Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageFileSelect}
            />

            {/* Gallery Upload Button + Remove Photo */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2.5 rounded-xl text-xs font-bold border border-[#6ee7b7]/30 bg-[#6ee7b7]/15 hover:bg-[#6ee7b7]/25 text-[#6ee7b7] flex items-center gap-2 transition-all shadow-sm"
              >
                <Camera size={16} />
                <span>{uploading ? t('profile_uploading', 'كنجهزو الصورة...') : t('profile_upload_gallery', 'اختر صورة من المعرض (Galerie) 📸')}</span>
              </button>

              {isImageUrl(selectedAvatar) && (
                <button
                  type="button"
                  onClick={() => setSelectedAvatar('🌱')}
                  className="px-3 py-2.5 rounded-xl text-xs text-red-400 glass hover:bg-red-500/10 border-red-500/20 flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 size={13} />
                  <span>{t('profile_remove_photo', 'مسح الصورة')}</span>
                </button>
              )}
            </div>

            {/* Avatar Presets & Custom Image Preview */}
            <div className="flex flex-wrap gap-2 items-center">
              {isImageUrl(selectedAvatar) && (
                <div className="relative group">
                  <div className="w-11 h-11 rounded-xl overflow-hidden ring-2 ring-[#6ee7b7] border-2 border-[#6ee7b7] shadow-lg">
                    <img src={selectedAvatar} alt="Custom Avatar" className="w-full h-full object-cover" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#6ee7b7] text-black rounded-full text-[9px] font-bold flex items-center justify-center">✓</span>
                </div>
              )}
              {AVATAR_PRESETS.map(av => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setSelectedAvatar(av)}
                  className={`text-2xl p-2 rounded-xl border transition-all ${
                    selectedAvatar === av ? 'bg-[#6ee7b7]/20 border-[#6ee7b7]' : 'border-white/5 hover:bg-white/5'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--subtle)] mb-1.5">{t('profile_language', 'لغة المنصة')}</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {languages.map(l => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => {
                    setLanguage(l.code)
                    setLang(l.code)
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    language === l.code ? 'bg-[#6ee7b7] text-black shadow-md' : 'glass text-[var(--subtle)] hover:text-white'
                  }`}
                >
                  <span>{l.flag}</span>
                  <span>{l.name}</span>
                </button>
              ))}
            </div>
          </div>

          {savedMsg && (
            <p className="text-xs font-bold text-[#6ee7b7] text-center">{savedMsg}</p>
          )}

          <button onClick={handleSaveProfile} className="btn-zen w-full py-3 font-bold text-xs">
            {t('common_save', 'حفظ إعدادات الملف')}
          </button>
        </div>

        {/* Security & Preferences */}
        <div className="glass p-6 md:p-8 rounded-[2rem] border border-white/5 space-y-5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Shield size={18} className="text-[#a78bfa]" />
            <span>{t('profile_subtitle', 'الأمان والتفضيلات')}</span>
          </h2>

          {/* Preferences toggles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-black/20 border border-white/5">
              <div className="flex items-center gap-2.5">
                <Bell size={16} className="text-[var(--subtle)]" />
                <span className="text-xs font-bold text-white">{t('profile_notifications', 'الإشعارات اليومية والتذكيرات')}</span>
              </div>
              <input
                type="checkbox"
                checked={notifEnabled}
                onChange={e => setNotifEnabled(e.target.checked)}
                className="w-4 h-4 accent-[#6ee7b7]"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-black/20 border border-white/5">
              <div className="flex items-center gap-2.5">
                <Volume2 size={16} className="text-[var(--subtle)]" />
                <span className="text-xs font-bold text-white">{t('profile_sounds', 'المؤثرات الصوتية للأدوات')}</span>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={e => setSoundEnabled(e.target.checked)}
                className="w-4 h-4 accent-[#6ee7b7]"
              />
            </div>
          </div>

          {/* Password update */}
          <form onSubmit={handleChangePassword} className="space-y-3 pt-2 border-t border-white/5">
            <label className="block text-xs font-bold text-[var(--subtle)]">{t('profile_change_pwd', 'تحديث كلمة السر')}</label>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="zen-input text-xs"
            />
            {pwMsg && <p className="text-xs text-[#6ee7b7] font-semibold">{pwMsg}</p>}
            <button type="submit" className="btn-ghost w-full py-2.5 text-xs font-bold">
              {t('profile_change_pwd', 'تغيير كلمة السر')}
            </button>
          </form>

          {/* Data Export & Account Delete */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <button
              onClick={exportData}
              className="w-full py-2.5 rounded-xl text-xs font-bold glass flex items-center justify-center gap-2 text-[var(--subtle)] hover:text-white"
            >
              <Download size={14} />
              <span>{t('profile_export', 'تصدير بياناتي (JSON Export)')}</span>
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 flex items-center justify-center gap-2"
            >
              <Trash2 size={14} />
              <span>{t('profile_delete_acc', 'حذف حسابي وبياناتي')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass p-8 rounded-3xl max-w-sm w-full text-center border border-white/10"
            >
              <Trash2 size={36} className="mx-auto mb-3 text-red-400" />
              <h3 className="text-lg font-bold text-white mb-2">{t('profile_delete_acc', 'تأكيد حذف الحساب؟')}</h3>
              <p className="text-xs text-[var(--muted)] mb-6 leading-relaxed">
                هل أنت متأكد تماماً من رغبتك في حذف حسابك؟
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 rounded-xl text-xs font-bold text-white shadow-lg"
                >
                  {t('common_delete', 'نعم، احذف الحساب')}
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="btn-ghost flex-1 py-3 text-xs"
                >
                  {t('common_cancel', 'تراجع')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
