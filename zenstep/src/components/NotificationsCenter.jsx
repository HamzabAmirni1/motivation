import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, CheckCheck, Sparkles, Trophy, Flame, Info, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

export default function NotificationsCenter({ isOpen, onClose }) {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useAuth()
  const { t, lang, dir } = useLanguage()
  const unreadCount = notifications.filter(n => !n.read).length

  if (!isOpen) return null

  const dateLocale = lang === 'fr' ? 'fr-FR' : lang === 'en' ? 'en-US' : 'ar-MA'

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-end p-4 md:p-6 pt-16" dir={dir}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          className="glass relative z-10 w-full max-w-sm rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-[#6ee7b7]" />
              <h3 className="font-bold text-sm text-white">{t('notif_title', 'مركز الإشعارات')}</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#6ee7b7] text-black">
                  {unreadCount} {t('notif_new', 'جديد')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllNotificationsRead}
                  className="text-[10px] text-[#6ee7b7] hover:underline flex items-center gap-1"
                >
                  <CheckCheck size={12} />
                  <span>{t('notif_mark_all', 'قراءة الكل')}</span>
                </button>
              )}
              <button onClick={onClose} className="p-1 rounded-lg text-[var(--muted)] hover:text-white">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-xs text-[var(--muted)]">
                {t('notif_empty', 'لا توجد إشعارات حالياً')}
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => markNotificationRead(n.id)}
                  className={`p-3.5 rounded-2xl transition-all cursor-pointer border ${
                    !n.read
                      ? 'bg-white/[0.06] border-[#6ee7b7]/20 shadow-sm'
                      : 'bg-white/[0.02] border-white/5 opacity-70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-bold text-xs text-white flex items-center gap-1.5">
                      {n.type === 'achievement' && <span>🏆</span>}
                      {n.type === 'level_up' && <span>🎉</span>}
                      {n.type === 'streak' && <span>🔥</span>}
                      {n.type === 'system' && <span>🌱</span>}
                      <span>{n.title}</span>
                    </h4>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-[#6ee7b7] shrink-0 mt-1" />}
                  </div>
                  <p className="text-[11px] text-[var(--subtle)] leading-relaxed">{n.message}</p>
                  <span className="text-[9px] text-[var(--muted)] mt-1.5 block">
                    {new Date(n.created_at).toLocaleDateString(dateLocale, { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
