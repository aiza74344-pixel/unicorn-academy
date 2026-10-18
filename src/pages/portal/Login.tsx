import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useI18n } from '../../i18n/LanguageProvider';
import { usePageMeta } from '../../hooks/usePageMeta';
import { login, getSession, getLockoutRemainingSeconds, consumeSessionExpiredNotice } from '../../services/auth';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useToast } from '../../components/Toast';

export default function Login() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [rollNo, setRollNo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lockoutSeconds, setLockoutSeconds] = useState<number>(0);
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState(false);

  usePageMeta({
    title: t('portal.loginSeoTitle'),
    description: t('portal.loginSeoDesc'),
    noIndex: true,
  });

  // If already logged in, redirect directly to portal or change password
  useEffect(() => {
    const session = getSession();
    if (session) {
      if (session.must_change_password) {
        navigate('/portal/change-password', { replace: true });
      } else {
        navigate('/portal', { replace: true });
      }
    }

    // Check if session previously expired
    if (consumeSessionExpiredNotice()) {
      setSessionExpiredNotice(true);
    }

    // Check initial lockout state
    const remaining = getLockoutRemainingSeconds();
    if (remaining > 0) {
      setLockoutSeconds(remaining);
    }
  }, [navigate]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setErrorMessage(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds > 0 || isSubmitting) return;

    if (!rollNo.trim() || !password) {
      setErrorMessage(t('portal.errFillAllFields'));
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSessionExpiredNotice(false);

    try {
      const result = await login(rollNo, password);

      if (!result.success) {
        if (result.lockoutSeconds && result.lockoutSeconds > 0) {
          setLockoutSeconds(result.lockoutSeconds);
          setErrorMessage(t('portal.errLockedOutPrefix') + ' ' + result.lockoutSeconds + ' ' + t('portal.errLockedOutSuffix'));
        } else {
          setErrorMessage(t('portal.errInvalidCredentials'));
        }
        setIsSubmitting(false);
        return;
      }

      showToast({ type: 'success', title: t('portal.loginSuccessToast') });

      // Check destination: forced password change or preserved requested route
      if (result.session?.must_change_password) {
        navigate('/portal/change-password', { replace: true });
      } else {
        const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/portal';
        navigate(from, { replace: true });
      }
    } catch (err) {
      setErrorMessage(t('common.errorLoading'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillQuickDemo = (demoRoll: string, demoPass: string) => {
    setRollNo(demoRoll);
    setPassword(demoPass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#312E81] rounded-xl p-2"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#F59E0B] text-[#1E1B4B] font-bold text-xl flex items-center justify-center shadow-md font-heading group-hover:scale-105 transition-transform">
              UA
            </div>
            <div className="text-start">
              <span className="font-heading font-bold text-xl text-[#312E81] block leading-tight">
                {t('brand.name')}
              </span>
              <span className="text-xs text-slate-500 font-medium block">
                {t('portal.portalSubheading')}
              </span>
            </div>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-slate-900 tracking-tight font-heading">
            {t('portal.loginTitle')}
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            {t('portal.loginSubtitle')}
          </p>
        </div>

        {/* Session Expired Banner */}
        {sessionExpiredNotice && (
          <div
            role="status"
            className="mb-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-sm flex items-start gap-2.5 animate-in fade-in"
          >
            <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold text-xs uppercase tracking-wide text-amber-800">
                {t('portal.sessionExpiredTitle')}
              </p>
              <p className="text-xs mt-0.5">{t('portal.sessionExpiredMessage')}</p>
            </div>
          </div>
        )}

        {/* Generic Error / Lockout Alert */}
        {errorMessage && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-900 text-sm flex items-start gap-2.5 animate-in fade-in"
          >
            <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <p className="font-medium text-xs md:text-sm">{errorMessage}</p>
              {lockoutSeconds > 0 && (
                <div className="mt-2 w-full bg-red-200/60 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-red-600 h-1.5 transition-all duration-1000"
                    style={{ width: `${(lockoutSeconds / 60) * 100}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        <Card interactive={false} className="p-6 sm:p-8 border-slate-200 shadow-sm">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Roll Number Field */}
            <div className="text-start">
              <label htmlFor="portal-roll" className="block text-sm font-semibold text-slate-800 mb-1.5">
                {t('portal.rollNumberLabel')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="portal-roll"
                  type="text"
                  autoCapitalize="characters"
                  autoComplete="username"
                  required
                  disabled={lockoutSeconds > 0 || isSubmitting}
                  placeholder={t('portal.rollNumberPlaceholder')}
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-base text-slate-900 bg-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#312E81] focus-visible:border-transparent font-mono uppercase tracking-wider dir-ltr text-start disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {t('portal.rollNumberHint')}
              </p>
            </div>

            {/* Password Field */}
            <div className="text-start">
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="portal-password" className="block text-sm font-semibold text-slate-800">
                  {t('portal.passwordLabel')} <span className="text-red-500">*</span>
                </label>
                <a
                  href={`https://wa.me/923000000000?text=${encodeURIComponent(
                    lang === 'ur'
                      ? 'السلام علیکم، میں پورٹل پاس ورڈ ری سیٹ کروانا چاہتا ہوں۔ رول نمبر: ' + (rollNo || '')
                      : 'Assalam o Alaikum, I need assistance resetting my student portal password. Roll Number: ' + (rollNo || '')
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-[#7C3AED] hover:text-[#312E81] transition-colors"
                >
                  {t('portal.forgotPasswordLink')}
                </a>
              </div>
              <div className="relative">
                <input
                  id="portal-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  disabled={lockoutSeconds > 0 || isSubmitting}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 ps-3.5 pe-11 rounded-lg border border-slate-300 text-base text-slate-900 bg-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#312E81] focus-visible:border-transparent dir-ltr text-start disabled:bg-slate-50 disabled:text-slate-400"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? t('portal.hidePassword') : t('portal.showPassword')}
                  className="absolute inset-y-0 end-0 pe-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full !h-12 !text-base"
              loading={isSubmitting}
              disabled={lockoutSeconds > 0 || isSubmitting}
            >
              {lockoutSeconds > 0
                ? `${t('portal.lockedOutButton')} (${lockoutSeconds}s)`
                : t('portal.loginSubmitBtn')}
            </Button>
          </form>

          {/* Quick Demo Credentials Box for Testing */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5 text-center">
              {t('portal.testCredentialsLabel')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillQuickDemo('UA-2026-0001', 'Temp#2026')}
                className="p-2.5 rounded-lg border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/70 text-indigo-900 text-start transition-colors cursor-pointer"
              >
                <div className="font-bold flex items-center justify-between">
                  <span className="dir-ltr font-mono">UA-2026-0001</span>
                  <span className="text-[10px] bg-indigo-200 text-indigo-800 px-1 py-0.5 rounded font-normal">
                    {t('portal.testForcedPass')}
                  </span>
                </div>
                <div className="text-slate-600 mt-1 font-mono text-[11px] dir-ltr">Pass: Temp#2026</div>
              </button>

              <button
                type="button"
                onClick={() => fillQuickDemo('UA-2026-0002', 'Student#2026')}
                className="p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-900 text-start transition-colors cursor-pointer"
              >
                <div className="font-bold flex items-center justify-between">
                  <span className="dir-ltr font-mono">UA-2026-0002</span>
                  <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1 py-0.5 rounded font-normal">
                    {t('portal.testDirectPass')}
                  </span>
                </div>
                <div className="text-slate-600 mt-1 font-mono text-[11px] dir-ltr">Pass: Student#2026</div>
              </button>
            </div>
          </div>
        </Card>

        {/* Footer Help Contact */}
        <p className="text-center text-xs text-slate-500 mt-6 leading-relaxed">
          {t('portal.loginHelpNote')}{' '}
          <a
            href="https://wa.me/923000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#312E81] font-semibold underline hover:text-[#7C3AED]"
          >
            {t('portal.loginHelpWhatsApp')}
          </a>
        </p>
      </div>
    </div>
  );
}
