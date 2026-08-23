'use client';

import React, { useState, useEffect } from 'react';
import { MatchResult, ItemReport } from '@/types';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { useTranslatedReport } from '@/lib/hooks/useTranslatedReport';
import { X, CheckCircle, MapPin, Calendar, Mail, ShieldCheck, Zap, Languages, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MatchDetailModalProps {
  match: MatchResult | null;
  onClose: () => void;
  onConfirmMatch: (matchId: string) => void;
  onDismissMatch: (matchId: string) => void;
}

const DetailReportCard: React.FC<{ report: ItemReport; isLost: boolean }> = ({ report, isLost }) => {
  const { t } = useTranslation();
  const { title, description, isTranslating, isTranslated } = useTranslatedReport(report);

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${
      isLost ? 'bg-amber-500/5 border-amber-500/20' : 'bg-emerald-500/5 border-emerald-500/20'
    }`}>
      <div className="flex items-center justify-between">
        <Badge variant={isLost ? 'amber' : 'emerald'}>
          {isLost ? t('lostReportTag') : t('foundReportTag')}
        </Badge>
        <div className="flex items-center gap-1">
          {isTranslating ? (
            <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Translating...
            </span>
          ) : isTranslated ? (
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
              <Languages className="w-3 h-3" /> Auto-Translated
            </span>
          ) : null}
          <span className="text-[10px] sm:text-xs text-slate-400 uppercase">{t('reportLang')} {report.originalLanguage}</span>
        </div>
      </div>

      <h3 className="text-sm sm:text-base font-bold text-slate-100">
        {title || report.title}
      </h3>
      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800">
        "{description || report.description}"
      </p>

      <div className="space-y-1 text-xs text-slate-400 pt-1">
        <div className="flex items-center gap-2">
          <MapPin className={`w-3.5 h-3.5 ${isLost ? 'text-amber-400' : 'text-emerald-400'} shrink-0`} />
          <span className="truncate">{report.locationName} ({report.locationZoneId})</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className={`w-3.5 h-3.5 ${isLost ? 'text-amber-400' : 'text-emerald-400'} shrink-0`} />
          <span>{isLost ? t('lostDateLabel') : t('foundDateLabel')} {new Date(report.dateOccurred).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Mail className={`w-3.5 h-3.5 ${isLost ? 'text-amber-400' : 'text-emerald-400'} shrink-0`} />
          <span className="truncate">{report.contactEmail}</span>
        </div>
      </div>
    </div>
  );
};

export const MatchDetailModal: React.FC<MatchDetailModalProps> = ({
  match,
  onClose,
  onConfirmMatch,
  onDismissMatch
}) => {
  const { t, language } = useTranslation();
  const [translatedReasons, setTranslatedReasons] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;
    if (!match) return;

    async function translateReasons() {
      if (language === 'en') {
        setTranslatedReasons(match!.reasons);
        return;
      }

      const reasonsList: string[] = [];
      for (const reason of match!.reasons) {
        try {
          const res = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: reason, targetLang: language, sourceLang: 'en' })
          });
          reasonsList.push(res.ok ? (await res.json()).translatedText : reason);
        } catch (e) {
          reasonsList.push(reason);
        }
      }

      if (isMounted) {
        setTranslatedReasons(reasonsList);
      }
    }

    translateReasons();
    return () => { isMounted = false; };
  }, [match, language]);

  if (!match) return null;

  const { lostReport, foundReport, overallScore, confidence, breakdown } = match;

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 50) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  const getBarColor = (score: number) => {
    if (score >= 75) return 'bg-emerald-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-4 sm:my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100">{t('sideBySideTitle')}</h2>
              <p className="text-[11px] sm:text-xs text-slate-400">{t('sideBySideSub')}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[78vh] overflow-y-auto">
          
          {/* Overall Match Score Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center border font-extrabold shrink-0 ${getScoreColor(overallScore)}`}>
                <span className="text-xl sm:text-2xl">{overallScore}%</span>
                <span className="text-[9px] tracking-widest uppercase">{t('matchScore')}</span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs sm:text-sm font-bold text-slate-100">{t('confidenceLabel')}</span>
                  <Badge variant={overallScore >= 75 ? 'emerald' : overallScore >= 50 ? 'amber' : 'destructive'} className="text-[10px] sm:text-xs">
                    {confidence} {t('matchConfidence')}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {breakdown.canonicalConceptMatched 
                    ? `${t('matchedConcept')} "${breakdown.canonicalConceptMatched}"`
                    : `${t('categoryAlignment')} ${lostReport.category}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  onConfirmMatch(match.id);
                  onClose();
                }}
                className="flex-1 sm:flex-initial text-xs"
              >
                <CheckCircle className="w-4 h-4 mr-1.5" />
                <span>{t('confirmMatch')}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onDismissMatch(match.id);
                  onClose();
                }}
                className="flex-1 sm:flex-initial text-xs"
              >
                <span>{t('dismissMatch')}</span>
              </Button>
            </div>
          </div>

          {/* Side-by-Side Report Cards using reusable DetailReportCard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <DetailReportCard report={lostReport} isLost={true} />
            <DetailReportCard report={foundReport} isLost={false} />
          </div>

          {/* Scoring Dimension Sliders */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-3 sm:space-y-4">
            <h4 className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{t('scoringDimensionsTitle')}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 bg-slate-900 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">{t('dimCategory')}</span>
                  <span className="text-emerald-400">{breakdown.categoryScore}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className={`h-full ${getBarColor(breakdown.categoryScore)} transition-all duration-500`} style={{ width: `${breakdown.categoryScore}%` }} />
                </div>
              </div>

              <div className="space-y-1.5 bg-slate-900 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">{t('dimText')}</span>
                  <span className="text-emerald-400">{breakdown.textScore}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className={`h-full ${getBarColor(breakdown.textScore)} transition-all duration-500`} style={{ width: `${breakdown.textScore}%` }} />
                </div>
              </div>

              <div className="space-y-1.5 bg-slate-900 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">{t('dimLocation')}</span>
                  <span className="text-emerald-400">{breakdown.locationScore}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className={`h-full ${getBarColor(breakdown.locationScore)} transition-all duration-500`} style={{ width: `${breakdown.locationScore}%` }} />
                </div>
              </div>

              <div className="space-y-1.5 bg-slate-900 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">{t('dimTemporal')}</span>
                  <span className="text-emerald-400">{breakdown.timeScore}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className={`h-full ${getBarColor(breakdown.timeScore)} transition-all duration-500`} style={{ width: `${breakdown.timeScore}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Rationale Checklist */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-2.5">
            <h4 className="text-xs sm:text-sm font-bold text-slate-200">{t('rationaleTitle')}</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              {(translatedReasons.length > 0 ? translatedReasons : match.reasons).map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-900/60 px-3 py-2 rounded-lg border border-slate-800">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};
