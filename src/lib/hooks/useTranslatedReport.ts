'use client';

import { useState, useEffect } from 'react';
import { ItemReport } from '@/types';
import { useTranslation } from '@/lib/i18n/LanguageContext';

export interface TranslatedContent {
  title: string;
  description: string;
  isTranslating: boolean;
  isTranslated: boolean;
}

/**
 * Reusable Custom Hook for Live Report Translation
 * Translates report titles and descriptions dynamically to active UI language
 */
export function useTranslatedReport(report: ItemReport | null): TranslatedContent {
  const { language } = useTranslation();
  const [translated, setTranslated] = useState<TranslatedContent>({
    title: report?.title || '',
    description: report?.description || '',
    isTranslating: false,
    isTranslated: false
  });

  useEffect(() => {
    let isMounted = true;

    if (!report) {
      setTranslated({ title: '', description: '', isTranslating: false, isTranslated: false });
      return;
    }

    if (report.originalLanguage === language) {
      setTranslated({
        title: report.title,
        description: report.description,
        isTranslating: false,
        isTranslated: false
      });
      return;
    }

    async function performTranslation() {
      if (isMounted) {
        setTranslated(prev => ({ ...prev, isTranslating: true }));
      }

      try {
        const resTitle = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: report!.title,
            targetLang: language,
            sourceLang: report!.originalLanguage
          })
        });

        const resDesc = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: report!.description,
            targetLang: language,
            sourceLang: report!.originalLanguage
          })
        });

        const dataTitle = resTitle.ok ? await resTitle.json() : null;
        const dataDesc = resDesc.ok ? await resDesc.json() : null;

        if (isMounted) {
          setTranslated({
            title: dataTitle?.translatedText || report!.title,
            description: dataDesc?.translatedText || report!.description,
            isTranslating: false,
            isTranslated: true
          });
        }
      } catch (err) {
        if (isMounted) {
          setTranslated({
            title: report!.title,
            description: report!.description,
            isTranslating: false,
            isTranslated: false
          });
        }
      }
    }

    performTranslation();

    return () => { isMounted = false; };
  }, [report, language]);

  return translated;
}
