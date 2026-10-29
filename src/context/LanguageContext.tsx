import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language, translations, Translations } from '../i18n/translations';
import { 
  detectInitialLanguage, 
  recordManualLanguageSelection, 
  isRtlLanguage, 
  LANGUAGE_STORAGE_KEY 
} from '../utils/geoDetection';
import { 
  SUPPORTED_LANGUAGES, 
  SupportedLanguageInfo, 
  subscribeTranslationUpdates 
} from '../services/translationService';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Translations;
  isHindi: boolean;
  isRtl: boolean;
  dir: 'ltr' | 'rtl';
  supportedLanguages: SupportedLanguageInfo[];
  translationTick: number;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Automatically select language on first visit based on region & browser,
  // while strictly giving visitor's manual selection priority if previously saved.
  const [language, setLanguageState] = useState<Language>(() => {
    return detectInitialLanguage();
  });

  const [translationTick, setTranslationTick] = useState(0);

  // Subscribe to background translation resolutions
  useEffect(() => {
    const unsubscribe = subscribeTranslationUpdates(() => {
      setTranslationTick((tick) => tick + 1);
    });
    return unsubscribe;
  }, []);

  const isRtl = isRtlLanguage(language);
  const dir: 'ltr' | 'rtl' = isRtl ? 'rtl' : 'ltr';

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    recordManualLanguageSelection(lang);
    try {
      document.documentElement.lang = lang;
      document.documentElement.dir = isRtlLanguage(lang) ? 'rtl' : 'ltr';
    } catch {
      // ignore
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  }, [language, setLanguage]);

  // Synchronize document attributes on language change
  useEffect(() => {
    try {
      document.documentElement.lang = language;
      document.documentElement.dir = dir;
    } catch {
      // ignore
    }
  }, [language, dir]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    toggleLanguage,
    t: translations[language] || translations.en,
    isHindi: language === 'hi',
    isRtl,
    dir,
    supportedLanguages: SUPPORTED_LANGUAGES,
    translationTick,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
