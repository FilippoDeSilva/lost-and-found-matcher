'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Sparkles, PackageSearch, Layers } from 'lucide-react';

interface HeaderProps {
  activeTab: 'matches' | 'reports';
  onTabChange: (tab: 'matches' | 'reports') => void;
  onOpenReportModal: () => void;
  lostCount: number;
  foundCount: number;
  matchCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenReportModal,
  lostCount,
  foundCount,
  matchCount
}) => {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">

        {/* Top Mobile Bar: Logo & Action Button */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              <PackageSearch className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 truncate">
                  {t('appTitle')}
                </h1>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 font-normal truncate">
                {t('appSubtitle')}
              </p>
            </div>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <LanguageSelector />
          </div>
        </div>

        {/* Desktop Quick Stats & Language Selector */}
        <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-4">
          <div className="hidden lg:flex items-center gap-5 bg-slate-950/50 border border-slate-800/80 rounded-2xl px-4 py-2">
            <div className="text-center">
              <span className="block text-[11px] text-slate-400">{t('activeLost')}</span>
              <span className="text-xs sm:text-sm font-bold text-amber-400">{lostCount}</span>
            </div>
            <div className="h-5 w-px bg-slate-800" />
            <div className="text-center">
              <span className="block text-[11px] text-slate-400">{t('activeFound')}</span>
              <span className="text-xs sm:text-sm font-bold text-emerald-400">{foundCount}</span>
            </div>
            <div className="h-5 w-px bg-slate-800" />
            <div className="text-center">
              <span className="block text-[11px] text-slate-400">{t('matchesFound')}</span>
              <span className="text-xs sm:text-sm font-bold text-cyan-400">{matchCount}</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <LanguageSelector />
          </div>

          <Button
            variant="default"
            size="sm"
            onClick={onOpenReportModal}
            className="w-full md:w-auto py-2 sm:py-2.5 text-xs sm:text-sm font-bold"
          >
            <PlusCircle className="w-4 h-4 mr-1.5" />
            <span>{t('newReportBtn')}</span>
          </Button>
        </div>

      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between overflow-x-auto no-scrollbar">
        <nav className="flex items-center gap-2 min-w-full sm:min-w-0">
          <Button
            variant={activeTab === 'matches' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onTabChange('matches')}
            className={`text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4 ${activeTab === 'matches' ? 'border border-slate-700 text-emerald-400 font-bold' : ''}`}
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 mr-1.5 shrink-0" />
            <span>{t('matchesTab')}</span>
            <Badge variant="emerald" className="ml-1.5 py-0 px-1.5 text-[10px]">
              {matchCount}
            </Badge>
          </Button>

          <Button
            variant={activeTab === 'reports' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onTabChange('reports')}
            className={`text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4 ${activeTab === 'reports' ? 'border border-slate-700 text-cyan-400 font-bold' : ''}`}
          >
            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 mr-1.5 shrink-0" />
            <span>{t('reportsTab')}</span>
            <Badge variant="secondary" className="ml-1.5 py-0 px-1.5 text-[10px]">
              {lostCount + foundCount}
            </Badge>
          </Button>
        </nav>
      </div>
    </header>
  );
};
