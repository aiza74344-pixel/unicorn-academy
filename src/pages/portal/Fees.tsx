import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n/LanguageProvider';
import { usePageMeta } from '../../hooks/usePageMeta';
import { getSession } from '../../services/auth';
import {
  getStudentProfile,
  getFeeRecords,
  getPaymentProofs,
  devVerifyProof,
  devRejectProof,
  devResetPortalData,
} from '../../services/portal';
import { Student, FeeRecord, PaymentProof } from '../../types';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Skeleton } from '../../components/Skeleton';
import { ProofUploadModal } from './ProofUploadModal';
import { useToast } from '../../components/Toast';

export default function Fees() {
  const { t, lang } = useI18n();
  const session = getSession();
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [student, setStudent] = useState<Student | null>(null);
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [paymentProofs, setPaymentProofs] = useState<PaymentProof[]>([]);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFeeRecordId, setSelectedFeeRecordId] = useState<string | undefined>(undefined);

  // Dev helper state
  const [devCustomRejectReason, setDevCustomRejectReason] = useState(
    'Transaction reference could not be reconciled. Please re-upload with clear bank receipt.'
  );

  usePageMeta({
    title: t('portal.feesSeoTitle'),
    description: t('portal.feesSeoDesc'),
    noIndex: true,
  });

  const loadData = async () => {
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

      const [records, proofs] = await Promise.all([
        getFeeRecords(studentData.id),
        getPaymentProofs(studentData.id),
      ]);

      setFeeRecords(records);
      setPaymentProofs(proofs);

      // If user navigated to /portal/fees/proof or had ?upload=true
      if (location.pathname.includes('/proof') || location.search.includes('upload=true')) {
        setIsUploadOpen(true);
      }
    } catch (err) {
      setError(t('common.errorLoading'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [session?.roll_no, location.pathname, location.search]);

  // Totals calculations
  const totalInvoiced = feeRecords.reduce((sum, r) => sum + r.amount_due, 0);
  const totalPaid = feeRecords.reduce((sum, r) => sum + r.amount_paid, 0);
  const totalPending = totalInvoiced - totalPaid;

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

  const handleOpenUpload = (feeId?: string) => {
    setSelectedFeeRecordId(feeId);
    setIsUploadOpen(true);
  };

  // Developer Testing Helper Actions
  const handleDevVerify = async (proofId: string) => {
    const ok = await devVerifyProof(proofId);
    if (ok) {
      showToast({ type: 'success', title: 'Dev Helper: Proof verified & fee marked paid!' });
      loadData();
    }
  };

  const handleDevReject = async (proofId: string) => {
    const ok = await devRejectProof(proofId, devCustomRejectReason);
    if (ok) {
      showToast({ type: 'error', title: 'Dev Helper: Proof rejected with reason!' });
      loadData();
    }
  };

  const handleDevReset = () => {
    devResetPortalData();
    showToast({ type: 'success', title: 'Dev Helper: Portal test data reset to initial state.' });
    loadData();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton variant="rectangular" className="h-24 rounded-2xl" />
          <Skeleton variant="rectangular" className="h-24 rounded-2xl" />
          <Skeleton variant="rectangular" className="h-24 rounded-2xl" />
        </div>
        <Skeleton variant="rectangular" className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">{error}</h2>
        <Button variant="primary" onClick={loadData}>
          {t('common.retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-start">
      {/* PAGE TITLE & ACTION HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading">
            {t('portal.feesPageTitle')}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {t('portal.feesPageSubtitle')}
          </p>
        </div>

        {totalPending > 0 && (
          <Button
            variant="primary"
            onClick={() => handleOpenUpload()}
            className="w-full sm:w-auto"
          >
            <svg className="w-4 h-4 me-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {t('portal.btnUploadProof')}
          </Button>
        )}
      </div>

      {/* SUMMARY CARDS: TOTAL PAID, TOTAL PENDING, TOTAL INVOICED */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Paid */}
        <Card interactive={false} className="p-5 border-emerald-100 bg-emerald-50/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              {t('portal.summaryTotalPaid')}
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-950 font-mono mt-2 dir-ltr">
            PKR {totalPaid.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-700 mt-1 block">
            {t('portal.clearedFeeDesc')}
          </span>
        </Card>

        {/* Total Pending */}
        <Card interactive={false} className="p-5 border-rose-100 bg-rose-50/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
              {t('portal.summaryTotalPending')}
            </span>
            <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-950 font-mono mt-2 dir-ltr">
            PKR {totalPending.toLocaleString()}
          </p>
          <span className="text-[11px] text-rose-700 mt-1 block">
            {totalPending > 0 ? t('portal.duesAwaitingPayment') : t('portal.allDuesCleared')}
          </span>
        </Card>

        {/* Total Invoiced */}
        <Card interactive={false} className="p-5 border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('portal.summaryTotalInvoiced')}
            </span>
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono mt-2 dir-ltr">
            PKR {totalInvoiced.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {feeRecords.length} {t('portal.monthsRecorded')}
          </span>
        </Card>
      </div>

      {/* MONTH-WISE FEE HISTORY SECTION */}
      <section aria-labelledby="fee-history-heading">
        <div className="flex items-center justify-between mb-4">
          <h2 id="fee-history-heading" className="text-lg font-bold text-slate-900 font-heading">
            {t('portal.feeHistoryTitle')}
          </h2>
          <span className="text-xs text-slate-500">
            {t('portal.newestFirst')}
          </span>
        </div>

        {feeRecords.length === 0 ? (
          <Card interactive={false} className="p-12 text-center text-slate-500">
            <p className="font-semibold">{t('portal.noFeeRecordYet')}</p>
          </Card>
        ) : (
          <>
            {/* DESKTOP TABLE (hidden on mobile) */}
            <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
              <table className="w-full text-start border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <th scope="col" className="py-3.5 px-4 text-start">{t('portal.thMonth')}</th>
                    <th scope="col" className="py-3.5 px-4 text-start">{t('portal.thDue')}</th>
                    <th scope="col" className="py-3.5 px-4 text-start">{t('portal.thPaid')}</th>
                    <th scope="col" className="py-3.5 px-4 text-start">{t('portal.thStatus')}</th>
                    <th scope="col" className="py-3.5 px-4 text-start">{t('portal.thPaidOn')}</th>
                    <th scope="col" className="py-3.5 px-4 text-start">{t('portal.thReceiptNo')}</th>
                    <th scope="col" className="py-3.5 px-4 text-end">{t('portal.thAction')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {feeRecords.map((rec) => {
                    const hasPendingProof = paymentProofs.some(
                      (p) => p.fee_record_id === rec.id && p.status === 'pending'
                    );

                    return (
                      <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-4 font-semibold text-slate-900">
                          {formatMonth(rec.month)}
                        </td>
                        <td className="py-4 px-4 font-mono dir-ltr text-slate-700">
                          PKR {rec.amount_due.toLocaleString()}
                        </td>
                        <td className="py-4 px-4 font-mono dir-ltr text-emerald-700 font-medium">
                          PKR {rec.amount_paid.toLocaleString()}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col items-start gap-1">
                            <Badge status={rec.status} />
                            {hasPendingProof && (
                              <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                                {t('portal.badgeVerificationPending')}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-600 text-xs dir-ltr">
                          {rec.paid_on ? formatDate(rec.paid_on) : '—'}
                        </td>
                        <td className="py-4 px-4 font-mono text-xs text-slate-600 dir-ltr">
                          {rec.receipt_no || '—'}
                        </td>
                        <td className="py-4 px-4 text-end">
                          {rec.status !== 'paid' ? (
                            <button
                              type="button"
                              onClick={() => handleOpenUpload(rec.id)}
                              disabled={hasPendingProof}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                hasPendingProof
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                  : 'bg-[#312E81] text-white hover:bg-[#1E1B4B]'
                              }`}
                            >
                              {hasPendingProof ? t('portal.underReview') : t('portal.btnUploadProof')}
                            </button>
                          ) : (
                            <span className="text-xs text-emerald-600 font-medium">
                              ✓ {t('badge.paid')}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS (shown on mobile, hidden on md+) */}
            <div className="md:hidden space-y-3">
              {feeRecords.map((rec) => {
                const hasPendingProof = paymentProofs.some(
                  (p) => p.fee_record_id === rec.id && p.status === 'pending'
                );
                const remaining = rec.amount_due - rec.amount_paid;

                return (
                  <Card key={rec.id} interactive={false} className="p-4 border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          {formatMonth(rec.month)}
                        </h3>
                        {hasPendingProof && (
                          <span className="inline-block mt-0.5 text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                            {t('portal.badgeVerificationPending')}
                          </span>
                        )}
                      </div>
                      <Badge status={rec.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100 my-2">
                      <div>
                        <span className="text-slate-500 block">{t('portal.amountDue')}</span>
                        <span className="font-mono font-bold text-slate-900 dir-ltr block mt-0.5">
                          PKR {rec.amount_due.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">{t('portal.amountPaid')}</span>
                        <span className="font-mono font-bold text-emerald-600 dir-ltr block mt-0.5">
                          PKR {rec.amount_paid.toLocaleString()}
                        </span>
                      </div>
                      {remaining > 0 && (
                        <div className="col-span-2">
                          <span className="text-slate-500 block">{t('portal.remainingBalance')}</span>
                          <span className="font-mono font-bold text-rose-600 dir-ltr block mt-0.5">
                            PKR {remaining.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {rec.paid_on && (
                        <div>
                          <span className="text-slate-500 block">{t('portal.paidOn')}</span>
                          <span className="text-slate-700 dir-ltr block mt-0.5">
                            {formatDate(rec.paid_on)}
                          </span>
                        </div>
                      )}
                      {rec.receipt_no && (
                        <div>
                          <span className="text-slate-500 block">{t('portal.receiptNo')}</span>
                          <span className="font-mono text-slate-700 dir-ltr block mt-0.5">
                            {rec.receipt_no}
                          </span>
                        </div>
                      )}
                    </div>

                    {rec.status !== 'paid' && (
                      <div className="mt-3">
                        <Button
                          variant="primary"
                          onClick={() => handleOpenUpload(rec.id)}
                          disabled={hasPendingProof}
                          className="w-full !min-h-[40px] !text-xs"
                        >
                          {hasPendingProof ? t('portal.underReview') : t('portal.btnUploadProof')}
                        </Button>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* MY PAYMENT PROOFS SECTION */}
      <section aria-labelledby="payment-proofs-heading" className="pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 id="payment-proofs-heading" className="text-lg font-bold text-slate-900 font-heading">
            {t('portal.proofsSectionTitle')}
          </h2>
          <span className="text-xs text-slate-500">
            {paymentProofs.length} {t('portal.submissionsCount')}
          </span>
        </div>

        {paymentProofs.length === 0 ? (
          <Card interactive={false} className="p-8 text-center text-slate-500 text-xs">
            {t('portal.noProofsUploadedYet')}
          </Card>
        ) : (
          <div className="space-y-3">
            {paymentProofs.map((proof) => {
              const matchedFee = feeRecords.find((f) => f.id === proof.fee_record_id);

              return (
                <Card
                  key={proof.id}
                  interactive={false}
                  className={`p-4 border transition-all ${
                    proof.status === 'rejected'
                      ? 'border-red-200 bg-red-50/20'
                      : proof.status === 'pending'
                      ? 'border-indigo-200 bg-indigo-50/15'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {/* Method Icon / Thumbnail */}
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 font-bold text-xs uppercase text-[#312E81]">
                        {proof.method === 'jazzcash'
                          ? 'JC'
                          : proof.method === 'easypaisa'
                          ? 'EP'
                          : 'BK'}
                      </div>

                      <div className="overflow-hidden">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 text-sm">
                            {matchedFee ? formatMonth(matchedFee.month) : t('portal.feeSubmission')}
                          </span>
                          <span className="text-xs font-mono font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded dir-ltr">
                            {proof.transaction_id}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {t('portal.amount')}: <strong className="font-mono text-slate-800 dir-ltr">PKR {proof.amount.toLocaleString()}</strong> •{' '}
                          {t('portal.submittedOn')}: <span className="dir-ltr">{formatDate(proof.created_at)}</span>
                        </p>
                      </div>
                    </div>

                    {/* Proof Status Badge */}
                    <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                      <Badge status={proof.status} />
                    </div>
                  </div>

                  {/* Rejected Reason Banner & Re-upload button */}
                  {proof.status === 'rejected' && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900">
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1">
                          <span className="font-bold text-red-950 block">{t('portal.rejectionReasonTitle')}</span>
                          <p className="mt-0.5 leading-relaxed">{proof.reject_reason}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenUpload(proof.fee_record_id)}
                          className="shrink-0 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                        >
                          {t('portal.btnUploadAgain')}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Pending Notice */}
                  {proof.status === 'pending' && (
                    <p className="mt-2 text-[11px] text-indigo-700">
                      ℹ️ {t('portal.pendingAdminReviewNotice')}
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* DEVELOPER / REVIEWER TESTING HELPER PANEL */}
      <section className="mt-8 p-5 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-200 px-2 py-0.5 rounded">
              🛠️ {t('portal.devHelperTitle')}
            </span>
            <p className="text-xs text-amber-900 mt-1">
              {t('portal.devHelperDesc')}
            </p>
          </div>
          <button
            type="button"
            onClick={handleDevReset}
            className="px-3 py-1 text-xs font-semibold text-amber-900 bg-amber-200 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
          >
            {t('portal.devResetData')}
          </button>
        </div>

        <div className="space-y-2 mt-3">
          <p className="text-xs font-semibold text-slate-700">
            {t('portal.devActiveProofsList')}:
          </p>
          {paymentProofs.map((p) => (
            <div
              key={p.id}
              className="p-2.5 bg-white rounded-lg border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
            >
              <div>
                <span className="font-mono font-bold text-slate-800">{p.transaction_id}</span>
                <span className="ms-2 text-slate-500">
                  (PKR {p.amount.toLocaleString()} — <strong className="capitalize">{p.status}</strong>)
                </span>
              </div>
              <div className="flex items-center gap-2">
                {p.status !== 'verified' && (
                  <button
                    type="button"
                    onClick={() => handleDevVerify(p.id)}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium cursor-pointer"
                  >
                    {t('portal.devMarkVerified')}
                  </button>
                )}
                {p.status !== 'rejected' && (
                  <button
                    type="button"
                    onClick={() => handleDevReject(p.id)}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-medium cursor-pointer"
                  >
                    {t('portal.devMarkRejected')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PROOF UPLOAD MODAL */}
      {student && (
        <ProofUploadModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          student={student}
          feeRecords={feeRecords}
          selectedFeeRecordId={selectedFeeRecordId}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
