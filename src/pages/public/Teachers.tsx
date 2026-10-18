import React, { useEffect, useState, useCallback } from 'react';
import { useI18n } from '../../i18n/LanguageProvider';
import { usePageMeta } from '../../hooks/usePageMeta';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Skeleton } from '../../components/Skeleton';
import { getTeachers } from '../../services';
import { Teacher } from '../../types';

export default function Teachers() {
  const { lang, t } = useI18n();

  // Dynamic SEO title & description
  usePageMeta({
    title: t('teachers.seoTitle'),
    description: t('teachers.seoDescription'),
  });

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTeachers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTeachers();
      setTeachers(data);
    } catch (err) {
      console.error('Failed to load teachers:', err);
      setError(t('common.errorLoading'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  if (error && !loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-16 text-center">
        <Card className="max-w-md mx-auto p-8 border-rose-200 bg-rose-50/50">
          <p className="text-rose-800 font-medium mb-4">{error}</p>
          <Button variant="primary" onClick={loadTeachers}>
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
        <div className="inline-block px-3.5 py-1 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] text-xs sm:text-sm font-semibold tracking-wide">
          {t('brand.name')}
        </div>
        <h1 className="h1-title text-[#312E81] tracking-tight">
          {t('teachers.title')}
        </h1>
        <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
          {t('teachers.subtitle')}
        </p>
      </header>

      {/* Teachers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="p-6 space-y-4 text-center">
              <Skeleton className="w-24 h-24 rounded-full mx-auto" />
              <Skeleton className="h-6 w-3/4 mx-auto" />
              <Skeleton className="h-4 w-1/2 mx-auto" />
              <Skeleton className="h-4 w-2/3 mx-auto" />
            </Card>
          ))}
        </div>
      ) : teachers.length === 0 ? (
        <div className="text-center py-12">
          <Card className="max-w-md mx-auto p-8 border-slate-200">
            <p className="text-slate-600">{t('teachers.emptyTeachers')}</p>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {teachers.map((teacher) => {
            const name = lang === 'ur' ? teacher.name_ur : teacher.name_en;
            const subject = lang === 'ur' ? teacher.subject_ur : teacher.subject_en;
            const qualification = lang === 'ur' ? teacher.qualification_ur : teacher.qualification_en;
            const experience = lang === 'ur' ? teacher.experience_ur : teacher.experience_en;

            // Generate initials for avatar placeholder
            const initials = teacher.name_en
              .split(' ')
              .filter((part) => !part.includes('.'))
              .map((n) => n[0])
              .join('')
              .slice(0, 2);

            return (
              <Card
                key={teacher.id}
                className="p-6 sm:p-7 flex flex-col items-center text-center border-slate-200/80 hover:border-[#312E81]/30 transition-all justify-between"
              >
                <div className="w-full flex flex-col items-center space-y-4">
                  {/* Photo Placeholder First */}
                  <div
                    role="img"
                    aria-label={name}
                    className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#312E81]/15 via-[#7C3AED]/20 to-[#F59E0B]/20 border-2 border-[#312E81]/30 flex items-center justify-center text-[#312E81] font-heading font-bold text-2xl shadow-xs"
                  >
                    {initials}
                  </div>

                  {/* Teacher Info */}
                  <div className="space-y-1">
                    <h2 className="h3-title text-slate-900 leading-snug">
                      {name}
                    </h2>
                    <p className="text-sm font-semibold text-[#7C3AED]">
                      {subject}
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100 w-full">
                    <p>
                      <strong className="font-semibold text-slate-700 me-1">
                        {t('teachers.qualificationLabel')}
                      </strong>
                      {qualification}
                    </p>
                    <p>
                      <strong className="font-semibold text-slate-700 me-1">
                        {t('teachers.experienceLabel')}
                      </strong>
                      {experience}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-6 border-t border-slate-100 w-full">
                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium">
                    {lang === 'ur' ? 'فعال و دستیاب' : 'Active Faculty Member'}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
