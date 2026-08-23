'use client';

import React from 'react';
import { Language } from '@/types';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { Globe } from 'lucide-react';

const LANGUAGES: { code: Language; flag: string }[] = [
  { code: 'en', flag: '🇺🇸' },
  { code: 'es', flag: '🇪🇸' },
  { code: 'fr', flag: '🇫🇷' },
  { code: 'am', flag: '🇪🇹' }
];

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useTranslation();

  return (
    <div className="relative inline-flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 backdrop-blur-md rounded-xl px-2.5 sm:px-3 py-1.5 shadow-sm text-xs sm:text-sm text-slate-200">
      <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="bg-transparent text-slate-200 focus:outline-none cursor-pointer font-medium max-w-[110px] sm:max-w-none truncate"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code} className="bg-slate-900 text-slate-100">
            {lang.flag}
          </option>
        ))}
      </select>
    </div>
  );
};
