import React, { useState, useEffect } from 'react';
import { useI18n } from '../../i18n/LanguageProvider';
import { FeeRecord, PaymentMethod, Student } from '../../types';
import { submitPaymentProof } from '../../services/portal';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { useToast } from '../../components/Toast';

interface ProofUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  feeRecords: FeeRecord[];
  selectedFeeRecordId?: string;
  onSuccess: () => void;
}

export const ProofUploadModal: React.FC<ProofUploadModalProps> = ({
  isOpen,
  onClose,
  student,
  feeRecords,
  selectedFeeRecordId,
  onSuccess,
}) => {
  const { t, lang } = useI18n();
  const { showToast } = useToast();

  // Filter only unpaid or partial fee records
  const eligibleRecords = feeRecords.filter(
    (r) => r.status === 'unpaid' || r.status === 'partial'
  );

  const [feeRecordId, setFeeRecordId] = useState<string>(
    selectedFeeRecordId || (eligibleRecords[0]?.id ?? '')
  );
  const [method, setMethod] = useState<PaymentMethod>('jazzcash');
  const [transactionId, setTransactionId] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // When selected fee record changes or opens, set default amount to remaining due
  useEffect(() => {
    if (selectedFeeRecordId) {
      setFeeRecordId(selectedFeeRecordId);
    } else if (eligibleRecords.length > 0 && !eligibleRecords.some((r) => r.id === feeRecordId)) {
      setFeeRecordId(eligibleRecords[0].id);
    }
  }, [selectedFeeRecordId, eligibleRecords]);

  // Set default amount when feeRecordId changes
  useEffect(() => {
    const activeRecord = eligibleRecords.find((r) => r.id === feeRecordId);
    if (activeRecord) {
      const remaining = activeRecord.amount_due - activeRecord.amount_paid;
      setAmount(remaining.toString());
    }
  }, [feeRecordId]);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (screenshotPreview && screenshotPreview.startsWith('blob:')) {
        URL.revokeObjectURL(screenshotPreview);
      }
    };
  }, [screenshotPreview]);

  const activeRecord = eligibleRecords.find((r) => r.id === feeRecordId);
  const remainingDue = activeRecord ? activeRecord.amount_due - activeRecord.amount_paid : 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type (JPG or PNG)
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setErrorMessage(t('portal.errFileTypeOnly'));
      e.target.value = '';
      return;
    }

    // Validate size (max 2 MB = 2 * 1024 * 1024 bytes)
    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage(t('portal.errFileSizeLimit'));
      e.target.value = '';
      return;
    }

    setErrorMessage(null);
    setScreenshotFile(file);
    const previewUrl = URL.createObjectURL(file);
    setScreenshotPreview(previewUrl);
  };

  const removeFile = () => {
    if (screenshotPreview && screenshotPreview.startsWith('blob:')) {
      URL.revokeObjectURL(screenshotPreview);
    }
    setScreenshotFile(null);
    setScreenshotPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Client-side validations
    if (!feeRecordId) {
      setErrorMessage(t('portal.errSelectMonth'));
      return;
    }

    const trimmedTx = transactionId.trim().toUpperCase();
    if (!trimmedTx || trimmedTx.length < 6 || trimmedTx.length > 30 || !/^[A-Z0-9]+$/.test(trimmedTx)) {
      setErrorMessage(t('portal.errTxFormat'));
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage(t('portal.errInvalidAmount'));
      return;
    }

    if (numAmount > remainingDue) {
      setErrorMessage(
        t('portal.errAmountExceeds') + ` (PKR ${remainingDue.toLocaleString()})`
      );
      return;
    }

    if (!screenshotFile) {
      setErrorMessage(t('portal.errScreenshotRequired'));
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await submitPaymentProof({
        student_id: student.id,
        fee_record_id: feeRecordId,
        method,
        transaction_id: trimmedTx,
        amount: numAmount,
        screenshot_file: screenshotFile,
      });

      if (!res.success) {
        setErrorMessage(res.error || t('portal.errProofFailed'));
        setIsSubmitting(false);
        return;
      }

      showToast({ type: 'success', title: t('portal.proofSubmittedSuccess') });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      // Friendly network error keeping user entered fields safe
      setErrorMessage(t('portal.errNetworkRetry'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatMonth = (monthStr: string) => {
    const d = new Date(monthStr);
    return d.toLocaleDateString(lang === 'ur' ? 'ur-PK' : 'en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('portal.uploadProofTitle')}
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting || eligibleRecords.length === 0}
          >
            {t('portal.submitProofBtn')}
          </Button>
        </div>
      }
    >
      {eligibleRecords.length === 0 ? (
        <div className="py-8 text-center text-slate-500">
          <svg className="w-12 h-12 mx-auto text-emerald-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-semibold text-slate-800">{t('portal.allFeesCleared')}</p>
          <p className="text-xs text-slate-500 mt-1">{t('portal.noPendingMonths')}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4 text-start">
          {errorMessage && (
            <div
              role="alert"
              className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs sm:text-sm flex items-start gap-2"
            >
              <svg className="w-4 h-4 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Fee Month Selector */}
          <div>
            <label htmlFor="proof-month" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
              {t('portal.selectFeeMonth')} <span className="text-red-500">*</span>
            </label>
            <select
              id="proof-month"
              value={feeRecordId}
              onChange={(e) => setFeeRecordId(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#312E81]"
            >
              {eligibleRecords.map((rec) => {
                const rem = rec.amount_due - rec.amount_paid;
                return (
                  <option key={rec.id} value={rec.id}>
                    {formatMonth(rec.month)} — {t('portal.dueLabel')}: PKR {rem.toLocaleString()} ({t(`badge.${rec.status}`)})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
              {t('portal.paymentMethodLabel')} <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'jazzcash' as PaymentMethod, label: 'JazzCash' },
                { id: 'easypaisa' as PaymentMethod, label: 'EasyPaisa' },
                { id: 'bank' as PaymentMethod, label: t('portal.bankTransfer') },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold text-center transition-all cursor-pointer ${
                    method === m.id
                      ? 'border-[#312E81] bg-[#312E81] text-white shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Transaction ID & Amount in a 2-col responsive row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="proof-txid" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                {t('portal.txIdLabel')} <span className="text-red-500">*</span>
              </label>
              <input
                id="proof-txid"
                type="text"
                required
                placeholder="e.g. JC9876543210"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 font-mono text-sm uppercase tracking-wide placeholder:normal-case placeholder:font-sans focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#312E81] dir-ltr text-start"
              />
              <p className="text-[11px] text-slate-500 mt-1">{t('portal.txIdHint')}</p>
            </div>

            <div>
              <label htmlFor="proof-amount" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                {t('portal.amountPaidLabel')} (PKR) <span className="text-red-500">*</span>
              </label>
              <input
                id="proof-amount"
                type="number"
                min="1"
                max={remainingDue}
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#312E81] dir-ltr text-start"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                {t('portal.maxAmountHint')}: <span className="font-semibold dir-ltr">PKR {remainingDue.toLocaleString()}</span>
              </p>
            </div>
          </div>

          {/* Screenshot Upload with Preview & Remove */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
              {t('portal.screenshotLabel')} <span className="text-red-500">*</span>
            </label>

            {!screenshotPreview ? (
              <label
                htmlFor="screenshot-input"
                className="border-2 border-dashed border-slate-300 hover:border-[#312E81] rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-slate-100/70 transition-colors"
              >
                <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs font-semibold text-[#312E81]">
                  {t('portal.clickToUploadScreenshot')}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5">
                  JPG / PNG (Max 2 MB)
                </span>
                <input
                  id="screenshot-input"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
            ) : (
              <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-900/5 p-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={screenshotPreview}
                    alt="Receipt Screenshot Preview"
                    className="w-14 h-14 object-cover rounded-lg border border-slate-200"
                  />
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-slate-900 truncate max-w-[200px]">
                      {screenshotFile?.name || 'receipt-image.png'}
                    </p>
                    <p className="text-[11px] text-slate-500 dir-ltr">
                      {screenshotFile ? (screenshotFile.size / 1024).toFixed(0) + ' KB' : ''}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={removeFile}
                  className="px-2.5 py-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors cursor-pointer"
                >
                  {t('portal.removeScreenshot')}
                </button>
              </div>
            )}
          </div>
        </form>
      )}
    </Modal>
  );
};
