import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/LanguageProvider';
import { SiteSettings } from '../types';
import { getSiteSettings } from '../services';

export const Footer: React.FC = () => {
  const { lang, t } = useI18n();
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    let isMounted = true;
    getSiteSettings().then((data) => {
      if (isMounted) setSettings(data);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/about', label: t('nav.about') },
    { to: '/courses', label: t('nav.courses') },
    { to: '/teachers', label: t('nav.teachers') },
    { to: '/results', label: t('nav.results') },
    { to: '/gallery', label: t('nav.gallery') },
    { to: '/faq', label: t('nav.faq') },
    { to: '/contact', label: t('nav.contact') },
    { to: '/admission', label: t('nav.admission') },
    { to: '/admission/status', label: lang === 'ur' ? 'درخواست کی صورتحال' : 'Track Status' },
    { to: '/portal/login', label: t('nav.portalLogin') },
  ];

  return (
    <footer className="bg-[#1E1B4B] text-slate-300 pt-14 pb-10 border-t border-[#312E81]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="md:col-span-5 text-start">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#F59E0B] flex items-center justify-center text-[#1E1B4B] font-bold text-base shrink-0 font-heading">
                {t('brand.short')}
              </div>
              <span className="font-heading font-bold text-xl text-white tracking-tight">
                {t('brand.name')}
              </span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed max-w-sm mb-4">
              {t('footer.tagline')}
            </p>
            <div className="inline-block px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-[#F59E0B] font-medium">
              {t('badge.admissionOpen')}
            </div>
          </div>

          {/* Quick Links with FAQ & Track Status included */}
          <div className="md:col-span-3 text-start">
            <h4 className="text-white font-semibold text-base mb-4 font-heading tracking-wide">
              {t('footer.quickLinks')}
            </h4>
            <ul className="grid grid-cols-2 gap-x-2 gap-y-2 text-sm">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="hover:text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded-xs"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details from Mock Settings */}
          <div className="md:col-span-4 text-start">
            <h4 className="text-white font-semibold text-base mb-4 font-heading tracking-wide">
              {t('footer.contactUs')}
            </h4>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-start gap-2.5">
                <svg
                  className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <div>
                  <span className="font-medium text-white me-1">
                    {t('footer.addressLabel')}
                  </span>
                  <span>
                    {lang === 'ur'
                      ? settings?.address_ur || 'صادق آباد، پنجاب، پاکستان'
                      : settings?.address_en || 'Sadiqabad, Punjab, Pakistan'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <svg
                  className="w-4 h-4 text-[#F59E0B] shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <div>
                  <span className="font-medium text-white me-1">
                    {t('footer.phoneLabel')}
                  </span>
                  <a
                    href={`tel:${settings?.phone || '03000000000'}`}
                    className="hover:text-white transition-colors underline-offset-4 hover:underline"
                    dir="ltr"
                  >
                    {settings?.phone || '0300-0000000'}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <svg
                  className="w-4 h-4 text-[#22C55E] shrink-0"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67Z" />
                </svg>
                <div>
                  <span className="font-medium text-white me-1">
                    {t('footer.whatsappLabel')}
                  </span>
                  <a
                    href={`https://wa.me/${settings?.whatsapp || '923000000000'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors underline-offset-4 hover:underline"
                    dir="ltr"
                  >
                    +{settings?.whatsapp || '923000000000'}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2 text-center sm:text-start">
          <p>© {currentYear} {t('footer.rights')}</p>
          <p className="text-slate-400">Unicorn Academy • Sadiqabad, Pakistan</p>
        </div>
      </div>
    </footer>
  );
};
