import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import enTranslations from './en.json';
import urTranslations from './ur.json';

export type Language = 'en' | 'ur';
export type Direction = 'ltr' | 'rtl';

interface LanguageContextType {
  lang: Language;
  dir: Direction;
  setLang: (lang: Language) => void;
  t: (path: string) => string;
}

const STORAGE_KEY = 'ua_sadiqabad_language';

const translations: Record<Language, Record<string, any>> = {
  en: enTranslations,
  ur: urTranslations,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'ur') {
      return saved;
    }
  } catch (e) {
    console.warn('Unable to access localStorage for language setting:', e);
  }
  return 'en';
}

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(getInitialLanguage);

  const dir: Direction = lang === 'ur' ? 'rtl' : 'ltr';

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch (e) {
      console.warn('Failed to save language preference to localStorage:', e);
    }
  };

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const t = useMemo(() => {
    return (path: string): string => {
      const keys = path.split('.');
      let current: any = translations[lang];
      for (const key of keys) {
        if (current && typeof current === 'object' && key in current) {
          current = current[key];
        } else {
          // Fallback to English if translation is missing in the chosen language
          let fallback: any = translations.en;
          for (const fallbackKey of keys) {
            if (fallback && typeof fallback === 'object' && fallbackKey in fallback) {
              fallback = fallback[fallbackKey];
            } else {
              return path;
            }
          }
          return typeof fallback === 'string' ? fallback : path;
        }
      }
      return typeof current === 'string' ? current : path;
    };
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, dir, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useI18n(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useI18n must be used within a LanguageProvider');
  }
  return context;
}
