'use client';

import React from 'react';
import { MatchResult } from '@/types';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { useTranslatedReport } from '@/lib/hooks/useTranslatedReport';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Eye, MapPin, Sparkles } from 'lucide-react';

interface MatchFeedProps {
  matches: MatchResult[];
  onSelectMatch: (match: MatchResult) => void;
  onConfirmMatch: (matchId: string) => void;
}

const MatchCardItem: React.FC<{
  match: MatchResult;
  onSelectMatch: (match: MatchResult) => void;
  onConfirmMatch: (matchId: string) => void;
}> = ({ match, onSelectMatch, onConfirmMatch }) => {
  const { t } = useTranslation();
  const lostTranslated = useTranslatedReport(match.lostReport);
  const foundTranslated = useTranslatedReport(match.foundReport);

  const { overallScore, confidence, breakdown, reasons } = match;

  // Dynamic Color Theme: High = Green, Medium = Yellow/Amber, Low = Red
  const getScoreTheme = (score: number) => {
    if (score >= 75) {
      return {
        scoreText: 'text-emerald-400',
        badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        barBg: 'bg-emerald-500',
        borderHover: 'hover:border-emerald-500/40',
      };
    } else if (score >= 50) {
      return {
        scoreText: 'text-amber-400',
        badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        barBg: 'bg-amber-500',
        borderHover: 'hover:border-amber-500/40',
      };
    } else {
      return {
        scoreText: 'text-rose-400',
        badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        barBg: 'bg-rose-500',
        borderHover: 'hover:border-rose-500/40',
      };
    }
  };

  const theme = getScoreTheme(overallScore);

  return (
    <Card className={`p-3.5 sm:p-5 flex flex-col justify-between space-y-3 sm:space-y-4 transition-all duration-300 ${theme.borderHover}`}>
      
      {/* Card Header: Score Badge & View Button */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5 sm:pb-3">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex flex-col items-center justify-center border font-black shrink-0 ${theme.badgeBg}`}>
            <span className="text-sm sm:text-lg leading-tight">{overallScore}%</span>
            <span className="text-[7px] sm:text-[8px] uppercase tracking-tighter">MATCH</span>
          </div>
          <div className="min-w-0">
            <Badge variant={overallScore >= 75 ? 'emerald' : overallScore >= 50 ? 'amber' : 'destructive'} className="text-[9px] sm:text-[10px]">
              {confidence} {t('matchConfidence')}
            </Badge>
            <span className="text-[10px] sm:text-[11px] text-slate-400 block mt-0.5 font-medium truncate">
              {breakdown.canonicalConceptMatched || match.lostReport.category}
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelectMatch(match)}
          className="text-[11px] sm:text-xs py-1 px-2 sm:px-2.5 h-7 sm:h-8 border-slate-700 hover:bg-slate-800 text-slate-200 shrink-0"
        >
          <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 text-cyan-400" />
          <span>{t('viewBreakdown')}</span>
        </Button>
      </div>

      {/* Side-by-Side Items (Stacked on mobile, 2 cols on sm+) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 text-xs">
        
        {/* Lost Item */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] font-bold text-amber-400 uppercase tracking-wider">{t('iLostItem')}</span>
            <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase">{match.lostReport.originalLanguage}</span>
          </div>
          <h4 className="font-bold text-slate-100 text-xs sm:text-sm line-clamp-1">{lostTranslated.title || match.lostReport.title}</h4>
          <p className="text-[10px] sm:text-[11px] text-slate-400 line-clamp-2">"{lostTranslated.description || match.lostReport.description}"</p>
          <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-slate-400 pt-1">
            <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="truncate">{match.lostReport.locationName}</span>
          </div>
        </div>

        {/* Found Item */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{t('iFoundItem')}</span>
            <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase">{match.foundReport.originalLanguage}</span>
          </div>
          <h4 className="font-bold text-slate-100 text-xs sm:text-sm line-clamp-1">{foundTranslated.title || match.foundReport.title}</h4>
          <p className="text-[10px] sm:text-[11px] text-slate-400 line-clamp-2">"{foundTranslated.description || match.foundReport.description}"</p>
          <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-slate-400 pt-1">
            <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="truncate">{match.foundReport.locationName}</span>
          </div>
        </div>

      </div>

      {/* Rationale Bullet Points Preview */}
      <div className="p-2 sm:p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[10px] sm:text-[11px] space-y-1 text-slate-300">
        {reasons.slice(0, 2).map((reason, idx) => (
          <div key={idx} className="flex items-center gap-1.5 truncate">
            <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="truncate">{reason}</span>
          </div>
        ))}
      </div>

      {/* Card Action Footer */}
      <div className="pt-1">
        <Button
          variant="default"
          size="sm"
          onClick={() => onConfirmMatch(match.id)}
          className="w-full text-xs py-2 sm:py-2.5 font-bold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700"
        >
          <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
          <span>Confirm & View Action Plan</span>
        </Button>
      </div>

    </Card>
  );
};

export const MatchFeed: React.FC<MatchFeedProps> = ({
  matches,
  onSelectMatch,
  onConfirmMatch
}) => {
  const { t } = useTranslation();

  if (matches.length === 0) {
    return (
      <Card className="p-6 sm:p-8 text-center space-y-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <h3 className="text-sm sm:text-base font-bold text-slate-200">{t('noMatchesTitle')}</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">{t('noMatchesSub')}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm sm:text-lg font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{t('matchesFound')} ({matches.length})</span>
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-400">{t('sideBySideSub')}</p>
        </div>
      </div>

      {/* Multi-Column Responsive Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
        {matches.map(match => (
          <MatchCardItem
            key={match.id}
            match={match}
            onSelectMatch={onSelectMatch}
            onConfirmMatch={onConfirmMatch}
          />
        ))}
      </div>
    </div>
  );
};
