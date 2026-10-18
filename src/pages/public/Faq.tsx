import React, { useEffect, useState, useCallback } from 'react';
import { useI18n } from '../../i18n/LanguageProvider';
import { usePageMeta } from '../../hooks/usePageMeta';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Skeleton } from '../../components/Skeleton';
import { FaqAccordion } from '../../components/FaqAccordion';
import { getFaqs, getTestimonials } from '../../services';
import { FaqItem, Testimonial } from '../../types';

export default function Faq() {
  const { lang, t } = useI18n();

  // Dynamic SEO title & description
  usePageMeta({
    title: t('faq.seoTitle'),
    description: t('faq.seoDescription'),
  });

  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [faqsData, testimonialsData] = await Promise.all([
        getFaqs(),
        getTestimonials(),
      ]);
      setFaqs(faqsData);
      setTestimonials(testimonialsData);
    } catch (err) {
      console.error('Failed to load FAQ & Testimonials data:', err);
      setError(t('common.errorLoading'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (error && !loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-16 text-center">
        <Card className="max-w-md mx-auto p-8 border-rose-200 bg-rose-50/50">
          <p className="text-rose-800 font-medium mb-4">{error}</p>
          <Button variant="primary" onClick={loadData}>
            {t('common.retry')}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-10 md:py-16 space-y-16 max-w-[1200px] mx-auto px-4 sm:px-6">
      {/* Header */}
      <header className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-block px-3.5 py-1 rounded-full bg-[#312E81]/8 text-[#312E81] text-xs sm:text-sm font-semibold tracking-wide">
          {t('brand.name')}
        </div>
        <h1 className="h1-title text-[#312E81] tracking-tight">
          {t('faq.title')}
        </h1>
        <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
          {t('faq.subtitle')}
        </p>
      </header>

      {/* 1. FAQ Accordion Section */}
      <section className="max-w-3xl mx-auto space-y-6 w-full">
        <div className="text-start border-b border-slate-200/80 pb-3">
          <h2 className="h2-title text-[#312E81]">
            {t('faq.faqSectionTitle')}
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            {t('faq.faqSectionSubtitle')}
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <FaqAccordion faqs={faqs} />
        )}
      </section>

      {/* 2. Testimonials Section */}
      <section className="space-y-8 pt-6 border-t border-slate-200/80 w-full">
        <div className="text-start max-w-2xl">
          <h2 className="h2-title text-[#312E81]">
            {t('faq.testimonialsSectionTitle')}
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            {t('faq.testimonialsSectionSubtitle')}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 space-y-4">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-start">
            {testimonials.map((test) => {
              const role = lang === 'ur' ? test.role_ur : test.role_en;
              const text = lang === 'ur' ? test.text_ur : test.text_en;

              return (
                <Card
                  key={test.id}
                  className="p-6 sm:p-7 flex flex-col justify-between border-slate-200/80 hover:border-[#7C3AED]/40"
                >
                  <div className="space-y-4">
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
              );
            })}
          </div>
        )}
      </section>

      {/* Call to Action Bar */}
      <section className="bg-slate-50/90 rounded-2xl border border-slate-200/80 p-8 text-center flex flex-col items-center space-y-4">
        <h2 className="h2-title text-[#312E81]">
          {t('about.ctaTitle')}
        </h2>
        <p className="text-slate-600 text-sm sm:text-base max-w-lg">
          {t('about.ctaSubtitle')}
        </p>
        <div className="pt-1">
          <Button to="/admission" variant="accent" className="px-8 shadow-md">
            {t('common.applyNow')}
          </Button>
        </div>
      </section>
    </div>
  );
}
