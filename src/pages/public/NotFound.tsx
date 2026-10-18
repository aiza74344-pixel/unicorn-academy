import React from 'react';
import { useI18n } from '../../i18n/LanguageProvider';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';

export default function NotFound() {
  const { t } = useI18n();

  return (
    <div className="py-16 md:py-24 px-4 sm:px-6 max-w-[1200px] mx-auto text-center flex items-center justify-center">
      <Card className="max-w-md w-full p-8 sm:p-12 text-center space-y-6 border-slate-200/80 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center font-bold text-2xl font-heading">
          404
        </div>

        <div className="space-y-2">
          <h1 className="h2-title text-slate-900">
            {t('notFound.title')}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {t('notFound.description')}
          </p>
        </div>

        <div className="pt-2">
          <Button to="/" variant="primary">
            {t('notFound.backButton')}
          </Button>
        </div>
      </Card>
    </div>
  );
}
