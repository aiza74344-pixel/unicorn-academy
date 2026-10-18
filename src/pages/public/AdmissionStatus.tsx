import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useI18n } from '../../i18n/LanguageProvider';
import { usePageMeta } from '../../hooks/usePageMeta';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { FormField } from '../../components/FormField';
import { getAdmissionStatus } from '../../services';
import { AdmissionStatusResult } from '../../types';

export default function AdmissionStatus() {
  const { lang, t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();

  usePageMeta({
    title: t('status.seoTitle'),
    description: t('status.seoDescription'),
  });

  const [refInput, setRefInput] = useState('');
  const [result, setResult] = useState<AdmissionStatusResult | null | undefined>(undefined);
  const [isSearching, setIsSearching] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [formatError, setFormatError] = useState<string | null>(null);

  const checkStatus = useCallback(
    async (refNo: string) => {
      const cleanRef = refNo.trim().toUpperCase();
      if (!cleanRef) return;

      // Basic reference format validation
      if (!/^ADM-[0-9]{6}$/.test(cleanRef)) {
        setFormatError(t('status.errInvalidFormat'));
        setResult(undefined);
        return;
      }

      setFormatError(null);
      setIsSearching(true);
      setIsRateLimited(true);

      try {
        const res = await getAdmissionStatus(cleanRef);
        setResult(res);
      } catch (err) {
        console.error('Failed to get status:', err);
        setResult(null);
      } finally {
        setIsSearching(false);
        // Rate-limit check button for 2 seconds
        setTimeout(() => setIsRateLimited(false), 2000);
      }
    },
    [t]
  );

  // Check ref from URL parameter on initial load
  useEffect(() => {
    const urlRef = searchParams.get('ref');
    if (urlRef) {
      setRefInput(urlRef.toUpperCase());
      checkStatus(urlRef);
    }
  }, [searchParams, checkStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRateLimited || isSearching) return;
    setSearchParams({ ref: refInput.trim().toUpperCase() });
    checkStatus(refInput);
  };

  return (
    <div className="py-10 md:py-16 space-y-10 max-w-[1200px] mx-auto px-4 sm:px-6">
      {/* Header */}
      <header className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-block px-3.5 py-1 rounded-full bg-[#312E81]/8 text-[#312E81] text-xs sm:text-sm font-semibold tracking-wide">
          {t('brand.name')}
        </div>
        <h1 className="h1-title text-[#312E81] tracking-tight">
          {t('status.pageTitle')}
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          {t('status.pageSubtitle')}
        </p>
      </header>

      {/* Search Input Box */}
      <Card className="max-w-xl mx-auto p-6 sm:p-8 border-slate-200/80 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4 text-start">
          <div>
            <FormField
              label={t('status.inputLabel')}
              placeholder={t('status.inputPlaceholder')}
              required
              dir="ltr"
              value={refInput}
              error={formatError || undefined}
              onChange={(e) => {
                setRefInput(e.target.value.toUpperCase());
                if (formatError) setFormatError(null);
              }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <Button
              type="submit"
              variant="primary"
              loading={isSearching}
              disabled={isRateLimited || isSearching || !refInput.trim()}
              className="w-full sm:w-auto px-6"
            >
              {isSearching ? t('status.checkingBtn') : t('status.checkBtn')}
            </Button>

            {isRateLimited && (
              <span className="text-xs text-slate-500 italic">
                {t('status.rateLimitNotice')}
              </span>
            )}
          </div>
        </form>

        {/* Sample Reference Numbers for easy testing */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-start text-xs text-slate-500 space-y-1.5">
          <p className="font-semibold text-slate-600">
            {t('status.sampleNotice')}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {['ADM-000123', 'ADM-000124', 'ADM-000125'].map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => {
                  setRefInput(sample);
                  setSearchParams({ ref: sample });
                  checkStatus(sample);
                }}
                className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-medium transition-colors cursor-pointer"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Result Display Card */}
      {result !== undefined && (
        <div className="max-w-xl mx-auto w-full">
          {result ? (
            <Card className="p-6 sm:p-8 border-slate-200 shadow-md space-y-6 text-start animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="font-heading font-bold text-lg text-slate-900">
                  {t('status.resultHeading')}
                </h2>
                <Badge status={result.status} />
              </div>

              {/* Status details */}
              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                  <span className="text-slate-500">{t('status.fieldRef')}</span>
                  <span className="font-mono font-bold text-[#312E81] text-base" dir="ltr">
                    {result.reference_no}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                  <span className="text-slate-500">{t('status.fieldStudent')}</span>
                  <span className="font-semibold text-slate-800">
                    {result.student_name_masked}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                  <span className="text-slate-500">{t('status.fieldClass')}</span>
                  <span className="font-medium text-slate-800">
                    {lang === 'ur'
                      ? result.class_name_ur || 'منتخب کلاس'
                      : result.class_name_en || 'Selected Class'}
                  </span>
                </div>
              </div>

              {/* Status-specific advisory note */}
              <div className="pt-2">
                {result.status === 'pending' && (
                  <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200/80 text-xs sm:text-sm text-indigo-950 flex items-start gap-2.5">
                    <svg className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>{t('status.pendingNote')}</p>
                  </div>
                )}

                {result.status === 'approved' && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs sm:text-sm text-emerald-950 flex items-start gap-2.5">
                    <svg className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    <p>{t('status.approvedNote')}</p>
                  </div>
                )}

                {result.status === 'rejected' && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200/80 text-xs sm:text-sm text-rose-950 space-y-3">
                    <div>
                      <p className="font-semibold text-rose-900">
                        {t('status.rejectedNote')}
                      </p>
                      <p className="mt-1 text-slate-700">
                        {result.reject_reason ||
                          'Seat quota reached for this academic batch.'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-rose-200/60 flex items-center justify-between gap-3">
                      <span className="text-xs text-rose-800">
                        {t('status.rejectedContact')}
                      </span>
                      <Button
                        to="/contact"
                        variant="secondary"
                        className="!min-h-[36px] !px-3 !py-1 text-xs"
                      >
                        {t('status.btnContactDesk')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            /* Not Found Box */
            <Card className="p-6 sm:p-8 border-amber-200 bg-amber-50/50 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <div>
                <h2 className="font-heading font-semibold text-base text-slate-900">
                  {t('status.notFoundTitle')}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto">
                  {t('status.notFoundBody')}
                </p>
              </div>

              <div className="pt-2">
                <Button to="/admission" variant="primary" className="!text-sm">
                  {t('status.btnApplyNew')}
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
