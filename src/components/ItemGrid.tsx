'use client';

import React, { useState, useMemo } from 'react';
import { ItemReport, ReportType, ReportCategory } from '@/types';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { useTranslatedReport } from '@/lib/hooks/useTranslatedReport';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MapPin, Calendar, Mail, Search, Languages, Loader2 } from 'lucide-react';

interface ItemGridProps {
  reports: ItemReport[];
  onOpenReportModal: () => void;
}

const ReportCardItem: React.FC<{ report: ItemReport }> = ({ report }) => {
  const { t } = useTranslation();
  const { title, description, isTranslating, isTranslated } = useTranslatedReport(report);

  return (
    <Card className="p-4 sm:p-5 flex flex-col justify-between space-y-3 sm:space-y-4 hover:border-slate-700 transition-all">
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <Badge variant={report.type === 'LOST' ? 'amber' : 'emerald'} className="text-[10px] sm:text-xs">
            {report.type === 'LOST' ? t('iLostItem') : t('iFoundItem')}
          </Badge>
          
          <div className="flex items-center gap-1">
            {isTranslating ? (
              <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                <Loader2 className="w-3 h-3 animate-spin" /> Translating...
              </span>
            ) : isTranslated ? (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                <Languages className="w-3 h-3" /> Auto-Translated
              </span>
            ) : null}
            <span className="text-[10px] sm:text-[11px] text-slate-400 uppercase font-mono bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
              {report.originalLanguage}
            </span>
          </div>
        </div>

        <h3 className="text-sm sm:text-base font-bold text-slate-100">{title || report.title}</h3>
        
        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800 line-clamp-3">
          "{description || report.description}"
        </p>
      </div>

      <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="truncate">{report.locationName} ({report.locationZoneId})</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>{new Date(report.dateOccurred).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="truncate">{report.contactEmail}</span>
        </div>
      </div>
    </Card>
  );
};

export const ItemGrid: React.FC<ItemGridProps> = ({ reports, onOpenReportModal }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<ReportType | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<ReportCategory | 'ALL'>('ALL');

  // Filter & Sort Reports by Latest Timestamp Descending
  const sortedAndFilteredReports = useMemo(() => {
    return reports
      .filter(rep => {
        const matchesType = typeFilter === 'ALL' || rep.type === typeFilter;
        const matchesCategory = categoryFilter === 'ALL' || rep.category === categoryFilter;
        const query = searchTerm.toLowerCase();
        const matchesSearch = !searchTerm ||
          rep.title.toLowerCase().includes(query) ||
          rep.description.toLowerCase().includes(query) ||
          rep.locationName.toLowerCase().includes(query);

        return matchesType && matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        const timeA = new Date(a.dateReported || a.dateOccurred || 0).getTime();
        const timeB = new Date(b.dateReported || b.dateOccurred || 0).getTime();
        return timeB - timeA; // Latest/newest reports first!
      });
  }, [reports, typeFilter, categoryFilter, searchTerm]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Search & Filter Controls */}
      <Card className="p-3.5 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
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

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
          {/* Type Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 rounded-xl px-2.5 sm:px-3 py-1.5 text-xs text-slate-300 flex-1 sm:flex-initial">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as ReportType | 'ALL')}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer w-full"
            >
              <option value="ALL" className="bg-slate-900">{t('allReportTypes')}</option>
              <option value="LOST" className="bg-slate-900">{t('lostOnly')}</option>
              <option value="FOUND" className="bg-slate-900">{t('foundOnly')}</option>
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

      {/* Grid List displaying sortedAndFilteredReports */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {sortedAndFilteredReports.map(report => (
          <ReportCardItem key={report.id} report={report} />
        ))}
      </div>
    </div>
  );
};
