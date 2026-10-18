import React from 'react';
import { useLocation } from 'react-router-dom';
import { useI18n } from '../../i18n/LanguageProvider';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';

export default function ComingSoon() {
  const { t } = useI18n();
  const location = useLocation();

  // Map route pathname to friendly title key if available
  const routeSegment = location.pathname.replace(/^\/|\/$/g, '');

  return (
    <div className="py-16 md:py-24 px-4 sm:px-6 max-w-[1200px] mx-auto text-center flex items-center justify-center">
      <Card className="max-w-lg w-full p-8 sm:p-12 text-center space-y-6 border-slate-200/80 shadow-sm">
        <div className="inline-block">
          <Badge status="pending" label={t('comingSoon.stayTuned')} />
        </div>

        <div className="w-16 h-16 rounded-full bg-[#312E81]/10 text-[#312E81] mx-auto flex items-center justify-center">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="h2-title text-slate-900 capitalize">
            {routeSegment ? `/${routeSegment}` : ''} {t('comingSoon.title')}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {t('comingSoon.description')}
          </p>
        </div>

        <div className="pt-2">
          <Button to="/" variant="primary">
            {t('common.backToHome')}
          </Button>
        </div>
      </Card>
    </div>
  );
}
