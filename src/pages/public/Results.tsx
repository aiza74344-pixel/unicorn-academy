import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useI18n } from '../../i18n/LanguageProvider';
import { usePageMeta } from '../../hooks/usePageMeta';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Skeleton } from '../../components/Skeleton';
import { getToppers } from '../../services';
import { Topper } from '../../types';

export default function Results() {
  const { lang, t } = useI18n();

  // Dynamic SEO title & description
  usePageMeta({
    title: t('results.seoTitle'),
    description: t('results.seoDescription'),
  });

  const [toppers, setToppers] = useState<Topper[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadToppers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getToppers();
      setToppers(data);
      // Default to latest year if available
      if (data.length > 0) {
        const maxYear = Math.max(...data.map((item) => item.year));
        setSelectedYear(maxYear);
      }
    } catch (err) {
      console.error('Failed to load toppers:', err);
      setError(t('common.errorLoading'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadToppers();
  }, [loadToppers]);

  // Extract distinct years sorted descending
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(toppers.map((t) => t.year)));
    return years.sort((a, b) => b - a);
  }, [toppers]);

  const filteredToppers = useMemo(() => {
    if (selectedYear === 'all') return toppers;
    return toppers.filter((t) => t.year === selectedYear);
  }, [toppers, selectedYear]);

  if (error && !loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-16 text-center">
        <Card className="max-w-md mx-auto p-8 border-rose-200 bg-rose-50/50">
          <p className="text-rose-800 font-medium mb-4">{error}</p>
          <Button variant="primary" onClick={loadToppers}>
            {t('common.retry')}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-10 md:py-16 space-y-12 max-w-[1200px] mx-auto px-4 sm:px-6">
      {/* Header */}
      <header className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-block">
          <Badge status="approved" label={t('results.marksLabel')} />
        </div>
        <h1 className="h1-title text-[#312E81] tracking-tight">
          {t('results.title')}
        </h1>
        <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
          {t('results.subtitle')}
        </p>
      </header>

      {/* Year Filter Chips */}
      <div className="flex flex-col items-center gap-3">
        <span className="text-xs sm:text-sm font-semibold text-slate-600">
          {t('results.filterYear')}
        </span>
        <div
          role="group"
          aria-label={t('results.filterYear')}
          className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/80 shadow-2xs gap-1 flex-wrap justify-center"
        >
          <button
            type="button"
            onClick={() => setSelectedYear('all')}
            className={`px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#312E81] ${
              selectedYear === 'all'
                ? 'bg-[#312E81] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            {t('results.allYears')}
          </button>
          {availableYears.map((yr) => (
            <button
              key={yr}
              type="button"
              onClick={() => setSelectedYear(yr)}
              className={`px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#312E81] ${
                selectedYear === yr
                  ? 'bg-[#312E81] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {yr}
            </button>
          ))}
        </div>
      </div>

      {/* Toppers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="p-6 space-y-4 text-center">
              <Skeleton className="w-20 h-20 rounded-full mx-auto" />
              <Skeleton className="h-6 w-3/4 mx-auto" />
              <Skeleton className="h-4 w-1/2 mx-auto" />
              <Skeleton className="h-8 w-2/3 mx-auto rounded-lg" />
            </Card>
          ))}
        </div>
      ) : filteredToppers.length === 0 ? (
        <div className="text-center py-12">
          <Card className="max-w-md mx-auto p-8 border-slate-200">
            <p className="text-slate-600">{t('results.emptyToppers')}</p>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredToppers.map((topper) => {
            const name = lang === 'ur' ? topper.name_ur : topper.name_en;
            const classLabel = lang === 'ur' ? topper.class_label_ur : topper.class_label_en;
            const initials = topper.name_en
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2);

            return (
              <Card
                key={topper.id}
                className="p-6 text-center flex flex-col items-center justify-between border-slate-200/80 hover:border-[#F59E0B]/50 transition-all"
              >
                <div className="space-y-3.5 w-full">
                  {/* Photo Placeholder First */}
                  <div
                    role="img"
                    aria-label={name}
                    className="w-20 h-20 rounded-full mx-auto bg-gradient-to-tr from-[#312E81]/15 to-[#F59E0B]/20 border-2 border-[#F59E0B] flex items-center justify-center text-[#312E81] font-bold text-xl font-heading shadow-xs"
                  >
                    {initials}
                  </div>

                  <div>
                    <h2 className="h3-title text-slate-900 leading-snug">
                      {name}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      {classLabel}
                    </p>
                  </div>

                  {/* Marks with Gold Accent */}
                  <div className="py-2.5 px-3 rounded-lg bg-[#FEF3C7] border border-[#FCD34D]/80">
                    <span className="text-[11px] font-medium text-[#92400E] block uppercase tracking-wider">
                      {t('results.marksLabel')}
                    </span>
                    <span className="text-lg font-bold text-[#B45309] font-heading">
                      {topper.marks}
                    </span>
                  </div>
                </div>

                <div className="pt-3 mt-4 border-t border-slate-100 w-full text-xs text-slate-500 font-medium">
                  {t('results.yearLabel')}: {topper.year}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Motivational Apply Now CTA at Bottom */}
      <section className="bg-slate-50/90 rounded-2xl border border-slate-200/80 p-8 sm:p-12 text-center shadow-xs flex flex-col items-center space-y-4">
        <h2 className="h2-title text-[#312E81] max-w-xl">
          {t('results.ctaTitle')}
        </h2>
        <p className="text-slate-600 text-sm sm:text-base max-w-lg leading-relaxed">
          {t('results.ctaSubtitle')}
        </p>
        <div className="pt-2">
          <Button to="/admission" variant="accent" className="px-8 shadow-md">
            {t('common.applyNow')}
          </Button>
        </div>
      </section>
    </div>
  );
}
