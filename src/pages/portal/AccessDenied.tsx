import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/LanguageProvider';
import { usePageMeta } from '../../hooks/usePageMeta';
import { Button } from '../../components/Button';
import { getSession } from '../../services/auth';

export default function AccessDenied() {
  const { t } = useI18n();
  const session = getSession();

  usePageMeta({
    title: t('portal.accessDeniedTitle'),
    description: t('portal.accessDeniedDesc'),
    noIndex: true,
  });

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-100 shadow-md p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-700 bg-red-100 rounded-full mb-3">
          403 {t('portal.forbidden')}
        </span>

        <h1 className="text-2xl font-bold text-slate-900 mb-3 font-heading">
          {t('portal.accessDeniedHeading')}
        </h1>

        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          {t('portal.accessDeniedMessage')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {session ? (
            <Button to="/portal" variant="primary" className="w-full sm:w-auto">
              {t('portal.returnToPortal')}
            </Button>
          ) : (
            <Button to="/portal/login" variant="primary" className="w-full sm:w-auto">
              {t('nav.portalLogin')}
            </Button>
          )}

          <Button to="/" variant="secondary" className="w-full sm:w-auto">
            {t('common.backToHome')}
          </Button>
        </div>
      </div>
    </div>
  );
}
