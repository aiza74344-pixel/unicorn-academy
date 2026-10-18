import React, { useEffect, useState, useCallback } from 'react';
import { useI18n } from '../../i18n/LanguageProvider';
import { usePageMeta } from '../../hooks/usePageMeta';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Skeleton } from '../../components/Skeleton';
import { getSiteSettings } from '../../services';
import { SiteSettings } from '../../types';

export default function About() {
  const { lang, t } = useI18n();

  // Dynamic SEO title & description
  usePageMeta({
    title: t('about.seoTitle'),
    description: t('about.seoDescription'),
  });

  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSiteSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load about data:', err);
      setError(t('common.errorLoading'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  if (error && !loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-16 text-center">
        <Card className="max-w-md mx-auto p-8 border-rose-200 bg-rose-50/50">
          <p className="text-rose-800 font-medium mb-4">{error}</p>
          <Button variant="primary" onClick={loadSettings}>
            {t('common.retry')}
          </Button>
        </Card>
      </div>
    );
  }

  const history =
    lang === 'ur' ? settings?.about_history_ur : settings?.about_history_en;
  const mission =
    lang === 'ur' ? settings?.about_mission_ur : settings?.about_mission_en;
  const vision =
    lang === 'ur' ? settings?.about_vision_ur : settings?.about_vision_en;

  return (
    <div className="py-10 md:py-16 space-y-16 max-w-[1200px] mx-auto px-4 sm:px-6">
      {/* 1. Page Header with Title and Short Intro */}
      <header className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-block px-3.5 py-1 rounded-full bg-[#312E81]/8 text-[#312E81] text-xs sm:text-sm font-semibold tracking-wide">
          {t('brand.name')}
        </div>
        <h1 className="h1-title text-[#312E81] tracking-tight">
          {t('about.title')}
        </h1>
        <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
          {t('about.intro')}
        </p>
      </header>

      {/* 2. Visual Placeholder Image (Styled block in soft indigo/violet with inline SVG & alt text) */}
      <div className="w-full flex justify-center">
        <div
          role="img"
          aria-label={t('about.imageAlt')}
          className="w-full max-w-4xl aspect-[16/9] sm:aspect-[21/9] rounded-2xl bg-gradient-to-br from-[#312E81]/12 via-[#7C3AED]/12 to-[#F59E0B]/10 border border-[#312E81]/15 p-6 sm:p-10 flex flex-col justify-between shadow-xs overflow-hidden relative"
        >
          <div className="flex items-center justify-between">
            <span className="px-3.5 py-1 rounded-full bg-white/80 backdrop-blur-xs text-xs font-semibold text-[#312E81] border border-white/60">
              Sadiqabad, Punjab
            </span>
            <div className="w-9 h-9 rounded-full bg-[#F59E0B] text-[#1E1B4B] flex items-center justify-center font-bold text-xs font-heading">
              UA
            </div>
          </div>

          <div className="flex flex-col items-center justify-center my-auto text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-white/90 shadow-xs flex items-center justify-center text-[#7C3AED]">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="font-heading font-semibold text-slate-800 text-sm sm:text-base">
              Unicorn Academy Campus
            </p>
            <p className="text-xs text-slate-500 max-w-sm">
              Equipped with modern tutorial halls, disciplined test rooms, and expert mentorship.
            </p>
          </div>

          <div className="text-center pt-2 border-t border-slate-200/50">
            <span className="text-xs text-slate-500 font-medium">
              Established 2014 • Over a Decade of Educational Leadership
            </span>
          </div>
        </div>
      </div>

      {/* 3. Three Blocks: Our History, Our Mission, Our Vision (Clean readable layout, max 70 chars per line) */}
      <section className="space-y-8" aria-label="Institutional Pillars">
        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-44 w-full rounded-xl" />
            <Skeleton className="h-44 w-full rounded-xl" />
            <Skeleton className="h-44 w-full rounded-xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 text-start">
            {/* Block 1: Our History */}
            <Card className="p-6 sm:p-8 flex flex-col justify-between border-slate-200/80">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#312E81]/8 text-[#312E81] flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="h2-title text-[#312E81]">
                  {t('about.historyTitle')}
                </h2>
                {/* Max 70 characters line constraint for comfortable reading */}
                <p className="text-slate-600 text-base leading-relaxed max-w-[65ch]">
                  {history}
                </p>
              </div>
            </Card>

            {/* Block 2: Our Mission */}
            <Card className="p-6 sm:p-8 flex flex-col justify-between border-slate-200/80">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="h2-title text-[#7C3AED]">
                  {t('about.missionTitle')}
                </h2>
                <p className="text-slate-600 text-base leading-relaxed max-w-[65ch]">
                  {mission}
                </p>
              </div>
            </Card>

            {/* Block 3: Our Vision */}
            <Card className="p-6 sm:p-8 flex flex-col justify-between border-slate-200/80">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/12 text-[#B45309] flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h2 className="h2-title text-[#B45309]">
                  {t('about.visionTitle')}
                </h2>
                <p className="text-slate-600 text-base leading-relaxed max-w-[65ch]">
                  {vision}
                </p>
              </div>
            </Card>
          </div>
        )}
      </section>

      {/* 4. Small Values List (3 Items) */}
      <section className="bg-slate-50/90 rounded-2xl border border-slate-200/80 p-8 sm:p-12 text-start">
        <div className="mb-8 max-w-2xl">
          <h2 className="h2-title text-[#312E81]">{t('about.valuesTitle')}</h2>
          <p className="text-slate-600 text-sm sm:text-base mt-1">
            {t('brand.tagline')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Value 1 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200/70 shadow-2xs space-y-2.5">
            <div className="w-10 h-10 rounded-lg bg-[#312E81]/8 text-[#312E81] flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="font-heading font-semibold text-base text-slate-900">
              {t('about.value1Title')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-[60ch]">
              {t('about.value1Desc')}
            </p>
          </div>

          {/* Value 2 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200/70 shadow-2xs space-y-2.5">
            <div className="w-10 h-10 rounded-lg bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-heading font-semibold text-base text-slate-900">
              {t('about.value2Title')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-[60ch]">
              {t('about.value2Desc')}
            </p>
          </div>

          {/* Value 3 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200/70 shadow-2xs space-y-2.5">
            <div className="w-10 h-10 rounded-lg bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-heading font-semibold text-base text-slate-900">
              {t('about.value3Title')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-[60ch]">
              {t('about.value3Desc')}
            </p>
          </div>
        </div>
      </section>

      {/* 5. Bottom Call to Action Section with "Apply Now" Button */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-12 text-center shadow-xs flex flex-col items-center space-y-5">
        <h2 className="h2-title text-[#312E81] max-w-xl">
          {t('about.ctaTitle')}
        </h2>
        <p className="text-slate-600 text-sm sm:text-base max-w-lg leading-relaxed">
          {t('about.ctaSubtitle')}
        </p>
        <div className="pt-2">
          {/* Primary CTA */}
          <Button to="/admission" variant="accent" className="px-8 shadow-md">
            {t('about.applyNow')}
          </Button>
        </div>
      </section>
    </div>
  );
}
