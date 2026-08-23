'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ItemReport, MatchResult } from '@/types';
import { INITIAL_SAMPLE_REPORTS } from '@/lib/sampleData';
import { calculateReportMatch } from '@/lib/matcher/engine';
import { LanguageProvider, useTranslation } from '@/lib/i18n/LanguageContext';
import { Header } from '@/components/Header';
import { MatchFeed } from '@/components/MatchFeed';
import { ItemGrid } from '@/components/ItemGrid';
import { MatchDetailModal } from '@/components/MatchDetailModal';
import { ReportModal } from '@/components/ReportModal';
import { HelpCircle } from 'lucide-react';

function MatcherAppContent() {
  const { t } = useTranslation();
  const [reports, setReports] = useState<ItemReport[]>(INITIAL_SAMPLE_REPORTS);
  const [activeTab, setActiveTab] = useState<'matches' | 'reports'>('matches');
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [confirmedMatchIds, setConfirmedMatchIds] = useState<Set<string>>(new Set());

  // Fetch initial reports from database / API
  useEffect(() => {
    async function loadReports() {
      try {
        const res = await fetch('/api/reports');
        if (res.ok) {
          const data = await res.json();
          if (data.reports && data.reports.length > 0) {
            setReports(data.reports);
          }
        }
      } catch (err) {
        console.warn('API lookup fallback to client data:', err);
      }
    }
    loadReports();
  }, []);

  // Real-time Match Computation Engine
  const matches = useMemo(() => {
    const lostList = reports.filter(r => r.type === 'LOST' && r.status === 'OPEN');
    const foundList = reports.filter(r => r.type === 'FOUND' && r.status === 'OPEN');

    const results: MatchResult[] = [];

    for (const lost of lostList) {
      for (const found of foundList) {
        const match = calculateReportMatch(lost, found);
        if (!confirmedMatchIds.has(match.id)) {
          results.push(match);
        }
      }
    }

    return results.sort((a, b) => b.overallScore - a.overallScore);
  }, [reports, confirmedMatchIds]);

  const lostCount = reports.filter(r => r.type === 'LOST').length;
  const foundCount = reports.filter(r => r.type === 'FOUND').length;

  const handleAddReport = async (newReportData: Omit<ItemReport, 'id' | 'status' | 'dateReported'>) => {
    const tempId = `rep_${Date.now()}`;
    const newReport: ItemReport = {
      ...newReportData,
      id: tempId,
      status: 'OPEN',
      dateReported: new Date().toISOString()
    };

    // Immediately prepend to reports state for instant UI update
    setReports(prev => [newReport, ...prev]);
    setActiveTab('reports');

    // Persist to Database API
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReportData)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.report) {
          setReports(prev => [data.report, ...prev.filter(r => r.id !== tempId)]);
        }
      }
    } catch (err) {
      console.warn('Failed to save report to DB endpoint:', err);
    }
  };

  const handleConfirmMatch = (matchId: string) => {
    setConfirmedMatchIds(prev => new Set(prev).add(matchId));
  };

  const handleDismissMatch = (matchId: string) => {
    setConfirmedMatchIds(prev => new Set(prev).add(matchId));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Sticky Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        lostCount={lostCount}
        foundCount={foundCount}
        matchCount={matches.length}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* Quick Test Bar */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <HelpCircle className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-200 block">{t('quickScenariosTitle')}</span>
              <span className="text-[11px] text-slate-400">{t('quickScenariosSub')}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setReports(INITIAL_SAMPLE_REPORTS)}
              className="flex-1 md:flex-initial px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors text-center"
            >
              {t('resetPromptData')}
            </button>
            <button
              onClick={() => {
                const sampleAirpods: ItemReport = {
                  id: `airpods_${Date.now()}`,
                  type: 'LOST',
                  title: 'Black AirPods Case',
                  category: 'ELECTRONICS',
                  description: 'I lost my black AirPods case yesterday near the cafeteria.',
                  originalLanguage: 'en',
                  locationName: 'Cafeteria',
                  locationZoneId: 'CAFETERIA_DINING',
                  dateOccurred: new Date().toISOString(),
                  dateReported: new Date().toISOString(),
                  status: 'OPEN',
                  contactEmail: 'student.test@univ.edu'
                };
                setReports(prev => [sampleAirpods, ...prev]);
                setActiveTab('matches');
              }}
              className="flex-1 md:flex-initial px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30 transition-colors text-center"
            >
              {t('addAirpodsScenario')}
            </button>
          </div>
        </div>

        {/* Tab Views */}
        {activeTab === 'matches' ? (
          <MatchFeed
            matches={matches}
            onSelectMatch={setSelectedMatch}
            onConfirmMatch={handleConfirmMatch}
          />
        ) : (
          <ItemGrid
            reports={reports}
            onOpenReportModal={() => setIsReportModalOpen(true)}
          />
        )}

      </main>

      {/* Side-by-Side Analysis Breakdown Modal */}
      <MatchDetailModal
        match={selectedMatch}
        onClose={() => setSelectedMatch(null)}
        onConfirmMatch={handleConfirmMatch}
        onDismissMatch={handleDismissMatch}
      />

      {/* New Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitReport={handleAddReport}
      />

    </div>
  );
}

export default function Home() {
  return (
    <LanguageProvider>
      <MatcherAppContent />
    </LanguageProvider>
  );
}
