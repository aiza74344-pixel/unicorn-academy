import React, { useEffect, useState } from 'react';
import { useI18n } from '../../i18n/LanguageProvider';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { FormField } from '../../components/FormField';
import { Modal } from '../../components/Modal';
import { Skeleton } from '../../components/Skeleton';
import { useToast } from '../../components/Toast';
import { ClassItem, Announcement } from '../../types';
import { getClasses, getAnnouncements } from '../../services';

export default function Foundation() {
  const { lang, t } = useI18n();
  const { showToast } = useToast();

  // Data fetching state
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);

  // Interactive component states for showcase
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [testInputNormal, setTestInputNormal] = useState('');
  const [testInputError, setTestInputError] = useState('0300123');

  useEffect(() => {
    let isMounted = true;
    setIsLoadingClasses(true);

    Promise.all([getClasses(), getAnnouncements()])
      .then(([classesData, announcementsData]) => {
        if (isMounted) {
          setClasses(classesData);
          setAnnouncements(announcementsData);
          setIsLoadingClasses(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching foundation data:', err);
        if (isMounted) setIsLoadingClasses(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleShowSuccessToast = () => {
    showToast({
      type: 'success',
      title: t('foundation.toastSuccessTitle'),
      message: t('foundation.toastSuccessMessage'),
    });
  };

  const handleShowErrorToast = () => {
    showToast({
      type: 'error',
      title: t('foundation.toastErrorTitle'),
      message: t('foundation.toastErrorMessage'),
    });
  };

  const handleConfirmDelete = () => {
    setIsModalOpen(false);
    showToast({
      type: 'success',
      title: lang === 'ur' ? 'ریکارڈ حذف کر دیا گیا' : 'Record Deleted',
      message:
        lang === 'ur'
          ? 'نمونہ طالب علم کا ریکارڈ بحفاظت ہٹا دیا گیا ہے۔'
          : 'The student record has been successfully removed.',
    });
  };

  return (
    <div className="py-8 md:py-14 space-y-16">
      {/* 1. Hero Section with Gold Badge, H1, Subtitle, and Apply Now CTA */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 text-center">
        <div className="flex flex-col items-center max-w-3xl mx-auto space-y-5">
          {/* Announcement Alert Banner if available */}
          {announcements.length > 0 && announcements[0].is_published && (
            <div className="w-full mb-2 p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-amber-900 text-xs sm:text-sm flex items-center justify-center gap-2">
              <span className="font-semibold px-2 py-0.5 rounded bg-amber-200 text-amber-950 text-xs shrink-0">
                {lang === 'ur' ? 'اعلانیہ' : 'NOTICE'}
              </span>
              <span className="truncate">
                {lang === 'ur'
                  ? announcements[0].title_ur
                  : announcements[0].title_en}
              </span>
            </div>
          )}

          {/* Admission Open Gold Badge */}
          <div className="inline-block">
            <Badge
              status="admission_open"
              label={t('foundation.heroBadge')}
              className="text-sm px-4 py-1.5 shadow-sm"
            />
          </div>

          {/* H1 Heading */}
          <h1 className="h1-title text-[#312E81] tracking-tight">
            {t('foundation.heroTitle')}
          </h1>

          {/* Intro Text */}
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
            {t('foundation.heroSubtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button to="/admission" variant="accent" className="px-8 shadow-md">
              {t('common.applyNow')}
            </Button>
            <Button to="/courses" variant="secondary" className="px-6">
              {t('common.exploreCourses')}
            </Button>
          </div>
        </div>
      </section>

      {/* 2. Academic Classes Grid loaded via getClasses() with Skeletons */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="text-start mb-8 border-b border-slate-200/70 pb-4">
          <h2 className="h2-title text-[#312E81]">{t('foundation.classesTitle')}</h2>
          <p className="text-slate-600 text-sm sm:text-base mt-1">
            {t('foundation.classesSubtitle')}
          </p>
        </div>

        {/* Loading Skeletons */}
        {isLoadingClasses ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-6 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="space-y-2 pt-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                  <Skeleton className="h-3 w-4/6" />
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-8 w-20 rounded-md" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {classes.map((cls) => {
              const name = lang === 'ur' ? cls.name_ur : cls.name_en;
              const subjects = lang === 'ur' ? cls.subjects_ur : cls.subjects_en;

              return (
                <Card
                  key={cls.id}
                  className="p-6 flex flex-col justify-between border-slate-200/80"
                >
                  <div>
                    {/* Level / Group Tag */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs uppercase font-semibold tracking-wider text-[#7C3AED] bg-[#7C3AED]/10 px-2.5 py-0.5 rounded-full">
                        {cls.level}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {cls.timing}
                      </span>
                    </div>

                    {/* Class Name */}
                    <h3 className="h3-title text-slate-900 mb-3 text-start">
                      {name}
                    </h3>

                    {/* Subjects */}
                    <div className="text-start mb-6">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        {t('foundation.subjectsLabel')}
                      </p>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {subjects.slice(0, 4).map((sub, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#312E81] shrink-0" />
                            <span className="truncate">{sub}</span>
                          </li>
                        ))}
                        {subjects.length > 4 && (
                          <li className="text-[11px] text-slate-500 italic">
                            +{subjects.length - 4} more
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Monthly Fee & Card CTA */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="text-start">
                      <span className="text-xs text-slate-500 block">
                        {t('common.perMonth')}
                      </span>
                      <span className="text-lg font-bold text-[#312E81]">
                        {cls.monthly_fee.toLocaleString()} {t('foundation.feePrefix')}
                      </span>
                    </div>
                    <Button
                      to="/admission"
                      variant="primary"
                      className="!min-h-[36px] !px-3 !py-1 !text-xs"
                    >
                      {t('common.applyNow')}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. Comprehensive Components Showcase Section */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-10">
          <div className="text-start border-b border-slate-100 pb-5">
            <h2 className="h2-title text-[#312E81]">
              {t('foundation.componentsSectionTitle')}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-1">
              {t('foundation.componentsSectionSubtitle')}
            </p>
          </div>

          {/* Sub-Showcase 1: Buttons */}
          <div className="space-y-4 text-start">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#312E81]" />
              {t('foundation.buttonsShowcase')}
            </h3>
            <div className="flex flex-wrap items-center gap-3.5">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="accent">Accent Button</Button>
              <Button variant="danger">Danger Button</Button>

              {/* Loading button demo */}
              <Button
                variant="primary"
                loading={isButtonLoading}
                onClick={() => {
                  setIsButtonLoading(true);
                  setTimeout(() => setIsButtonLoading(false), 2000);
                }}
              >
                {isButtonLoading ? t('common.loading') : 'Click for Loading State'}
              </Button>
            </div>
          </div>

          {/* Sub-Showcase 2: All 6 Badges (Color + Icon + Text) */}
          <div className="space-y-4 text-start">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
              {t('foundation.badgesShowcase')}
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <Badge status="paid" />
              <Badge status="unpaid" />
              <Badge status="partial" />
              <Badge status="pending" />
              <Badge status="approved" />
              <Badge status="rejected" />
              <Badge status="admission_open" />
            </div>
          </div>

          {/* Sub-Showcase 3: Two FormFields (Normal with hint, and with validation error) */}
          <div className="space-y-4 text-start">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" />
              {t('foundation.formsShowcase')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
              <FormField
                label={t('foundation.fieldNormalLabel')}
                placeholder={t('foundation.fieldNormalPlaceholder')}
                hint={t('foundation.fieldNormalHint')}
                required
                value={testInputNormal}
                onChange={(e) => setTestInputNormal(e.target.value)}
              />

              <FormField
                label={t('foundation.fieldErrorLabel')}
                placeholder={t('foundation.fieldErrorPlaceholder')}
                error={t('foundation.fieldErrorMessage')}
                required
                value={testInputError}
                onChange={(e) => setTestInputError(e.target.value)}
              />
            </div>
          </div>

          {/* Sub-Showcase 4: Interactive Overlays & Notifications (Toast & Modal) */}
          <div className="space-y-4 text-start">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
              {t('foundation.modalsAndToasts')}
            </h3>
            <div className="flex flex-wrap items-center gap-4">
              <Button
                variant="primary"
                onClick={handleShowSuccessToast}
                className="!text-sm"
              >
                {t('foundation.showSuccessToast')}
              </Button>

              <Button
                variant="secondary"
                onClick={handleShowErrorToast}
                className="!text-sm"
              >
                {t('foundation.showErrorToast')}
              </Button>

              <Button
                variant="danger"
                onClick={() => setIsModalOpen(true)}
                className="!text-sm"
              >
                {t('foundation.openModal')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Delete Confirmation Modal Example */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('foundation.modalTitle')}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              className="!min-h-[40px] !px-4 !py-1.5 !text-sm"
            >
              {t('foundation.modalCancel')}
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              className="!min-h-[40px] !px-4 !py-1.5 !text-sm"
            >
              {t('foundation.modalConfirm')}
            </Button>
          </>
        }
      >
        <p>{t('foundation.modalBody')}</p>
      </Modal>
    </div>
  );
}
