import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/LanguageProvider';
import { usePageMeta } from '../../hooks/usePageMeta';
import { getSession } from '../../services/auth';
import {
  getStudentProfile,
  getStudentClass,
  getFeeRecords,
  getPaymentProofs,
  getPortalAnnouncements,
} from '../../services/portal';
import { Student, FeeRecord, PaymentProof, Announcement, ClassItem } from '../../types';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Skeleton } from '../../components/Skeleton';
import { ProofUploadModal } from './ProofUploadModal';

export default function Dashboard() {
  const { t, lang } = useI18n();
  const session = getSession();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [student, setStudent] = useState<Student | null>(null);
  const [studentClass, setStudentClass] = useState<ClassItem | null>(null);
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [paymentProofs, setPaymentProofs] = useState<PaymentProof[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFeeRecordId, setSelectedFeeRecordId] = useState<string | undefined>(undefined);

  usePageMeta({
    title: t('portal.dashboardTitle'),
    description: t('portal.dashboardDesc'),
    noIndex: true,
  });

  const loadDashboardData = async () => {
    if (!session?.roll_no) return;
    setIsLoading(true);
    setError(null);

    try {
      const studentData = await getStudentProfile(session.roll_no);
      if (!studentData) {
        setError(t('portal.errStudentNotFound'));
        setIsLoading(false);
        return;
      }
      setStudent(studentData);

      const [clsData, feesData, proofsData, newsData] = await Promise.all([
        getStudentClass(studentData.class_id),
        getFeeRecords(studentData.id),
        getPaymentProofs(studentData.id),
        getPortalAnnouncements(),
      ]);

      setStudentClass(clsData || null);
      setFeeRecords(feesData);
      setPaymentProofs(proofsData);
      setAnnouncements(newsData.slice(0, 3));
    } catch (err) {
      setError(t('common.errorLoading'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [session?.roll_no]);

  // Current (latest) month fee record
  const currentMonthRecord = feeRecords[0] || null;

  // Check if current month has a pending proof
  const currentMonthPendingProof = currentMonthRecord
    ? paymentProofs.find(
        (p) => p.fee_record_id === currentMonthRecord.id && p.status === 'pending'
      )
    : null;

  const openUploadModal = (recId?: string) => {
    setSelectedFeeRecordId(recId || currentMonthRecord?.id);
    setIsUploadOpen(true);
  };

  const formatMonth = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === 'ur' ? 'ur-PK' : 'en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === 'ur' ? 'ur-PK' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="p-6 bg-white rounded-2xl border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2 w-full max-w-md">
            <Skeleton variant="text" className="!h-8 !w-3/4" />
            <Skeleton variant="text" className="!h-4 !w-1/2" />
          </div>
          <Skeleton variant="rectangular" className="!h-10 !w-36" />
        </div>

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton variant="rectangular" className="!h-64 lg:col-span-2 rounded-2xl" />
          <Skeleton variant="rectangular" className="!h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">{error}</h2>
        <Button variant="primary" onClick={loadDashboardData}>
          {t('common.retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-start">
      {/* GREETING BANNER */}
      <div className="p-6 md:p-8 bg-gradient-to-br from-[#312E81] to-[#1E1B4B] rounded-2xl text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-semibold mb-2">
            <span>🎓</span>
            <span>{t('portal.academicSession')} 2026-27</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading">
            {t('portal.greetingPrefix')}, {student?.full_name}!
          </h1>
          <p className="text-indigo-200 text-sm mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>
              {t('portal.rollNo')}: <strong className="font-mono text-white dir-ltr">{student?.roll_no}</strong>
            </span>
            <span>•</span>
            <span>
              {t('portal.class')}: <strong>{lang === 'ur' ? studentClass?.name_ur : studentClass?.name_en}</strong>
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/portal/fees"
            className="px-4 py-2 text-sm font-semibold text-white bg-white/15 hover:bg-white/25 rounded-xl transition-colors"
          >
            {t('portal.viewFeeHistory')}
          </Link>
        </div>
      </div>

      {/* DASHBOARD GRID: THIS MONTH FEE STATUS + ANNOUNCEMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* THIS MONTH FEE STATUS CARD */}
        <div className="lg:col-span-2">
          <Card interactive={false} className="p-6 border-slate-200 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t('portal.currentMonthInvoice')}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                    {currentMonthRecord ? formatMonth(currentMonthRecord.month) : t('portal.noFeeRecordTitle')}
                  </h2>
                </div>
                {currentMonthRecord && (
                  <Badge status={currentMonthRecord.status} />
                )}
              </div>

              {!currentMonthRecord ? (
                <div className="py-12 text-center text-slate-500">
                  <svg className="w-10 h-10 mx-auto text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-sm font-semibold">{t('portal.noFeeRecordYet')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Amount Breakdown */}
                  <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                    <div>
                      <span className="text-[11px] font-medium text-slate-500 uppercase block">
                        {t('portal.amountDue')}
                      </span>
                      <span className="text-base sm:text-lg font-bold text-slate-900 font-mono dir-ltr block mt-0.5">
                        PKR {currentMonthRecord.amount_due.toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-medium text-slate-500 uppercase block">
                        {t('portal.amountPaid')}
                      </span>
                      <span className="text-base sm:text-lg font-bold text-emerald-600 font-mono dir-ltr block mt-0.5">
                        PKR {currentMonthRecord.amount_paid.toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-medium text-slate-500 uppercase block">
                        {t('portal.remainingBalance')}
                      </span>
                      <span className="text-base sm:text-lg font-bold text-[#DC2626] font-mono dir-ltr block mt-0.5">
                        PKR {(currentMonthRecord.amount_due - currentMonthRecord.amount_paid).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Verification Pending Notice Banner if pending proof exists */}
                  {currentMonthPendingProof && (
                    <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl flex items-start gap-3 text-indigo-900 text-xs sm:text-sm">
                      <svg className="w-5 h-5 text-[#312E81] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="flex-1">
                        <p className="font-bold text-xs uppercase tracking-wide text-[#312E81]">
                          {t('portal.verificationPendingTitle')}
                        </p>
                        <p className="text-xs text-indigo-800 mt-0.5 leading-relaxed">
                          {t('portal.verificationPendingMsg')}{' '}
                          <span className="font-mono font-semibold dir-ltr">
                            TxID: {currentMonthPendingProof.transaction_id}
                          </span>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Paid Status Details */}
                  {currentMonthRecord.status === 'paid' && (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-900 text-xs sm:text-sm">
                      <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <span className="font-semibold block">{t('portal.feePaidClear')}</span>
                        <span className="text-xs text-emerald-700">
                          {t('portal.receiptNo')}: <strong className="font-mono dir-ltr">{currentMonthRecord.receipt_no}</strong> •{' '}
                          {t('portal.paidOn')}: {currentMonthRecord.paid_on ? formatDate(currentMonthRecord.paid_on) : '—'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action footer */}
            {currentMonthRecord && currentMonthRecord.status !== 'paid' && (
              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  {currentMonthPendingProof
                    ? t('portal.proofUnderReviewHint')
                    : t('portal.payOnlineHint')}
                </span>
                <Button
                  variant="primary"
                  onClick={() => openUploadModal(currentMonthRecord.id)}
                  disabled={Boolean(currentMonthPendingProof)}
                  className="w-full sm:w-auto"
                >
                  <svg className="w-4 h-4 me-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  {currentMonthPendingProof
                    ? t('portal.btnProofSubmitted')
                    : t('portal.btnUploadProof')}
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* LATEST 3 ANNOUNCEMENTS CARD */}
        <div className="lg:col-span-1">
          <Card interactive={false} className="p-6 border-slate-200 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h2 className="text-base font-bold text-slate-900 font-heading">
                  {t('portal.announcementsTitle')}
                </h2>
                <Link
                  to="/portal/announcements"
                  className="text-xs font-semibold text-[#7C3AED] hover:text-[#312E81] transition-colors"
                >
                  {t('portal.viewAll')}
                </Link>
              </div>

              {announcements.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  {t('portal.noAnnouncements')}
                </div>
              ) : (
                <div className="space-y-3.5">
                  {announcements.map((ann) => (
                    <article key={ann.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-start">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#312E81] bg-[#312E81]/10 px-1.5 py-0.5 rounded">
                          {ann.audience === 'students' ? t('portal.audienceStudents') : t('portal.audiencePublic')}
                        </span>
                        <time className="text-[11px] text-slate-400 dir-ltr">
                          {formatDate(ann.published_at)}
                        </time>
                      </div>
                      <h3 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {lang === 'ur' ? ann.title_ur : ann.title_en}
                      </h3>
                      <p className="text-[11px] text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                        {lang === 'ur' ? ann.body_ur : ann.body_en}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Helpline Support */}
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
              <span>{t('portal.helpDeskNote')}: </span>
              <a
                href="https://wa.me/923000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#312E81] font-semibold underline"
              >
                0300-0000000
              </a>
            </div>
          </Card>
        </div>
      </div>

      {/* PROOF UPLOAD MODAL */}
      {student && (
        <ProofUploadModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          student={student}
          feeRecords={feeRecords}
          selectedFeeRecordId={selectedFeeRecordId}
          onSuccess={loadDashboardData}
        />
      )}
    </div>
  );
}
