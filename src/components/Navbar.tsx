import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/LanguageProvider';
import { Button } from './Button';
import { getSession, logout, subscribeAuth } from '../services/auth';
import { AuthSession } from '../types';
import { useToast } from './Toast';

export const Navbar: React.FC = () => {
  const { lang, setLang, t } = useI18n();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(() => getSession());

  useEffect(() => {
    const unsub = subscribeAuth((newSession) => {
      setSession(newSession);
    });
    return unsub;
  }, []);

  const handleLogout = () => {
    logout();
    showToast({ type: 'success', title: t('portal.loggedOutNotice') });
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/about', label: t('nav.about') },
    { to: '/courses', label: t('nav.courses') },
    { to: '/teachers', label: t('nav.teachers') },
    { to: '/results', label: t('nav.results') },
    { to: '/gallery', label: t('nav.gallery') },
    { to: '/admission', label: t('nav.admission') },
    { to: '/contact', label: t('nav.contact') },
  ];

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-2xs">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo / Brand */}
          <Link
            to="/"
            className="flex items-center gap-3 text-slate-900 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#312E81] rounded-lg p-1"
          >
            {/* Gold circle with UA */}
            <div className="w-11 h-11 rounded-full bg-[#F59E0B] flex items-center justify-center text-[#1E1B4B] font-bold text-lg shadow-sm group-hover:scale-105 transition-transform shrink-0 font-heading">
              {t('brand.short')}
            </div>
            <div className="flex flex-col text-start">
              <span className="font-heading font-bold text-lg md:text-xl text-[#312E81] tracking-tight leading-tight">
                {t('brand.name')}
              </span>
              <span className="text-xs text-slate-500 font-normal hidden sm:inline-block">
                {t('brand.tagline')}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            className="hidden lg:flex items-center gap-1 xl:gap-2"
            aria-label="Main Navigation"
          >
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#312E81] ${
                    isActive
                      ? 'text-[#312E81] bg-[#312E81]/8 font-semibold'
                      : 'text-slate-600 hover:text-[#312E81] hover:bg-slate-50'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Action Items: Language Toggle & Portal Login */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Language Toggle: EN | اردو with aria-pressed */}
            <div
              className="inline-flex items-center rounded-lg bg-slate-100 p-0.5 border border-slate-200"
              role="group"
              aria-label={t('nav.langToggle')}
            >
              <button
                type="button"
                aria-pressed={lang === 'en'}
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  lang === 'en'
                    ? 'bg-[#312E81] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                aria-pressed={lang === 'ur'}
                onClick={() => setLang('ur')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  lang === 'ur'
                    ? 'bg-[#312E81] text-white shadow-xs font-urdu text-[13px]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-urdu text-[13px]'
                }`}
              >
                اردو
              </button>
            </div>

            {/* Portal Action: My Portal + Logout if logged in, otherwise Portal Login */}
            {session ? (
              <div className="flex items-center gap-2">
                <Button
                  to="/portal"
                  variant="primary"
                  className="!min-h-[40px] !px-3.5 !py-1.5 !text-sm"
                >
                  <svg className="w-4 h-4 me-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  {t('nav.myPortal')}
                </Button>
                <button
                  type="button"
                  onClick={handleLogout}
                  title={t('portal.logout')}
                  aria-label={t('portal.logout')}
                  className="px-2.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <Button
                to="/portal/login"
                variant="primary"
                className="!min-h-[40px] !px-4 !py-1.5 !text-sm"
              >
                {t('nav.portalLogin')}
              </Button>
            )}
          </div>


          {/* Mobile Actions: Language toggle + Hamburger Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Language Toggle Mobile */}
            <div
              className="inline-flex items-center rounded-lg bg-slate-100 p-0.5 border border-slate-200"
              role="group"
              aria-label={t('nav.langToggle')}
            >
              <button
                type="button"
                aria-pressed={lang === 'en'}
                onClick={() => setLang('en')}
                className={`px-2 py-1 text-xs font-semibold rounded-md ${
                  lang === 'en'
                    ? 'bg-[#312E81] text-white shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                aria-pressed={lang === 'ur'}
                onClick={() => setLang('ur')}
                className={`px-2 py-1 text-xs font-semibold rounded-md ${
                  lang === 'ur'
                    ? 'bg-[#312E81] text-white shadow-xs font-urdu'
                    : 'text-slate-600 font-urdu'
                }`}
              >
                اردو
              </button>
            </div>

            {/* Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation-menu"
              aria-label={t('nav.toggleMenu')}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#312E81] cursor-pointer"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div
            id="mobile-navigation-menu"
            className="lg:hidden py-4 border-t border-slate-100 animate-in slide-in-from-top-2 duration-150"
          >
            <nav className="flex flex-col gap-1" aria-label="Mobile Navigation">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `px-4 py-2.5 rounded-lg text-base font-medium transition-colors ${
                      isActive
                        ? 'text-[#312E81] bg-[#312E81]/8 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="pt-3 mt-2 border-t border-slate-100 px-2 space-y-2">
                {session ? (
                  <>
                    <Button
                      to="/portal"
                      variant="primary"
                      className="w-full"
                      onClick={closeMobileMenu}
                    >
                      <svg className="w-4 h-4 me-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      {t('nav.myPortal')}
                    </Button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>{t('portal.logout')}</span>
                    </button>
                  </>
                ) : (
                  <Button
                    to="/portal/login"
                    variant="primary"
                    className="w-full"
                    onClick={closeMobileMenu}
                  >
                    {t('nav.portalLogin')}
                  </Button>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
