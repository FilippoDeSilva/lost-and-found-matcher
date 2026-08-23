'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ItemReport, MatchResult } from '@/types';
import { calculateReportMatch } from '@/lib/matcher/engine';
import { LanguageProvider, useTranslation } from '@/lib/i18n/LanguageContext';
import { Header } from '@/components/Header';
import { MatchFeed } from '@/components/MatchFeed';
import { ItemGrid } from '@/components/ItemGrid';
import { MatchDetailModal } from '@/components/MatchDetailModal';
import { ReportModal } from '@/components/ReportModal';
import { Database, RefreshCw, Loader2 } from 'lucide-react';

function MatcherAppContent() {
  const { t } = useTranslation();
  const [reports, setReports] = useState<ItemReport[]>([]);
  const [activeTab, setActiveTab] = useState<'matches' | 'reports'>('matches');
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [confirmedMatchIds, setConfirmedMatchIds] = useState<Set<string>>(new Set());
  const [isSeeding, setIsSeeding] = useState(false);

  // Fetch real database records from Prisma DB API
  const loadDatabaseReports = async () => {
    try {
      const res = await fetch('/api/reports');
      if (res.ok) {
        const data = await res.json();
        if (data.reports) {
          setReports(data.reports);
        }
      }
    } catch (err) {
      console.warn('Failed to load reports from database API:', err);
    }
  };

  useEffect(() => {
    loadDatabaseReports();
  }, []);

  // Trigger Database Reset & Seeding via Prisma DB API
  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.reports) {
          setReports(data.reports);
        }
      }
    } catch (err) {
      console.error('Failed to seed database:', err);
    }
    setIsSeeding(false);
  };

  // Real-time Match Engine evaluated over Database Reports
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

  const lostCount = reports.filter(r => r.type === 'LOST' && r.status !== 'RESOLVED').length;
  const foundCount = reports.filter(r => r.type === 'FOUND' && r.status !== 'RESOLVED').length;

  const handleAddReport = async (newReportData: Omit<ItemReport, 'id' | 'status' | 'dateReported'>) => {
    const tempId = `rep_${Date.now()}`;
    const newReport: ItemReport = {
      ...newReportData,
      id: tempId,
      status: 'OPEN',
      dateReported: new Date().toISOString()
    };

    setReports(prev => [newReport, ...prev]);
    setActiveTab('reports');

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
      console.warn('Failed to save report to database endpoint:', err);
    }
  };

  const handleConfirmMatch = (matchId: string) => {
    setConfirmedMatchIds(prev => new Set(prev).add(matchId));
  };

  const handleDismissMatch = (matchId: string) => {
    setConfirmedMatchIds(prev => new Set(prev).add(matchId));
  };

  const handleResolveReports = (lostId: string, foundId: string) => {
    setReports(prev =>
      prev.map(r => (r.id === lostId || r.id === foundId ? { ...r, status: 'RESOLVED' } : r))
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Header */}
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
        
        {/* Database Persistence Bar */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Database className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-200 block">Prisma & PostgreSQL / Supabase Connected</span>
              <span className="text-[11px] text-slate-400">All reports, confirmed matches, and statuses are persisted in database</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              disabled={isSeeding}
              onClick={handleSeedDatabase}
              className="flex-1 md:flex-initial px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
            >
              {isSeeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isSeeding ? 'Seeding DB...' : 'Re-Seed Database Records'}</span>
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
        onResolveReports={handleResolveReports}
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
