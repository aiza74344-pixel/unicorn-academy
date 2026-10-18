import React, { useState, useEffect } from 'react';
import { useI18n } from '../../i18n/LanguageProvider';
import { usePageMeta } from '../../hooks/usePageMeta';
import { getPortalAnnouncements } from '../../services/portal';
import { Announcement } from '../../types';
import { Card } from '../../components/Card';
import { Skeleton } from '../../components/Skeleton';
import { Button } from '../../components/Button';

export default function Announcements() {
  const { t, lang } = useI18n();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  usePageMeta({
    title: t('portal.announcementsPageTitle'),
    description: t('portal.announcementsPageDesc'),
    noIndex: true,
  });

  const loadAnnouncements = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPortalAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      setError(t('common.errorLoading'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === 'ur' ? 'ur-PK' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="rectangular" className="h-20 rounded-2xl" />
        <Skeleton variant="rectangular" className="h-32 rounded-2xl" />
        <Skeleton variant="rectangular" className="h-32 rounded-2xl" />
        <Skeleton variant="rectangular" className="h-32 rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">{error}</h2>
        <Button variant="primary" onClick={loadAnnouncements}>
          {t('common.retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-start">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading">
          {t('portal.announcementsPageTitle')}
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          {t('portal.announcementsPageSubtitle')}
        </p>
      </div>

      {announcements.length === 0 ? (
        <Card interactive={false} className="p-12 text-center text-slate-500">
          <svg className="w-12 h-12 mx-auto text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
          <p className="font-semibold text-slate-800">{t('portal.noAnnouncements')}</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <Card
              key={ann.id}
              interactive={false}
              className="p-5 sm:p-6 border-slate-200 hover:border-slate-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#312E81] bg-[#312E81]/10 px-2 py-0.5 rounded">
                    {ann.audience === 'students' ? t('portal.audienceStudents') : t('portal.audiencePublic')}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <time className="text-xs text-slate-500 font-medium dir-ltr">
                    {formatDate(ann.published_at)}
                  </time>
                </div>
              </div>

              <h2 className="text-lg font-bold text-slate-900 mb-2 leading-snug">
                {lang === 'ur' ? ann.title_ur : ann.title_en}
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {lang === 'ur' ? ann.body_ur : ann.body_en}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
