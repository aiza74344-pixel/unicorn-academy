import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n/LanguageProvider';
import { usePageMeta } from '../../hooks/usePageMeta';
import { changePassword, getSession } from '../../services/auth';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useToast } from '../../components/Toast';

export default function ChangePassword() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const session = getSession();
  const isForced = Boolean(session?.must_change_password);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  usePageMeta({
    title: isForced ? t('portal.forcedPasswordTitle') : t('portal.changePasswordTitle'),
    description: t('portal.changePasswordDesc'),
    noIndex: true,
  });

  // Live checklist evaluation
  const ruleMinLength = newPassword.length >= 8;
  const ruleLetterAndNumber = /[A-Za-z]/.test(newPassword) && /[0-9]/.test(newPassword);
  const ruleNotCurrent = newPassword.length > 0 && currentPassword.length > 0 && newPassword !== currentPassword;
  const ruleMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const allRulesSatisfied =
    ruleMinLength && ruleLetterAndNumber && ruleNotCurrent && ruleMatch && currentPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage(t('portal.errFillAllFields'));
      return;
    }

    if (!allRulesSatisfied) {
      setErrorMessage(t('portal.errSatisfyAllRules'));
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await changePassword(currentPassword, newPassword);
      if (!res.success) {
        setErrorMessage(res.error || t('portal.errCurrentPasswordWrong'));
        setIsSubmitting(false);
        return;
      }

      showToast({ type: 'success', title: t('portal.passwordChangedSuccess') });
      navigate('/portal', { replace: true });
    } catch (err) {
      setErrorMessage(t('common.errorLoading'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6 sm:py-10 px-4">
      {/* Forced Banner if first login */}
      {isForced && (
        <div
          role="status"
          className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3 shadow-xs"
        >
          <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h2 className="font-bold text-amber-950 text-sm">
              {t('portal.forcedBannerHeading')}
            </h2>
            <p className="mt-1 text-xs text-amber-900/90 leading-relaxed">
              {t('portal.forcedBannerMessage')}
            </p>
          </div>
        </div>
      )}

      <Card interactive={false} className="p-6 sm:p-8 border-slate-200 shadow-sm">
        <div className="text-start mb-6">
          <h1 className="text-2xl font-bold text-slate-900 font-heading">
            {isForced ? t('portal.forcedHeading') : t('portal.changePassword')}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {t('portal.changePasswordSubtitle')}
          </p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs sm:text-sm flex items-start gap-2.5"
          >
            <svg className="w-4 h-4 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Current Password */}
          <div className="text-start">
            <label htmlFor="current-pass" className="block text-sm font-semibold text-slate-800 mb-1.5">
              {t('portal.currentPasswordLabel')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="current-pass"
                type={showCurrent ? 'text' : 'password'}
                autoComplete="current-password"
                required
                disabled={isSubmitting}
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full h-11 ps-3.5 pe-11 rounded-lg border border-slate-300 text-base text-slate-900 bg-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#312E81] dir-ltr text-start"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowCurrent(!showCurrent)}
                aria-label={showCurrent ? t('portal.hidePassword') : t('portal.showPassword')}
                className="absolute inset-y-0 end-0 pe-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showCurrent ? (
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

          {/* New Password */}
          <div className="text-start">
            <label htmlFor="new-pass" className="block text-sm font-semibold text-slate-800 mb-1.5">
              {t('portal.newPasswordLabel')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="new-pass"
                type={showNew ? 'text' : 'password'}
                autoComplete="new-password"
                required
                disabled={isSubmitting}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-11 ps-3.5 pe-11 rounded-lg border border-slate-300 text-base text-slate-900 bg-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#312E81] dir-ltr text-start"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowNew(!showNew)}
                aria-label={showNew ? t('portal.hidePassword') : t('portal.showPassword')}
                className="absolute inset-y-0 end-0 pe-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showNew ? (
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

          {/* Confirm New Password */}
          <div className="text-start">
            <label htmlFor="confirm-pass" className="block text-sm font-semibold text-slate-800 mb-1.5">
              {t('portal.confirmPasswordLabel')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="confirm-pass"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                required
                disabled={isSubmitting}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-11 ps-3.5 pe-11 rounded-lg border border-slate-300 text-base text-slate-900 bg-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#312E81] dir-ltr text-start"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirm(!showConfirm)}
                aria-label={showConfirm ? t('portal.hidePassword') : t('portal.showPassword')}
                className="absolute inset-y-0 end-0 pe-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showConfirm ? (
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

          {/* Live Password Rules Checklist (Icon + Text, not color alone) */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 my-4 text-start">
            <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
              {t('portal.rulesTitle')}
            </p>
            <ul className="space-y-2 text-xs">
              {/* Rule 1: Min 8 chars */}
              <li className={`flex items-center gap-2 ${ruleMinLength ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                {ruleMinLength ? (
                  <svg className="w-4 h-4 text-emerald-600 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="w-4 h-4 rounded-full border border-slate-400 flex items-center justify-center shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  </span>
                )}
                <span>{t('portal.ruleMinLength')}</span>
              </li>

              {/* Rule 2: Letter and Number */}
              <li className={`flex items-center gap-2 ${ruleLetterAndNumber ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                {ruleLetterAndNumber ? (
                  <svg className="w-4 h-4 text-emerald-600 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="w-4 h-4 rounded-full border border-slate-400 flex items-center justify-center shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  </span>
                )}
                <span>{t('portal.ruleLetterAndNumber')}</span>
              </li>

              {/* Rule 3: Not equal current */}
              <li className={`flex items-center gap-2 ${ruleNotCurrent ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                {ruleNotCurrent ? (
                  <svg className="w-4 h-4 text-emerald-600 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="w-4 h-4 rounded-full border border-slate-400 flex items-center justify-center shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  </span>
                )}
                <span>{t('portal.ruleNotCurrent')}</span>
              </li>

              {/* Rule 4: Passwords Match */}
              <li className={`flex items-center gap-2 ${ruleMatch ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                {ruleMatch ? (
                  <svg className="w-4 h-4 text-emerald-600 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="w-4 h-4 rounded-full border border-slate-400 flex items-center justify-center shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  </span>
                )}
                <span>{t('portal.ruleMatch')}</span>
              </li>
            </ul>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full !h-12 !text-base"
              loading={isSubmitting}
              disabled={!allRulesSatisfied || isSubmitting}
            >
              {t('portal.updatePasswordBtn')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
