import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useI18n } from '../../i18n/LanguageProvider';
import { getSession, logout, refreshSession } from '../../services/auth';
import { getStudentProfile } from '../../services/portal';
import { Student } from '../../types';
import { useToast } from '../../components/Toast';

export default function PortalLayout() {
  const { lang, setLang, t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [student, setStudent] = useState<Student | null>(null);

  const session = getSession();

  useEffect(() => {
    // Refresh session timestamp on route transitions or clicks
    refreshSession();

    if (session?.roll_no) {
      getStudentProfile(session.roll_no).then((data) => {
        setStudent(data);
      });
    }
  }, [location.pathname, session?.roll_no]);

  const handleLogout = () => {
    logout();
    showToast({ type: 'success', title: t('portal.loggedOutNotice') });
    navigate('/portal/login', { replace: true });
  };

  const navItems = [
    {
      to: '/portal',
      end: true,
      label: t('portal.navDashboard'),
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      to: '/portal/fees',
      end: false,
      label: t('portal.navFees'),
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      to: '/portal/announcements',
      end: false,
      label: t('portal.navAnnouncements'),
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      ),
    },
    {
      to: '/portal/profile',
      end: false,
      label: t('portal.navProfile'),
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row text-slate-800 antialiased selection:bg-[#7C3AED] selection:text-white pb-20 lg:pb-0">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-white border-e border-slate-200 shrink-0 sticky top-0 h-screen z-30">
        {/* Brand header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#312E81] rounded-lg">
            <div className="w-10 h-10 rounded-xl bg-[#F59E0B] text-[#1E1B4B] font-bold text-base flex items-center justify-center shadow-xs font-heading group-hover:scale-105 transition-transform">
              UA
            </div>
            <div className="text-start">
              <span className="font-heading font-bold text-base text-[#312E81] block leading-tight">
                {t('brand.short')} {t('portal.portalTitle')}
              </span>
              <span className="text-xs text-slate-500 font-medium block">
                {t('brand.name')}
              </span>
            </div>
          </Link>
        </div>

        {/* Student Mini Profile Summary */}
        <div className="p-4 mx-3 my-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#312E81] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
              {student ? student.full_name.charAt(0) : 'U'}
            </div>
            <div className="overflow-hidden text-start">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {student?.full_name || t('portal.studentDefault')}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs font-mono font-bold text-[#312E81] bg-[#312E81]/10 px-1.5 py-0.5 rounded dir-ltr inline-block">
                  {session?.roll_no}
                </span>
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
                  {t('portal.activeStudent')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto" aria-label="Portal Navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#312E81] text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Utility Actions */}
        <div className="p-4 border-t border-slate-200/80 space-y-2 bg-slate-50/50">
          {/* Change Password Link */}
          <NavLink
            to="/portal/change-password"
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-slate-200 text-[#312E81] font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`
            }
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <span>{t('portal.changePassword')}</span>
          </NavLink>

          {/* Language Switcher */}
          <div className="flex items-center justify-between px-3 py-1.5 text-xs text-slate-500">
            <span>{t('nav.langToggle')}</span>
            <div className="inline-flex rounded-lg bg-slate-200 p-0.5">
              <button
                type="button"
                onClick={() => setLang('en')}
                aria-pressed={lang === 'en'}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                  lang === 'en' ? 'bg-[#312E81] text-white shadow-2xs' : 'text-slate-700'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang('ur')}
                aria-pressed={lang === 'ur'}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold font-urdu cursor-pointer ${
                  lang === 'ur' ? 'bg-[#312E81] text-white shadow-2xs' : 'text-slate-700'
                }`}
              >
                اردو
              </button>
            </div>
          </div>

          {/* Academy Public Website Link */}
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 hover:text-[#312E81] transition-colors"
          >
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>{t('portal.backToPublicSite')}</span>
          </Link>

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>{t('portal.logout')}</span>
          </button>
        </div>
      </aside>

      {/* MOBILE TOP BAR */}
      <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-2xs">
        <Link to="/portal" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#F59E0B] text-[#1E1B4B] font-bold text-sm flex items-center justify-center font-heading">
            UA
          </div>
          <div className="text-start">
            <span className="font-heading font-bold text-sm text-[#312E81] block leading-tight">
              {t('portal.portalTitle')}
            </span>
            <span className="text-[11px] font-mono text-slate-500 block dir-ltr">
              {session?.roll_no}
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <div className="inline-flex rounded-md bg-slate-100 p-0.5 border border-slate-200">
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-2 py-0.5 text-xs font-semibold rounded ${
                lang === 'en' ? 'bg-[#312E81] text-white' : 'text-slate-600'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang('ur')}
              className={`px-2 py-0.5 text-xs font-semibold rounded font-urdu ${
                lang === 'ur' ? 'bg-[#312E81] text-white' : 'text-slate-600'
              }`}
            >
              اردو
            </button>
          </div>

          {/* Change password button */}
          <Link
            to="/portal/change-password"
            title={t('portal.changePassword')}
            aria-label={t('portal.changePassword')}
            className="p-2 text-slate-600 hover:text-[#312E81] rounded-lg hover:bg-slate-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </Link>

          {/* Logout button */}
          <button
            type="button"
            onClick={handleLogout}
            title={t('portal.logout')}
            aria-label={t('portal.logout')}
            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet context={{ student }} />
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR (min 44px touch targets) */}
      <nav
        className="lg:hidden fixed bottom-0 start-0 end-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 shadow-lg"
        aria-label="Mobile Bottom Navigation"
      >
        <div className="grid grid-cols-4 items-center">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-h-[52px] py-1 px-1 rounded-xl transition-all ${
                  isActive
                    ? 'text-[#312E81] font-bold bg-[#312E81]/8'
                    : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              {item.icon}
              <span className="text-[11px] mt-0.5 truncate max-w-full">
                {item.label}
              </span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
