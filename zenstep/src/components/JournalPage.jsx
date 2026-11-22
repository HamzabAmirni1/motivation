import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Plus, Search, Tag, Trash2, Edit3, Calendar, Lock, CheckCircle2, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

const JOURNAL_MOODS = ['🌿', '😌', '😊', '💡', '🌧️', '🔥', '✨', '🧘'];

export default function JournalPage() {
  const { getJournalEntries, addJournalEntry, updateJournalEntry, deleteJournalEntry } = useAuth()
  const { t, lang, dir } = useLanguage()
  const entries = getJournalEntries()

  const [isWriting, setIsWriting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState('🌿')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTagFilter, setSelectedTagFilter] = useState(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      const clean = tagInput.trim().replace(/^#/, '')
      if (!tags.includes(clean)) setTags([...tags, clean])
      setTagInput('')
    }
  }

  const removeTag = (t) => {
    setTags(tags.filter(x => x !== t))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!title.trim() && !content.trim()) return

    const defaultTitle = t('journal_title_placeholder', 'تدوينة بدون عنوان')

    if (editingId) {
      await updateJournalEntry(editingId, {
        title: title.trim() || defaultTitle,
        content: content.trim(),
        mood,
        tags
      })
    } else {
      await addJournalEntry({
        title: title.trim() || defaultTitle,
        content: content.trim(),
        mood,
        tags
      })
    }

    resetForm()
  }

  const handleEdit = (entry) => {
    setEditingId(entry.id)
    setTitle(entry.title)
    setContent(entry.content)
    setMood(entry.mood || '🌿')
    setTags(entry.tags || [])
    setIsWriting(true)
  }

  const resetForm = () => {
    setTitle('')
    setContent('')
    setMood('🌿')
    setTags([])
    setEditingId(null)
    setIsWriting(false)
  }

  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      const matchQuery = !searchQuery || 
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        e.content.toLowerCase().includes(searchQuery.toLowerCase())
      const matchTag = !selectedTagFilter || (e.tags && e.tags.includes(selectedTagFilter))
      return matchQuery && matchTag
    })
  }, [entries, searchQuery, selectedTagFilter])

  const allTags = useMemo(() => {
    const set = new Set()
    entries.forEach(e => (e.tags || []).forEach(t => set.add(t)))
    return Array.from(set)
  }, [entries])

  const dateLocale = lang === 'fr' ? 'fr-FR' : lang === 'en' ? 'en-US' : 'ar-MA'

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12" dir={dir}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-2 chip">
            <Lock size={12} /> {t('journal_subtitle', 'مذكرتك الشخصية الخاصة (مشفرة ومحمية)')}
          </div>
          <h1 className="text-3xl font-black gradient-text">
            {t('journal_title', 'مذكرتي الخاصة والسرية')}
          </h1>
          <p style={{ color: 'var(--subtle)' }} className="text-sm mt-1">
            {t('journal_subtitle', 'مساحتك الآمنة لكتابة خواطرك، تفريغ مشاعرك، وتوثيق لحظات الامتنان اليومية.')}
          </p>
        </div>

        {!isWriting && (
          <button
            onClick={() => setIsWriting(true)}
            className="btn-zen flex items-center justify-center gap-2 px-6 py-3 font-bold shadow-xl shrink-0"
          >
            <Plus size={18} />
            <span>{t('journal_new_btn', 'تدوينة جديدة')} (+25 XP)</span>
          </button>
        )}
      </motion.div>

      {/* Editor Modal / Card */}
      <AnimatePresence>
        {isWriting && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass p-6 md:p-8 rounded-[2rem] border border-[#6ee7b7]/20 shadow-2xl space-y-5"
          >
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit3 size={18} className="text-[#6ee7b7]" />
                <span>{editingId ? t('common_edit', 'تعديل التدوينة') : t('journal_new_btn', 'كتابة تدوينة جديدة')}</span>
              </h2>
              <button onClick={resetForm} className="p-2 text-[var(--muted)] hover:text-white rounded-lg">
                <X size={20} />
              </button>
            </div>

            {/* Title & Mood */}
            <div className="flex gap-3">
              <div className="flex items-center gap-1 bg-white/5 px-3 py-2 rounded-2xl border border-white/5">
                {JOURNAL_MOODS.map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMood(m)}
                    className={`text-lg p-1 rounded-lg transition-transform ${mood === m ? 'scale-125 bg-white/10' : 'opacity-50 hover:opacity-100'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder={t('journal_title_placeholder', 'عنوان التدوينة...')}
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="zen-input flex-1 font-bold text-base"
              />
            </div>

            {/* Content area */}
            <textarea
              rows={7}
              placeholder={t('journal_body_placeholder', 'عبر عما يجول في خاطرك بكل حرية وأمان... لا أحد يقرأ هذا غيرك.')}
              value={content}
              onChange={e => setContent(e.target.value)}
              className="zen-input resize-none leading-relaxed text-sm"
            />

            {/* Tags input */}
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(t => (
                  <span key={t} className="chip-purple text-xs flex items-center gap-1 px-2.5 py-1 rounded-lg">
                    #{t}
                    <button type="button" onClick={() => removeTag(t)} className="hover:text-red-400">×</button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder={t('journal_tags_placeholder', 'أضف وسماً واضغط Enter...')}
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="zen-input text-xs"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} className="btn-zen flex-1 py-3 font-bold flex items-center justify-center gap-2">
                <CheckCircle2 size={16} />
                <span>{t('journal_save_btn', 'حفظ في مذكرتك')}</span>
              </button>
              <button onClick={resetForm} className="btn-ghost px-6 text-xs">
                {t('common_cancel', 'إلغاء')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="text"
            placeholder={t('journal_search_placeholder', 'بحث في مذكراتك...')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="zen-input pr-11 py-3 text-sm"
          />
        </div>

        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setSelectedTagFilter(null)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${!selectedTagFilter ? 'bg-[#6ee7b7] text-[#0a0f1a]' : 'glass text-[var(--subtle)]'}`}
            >
              الكل ({entries.length})
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTagFilter(selectedTagFilter === tag ? null : tag)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${selectedTagFilter === tag ? 'bg-[#a78bfa] text-white' : 'glass text-[var(--subtle)]'}`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Entries List */}
      {filteredEntries.length === 0 ? (
        <div className="glass p-12 text-center rounded-[2.5rem] border border-white/5 space-y-4">
          <div className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center text-3xl bg-white/5 text-[var(--subtle)]">
            📖
          </div>
          <h3 className="text-xl font-bold text-white">
            {t('journal_empty', 'المذكرة فارغة حتى الآن')}
          </h3>
          <p className="text-xs max-w-sm mx-auto text-[var(--muted)] leading-relaxed">
            {t('journal_subtitle', 'البدء في كتابة الأفكار خطوة ممتازة لصفاء الذهن وتقليل التوتر. اضغط على "تدوينة جديدة" وابدأ الآن.')}
          </p>
          <button
            onClick={() => setIsWriting(true)}
            className="btn-zen px-6 py-2.5 text-xs font-bold"
          >
            {t('journal_new_btn', 'كتابة أول تدوينة')} (+25 XP)
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {filteredEntries.map(entry => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-6 rounded-[2rem] border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl p-2 rounded-2xl bg-white/5">{entry.mood || '🌿'}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="p-2 rounded-xl text-[var(--subtle)] hover:text-white hover:bg-white/5"
                      title={t('common_edit', 'تعديل')}
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(entry.id)}
                      className="p-2 rounded-xl text-red-400 hover:bg-red-500/10"
                      title={t('common_delete', 'حذف')}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-[#6ee7b7] transition-colors">
                  {entry.title}
                </h3>
                <p className="text-xs text-[var(--subtle)] line-clamp-4 leading-relaxed whitespace-pre-wrap">
                  {entry.content}
                </p>
              </div>

              {entry.tags && entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-white/5">
                  {entry.tags.map(t => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-[var(--subtle)]">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass p-8 rounded-3xl max-w-sm w-full text-center border border-white/10"
            >
              <Trash2 size={36} className="mx-auto mb-3 text-red-400" />
              <h3 className="text-lg font-bold text-white mb-2">{t('common_confirm', 'تأكيد الحذف')}</h3>
              <p className="text-xs text-[var(--muted)] mb-6 leading-relaxed">
                هل أنت متأكد من حذف هذه التدوينة؟ لن تتمكن من استرجاعها بعد الحذف.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    deleteJournalEntry(deleteConfirmId)
                    setDeleteConfirmId(null)
                  }}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 rounded-xl text-xs font-bold text-white shadow-lg"
                >
                  {t('common_delete', 'حذف')}
                </button>
                <button
                  onClick={() => setDeleteConfirmId(null)}
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
