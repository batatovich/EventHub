import { useState, useEffect } from 'react';
import { getUserLangFromCookie } from '@/lib/helpers/getUserLang';

export function useTranslations(path) {
  const [translations, setTranslations] = useState(null); // Start with null
  const userLang = getUserLangFromCookie();

  useEffect(() => {
    async function loadTranslations() {
      try {
        const loadedTranslations = await import(`@/locales/${userLang}/${path}`);
        setTranslations({ ...loadedTranslations.default, lang: userLang });
      } catch (err) {
        console.error('Error loading translations:', err);
        setTranslations(null); 
      }
    }

    loadTranslations();
  }, [userLang, path]);

  return translations;
}
