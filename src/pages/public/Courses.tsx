import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useI18n } from '../../i18n/LanguageProvider';
import { usePageMeta } from '../../hooks/usePageMeta';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Skeleton } from '../../components/Skeleton';
import { getClasses } from '../../services';
import { ClassItem, ClassLevel } from '../../types';

export default function Courses() {
  const { lang, dir, t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();

  // Dynamic SEO title & description
  usePageMeta({
    title: t('courses.seoTitle'),
    description: t('courses.seoDescription'),
  });

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Read level from URL or default to 'primary'
  const validLevels: ClassLevel[] = ['primary', 'middle', 'matric', 'fsc'];
  const currentLevelParam = searchParams.get('level') as ClassLevel;
  const activeLevel: ClassLevel = validLevels.includes(currentLevelParam)
    ? currentLevelParam
    : 'primary';

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const loadClasses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getClasses();
      setClasses(data);
    } catch (err) {
      console.error('Failed to load classes:', err);
      setError(t('common.errorLoading'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const handleSelectLevel = (lvl: ClassLevel) => {
    setSearchParams({ level: lvl });
  };

  const tabs: { key: ClassLevel; label: string }[] = [
    { key: 'primary', label: t('courses.tabPrimary') },
    { key: 'middle', label: t('courses.tabMiddle') },
    { key: 'matric', label: t('courses.tabMatric') },
    { key: 'fsc', label: t('courses.tabFsc') },
  ];

  // Keyboard navigation for tablist
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const isRtl = dir === 'rtl';
    let nextIndex: number | null = null;

    if (e.key === 'ArrowRight') {
      nextIndex = isRtl ? (index - 1 + tabs.length) % tabs.length : (index + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = isRtl ? (index + 1) % tabs.length : (index - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = tabs.length - 1;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      const nextTab = tabs[nextIndex];
      handleSelectLevel(nextTab.key);
      tabRefs.current[nextIndex]?.focus();
    }
  };

  const filteredClasses = classes.filter((c) => c.level === activeLevel && c.is_active);

  if (error && !loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-16 text-center">
        <Card className="max-w-md mx-auto p-8 border-rose-200 bg-rose-50/50">
          <p className="text-rose-800 font-medium mb-4">{error}</p>
          <Button variant="primary" onClick={loadClasses}>
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
          <Badge status="admission_open" label={t('badge.admissionOpen')} />
        </div>
        <h1 className="h1-title text-[#312E81] tracking-tight">
          {t('courses.title')}
        </h1>
        <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
          {t('courses.subtitle')}
        </p>
      </header>

      {/* Accessible Level Tabs */}
      <div className="flex justify-center">
        <div
          role="tablist"
          aria-label={t('courses.title')}
          className="inline-flex p-1.5 rounded-2xl bg-slate-100/90 border border-slate-200/80 shadow-2xs overflow-x-auto max-w-full"
        >
          {tabs.map((tab, idx) => {
            const isSelected = tab.key === activeLevel;
            return (
              <button
                key={tab.key}
                ref={(el) => {
                  tabRefs.current[idx] = el;
                }}
                role="tab"
                id={`tab-${tab.key}`}
                aria-selected={isSelected}
                aria-controls={`tabpanel-${tab.key}`}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => handleSelectLevel(tab.key)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className={`px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#312E81] ${
                  isSelected
                    ? 'bg-[#312E81] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panel & Classes Grid */}
      <div
        id={`tabpanel-${activeLevel}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeLevel}`}
        className="w-full"
      >
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-6 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </Card>
            ))}
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="text-center py-12">
            <Card className="max-w-md mx-auto p-8 border-slate-200">
              <p className="text-slate-600">{t('courses.emptyLevel')}</p>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredClasses.map((cls) => {
              const name = lang === 'ur' ? cls.name_ur : cls.name_en;
              const subjects = lang === 'ur' ? cls.subjects_ur : cls.subjects_en;

              // Format fee with Intl
              const locale = lang === 'ur' ? 'ur-PK' : 'en-PK';
              const formattedFee = new Intl.NumberFormat(locale).format(cls.monthly_fee);

              return (
                <Card
                  key={cls.id}
                  className="p-6 flex flex-col justify-between border-slate-200/80 hover:border-[#312E81]/30 transition-all text-start"
                >
                  <div className="space-y-4">
                    {/* Top Level / Group Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs uppercase font-semibold text-[#7C3AED] bg-[#7C3AED]/10 px-2.5 py-0.5 rounded-full">
                        {cls.level}
                      </span>
                      {cls.group_name && (
                        <span className="text-xs font-medium text-slate-500 uppercase">
                          {cls.group_name.replace('_', ' ')}
                        </span>
                      )}
                    </div>

                    {/* Class Name */}
                    <h2 className="h3-title text-slate-900 leading-snug">
                      {name}
                    </h2>

                    {/* Timings */}
                    <div className="text-xs text-slate-600 flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <svg className="w-4 h-4 text-[#312E81] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>
                        <strong className="font-semibold text-slate-700 me-1">
                          {t('courses.timingLabel')}
                        </strong>
                        {cls.timing}
                      </span>
                    </div>

                    {/* Subjects */}
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        {t('courses.subjectsLabel')}
                      </p>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {subjects.map((sub, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#312E81] shrink-0" />
                            <span className="truncate">{sub}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Fee & Apply Button */}
                  <div className="pt-4 mt-6 border-t border-slate-100 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500 font-medium">
                        {t('courses.feeLabel')}
                      </span>
                      <span className="text-base font-bold text-[#312E81] font-heading">
                        {formattedFee} {lang === 'ur' ? 'روپے' : 'PKR'}{' '}
                        <span className="text-xs font-normal text-slate-500">
                          {t('courses.perMonth')}
                        </span>
                      </span>
                    </div>

                    <Button
                      to={`/admission?class=${cls.id}`}
                      variant="primary"
                      className="w-full !text-sm !min-h-[42px]"
                    >
                      {t('courses.applyForClass')}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
