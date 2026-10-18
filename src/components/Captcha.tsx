import React, { useState } from 'react';
import { useI18n } from '../i18n/LanguageProvider';

interface CaptchaProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (err: string) => void;
}

/**
 * MOCK CAPTCHA COMPONENT
 * NOTE FOR STAGE D: In Stage D, this component will be replaced by Cloudflare Turnstile
 * utilizing import.meta.env.VITE_TURNSTILE_SITE_KEY (client-side widget only).
 * The current mock simulates human verification and error recovery seamlessly.
 */
export const Captcha: React.FC<CaptchaProps> = ({
  onVerify,
  onExpire,
  onError,
}) => {
  const { lang, t } = useI18n();
  const [status, setStatus] = useState<'idle' | 'verifying' | 'verified' | 'error'>('idle');

  const handleToggle = () => {
    if (status === 'verifying' || status === 'verified') return;

    setStatus('verifying');
    setTimeout(() => {
      // 95% simulated success rate
      const isSuccess = Math.random() > 0.05;
      if (isSuccess) {
        setStatus('verified');
        const mockToken = `mock_turnstile_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
        onVerify(mockToken);
      } else {
        setStatus('error');
        onError?.('Verification failed.');
      }
    }, 600);
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStatus('idle');
    onExpire?.();
  };

  return (
    <div className="w-full max-w-sm rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs text-start">
      <div className="flex items-center justify-between gap-3">
        <div
          role="checkbox"
          tabIndex={0}
          aria-checked={status === 'verified'}
          aria-label={t('admission.captchaLabel')}
          onClick={handleToggle}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              handleToggle();
            }
          }}
          className={`flex items-center gap-3 select-none cursor-pointer p-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#312E81] ${
            status === 'verified' ? 'cursor-default' : ''
          }`}
        >
          {/* Checkbox Icon / State */}
          <div
            className={`w-7 h-7 rounded-md border-2 flex items-center justify-center transition-all ${
              status === 'verified'
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                : status === 'error'
                ? 'border-rose-500 bg-rose-50'
                : 'border-slate-300 bg-white hover:border-[#312E81]'
            }`}
          >
            {status === 'verifying' && (
              <svg className="w-4 h-4 animate-spin text-[#312E81]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            )}

            {status === 'verified' && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}

            {status === 'error' && (
              <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>

          <span className="text-sm font-medium text-slate-800">
            {t('admission.captchaLabel')}
          </span>
        </div>

        {/* Security Badge Placeholder */}
        <div className="flex flex-col items-center shrink-0 text-slate-400">
          <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="text-[9px] font-semibold tracking-wider text-slate-500 uppercase">
            Turnstile
          </span>
        </div>
      </div>

      {status === 'error' && (
        <div className="mt-2.5 pt-2 border-t border-rose-100 flex items-center justify-between text-xs text-rose-600 font-medium">
          <span>{t('admission.captchaError')}</span>
          <button
            type="button"
            onClick={handleRetry}
            className="text-xs font-semibold underline hover:text-rose-800 cursor-pointer"
          >
            {t('common.retry')}
          </button>
        </div>
      )}
    </div>
  );
};
