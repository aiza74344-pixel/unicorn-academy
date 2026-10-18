import React, { useEffect, useState, useCallback } from 'react';
import { useI18n } from '../../i18n/LanguageProvider';
import { usePageMeta } from '../../hooks/usePageMeta';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { FormField } from '../../components/FormField';
import { FaqAccordion } from '../../components/FaqAccordion';
import { useToast } from '../../components/Toast';
import { getSiteSettings, getFaqs, submitContactMessage } from '../../services';
import { SiteSettings, FaqItem } from '../../types';

export default function Contact() {
  const { lang, t } = useI18n();
  const { showToast } = useToast();

  // Dynamic SEO title & description
  usePageMeta({
    title: t('contact.seoTitle'),
    description: t('contact.seoDescription'),
  });

  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState(''); // Spam honeypot
  const [errors, setErrors] = useState<{ name?: string; phone?: string; message?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [settingsData, faqsData] = await Promise.all([
        getSiteSettings(),
        getFaqs(),
      ]);
      setSettings(settingsData);
      setFaqs(faqsData);
    } catch (err) {
      console.error('Failed to load contact data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Phone Validation helper for Pakistani format: 03001234567 or +923001234567
  const isValidPakistaniPhone = (num: string): boolean => {
    const cleaned = num.replace(/[\s\-()]/g, '');
    return /^((\+92)|(0092)|(92))?3[0-9]{9}$/.test(cleaned) || /^03[0-9]{9}$/.test(cleaned);
  };

  const validate = (): boolean => {
    const newErrors: { name?: string; phone?: string; message?: string } = {};

    if (!name.trim()) {
      newErrors.name = t('contact.errName');
    }

    if (!phone.trim() || !isValidPakistaniPhone(phone)) {
      newErrors.phone = t('contact.errPhone');
    }

    const trimmedMsg = message.trim();
    if (trimmedMsg.length < 10 || trimmedMsg.length > 500) {
      newErrors.message = t('contact.errMessage');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // If honeypot is filled, silent drop for spam bots
    if (honeypot) {
      setSubmitSuccess(true);
      return;
    }

    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await submitContactMessage({
        name: name.trim(),
        phone: phone.trim(),
        message: message.trim(),
      });

      setSubmitSuccess(true);
      setName('');
      setPhone('');
      setMessage('');
      setErrors({});

      showToast({
        type: 'success',
        title: t('contact.successTitle'),
        message: t('contact.successBody'),
      });
    } catch (err) {
      setSubmitError(t('contact.errorBody'));
      showToast({
        type: 'error',
        title: t('contact.errorTitle'),
        message: t('contact.errorBody'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const address = lang === 'ur' ? settings?.address_ur : settings?.address_en;
  const hours = lang === 'ur' ? settings?.opening_hours_ur : settings?.opening_hours_en;
  const phoneVal = settings?.phone || '0300-0000000';
  const whatsappVal = settings?.whatsapp || '923000000000';

  return (
    <div className="py-10 md:py-16 space-y-16 max-w-[1200px] mx-auto px-4 sm:px-6">
      {/* Header */}
      <header className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-block px-3.5 py-1 rounded-full bg-[#312E81]/8 text-[#312E81] text-xs sm:text-sm font-semibold tracking-wide">
          {t('brand.name')}
        </div>
        <h1 className="h1-title text-[#312E81] tracking-tight">
          {t('contact.title')}
        </h1>
        <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
          {t('contact.subtitle')}
        </p>
      </header>

      {/* Main Grid: Info Block & Contact Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Contact Info Cards & Social */}
        <div className="lg:col-span-5 space-y-6 text-start">
          <Card className="p-6 sm:p-8 space-y-6 border-slate-200/80 shadow-xs">
            <h2 className="h2-title text-[#312E81] border-b border-slate-100 pb-3">
              {t('contact.infoHeading')}
            </h2>

            {/* Address */}
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#312E81]/8 text-[#312E81] flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('contact.addressLabel')}
                </p>
                <p className="text-sm sm:text-base font-medium text-slate-900 mt-0.5">
                  {address || 'Main College Road, Sadiqabad, Punjab'}
                </p>
              </div>
            </div>

            {/* Direct Call: One-tap */}
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#312E81] flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('contact.phoneLabel')}
                </p>
                <a
                  href={`tel:${phoneVal}`}
                  className="text-base font-bold text-[#312E81] hover:underline block mt-0.5 font-heading"
                  dir="ltr"
                >
                  {phoneVal}
                </a>
              </div>
            </div>

            {/* Direct WhatsApp: One-tap */}
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67Z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('contact.whatsappLabel')}
                </p>
                <a
                  href={`https://wa.me/${whatsappVal}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base font-bold text-emerald-700 hover:underline block mt-0.5 font-heading"
                  dir="ltr"
                >
                  +{whatsappVal}
                </a>
              </div>
            </div>

            {/* Visiting Hours */}
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('contact.hoursLabel')}
                </p>
                <p className="text-sm font-medium text-slate-900 mt-0.5">
                  {hours || 'Monday - Saturday: 08:00 AM - 08:00 PM'}
                </p>
              </div>
            </div>

            {/* Social Links */}
            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                {t('contact.socialHeading')}
              </p>
              <div className="flex items-center gap-3">
                {/* Facebook */}
                <a
                  href={settings?.facebook_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook page of Unicorn Academy Sadiqabad"
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-[#1877F2] hover:text-white text-slate-600 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1877F2]"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href={settings?.instagram_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram profile of Unicorn Academy Sadiqabad"
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-[#E4405F] hover:text-white text-slate-600 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4405F]"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>

                {/* YouTube */}
                <a
                  href={settings?.youtube_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube channel of Unicorn Academy Sadiqabad"
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-[#FF0000] hover:text-white text-slate-600 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF0000]"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Contact Message Form */}
        <div className="lg:col-span-7">
          <Card className="p-6 sm:p-8 border-slate-200/80 shadow-xs text-start">
            <h2 className="h2-title text-[#312E81]">
              {t('contact.formHeading')}
            </h2>
            <p className="text-slate-600 text-sm mt-1 mb-6">
              {t('contact.formSubheading')}
            </p>

            {/* Success Notification Alert */}
            {submitSuccess && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-start gap-3">
                <svg className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="font-semibold">{t('contact.successTitle')}</p>
                  <p className="mt-0.5 text-xs text-emerald-800">{t('contact.successBody')}</p>
                </div>
              </div>
            )}

            {/* Error Notification Alert */}
            {submitError && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-sm flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold">{t('contact.errorTitle')}</p>
                    <p className="mt-0.5 text-xs text-rose-800">{submitError}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSubmitError(null)}
                  className="text-xs font-semibold text-rose-700 hover:underline shrink-0"
                >
                  {t('common.retry')}
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Spam Honeypot (Hidden) */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="website_hp">Leave empty</label>
                <input
                  type="text"
                  id="website_hp"
                  tabIndex={-1}
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  autoComplete="off"
                />
              </div>

              {/* Name */}
              <FormField
                label={t('contact.nameLabel')}
                placeholder={t('contact.namePlaceholder')}
                required
                value={name}
                error={errors.name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
              />

              {/* Phone */}
              <FormField
                label={t('contact.phoneLabel')}
                placeholder={t('contact.phonePlaceholder')}
                required
                value={phone}
                error={errors.phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                }}
              />

              {/* Message with Counter */}
              <div className="w-full text-start mb-4">
                <label
                  htmlFor="contact-message-input"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  {t('contact.messageLabel')}
                  <span className="text-red-500 ms-1" aria-hidden="true">*</span>
                </label>

                <textarea
                  id="contact-message-input"
                  rows={4}
                  required
                  maxLength={500}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (errors.message) setErrors((prev) => ({ ...prev, message: undefined }));
                  }}
                  placeholder={t('contact.messagePlaceholder')}
                  className={`w-full p-3.5 rounded-lg border text-base text-slate-900 bg-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 placeholder:text-slate-400 ${
                    errors.message
                      ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500'
                      : 'border-slate-300 hover:border-slate-400 focus-visible:border-[#312E81] focus-visible:ring-[#312E81]'
                  }`}
                />

                <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                  <span>{t('contact.counterLabel')}</span>
                  <span className={message.length > 450 ? 'text-amber-600 font-semibold' : ''}>
                    {message.length} / 500
                  </span>
                </div>

                {errors.message && (
                  <p className="text-xs text-red-600 font-medium mt-1.5 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    <span>{errors.message}</span>
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  loading={isSubmitting}
                  className="w-full sm:w-auto px-8"
                >
                  {isSubmitting ? t('contact.submittingBtn') : t('contact.submitBtn')}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>

      {/* Google Map Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 text-start">
          <h2 className="h2-title text-[#312E81]">
            {t('contact.mapHeading')}
          </h2>
          <a
            href={settings?.map_external_url || 'https://maps.google.com'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm font-semibold text-[#7C3AED] hover:underline flex items-center gap-1"
          >
            <span>{t('contact.mapFallback')}</span>
            <svg className="w-3.5 h-3.5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-slate-200 shadow-xs relative bg-slate-100">
          <iframe
            src={settings?.map_embed}
            title={t('contact.mapHeading')}
            className="w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </section>

      {/* Embedded FAQ Accordion Section */}
      <section className="space-y-6 pt-4 border-t border-slate-200/80 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <h2 className="h2-title text-[#312E81]">
            {t('faq.faqSectionTitle')}
          </h2>
          <p className="text-slate-600 text-sm">
            {t('faq.faqSectionSubtitle')}
          </p>
        </div>

        <FaqAccordion faqs={faqs} />
      </section>
    </div>
  );
}
