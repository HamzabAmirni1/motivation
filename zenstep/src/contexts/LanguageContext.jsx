import { createContext, useContext, useState, useEffect } from 'react'
import { TRANSLATIONS, SUPPORTED_LANGUAGES } from '../lib/translations'
import { supabase } from '../lib/supabase'

const LanguageContext = createContext({})
export const useLanguage = () => useContext(LanguageContext)

const LS_LANG_KEY = 'zs_language'

export function LanguageProvider({ children, initialLanguage = null, userId = null }) {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem(LS_LANG_KEY) || initialLanguage || 'darija'
  })

  const currentLangConfig = SUPPORTED_LANGUAGES.find(l => l.code === lang) || SUPPORTED_LANGUAGES[0]
  const dir = currentLangConfig.dir || 'rtl'

  useEffect(() => {
    // Update HTML attributes for directional flow and language
    document.documentElement.lang = lang === 'darija' ? 'ar-MA' : lang
    document.documentElement.dir = dir
  }, [lang, dir])

  const setLang = async (newLang) => {
    if (!TRANSLATIONS[newLang]) return
    setLangState(newLang)
    localStorage.setItem(LS_LANG_KEY, newLang)

    // Optional background sync to Supabase if user is logged in
    if (userId && userId !== 'guest') {
      try {
        await supabase.from('profiles').update({ language: newLang }).eq('id', userId)
      } catch (err) {
        console.warn('Language update sync warning:', err)
      }
    }
  }

  const t = (key, fallback = '') => {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.ar
    if (dict && dict[key] !== undefined) {
      return dict[key]
    }
    // Fallback to Arabic or English if key is missing
    const arDict = TRANSLATIONS.ar
    if (arDict && arDict[key] !== undefined) return arDict[key]
    const enDict = TRANSLATIONS.en
    if (enDict && enDict[key] !== undefined) return enDict[key]
    return fallback || key
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir, languages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  )
}
