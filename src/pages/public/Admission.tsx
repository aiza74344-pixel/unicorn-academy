import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useI18n } from '../../i18n/LanguageProvider';
import { usePageMeta } from '../../hooks/usePageMeta';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { FormField } from '../../components/FormField';
import { Captcha } from '../../components/Captcha';
import { useToast } from '../../components/Toast';
import { getClasses, submitAdmission, getSiteSettings } from '../../services';
import { ClassItem, ClassGroup, AdmissionFormData, SiteSettings } from '../../types';

export default function Admission() {
  const { lang, dir, t } = useI18n();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  usePageMeta({
    title: t('admission.seoTitle'),
    description: t('admission.seoDescription'),
  });

  // Current Step: 1 = Student, 2 = Class, 3 = Documents, 4 = Review
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form Data State (Kept in component state, persists across language switch and steps)
  const [formData, setFormData] = useState<AdmissionFormData>({
    student_name: '',
    father_name: '',
    date_of_birth: '',
    class_id: '',
    group_name: null,
    previous_school: '',
    phone: '',
    whatsapp: '',
    address: '',
    photo: null,
    bform: null,
    result_card: null,
    captcha_token: '',
  });

  const [sameAsPhone, setSameAsPhone] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  // File previews and local validation
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  // Submit states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<'network' | 'server' | null>(null);
  const [generatedRef, setGeneratedRef] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Input refs for auto-focusing on invalid fields
  const studentNameRef = useRef<HTMLInputElement>(null);
  const fatherNameRef = useRef<HTMLInputElement>(null);
  const dobRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLTextAreaElement>(null);
  const classSelectRef = useRef<HTMLSelectElement>(null);

  // Load Classes and Settings
  useEffect(() => {
    let isMounted = true;
    Promise.all([getClasses(), getSiteSettings()]).then(([clsData, setts]) => {
      if (!isMounted) return;
      setClasses(clsData);
      setSettings(setts);

      // Preselect class from query param ?class=<id> if provided
      const queryClassId = searchParams.get('class');
      if (queryClassId && clsData.some((c) => c.id === queryClassId)) {
        const found = clsData.find((c) => c.id === queryClassId);
        setFormData((prev) => ({
          ...prev,
          class_id: queryClassId,
          group_name: found?.group_name || prev.group_name,
        }));
      }
    });

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  // Warn before unload if user has typed info and not submitted
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (
        !generatedRef &&
        (formData.student_name || formData.phone || formData.class_id)
      ) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formData, generatedRef]);

  // Sync WhatsApp if checkbox is checked
  useEffect(() => {
    if (sameAsPhone) {
      setFormData((prev) => ({ ...prev, whatsapp: prev.phone }));
    }
  }, [sameAsPhone, formData.phone]);

  // Phone validation helper
  const isValidPakistaniPhone = (num: string): boolean => {
    const cleaned = num.replace(/[\s\-()]/g, '');
    return /^((\+92)|(0092)|(92))?3[0-9]{9}$/.test(cleaned) || /^03[0-9]{9}$/.test(cleaned);
  };

  // Age validation helper (between 3 and 25 years old today)
  const isValidAge = (dateStr: string): boolean => {
    if (!dateStr) return false;
    const dob = new Date(dateStr);
    if (isNaN(dob.getTime())) return false;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age >= 3 && age <= 25;
  };

  // Step 1 validation
  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.student_name.trim() || formData.student_name.trim().length > 60) {
      newErrors.student_name = t('admission.errStudentName');
    }
    if (!formData.father_name.trim() || formData.father_name.trim().length > 60) {
      newErrors.father_name = t('admission.errFatherName');
    }
    if (!formData.date_of_birth) {
      newErrors.date_of_birth = t('admission.errDobRequired');
    } else if (!isValidAge(formData.date_of_birth)) {
      newErrors.date_of_birth = t('admission.errDobRange');
    }
    if (!formData.phone.trim() || !isValidPakistaniPhone(formData.phone)) {
      newErrors.phone = t('admission.errPhone');
    }
    const trimmedAddress = formData.address.trim();
    if (trimmedAddress.length < 10 || trimmedAddress.length > 200) {
      newErrors.address = t('admission.errAddress');
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setLiveAnnouncement(Object.values(newErrors)[0]);
      if (newErrors.student_name) studentNameRef.current?.focus();
      else if (newErrors.father_name) fatherNameRef.current?.focus();
      else if (newErrors.date_of_birth) dobRef.current?.focus();
      else if (newErrors.phone) phoneRef.current?.focus();
      else if (newErrors.address) addressRef.current?.focus();
      return false;
    }

    return true;
  };

  // Step 2 validation
  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.class_id) {
      newErrors.class_id = t('admission.errClassRequired');
    } else {
      const selectedClass = classes.find((c) => c.id === formData.class_id);
      if (selectedClass?.level === 'fsc' && !selectedClass.group_name && !formData.group_name) {
        newErrors.group_name = t('admission.errGroupRequired');
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setLiveAnnouncement(Object.values(newErrors)[0]);
      classSelectRef.current?.focus();
      return false;
    }
    return true;
  };

  // Step 3 validation
  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.photo) {
      newErrors.photo = t('admission.errPhotoRequired');
    }
    if (!formData.bform) {
      newErrors.bform = t('admission.errBformRequired');
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setLiveAnnouncement(Object.values(newErrors)[0]);
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
        setErrors({});
        setLiveAnnouncement(t('admission.step2'));
      }
    } else if (step === 2) {
      if (validateStep2()) {
        setStep(3);
        setErrors({});
        setLiveAnnouncement(t('admission.step3'));
      }
    } else if (step === 3) {
      if (validateStep3()) {
        setStep(4);
        setErrors({});
        setLiveAnnouncement(t('admission.step4'));
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
      setErrors({});
    }
  };

  // File Upload Handlers with exact type & size (max 2 MB) validation
  const handleFileUpload = (
    field: 'photo' | 'bform' | 'result_card',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxBytes = 2 * 1024 * 1024; // 2 MB

    if (file.size > maxBytes) {
      setErrors((prev) => ({ ...prev, [field]: t('admission.errFileTooLarge') }));
      e.target.value = '';
      return;
    }

    if (field === 'photo') {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({ ...prev, [field]: t('admission.errFileTypePhoto') }));
        e.target.value = '';
        return;
      }
      setPhotoPreview(URL.createObjectURL(file));
    } else {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({ ...prev, [field]: t('admission.errFileTypeDoc') }));
        e.target.value = '';
        return;
      }
    }

    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });

    setFormData((prev) => ({ ...prev, [field]: file }));
  };

  const handleRemoveFile = (field: 'photo' | 'bform' | 'result_card') => {
    setFormData((prev) => ({ ...prev, [field]: null }));
    if (field === 'photo') setPhotoPreview(null);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== 4) return;

    // Check honeypot for spam bots
    if (honeypot) {
      setGeneratedRef('ADM-000199');
      return;
    }

    if (!formData.captcha_token) {
      setErrors({ captcha: t('admission.errCaptchaRequired') });
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await submitAdmission(formData);
      setGeneratedRef(res.reference_no);
      showToast({
        type: 'success',
        title: t('admission.successHeading'),
        message: `${t('admission.refBoxLabel')}: ${res.reference_no}`,
      });
    } catch (err: any) {
      if (err?.message?.includes('Network')) {
        setSubmitError('network');
      } else {
        setSubmitError('server');
      }
      showToast({
        type: 'error',
        title: t('admission.errNetwork'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyReference = () => {
    if (!generatedRef) return;
    navigator.clipboard.writeText(generatedRef).then(() => {
      setIsCopied(true);
      showToast({
        type: 'success',
        title: t('admission.copiedRef'),
        message: generatedRef,
      });
      setTimeout(() => setIsCopied(false), 3000);
    });
  };

  const selectedClass = classes.find((c) => c.id === formData.class_id);

  // SUCCESS SCREEN
  if (generatedRef) {
    return (
      <div className="py-12 md:py-20 px-4 sm:px-6 max-w-[1200px] mx-auto flex items-center justify-center">
        <Card className="max-w-2xl w-full p-8 sm:p-12 text-center space-y-8 border-emerald-200/80 shadow-md">
          {/* Success Check Icon */}
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <svg className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div className="space-y-2">
            <h1 className="h1-title text-slate-900 leading-tight">
              {t('admission.successHeading')}
            </h1>
            <p className="text-slate-600 text-base sm:text-lg max-w-lg mx-auto">
              {t('admission.successSubtitle')}
            </p>
          </div>

          {/* Reference Box (Always dir="ltr" for digits & prefix) */}
          <div className="p-6 rounded-2xl bg-slate-50 border-2 border-emerald-500/40 space-y-3">
            <span className="text-xs uppercase font-semibold text-slate-600 tracking-wider block">
              {t('admission.refBoxLabel')}
            </span>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <span
                dir="ltr"
                className="font-heading font-extrabold text-2xl sm:text-3xl text-[#312E81] tracking-wider select-all bg-white px-5 py-2 rounded-xl border border-slate-200 shadow-xs"
              >
                {generatedRef}
              </span>

              <Button
                variant="secondary"
                onClick={handleCopyReference}
                className="!min-h-[42px] !px-4 !py-1 text-xs"
              >
                <svg className="w-4 h-4 me-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>{isCopied ? t('admission.copiedRef') : t('admission.copyRef')}</span>
              </Button>
            </div>

            <p className="text-xs text-slate-500 italic max-w-md mx-auto pt-1">
              {t('admission.saveHint')}
            </p>
          </div>

          {/* Next Steps List */}
          <div className="text-start bg-amber-50/70 border border-amber-200/70 p-5 sm:p-6 rounded-xl space-y-2.5 text-xs sm:text-sm text-amber-950">
            <p className="font-semibold text-amber-900 text-sm">
              {t('admission.nextStepsTitle')}
            </p>
            <ul className="space-y-2 list-disc ps-4">
              <li>{t('admission.nextStep1')}</li>
              <li>{t('admission.nextStep2')}</li>
              <li>{t('admission.nextStep3')}</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button
              to={`/admission/status?ref=${encodeURIComponent(generatedRef)}`}
              variant="accent"
              className="px-6 shadow-sm"
            >
              {t('admission.btnTrackStatus')}
            </Button>
            <Button to="/" variant="secondary" className="px-6">
              {t('admission.btnHome')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const stepsMeta = [
    { num: 1, label: t('admission.step1') },
    { num: 2, label: t('admission.step2') },
    { num: 3, label: t('admission.step3') },
    { num: 4, label: t('admission.step4') },
  ];

  return (
    <div className="py-10 md:py-16 space-y-10 max-w-[1200px] mx-auto px-4 sm:px-6">
      {/* Screen Reader Live Region */}
      <div className="sr-only" aria-live="assertive">
        {liveAnnouncement}
      </div>

      {/* Header */}
      <header className="text-center max-w-3xl mx-auto space-y-3">
        <div className="flex items-center justify-center gap-2">
          <Badge status="admission_open" label={t('badge.admissionOpen')} />
        </div>
        <h1 className="h1-title text-[#312E81] tracking-tight">
          {t('admission.pageTitle')}
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
          {t('admission.pageSubtitle')}
        </p>

        {/* Link to status lookup */}
        <div className="pt-1">
          <Link
            to="/admission/status"
            className="text-xs sm:text-sm font-semibold text-[#7C3AED] hover:underline inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] rounded-md p-1"
          >
            <span>{t('admission.trackStatusLink')}</span>
            <svg className="w-3.5 h-3.5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </header>

      {/* Progress Indicator (4 steps with checkmark for completed, labels, and RTL mirror) */}
      <div className="max-w-2xl mx-auto w-full">
        <nav aria-label="Admission steps">
          <ol className="flex items-center justify-between w-full relative">
            {stepsMeta.map((s, idx) => {
              const isCompleted = step > s.num;
              const isCurrent = step === s.num;

              return (
                <li
                  key={s.num}
                  className="flex flex-col items-center flex-1 relative text-center"
                >
                  {/* Connecting Line between steps */}
                  {idx !== 0 && (
                    <div
                      aria-hidden="true"
                      className={`absolute top-4 -start-1/2 w-full h-1 -translate-y-1/2 transition-colors ${
                        step >= s.num ? 'bg-[#312E81]' : 'bg-slate-200'
                      }`}
                    />
                  )}

                  {/* Step Bubble */}
                  <div
                    aria-current={isCurrent ? 'step' : undefined}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all z-10 shadow-xs ${
                      isCompleted
                        ? 'bg-[#16A34A] text-white'
                        : isCurrent
                        ? 'bg-[#312E81] text-white ring-4 ring-[#312E81]/20'
                        : 'bg-white border-2 border-slate-300 text-slate-500'
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span>{s.num}</span>
                    )}
                  </div>

                  {/* Step Label */}
                  <span
                    className={`mt-2 text-xs font-semibold max-w-[85px] leading-tight ${
                      isCurrent
                        ? 'text-[#312E81]'
                        : isCompleted
                        ? 'text-slate-800'
                        : 'text-slate-600'
                    }`}
                  >
                    {s.label}
                  </span>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      {/* Form Container */}
      <Card className="max-w-3xl mx-auto p-6 sm:p-10 border-slate-200/80 shadow-xs">
        {/* Network / Server Error Notice */}
        {submitError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 text-sm flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <svg className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold">
                  {submitError === 'network' ? t('admission.errNetwork') : t('admission.errServer')}
                </p>
                {settings?.whatsapp && (
                  <a
                    href={`https://wa.me/${settings.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-emerald-700 underline mt-1 block"
                  >
                    {t('common.whatsappUs')} (+{settings.whatsapp})
                  </a>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSubmitError(null)}
              className="text-xs font-semibold text-rose-700 hover:underline shrink-0"
            >
              {t('common.retry')}
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Honeypot hidden input */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="confirm_admission_bot">Leave empty</label>
            <input
              type="text"
              id="confirm_admission_bot"
              tabIndex={-1}
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              autoComplete="off"
            />
          </div>

          {/* ================= STEP 1: STUDENT INFO ================= */}
          {step === 1 && (
            <div className="space-y-6 text-start">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="h2-title text-[#312E81]">
                  {t('admission.step1')}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {t('admission.studentNameHint')}
                </p>
              </div>

              {/* Student Name */}
              <div>
                <FormField
                  ref={studentNameRef}
                  label={t('admission.studentNameLabel')}
                  placeholder={t('admission.studentNamePlaceholder')}
                  required
                  maxLength={60}
                  value={formData.student_name}
                  error={errors.student_name}
                  hint={t('admission.studentNameHint')}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, student_name: e.target.value }))
                  }
                />
              </div>

              {/* Father Name */}
              <div>
                <FormField
                  ref={fatherNameRef}
                  label={t('admission.fatherNameLabel')}
                  placeholder={t('admission.fatherNamePlaceholder')}
                  required
                  maxLength={60}
                  value={formData.father_name}
                  error={errors.father_name}
                  hint={t('admission.fatherNameHint')}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, father_name: e.target.value }))
                  }
                />
              </div>

              {/* Date of Birth */}
              <div className="w-full text-start mb-4">
                <label
                  htmlFor="dob-input"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  {t('admission.dobLabel')}
                  <span className="text-red-500 ms-1">*</span>
                </label>
                <input
                  id="dob-input"
                  ref={dobRef}
                  type="date"
                  required
                  aria-invalid={Boolean(errors.date_of_birth)}
                  aria-describedby="dob-hint"
                  value={formData.date_of_birth}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date_of_birth: e.target.value }))
                  }
                  className={`w-full h-[44px] px-3.5 rounded-lg border text-base text-slate-900 bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 ${
                    errors.date_of_birth
                      ? 'border-red-500 focus-visible:ring-red-500'
                      : 'border-slate-300 focus-visible:ring-[#312E81]'
                  }`}
                />
                <p id="dob-hint" className="text-xs text-slate-500 mt-1.5">
                  {t('admission.dobHint')}
                </p>
                {errors.date_of_birth && (
                  <p className="text-xs text-red-600 font-medium mt-1.5 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    <span>{errors.date_of_birth}</span>
                  </p>
                )}
              </div>

              {/* Phone & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FormField
                    ref={phoneRef}
                    label={t('admission.phoneLabel')}
                    placeholder={t('admission.phonePlaceholder')}
                    required
                    dir="ltr"
                    value={formData.phone}
                    error={errors.phone}
                    hint={t('admission.phoneHint')}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, phone: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <FormField
                    label={t('admission.whatsappLabel')}
                    placeholder={t('admission.whatsappPlaceholder')}
                    dir="ltr"
                    disabled={sameAsPhone}
                    value={sameAsPhone ? formData.phone : formData.whatsapp}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, whatsapp: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* Same as phone checkbox */}
              <div className="flex items-center gap-2">
                <input
                  id="same-phone-chk"
                  type="checkbox"
                  checked={sameAsPhone}
                  onChange={(e) => setSameAsPhone(e.target.checked)}
                  className="w-4 h-4 rounded-sm border-slate-300 text-[#312E81] focus:ring-[#312E81] cursor-pointer"
                />
                <label
                  htmlFor="same-phone-chk"
                  className="text-xs sm:text-sm text-slate-700 cursor-pointer select-none"
                >
                  {t('admission.sameAsPhone')}
                </label>
              </div>

              {/* Residential Address */}
              <div className="w-full text-start">
                <label
                  htmlFor="address-textarea"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  {t('admission.addressLabel')}
                  <span className="text-red-500 ms-1">*</span>
                </label>
                <textarea
                  id="address-textarea"
                  ref={addressRef}
                  rows={3}
                  required
                  maxLength={200}
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, address: e.target.value }))
                  }
                  placeholder={t('admission.addressPlaceholder')}
                  className={`w-full p-3.5 rounded-lg border text-base text-slate-900 bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 ${
                    errors.address
                      ? 'border-red-500 focus-visible:ring-red-500'
                      : 'border-slate-300 focus-visible:ring-[#312E81]'
                  }`}
                />
                <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                  <span>{t('admission.addressHint')}</span>
                  <span>{formData.address.length} / 200</span>
                </div>
                {errors.address && (
                  <p className="text-xs text-red-600 font-medium mt-1.5 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    <span>{errors.address}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ================= STEP 2: CLASS SELECTION ================= */}
          {step === 2 && (
            <div className="space-y-6 text-start">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="h2-title text-[#312E81]">
                  {t('admission.step2')}
                </h2>
              </div>

              {/* Class Selection Dropdown grouped by level */}
              <div className="w-full text-start">
                <label
                  htmlFor="class-dropdown"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  {t('admission.classSelectLabel')}
                  <span className="text-red-500 ms-1">*</span>
                </label>

                <select
                  id="class-dropdown"
                  ref={classSelectRef}
                  value={formData.class_id}
                  required
                  onChange={(e) => {
                    const chosenId = e.target.value;
                    const c = classes.find((item) => item.id === chosenId);
                    setFormData((prev) => ({
                      ...prev,
                      class_id: chosenId,
                      group_name: c?.group_name || prev.group_name,
                    }));
                  }}
                  className={`w-full h-[46px] px-3.5 rounded-lg border text-base text-slate-900 bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 ${
                    errors.class_id
                      ? 'border-red-500 focus-visible:ring-red-500'
                      : 'border-slate-300 focus-visible:ring-[#312E81]'
                  }`}
                >
                  <option value="">{t('admission.classSelectPlaceholder')}</option>
                  {(['primary', 'middle', 'matric', 'fsc'] as const).map((lvl) => {
                    const group = classes.filter((c) => c.level === lvl && c.is_active);
                    if (group.length === 0) return null;

                    const levelLabel =
                      lvl === 'primary'
                        ? t('courses.tabPrimary')
                        : lvl === 'middle'
                        ? t('courses.tabMiddle')
                        : lvl === 'matric'
                        ? t('courses.tabMatric')
                        : t('courses.tabFsc');

                    return (
                      <optgroup key={lvl} label={levelLabel}>
                        {group.map((c) => (
                          <option key={c.id} value={c.id}>
                            {lang === 'ur' ? c.name_ur : c.name_en} ({c.timing})
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>

                {errors.class_id && (
                  <p className="text-xs text-red-600 font-medium mt-1.5 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    <span>{errors.class_id}</span>
                  </p>
                )}
              </div>

              {/* Preselected / Chosen Class Details Confirmation Banner */}
              {selectedClass && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#312E81]">
                      {t('admission.preselectedNotice')}
                    </span>
                    <span className="text-xs uppercase font-bold px-2 py-0.5 rounded bg-[#312E81]/10 text-[#312E81]">
                      {selectedClass.level}
                    </span>
                  </div>

                  <p className="text-slate-800 font-medium text-sm">
                    {lang === 'ur' ? selectedClass.name_ur : selectedClass.name_en}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 text-slate-600">
                    <span>
                      <strong>{t('courses.timingLabel')}</strong> {selectedClass.timing}
                    </span>
                    <span className="font-bold text-[#312E81]">
                      {t('admission.monthlyFeeLabel')}{' '}
                      {selectedClass.monthly_fee.toLocaleString()} {lang === 'ur' ? 'روپے' : 'PKR'}
                    </span>
                  </div>
                </div>
              )}

              {/* If FSc class is chosen and needs group choice */}
              {selectedClass?.level === 'fsc' && (
                <div className="w-full text-start space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    {t('admission.groupSelectLabel')}
                    <span className="text-red-500 ms-1">*</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { key: 'pre_medical' as ClassGroup, label: t('admission.groupPreMedical') },
                      { key: 'pre_engineering' as ClassGroup, label: t('admission.groupPreEngineering') },
                      { key: 'ics' as ClassGroup, label: t('admission.groupIcs') },
                      { key: 'fa' as ClassGroup, label: t('admission.groupFa') },
                    ].map((grp) => (
                      <label
                        key={grp.key}
                        className={`p-3 rounded-xl border text-xs sm:text-sm flex items-center gap-2.5 cursor-pointer transition-colors ${
                          formData.group_name === grp.key
                            ? 'border-[#312E81] bg-[#312E81]/8 font-semibold text-[#312E81]'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="fsc_group"
                          checked={formData.group_name === grp.key}
                          onChange={() => setFormData((prev) => ({ ...prev, group_name: grp.key }))}
                          className="text-[#312E81] focus:ring-[#312E81]"
                        />
                        <span>{grp.label}</span>
                      </label>
                    ))}
                  </div>

                  {errors.group_name && (
                    <p className="text-xs text-red-600 font-medium mt-1">
                      {errors.group_name}
                    </p>
                  )}
                </div>
              )}

              {/* Previous School (Optional) */}
              <div>
                <FormField
                  label={t('admission.prevSchoolLabel')}
                  placeholder={t('admission.prevSchoolPlaceholder')}
                  hint={t('admission.prevSchoolHint')}
                  value={formData.previous_school}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, previous_school: e.target.value }))
                  }
                />
              </div>
            </div>
          )}

          {/* ================= STEP 3: DOCUMENTS ================= */}
          {step === 3 && (
            <div className="space-y-6 text-start">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="h2-title text-[#312E81]">
                  {t('admission.step3')}
                </h2>
              </div>

              {/* 1. Student Photo (Required, JPG/PNG only) */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  {t('admission.photoLabel')}
                  <span className="text-red-500 ms-1">*</span>
                </label>

                {!formData.photo ? (
                  <label className="border-2 border-dashed border-slate-300 hover:border-[#312E81] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors text-center bg-slate-50/50 hover:bg-slate-50">
                    <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs sm:text-sm font-medium text-slate-700">
                      {t('admission.dropText')}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1">
                      {t('admission.photoHint')}
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg"
                      className="hidden"
                      onChange={(e) => handleFileUpload('photo', e)}
                    />
                  </label>
                ) : (
                  <div className="flex items-center gap-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    {photoPreview && (
                      <img
                        src={photoPreview}
                        alt={t('admission.photoAlt')}
                        className="w-16 h-16 object-cover rounded-lg border border-slate-300 shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate" dir="ltr">
                        {formData.photo.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {t('admission.fileSize')}{' '}
                        {(formData.photo.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="danger"
                      onClick={() => handleRemoveFile('photo')}
                      className="!min-h-[36px] !px-3 !py-1 text-xs"
                    >
                      {t('admission.removeFile')}
                    </Button>
                  </div>
                )}

                {errors.photo && (
                  <p className="text-xs text-red-600 font-medium mt-1">
                    {errors.photo}
                  </p>
                )}
              </div>

              {/* 2. B-Form / CNIC (Required, JPG/PNG/PDF) */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  {t('admission.bformLabel')}
                  <span className="text-red-500 ms-1">*</span>
                </label>

                {!formData.bform ? (
                  <label className="border-2 border-dashed border-slate-300 hover:border-[#312E81] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors text-center bg-slate-50/50 hover:bg-slate-50">
                    <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-xs sm:text-sm font-medium text-slate-700">
                      {t('admission.dropText')}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1">
                      {t('admission.bformHint')}
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,application/pdf"
                      className="hidden"
                      onChange={(e) => handleFileUpload('bform', e)}
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate" dir="ltr">
                        {formData.bform.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {t('admission.fileSize')}{' '}
                        {(formData.bform.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="danger"
                      onClick={() => handleRemoveFile('bform')}
                      className="!min-h-[36px] !px-3 !py-1 text-xs"
                    >
                      {t('admission.removeFile')}
                    </Button>
                  </div>
                )}

                {errors.bform && (
                  <p className="text-xs text-red-600 font-medium mt-1">
                    {errors.bform}
                  </p>
                )}
              </div>

              {/* 3. Previous Result Card (Optional, JPG/PNG/PDF) */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  {t('admission.resultCardLabel')}
                </label>

                {!formData.result_card ? (
                  <label className="border-2 border-dashed border-slate-300 hover:border-[#312E81] rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors text-center bg-slate-50/50 hover:bg-slate-50">
                    <span className="text-xs sm:text-sm font-medium text-slate-700">
                      {t('admission.dropText')}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1">
                      {t('admission.resultCardHint')}
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,application/pdf"
                      className="hidden"
                      onChange={(e) => handleFileUpload('result_card', e)}
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate" dir="ltr">
                        {formData.result_card.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {t('admission.fileSize')}{' '}
                        {(formData.result_card.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="danger"
                      onClick={() => handleRemoveFile('result_card')}
                      className="!min-h-[36px] !px-3 !py-1 text-xs"
                    >
                      {t('admission.removeFile')}
                    </Button>
                  </div>
                )}

                {errors.result_card && (
                  <p className="text-xs text-red-600 font-medium mt-1">
                    {errors.result_card}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ================= STEP 4: REVIEW & SUBMIT ================= */}
          {step === 4 && (
            <div className="space-y-6 text-start">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="h2-title text-[#312E81]">
                  {t('admission.reviewTitle')}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {t('admission.reviewNotice')}
                </p>
              </div>

              {/* Section 1: Student info summary */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="font-heading font-semibold text-sm text-slate-900">
                    {t('admission.sectionStudent')}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-semibold text-[#7C3AED] hover:underline cursor-pointer"
                  >
                    {t('admission.editSection')}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                  <div>
                    <span className="text-slate-500 block">{t('admission.studentNameLabel')}</span>
                    <span className="font-medium text-slate-900">{formData.student_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">{t('admission.fatherNameLabel')}</span>
                    <span className="font-medium text-slate-900">{formData.father_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">{t('admission.dobLabel')}</span>
                    <span className="font-medium text-slate-900" dir="ltr">{formData.date_of_birth}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">{t('admission.phoneLabel')}</span>
                    <span className="font-medium text-slate-900" dir="ltr">{formData.phone}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-500 block">{t('admission.addressLabel')}</span>
                    <span className="font-medium text-slate-900">{formData.address}</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Class info summary */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="font-heading font-semibold text-sm text-slate-900">
                    {t('admission.sectionClass')}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs font-semibold text-[#7C3AED] hover:underline cursor-pointer"
                  >
                    {t('admission.editSection')}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                  <div>
                    <span className="text-slate-500 block">{t('admission.classSelectLabel')}</span>
                    <span className="font-medium text-slate-900">
                      {selectedClass ? (lang === 'ur' ? selectedClass.name_ur : selectedClass.name_en) : ''}
                    </span>
                  </div>
                  {formData.group_name && (
                    <div>
                      <span className="text-slate-500 block">{t('admission.groupSelectLabel')}</span>
                      <span className="font-medium text-slate-900 uppercase">
                        {formData.group_name.replace('_', ' ')}
                      </span>
                    </div>
                  )}
                  {selectedClass && (
                    <div>
                      <span className="text-slate-500 block">{t('admission.monthlyFeeLabel')}</span>
                      <span className="font-semibold text-[#312E81]">
                        {selectedClass.monthly_fee.toLocaleString()} {lang === 'ur' ? 'روپے' : 'PKR'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 3: Documents summary */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="font-heading font-semibold text-sm text-slate-900">
                    {t('admission.sectionDocuments')}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="text-xs font-semibold text-[#7C3AED] hover:underline cursor-pointer"
                  >
                    {t('admission.editSection')}
                  </button>
                </div>
                <div className="flex items-center gap-4 text-xs sm:text-sm">
                  {photoPreview && (
                    <img
                      src={photoPreview}
                      alt="Student photo preview"
                      className="w-14 h-14 object-cover rounded-lg border border-slate-300 shrink-0"
                    />
                  )}
                  <div className="space-y-1">
                    <p className="text-slate-700">
                      <strong>Photo:</strong> <span dir="ltr">{formData.photo?.name}</span>
                    </p>
                    <p className="text-slate-700">
                      <strong>B-Form / CNIC:</strong> <span dir="ltr">{formData.bform?.name}</span>
                    </p>
                    {formData.result_card && (
                      <p className="text-slate-700">
                        <strong>Result Card:</strong> <span dir="ltr">{formData.result_card.name}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Terms check */}
              <p className="text-xs text-slate-500 italic">
                {t('admission.termsAgree')}
              </p>

              {/* CAPTCHA Component */}
              <div className="pt-2">
                <Captcha
                  onVerify={(token) => {
                    setFormData((prev) => ({ ...prev, captcha_token: token }));
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.captcha;
                      return copy;
                    });
                  }}
                  onExpire={() => {
                    setFormData((prev) => ({ ...prev, captcha_token: '' }));
                  }}
                  onError={(err) => {
                    setErrors((prev) => ({ ...prev, captcha: err }));
                  }}
                />
                {errors.captcha && (
                  <p className="text-xs text-red-600 font-medium mt-1">
                    {errors.captcha}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ================= STEP ACTION BUTTONS ================= */}
          <div className="pt-6 mt-8 border-t border-slate-100 flex items-center justify-between gap-4">
            {step > 1 ? (
              <Button
                type="button"
                variant="secondary"
                onClick={handleBack}
                disabled={isSubmitting}
                className="!min-h-[44px]"
              >
                <svg className="w-4 h-4 me-1 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                <span>{t('admission.btnBack')}</span>
              </Button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <Button
                type="button"
                variant="primary"
                onClick={handleNext}
                className="!min-h-[44px] px-6"
              >
                <span>{t('admission.btnNext')}</span>
                <svg className="w-4 h-4 ms-1 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            ) : (
              <Button
                type="submit"
                variant="accent"
                loading={isSubmitting}
                disabled={!formData.captcha_token || isSubmitting}
                className="!min-h-[44px] px-8 shadow-sm font-semibold"
              >
                {isSubmitting ? t('admission.submittingBtn') : t('admission.submitBtn')}
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
