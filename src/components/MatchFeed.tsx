'use client';

import React, { useState } from 'react';
import { MatchResult, ReportCategory, ConfidenceLevel } from '@/types';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Sparkles, Search, Filter, Eye, CheckCircle, ArrowRight, ShieldAlert } from 'lucide-react';

interface MatchFeedProps {
  matches: MatchResult[];
  onSelectMatch: (match: MatchResult) => void;
  onConfirmMatch: (matchId: string) => void;
}

export const MatchFeed: React.FC<MatchFeedProps> = ({
  matches,
  onSelectMatch,
  onConfirmMatch
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [confidenceFilter, setConfidenceFilter] = useState<ConfidenceLevel | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<ReportCategory | 'ALL'>('ALL');

  const filteredMatches = matches.filter(match => {
    const matchesConfidence = confidenceFilter === 'ALL' || match.confidence === confidenceFilter;
    const matchesCategory = categoryFilter === 'ALL' || match.lostReport.category === categoryFilter;
    const query = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      match.lostReport.title.toLowerCase().includes(query) ||
      match.foundReport.title.toLowerCase().includes(query) ||
      match.lostReport.description.toLowerCase().includes(query) ||
      match.foundReport.description.toLowerCase().includes(query);

    return matchesConfidence && matchesCategory && matchesSearch;
  });

  const getConfidenceVariant = (confidence: ConfidenceLevel) => {
    switch (confidence) {
      case 'HIGH':
        return 'emerald';
      case 'MEDIUM':
        return 'amber';
      default:
        return 'destructive';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Search & Filter Controls */}
      <Card className="p-3.5 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80 lg:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-xs sm:text-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
          {/* Confidence Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 rounded-xl px-2.5 sm:px-3 py-1.5 text-xs text-slate-300 flex-1 sm:flex-initial">
            <Filter className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <select
              value={confidenceFilter}
              onChange={(e) => setConfidenceFilter(e.target.value as ConfidenceLevel | 'ALL')}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer w-full"
            >
              <option value="ALL" className="bg-slate-900">{t('allConfidence')}</option>
              <option value="HIGH" className="bg-slate-900">{t('highConfidence')}</option>
              <option value="MEDIUM" className="bg-slate-900">{t('mediumConfidence')}</option>
              <option value="LOW" className="bg-slate-900">{t('lowConfidence')}</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 rounded-xl px-2.5 sm:px-3 py-1.5 text-xs text-slate-300 flex-1 sm:flex-initial">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as ReportCategory | 'ALL')}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer w-full"
            >
              <option value="ALL" className="bg-slate-900">{t('allCategories')}</option>
              <option value="ELECTRONICS" className="bg-slate-900">{t('catELECTRONICS')}</option>
              <option value="BAGS" className="bg-slate-900">{t('catBAGS')}</option>
              <option value="PERSONAL_ITEMS" className="bg-slate-900">{t('catPERSONAL_ITEMS')}</option>
              <option value="KEYS" className="bg-slate-900">{t('catKEYS')}</option>
              <option value="DOCUMENTS" className="bg-slate-900">{t('catDOCUMENTS')}</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Match Cards List */}
      {filteredMatches.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center space-y-3">
          <ShieldAlert className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-sm sm:text-base font-bold text-slate-300">{t('noMatchesTitle')}</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {t('noMatchesSub')}
          </p>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredMatches.map(match => (
            <Card
              key={match.id}
              className="p-4 sm:p-5 hover:border-slate-700 transition-all hover:shadow-emerald-500/5 overflow-hidden"
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-5">
                
                {/* Match Score Badge & Title */}
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 w-full lg:w-auto">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex flex-col items-center justify-center border font-black shrink-0 bg-slate-950 border-slate-800">
                    <span className="text-lg sm:text-xl text-emerald-400">{match.overallScore}%</span>
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-slate-500">{t('matchScore')}</span>
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <Badge variant={getConfidenceVariant(match.confidence)} className="text-[10px] sm:text-xs">
                        {match.confidence} {t('matchConfidence')}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] sm:text-xs">
                        {t(`cat${match.lostReport.category}` as any) || match.lostReport.category}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-100 truncate">
                      <span className="text-amber-300 truncate">🔴 {match.lostReport.title}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="text-emerald-300 truncate">🟢 {match.foundReport.title}</span>
                    </div>

                    <p className="text-[11px] sm:text-xs text-slate-400 line-clamp-1">
                      {t('lostAtVsFoundAt', { lostLoc: match.lostReport.locationName, foundLoc: match.foundReport.locationName })}
                    </p>
                  </div>
                </div>

                {/* Match Rationale Pill Summary */}
                <div className="flex flex-wrap gap-1.5 w-full lg:max-w-md">
                  {match.reasons.slice(0, 3).map((reason, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-[11px] font-medium rounded-lg bg-slate-950/60 border border-slate-800 text-slate-300 flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="truncate">{reason}</span>
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectMatch(match)}
                    className="flex-1 sm:flex-initial text-xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-cyan-400 mr-1.5" />
                    <span>{t('viewAnalysis')}</span>
                  </Button>

                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onConfirmMatch(match.id)}
                    className="flex-1 sm:flex-initial text-xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                    <span>{t('confirmMatch')}</span>
                  </Button>
                </div>

              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
