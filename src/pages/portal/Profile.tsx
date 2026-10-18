import React, { useState, useEffect } from 'react';
import { useI18n } from '../../i18n/LanguageProvider';
import { usePageMeta } from '../../hooks/usePageMeta';
import { getSession } from '../../services/auth';
import { getStudentProfile, getStudentClass } from '../../services/portal';
import { Student, ClassItem } from '../../types';
import { Card } from '../../components/Card';
import { Skeleton } from '../../components/Skeleton';
import { Button } from '../../components/Button';

export default function Profile() {
  const { t, lang } = useI18n();
  const session = getSession();

  const [student, setStudent] = useState<Student | null>(null);
  const [studentClass, setStudentClass] = useState<ClassItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  usePageMeta({
    title: t('portal.profilePageTitle'),
    description: t('portal.profilePageDesc'),
    noIndex: true,
  });

  const loadProfile = async () => {
    if (!session?.roll_no) return;
    setIsLoading(true);
    setError(null);

    try {
      const data = await getStudentProfile(session.roll_no);
      if (!data) {
        setError(t('portal.errStudentNotFound'));
        setIsLoading(false);
        return;
      }
      setStudent(data);

      const cls = await getStudentClass(data.class_id);
      setStudentClass(cls || null);
    } catch (err) {
      setError(t('common.errorLoading'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [session?.roll_no]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === 'ur' ? 'ur-PK' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="rectangular" className="h-40 rounded-2xl" />
        <Skeleton variant="rectangular" className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">{error || t('portal.errStudentNotFound')}</h2>
        <Button variant="primary" onClick={loadProfile}>
          {t('common.retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-start max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading">
          {t('portal.profilePageTitle')}
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          {t('portal.profilePageSubtitle')}
        </p>
      </div>

      {/* Main Profile Card */}
      <Card interactive={false} className="border-slate-200 overflow-hidden shadow-sm">
        {/* Header Hero Banner */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-[#312E81] via-[#1E1B4B] to-[#7C3AED] text-white flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-start">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/10 border-2 border-white/20 text-white flex items-center justify-center font-bold text-3xl shrink-0 font-heading shadow-md backdrop-blur-xs">
            {student.photo_path ? (
              <img
                src={student.photo_path}
                alt={student.full_name}
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              student.full_name.charAt(0)
            )}
          </div>

          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{t('portal.activeStudent')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading">
              {student.full_name}
            </h2>
            <p className="text-sm text-indigo-200 mt-1">
              {t('portal.fatherName')}: <strong className="text-white">{student.father_name}</strong>
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="text-xs font-mono font-bold text-white bg-white/15 px-2.5 py-1 rounded-md dir-ltr">
                {student.roll_no}
              </span>
              <span className="text-xs text-indigo-100 bg-white/10 px-2.5 py-1 rounded-md">
                {lang === 'ur' ? studentClass?.name_ur : studentClass?.name_en}
              </span>
            </div>
          </div>
        </div>

        {/* Read-Only Details Grid */}
        <div className="p-6 sm:p-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            {t('portal.academicAndPersonalDetails')}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8 text-sm">
            {/* Roll Number */}
            <div className="border-b border-slate-100 pb-3">
              <span className="text-xs text-slate-500 block">{t('portal.rollNo')}</span>
              <span className="font-mono font-semibold text-slate-900 dir-ltr text-base block mt-0.5">
                {student.roll_no}
              </span>
            </div>

            {/* Enrolled Class */}
            <div className="border-b border-slate-100 pb-3">
              <span className="text-xs text-slate-500 block">{t('portal.class')}</span>
              <span className="font-semibold text-slate-900 text-base block mt-0.5">
                {lang === 'ur' ? studentClass?.name_ur : studentClass?.name_en}
              </span>
            </div>

            {/* Full Name */}
            <div className="border-b border-slate-100 pb-3">
              <span className="text-xs text-slate-500 block">{t('portal.studentFullName')}</span>
              <span className="font-semibold text-slate-900 text-base block mt-0.5">
                {student.full_name}
              </span>
            </div>

            {/* Father's Name */}
            <div className="border-b border-slate-100 pb-3">
              <span className="text-xs text-slate-500 block">{t('portal.fatherName')}</span>
              <span className="font-semibold text-slate-900 text-base block mt-0.5">
                {student.father_name}
              </span>
            </div>

            {/* Date of Birth */}
            <div className="border-b border-slate-100 pb-3">
              <span className="text-xs text-slate-500 block">{t('portal.dateOfBirth')}</span>
              <span className="font-medium text-slate-900 text-base block mt-0.5 dir-ltr">
                {formatDate(student.date_of_birth)}
              </span>
            </div>

            {/* Registered Phone */}
            <div className="border-b border-slate-100 pb-3">
              <span className="text-xs text-slate-500 block">{t('portal.phoneLabel')}</span>
              <span className="font-mono font-medium text-slate-900 text-base block mt-0.5 dir-ltr">
                {student.phone}
              </span>
            </div>

            {/* Joining Date */}
            <div className="border-b border-slate-100 pb-3">
              <span className="text-xs text-slate-500 block">{t('portal.joiningDate')}</span>
              <span className="font-medium text-slate-900 text-base block mt-0.5 dir-ltr">
                {formatDate(student.joining_date)}
              </span>
            </div>

            {/* Concession Amount */}
            <div className="border-b border-slate-100 pb-3">
              <span className="text-xs text-slate-500 block">{t('portal.concessionScholarship')}</span>
              <span className="font-mono font-medium text-slate-900 text-base block mt-0.5 dir-ltr">
                {student.concession_amount > 0
                  ? `PKR ${student.concession_amount.toLocaleString()} / Month`
                  : t('portal.noneStandardFee')}
              </span>
            </div>

            {/* Address */}
            <div className="sm:col-span-2 border-b border-slate-100 pb-3">
              <span className="text-xs text-slate-500 block">{t('portal.residentialAddress')}</span>
              <span className="font-medium text-slate-900 text-sm block mt-0.5">
                {student.address}
              </span>
            </div>
          </div>

          {/* Admin Edit Notice + WhatsApp Link */}
          <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  {t('portal.profileEditNoticeTitle')}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('portal.profileEditNoticeDesc')}
                </p>
              </div>
            </div>

            <a
              href={`https://wa.me/923000000000?text=${encodeURIComponent(
                lang === 'ur'
                  ? `السلام علیکم، میں اپنی طالب علم پروفائل (رول نمبر: ${student.roll_no}) میں معلومات تبدیل کروانا چاہتا ہوں۔`
                  : `Assalam o Alaikum, I request an update to my student profile details (Roll Number: ${student.roll_no}).`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 px-4 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5"
            >
              <span>{t('portal.contactAdminWhatsApp')}</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}
