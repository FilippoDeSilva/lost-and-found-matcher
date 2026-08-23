'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ItemReport, MatchResult } from '@/types';
import { calculateReportMatch } from '@/lib/matcher/engine';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { Header } from '@/components/Header';
import { MatchFeed } from '@/components/MatchFeed';
import { ItemGrid } from '@/components/ItemGrid';
import { MatchDetailModal } from '@/components/MatchDetailModal';
import { ReportModal } from '@/components/ReportModal';

function MatcherAppContent() {
  const [reports, setReports] = useState<ItemReport[]>([]);
  const [activeTab, setActiveTab] = useState<'matches' | 'reports'>('matches');
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [confirmedMatchIds, setConfirmedMatchIds] = useState<Set<string>>(new Set());

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

  // Real-time Match Engine: Latest report timestamp matches ALWAYS come first!
  const matches = useMemo(() => {
    const lostList = reports.filter(r => r.type === 'LOST' && r.status === 'OPEN');
    const foundList = reports.filter(r => r.type === 'FOUND' && r.status === 'OPEN');

    const results: MatchResult[] = [];

    for (const lost of lostList) {
      for (const found of foundList) {
        const match = calculateReportMatch(lost, found);
        if (match.overallScore >= 50 && !confirmedMatchIds.has(match.id)) {
          results.push(match);
        }
      }
    }

    // Sort matches: Latest reports timestamp first!
    return results.sort((a, b) => {
      const timeA = Math.max(
        new Date(a.lostReport.dateReported || a.lostReport.dateOccurred || 0).getTime(),
        new Date(a.foundReport.dateReported || a.foundReport.dateOccurred || 0).getTime()
      );
      const timeB = Math.max(
        new Date(b.lostReport.dateReported || b.lostReport.dateOccurred || 0).getTime(),
        new Date(b.foundReport.dateReported || b.foundReport.dateOccurred || 0).getTime()
      );

      if (timeB !== timeA) {
        return timeB - timeA;
      }
      return b.overallScore - a.overallScore;
    });
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
