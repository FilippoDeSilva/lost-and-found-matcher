'use client';

import React, { useState } from 'react';
import { ItemReport, ReportType, ReportCategory, Language } from '@/types';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { resolveLocationZone } from '@/lib/matcher/locations';
import { X, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReport: (report: Omit<ItemReport, 'id' | 'status' | 'dateReported'>) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onSubmitReport
}) => {
  const { t, language } = useTranslation();
  const [type, setType] = useState<ReportType>('LOST');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ReportCategory>('ELECTRONICS');
  const [description, setDescription] = useState('');
  const [originalLanguage, setOriginalLanguage] = useState<Language>(language);
  const [locationName, setLocationName] = useState('');
  const [dateOccurred, setDateOccurred] = useState(new Date().toISOString().slice(0, 16));
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !contactEmail.trim() || !locationName.trim()) return;

    const locationZoneId = resolveLocationZone(locationName);

    onSubmitReport({
      type,
      title: title.trim(),
      category,
      description: description.trim(),
      originalLanguage,
      locationName: locationName.trim(),
      locationZoneId,
      dateOccurred: new Date(dateOccurred).toISOString(),
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim() || undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-4 sm:my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 shrink-0">
              <PlusCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100">{t('submitModalTitle')}</h2>
              <p className="text-[11px] sm:text-xs text-slate-400">{t('submitModalSub')}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3.5 sm:space-y-4">
          
          {/* Report Type Selector */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 p-1.5 bg-slate-950/60 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setType('LOST')}
              className={`py-2 sm:py-2.5 rounded-xl font-bold text-[11px] sm:text-xs transition-all flex items-center justify-center gap-1.5 ${
                type === 'LOST'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{t('iLostItem')}</span>
            </button>

            <button
              type="button"
              onClick={() => setType('FOUND')}
              className={`py-2 sm:py-2.5 rounded-xl font-bold text-[11px] sm:text-xs transition-all flex items-center justify-center gap-1.5 ${
                type === 'FOUND'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{t('iFoundItem')}</span>
            </button>
          </div>

          {/* Title & Language */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-300">{t('itemTitleLabel')}</label>
              <Input
                type="text"
                required
                placeholder={t('itemTitlePlaceholder')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">{t('reportLangLabel')}</label>
              <select
                value={originalLanguage}
                onChange={(e) => setOriginalLanguage(e.target.value as Language)}
                className="w-full h-10 bg-slate-950/80 border border-slate-800 rounded-xl px-3 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="en">🇺🇸 English</option>
                <option value="es">🇪🇸 Español</option>
                <option value="fr">🇫🇷 Français</option>
                <option value="am">🇪🇹 አማርኛ</option>
              </select>
            </div>
          </div>

          {/* Category & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">{t('categoryLabel')}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ReportCategory)}
                className="w-full h-10 bg-slate-950/80 border border-slate-800 rounded-xl px-3 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="ELECTRONICS">{t('catELECTRONICS')}</option>
                <option value="BAGS">{t('catBAGS')}</option>
                <option value="PERSONAL_ITEMS">{t('catPERSONAL_ITEMS')}</option>
                <option value="KEYS">{t('catKEYS')}</option>
                <option value="DOCUMENTS">{t('catDOCUMENTS')}</option>
                <option value="CLOTHING">{t('catCLOTHING')}</option>
                <option value="OTHER">{t('catOTHER')}</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">{t('locationLabel')}</label>
              <Input
                type="text"
                required
                placeholder={t('locationPlaceholder')}
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">{t('descriptionLabel')}</label>
            <textarea
              required
              rows={3}
              placeholder={t('descriptionPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Date & Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">{t('dateLabel')}</label>
              <Input
                type="datetime-local"
                required
                value={dateOccurred}
                onChange={(e) => setDateOccurred(e.target.value)}
                className="text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">{t('contactEmailLabel')}</label>
              <Input
                type="email"
                required
                placeholder="student@university.edu"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="default"
              className="w-full py-3 h-12 text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/20"
            >
              {t('submitBtn')}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
};
