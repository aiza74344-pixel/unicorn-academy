import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/LanguageProvider';
import { usePageMeta } from '../../hooks/usePageMeta';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Skeleton } from '../../components/Skeleton';
import { CountUpNumber } from '../../components/CountUpNumber';
import {
  getSiteSettings,
  getStats,
  getToppers,
  getTestimonials,
} from '../../services';
import { SiteSettings, Stats, Topper, Testimonial } from '../../types';

export default function Home() {
  const { lang, t } = useI18n();

  // Dynamic SEO title & description
  usePageMeta({
    title: t('home.seoTitle'),
    description: t('home.seoDescription'),
  });

  // State
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [toppers, setToppers] = useState<Topper[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHomeData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [settingsData, statsData, toppersData, testimonialsData] =
        await Promise.all([
          getSiteSettings(),
          getStats(),
          getToppers(),
          getTestimonials(),
        ]);
      setSettings(settingsData);
      setStats(statsData);
      setToppers(toppersData);
      setTestimonials(testimonialsData);
    } catch (err) {
      console.error('Failed to load Home data:', err);
      setError(t('common.errorLoading'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  const slogan =
    lang === 'ur'
      ? settings?.academy_slogan_ur || 'علم، فہم اور کردار کی باوقار تربیت کا مرکز'
      : settings?.academy_slogan_en || 'Igniting Minds, Inspiring Character, Shaping Futures';

  const whatsappLink = `https://wa.me/${settings?.whatsapp || '923000000000'}?text=${encodeURIComponent(
    lang === 'ur'
      ? 'السلام علیکم! مجھے یونیکورن اکیڈمی صادق آباد میں داخلے کی معلومات درکار ہیں۔'
      : 'Hello! I would like to inquire about admissions at Unicorn Academy Sadiqabad.'
  )}`;

  const callLink = `tel:${settings?.phone || '0300-0000000'}`;

  // Error boundary state
  if (error && !loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-16 text-center">
        <Card className="max-w-md mx-auto p-8 border-rose-200 bg-rose-50/50">
          <p className="text-rose-800 font-medium mb-4">{error}</p>
          <Button variant="primary" onClick={loadHomeData}>
            {t('common.retry')}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full pb-16 space-y-16 md:space-y-24">
      {/* SECTION 1: Top Admission Open Banner (shown only if admission_open_banner is true) */}
      {settings?.admission_open_banner && (
        <aside
          aria-label="Important announcement"
          className="w-full bg-[#FEF3C7] border-b border-[#FCD34D] text-[#92400E] px-4 py-2.5 text-center transition-colors"
        >
          <div className="max-w-[1200px] mx-auto flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm font-medium">
            <span className="flex items-center gap-1.5 font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#D97706] animate-ping" />
              <span>{t('home.bannerText')}</span>
            </span>
            <Link
              to="/admission"
              className="inline-flex items-center gap-1 text-[#312E81] hover:text-[#1E1B4B] font-bold underline underline-offset-4 decoration-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#312E81] rounded-xs"
            >
              <span>{t('home.bannerCta')}</span>
              <svg
                className="w-3.5 h-3.5 rtl:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </aside>
      )}

      {/* SECTION 2: Hero */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 w-full pt-4 md:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Hero Content */}
          <div className="lg:col-span-7 text-start space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge status="admission_open" label={t('home.heroBadge')} />
              <span className="text-xs sm:text-sm font-medium text-[#7C3AED] bg-[#7C3AED]/10 px-3 py-0.5 rounded-full">
                {slogan}
              </span>
            </div>

            <h1 className="h1-title text-[#312E81] tracking-tight leading-tight">
              {t('home.heroHeadline')}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              {t('home.heroSupporting')}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              {/* Primary CTA */}
              <Button to="/admission" variant="accent" className="shadow-md px-6">
                {t('home.heroApplyNow')}
              </Button>

              {/* WhatsApp Button */}
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center font-medium rounded-lg text-base min-h-[44px] px-5 py-2.5 transition-all duration-200 cursor-pointer border-2 border-[#16A34A] text-[#16A34A] hover:bg-[#16A34A]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A]"
              >
                <svg className="w-5 h-5 me-2 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67Z" />
                </svg>
                <span>{t('home.heroWhatsApp')}</span>
              </a>

              {/* Call Direct Link */}
              <a
                href={callLink}
                className="inline-flex items-center text-sm font-semibold text-slate-700 hover:text-[#312E81] px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <svg className="w-4 h-4 me-1.5 text-[#312E81]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{t('home.heroCall')} {settings?.phone || '0300-0000000'}</span>
              </a>
            </div>
          </div>

          {/* Hero Visual Placeholder (Styled block in soft indigo/violet with inline SVG & alt text) */}
          <div className="lg:col-span-5 flex justify-center">
            <div
              role="img"
              aria-label={t('home.heroStudentAlt')}
              className="w-full max-w-md aspect-[4/3] rounded-2xl bg-gradient-to-br from-[#312E81]/12 via-[#7C3AED]/15 to-[#F59E0B]/10 border border-[#312E81]/15 p-6 sm:p-8 flex flex-col justify-between shadow-xs relative overflow-hidden group"
            >
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-white/80 backdrop-blur-xs text-xs font-semibold text-[#312E81] border border-white/50">
                  Prep to FSc
                </span>
                <div className="w-8 h-8 rounded-full bg-[#F59E0B] text-[#1E1B4B] flex items-center justify-center font-bold text-xs shadow-xs font-heading">
                  UA
                </div>
              </div>

              {/* Graphic Icon Artwork */}
              <div className="flex flex-col items-center justify-center my-auto text-center space-y-3">
                <div className="w-20 h-20 rounded-2xl bg-white/90 shadow-sm border border-slate-100 flex items-center justify-center text-[#312E81] group-hover:scale-105 transition-transform">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.75"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <div className="space-y-1">
                  <p className="font-heading font-semibold text-slate-900 text-sm sm:text-base">
                    Unicorn Academy Sadiqabad
                  </p>
                  <p className="text-xs text-slate-500 max-w-xs">
                    {t('brand.tagline')}
                  </p>
                </div>
              </div>

              <div className="text-center pt-2 border-t border-slate-200/50">
                <span className="text-[11px] text-slate-500 font-medium tracking-wide">
                  Main College Road, Sadiqabad
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Numbers Strip (IntersectionObserver Count-Up) */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 w-full">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center space-y-2">
                  <Skeleton className="h-10 w-24 mx-auto" />
                  <Skeleton className="h-4 w-28 mx-auto" />
                </div>
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 divide-y sm:divide-y-0 sm:divide-x rtl:sm:divide-x-reverse divide-slate-100">
              {/* Stat 1: Students */}
              <div className="text-center pt-4 sm:pt-0">
                <p className="font-heading font-bold text-3xl sm:text-4xl text-[#312E81] tracking-tight">
                  <CountUpNumber target={stats.students} suffix="+" duration={1100} />
                </p>
                <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1.5">
                  {t('home.statsStudents')}
                </p>
              </div>

              {/* Stat 2: Teachers */}
              <div className="text-center pt-4 sm:pt-0">
                <p className="font-heading font-bold text-3xl sm:text-4xl text-[#7C3AED] tracking-tight">
                  <CountUpNumber target={stats.teachers} suffix="+" duration={1000} />
                </p>
                <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1.5">
                  {t('home.statsTeachers')}
                </p>
              </div>

              {/* Stat 3: Years */}
              <div className="text-center pt-4 sm:pt-0">
                <p className="font-heading font-bold text-3xl sm:text-4xl text-[#D97706] tracking-tight">
                  <CountUpNumber target={stats.years} suffix="+" duration={900} />
                </p>
                <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1.5">
                  {t('home.statsYears')}
                </p>
              </div>

              {/* Stat 4: Results */}
              <div className="text-center pt-4 sm:pt-0">
                <p className="font-heading font-bold text-3xl sm:text-4xl text-[#16A34A] tracking-tight">
                  <CountUpNumber target={stats.results_percent} suffix="%" duration={1200} />
                </p>
                <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1.5">
                  {t('home.statsResults')}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* SECTION 4: Classes Preview (4 Level Cards) */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 border-b border-slate-200/70 pb-4 text-start">
          <div>
            <h2 className="h2-title text-[#312E81]">{t('home.classesTitle')}</h2>
            <p className="text-slate-600 text-sm sm:text-base mt-1">
              {t('home.classesSubtitle')}
            </p>
          </div>
          <Link
            to="/courses"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#7C3AED] hover:text-[#312E81] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] rounded-md p-1 self-start sm:self-auto"
          >
            <span>{t('home.viewAllCourses')}</span>
            <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Level 1: Primary */}
          <Link
            to="/courses"
            className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#312E81] rounded-[12px]"
          >
            <Card className="p-6 h-full flex flex-col justify-between border-slate-200/80 group-hover:border-[#312E81]/30">
              <div className="space-y-4 text-start">
                <div className="w-12 h-12 rounded-xl bg-[#312E81]/8 text-[#312E81] flex items-center justify-center group-hover:bg-[#312E81] group-hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                </div>
                <div>
                  <h3 className="h3-title text-slate-900 group-hover:text-[#312E81] transition-colors">
                    {t('home.classPrimaryTitle')}
                  </h3>
                  <p className="text-xs font-semibold text-[#7C3AED] mt-0.5">
                    {t('home.classPrimaryClasses')}
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {t('home.classPrimaryDesc')}
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#312E81]">
                <span>{t('common.viewDetails')}</span>
                <svg className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Card>
          </Link>

          {/* Level 2: Middle */}
          <Link
            to="/courses"
            className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#312E81] rounded-[12px]"
          >
            <Card className="p-6 h-full flex flex-col justify-between border-slate-200/80 group-hover:border-[#312E81]/30">
              <div className="space-y-4 text-start">
                <div className="w-12 h-12 rounded-xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center group-hover:bg-[#7C3AED] group-hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <div>
                  <h3 className="h3-title text-slate-900 group-hover:text-[#7C3AED] transition-colors">
                    {t('home.classMiddleTitle')}
                  </h3>
                  <p className="text-xs font-semibold text-[#7C3AED] mt-0.5">
                    {t('home.classMiddleClasses')}
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {t('home.classMiddleDesc')}
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#312E81]">
                <span>{t('common.viewDetails')}</span>
                <svg className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Card>
          </Link>

          {/* Level 3: Matric */}
          <Link
            to="/courses"
            className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#312E81] rounded-[12px]"
          >
            <Card className="p-6 h-full flex flex-col justify-between border-slate-200/80 group-hover:border-[#312E81]/30">
              <div className="space-y-4 text-start">
                <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/12 text-[#B45309] flex items-center justify-center group-hover:bg-[#F59E0B] group-hover:text-[#0F172A] transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="h3-title text-slate-900 group-hover:text-[#B45309] transition-colors">
                    {t('home.classMatricTitle')}
                  </h3>
                  <p className="text-xs font-semibold text-[#B45309] mt-0.5">
                    {t('home.classMatricClasses')}
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {t('home.classMatricDesc')}
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#312E81]">
                <span>{t('common.viewDetails')}</span>
                <svg className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Card>
          </Link>

          {/* Level 4: FSc / Intermediate */}
          <Link
            to="/courses"
            className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#312E81] rounded-[12px]"
          >
            <Card className="p-6 h-full flex flex-col justify-between border-slate-200/80 group-hover:border-[#312E81]/30">
              <div className="space-y-4 text-start">
                <div className="w-12 h-12 rounded-xl bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center group-hover:bg-[#16A34A] group-hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="h3-title text-slate-900 group-hover:text-[#16A34A] transition-colors">
                    {t('home.classFscTitle')}
                  </h3>
                  <p className="text-xs font-semibold text-[#16A34A] mt-0.5">
                    {t('home.classFscClasses')}
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {t('home.classFscDesc')}
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#312E81]">
                <span>{t('common.viewDetails')}</span>
                <svg className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Card>
          </Link>
        </div>
      </section>

      {/* SECTION 5: Why Unicorn Academy (4 Reasons, Not Numbered) */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 w-full">
        <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-8 sm:p-12">
          <div className="text-start mb-10 max-w-2xl">
            <h2 className="h2-title text-[#312E81]">{t('home.whyTitle')}</h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              {t('home.whySubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-start">
            {/* Reason 1 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200/70 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#312E81]/8 text-[#312E81] flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="font-heading font-semibold text-base text-slate-900">
                {t('home.why1Title')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t('home.why1Desc')}
              </p>
            </div>

            {/* Reason 2 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200/70 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-heading font-semibold text-base text-slate-900">
                {t('home.why2Title')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t('home.why2Desc')}
              </p>
            </div>

            {/* Reason 3 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200/70 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/12 text-[#B45309] flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="font-heading font-semibold text-base text-slate-900">
                {t('home.why3Title')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t('home.why3Desc')}
              </p>
            </div>

            {/* Reason 4 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200/70 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="font-heading font-semibold text-base text-slate-900">
                {t('home.why4Title')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t('home.why4Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: Toppers (Grid of Topper Cards with Marks in Gold) */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 border-b border-slate-200/70 pb-4 text-start">
          <div>
            <h2 className="h2-title text-[#312E81]">{t('home.toppersTitle')}</h2>
            <p className="text-slate-600 text-sm sm:text-base mt-1">
              {t('home.toppersSubtitle')}
            </p>
          </div>
          <Link
            to="/results"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#312E81] hover:text-[#1E1B4B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#312E81] rounded-md p-1 self-start sm:self-auto"
          >
            <span>{t('home.toppersViewAll')}</span>
            <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-6 space-y-4">
                <Skeleton className="w-20 h-20 rounded-full mx-auto" />
                <Skeleton className="h-5 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-1/2 mx-auto" />
                <Skeleton className="h-6 w-2/3 mx-auto" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {toppers.map((topper) => {
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
                  className="p-6 text-center flex flex-col items-center justify-between border-slate-200/80 hover:border-[#F59E0B]/50"
                >
                  <div className="space-y-3.5 w-full">
                    {/* Photo Placeholder First */}
                    <div className="w-20 h-20 rounded-full mx-auto bg-gradient-to-tr from-[#312E81]/15 to-[#F59E0B]/20 border-2 border-[#F59E0B] flex items-center justify-center text-[#312E81] font-bold text-xl font-heading shadow-xs">
                      {initials}
                    </div>

                    <div>
                      <h3 className="h3-title text-slate-900 leading-snug">
                        {name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        {classLabel}
                      </p>
                    </div>

                    {/* Marks with Gold Accent */}
                    <div className="py-2.5 px-3 rounded-lg bg-[#FEF3C7] border border-[#FCD34D]/80">
                      <span className="text-[11px] font-medium text-[#92400E] block uppercase tracking-wider">
                        {t('home.toppersMarksLabel')}
                      </span>
                      <span className="text-lg font-bold text-[#B45309] font-heading">
                        {topper.marks}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 mt-4 border-t border-slate-100 w-full text-xs text-slate-500 font-medium">
                    {t('home.toppersYearLabel')}: {topper.year}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION 7: Testimonials (Grid on Desktop, Horizontal Scroll on Mobile) */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 w-full">
        <div className="text-start mb-8 border-b border-slate-200/70 pb-4">
          <h2 className="h2-title text-[#312E81]">{t('home.testimonialsTitle')}</h2>
          <p className="text-slate-600 text-sm sm:text-base mt-1">
            {t('home.testimonialsSubtitle')}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 space-y-4">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto pb-4 md:pb-0 snap-x snap-mandatory scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0">
            {testimonials.map((test) => {
              const role = lang === 'ur' ? test.role_ur : test.role_en;
              const text = lang === 'ur' ? test.text_ur : test.text_en;

              return (
                <div key={test.id} className="min-w-[85vw] sm:min-w-[340px] md:min-w-0 snap-center">
                  <Card className="p-6 sm:p-7 h-full flex flex-col justify-between border-slate-200/80 text-start">
                    <div className="space-y-4">
                      {/* Quote Icon */}
                      <svg
                        className="w-8 h-8 text-[#7C3AED]/30 shrink-0"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                      <p className="text-sm sm:text-base text-slate-700 leading-relaxed italic">
                        "{text}"
                      </p>
                    </div>

                    <div className="pt-4 mt-6 border-t border-slate-100">
                      <p className="font-heading font-semibold text-slate-900 text-sm sm:text-base">
                        {test.name}
                      </p>
                      <p className="text-xs text-[#7C3AED] font-medium mt-0.5">
                        {role}
                      </p>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION 8: Admission CTA Band (Dark Indigo Background with One Sentence and Apply Now Button) */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 w-full">
        <div className="bg-[#1E1B4B] text-white rounded-2xl p-8 sm:p-12 lg:p-16 border border-[#312E81] shadow-xl text-center flex flex-col items-center space-y-6">
          <Badge status="admission_open" label={t('home.heroBadge')} className="!text-xs" />

          <h2 className="h2-title text-white max-w-2xl leading-tight">
            {t('home.ctaBandTitle')}
          </h2>

          <p className="text-slate-300 text-base sm:text-lg max-w-xl leading-relaxed">
            {t('home.ctaBandSubtitle')}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            {/* The single primary accent CTA in this section */}
            <Button to="/admission" variant="accent" className="px-8 shadow-md">
              {t('home.ctaBandApply')}
            </Button>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center font-medium rounded-lg text-base min-h-[44px] px-6 py-2.5 transition-all duration-200 cursor-pointer bg-white/10 hover:bg-white/20 text-white border border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <span>{t('home.ctaBandWhatsApp')}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
