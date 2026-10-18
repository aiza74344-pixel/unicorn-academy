import {
  Student,
  FeeRecord,
  PaymentProof,
  PaymentMethod,
  Announcement,
  ClassItem,
} from '../types';
import { mockClasses, mockAnnouncements } from '../data/mock';

/**
 * MOCK PORTAL SERVICE FOR STUDENT / PARENT PORTAL
 * NOTE FOR STAGE D:
 * In Stage D, these methods will connect to Supabase PostgreSQL via RLS policies
 * and Supabase Storage for receipt screenshots. The client UI components consume
 * this exact API surface without any code changes.
 */

// MOCK ONLY: Test Students
export const mockStudents: Student[] = [
  {
    id: 'stud-001',
    profile_id: 'prof-001',
    roll_no: 'UA-2026-0001',
    full_name: 'Muhammad Daniyal Tariq',
    father_name: 'Muhammad Tariq Mehmood',
    date_of_birth: '2008-04-15',
    class_id: 'class-10',
    phone: '0301-2345678',
    address: 'Street 4, Mohallah Farooqabad, Sadiqabad, Punjab',
    photo_path: null,
    joining_date: '2024-04-01',
    concession_amount: 500,
    status: 'active',
  },
  {
    id: 'stud-002',
    profile_id: 'prof-002',
    roll_no: 'UA-2026-0002',
    full_name: 'Fatima Zahra Aslam',
    father_name: 'Muhammad Aslam',
    date_of_birth: '2007-09-20',
    class_id: 'class-fsc-med',
    phone: '0302-9876543',
    address: 'House 12, Block B, Model Town, Sadiqabad, Punjab',
    photo_path: null,
    joining_date: '2023-08-15',
    concession_amount: 0,
    status: 'active',
  },
];

// MOCK ONLY: Fee Records store
let mockFeeRecordsStore: FeeRecord[] = [
  // Student 1 (UA-2026-0001) - Matric Class 10 (Fee 6,500 - 500 concession = 6,000)
  {
    id: 'fee-001-04',
    student_id: 'stud-001',
    month: '2026-04-01',
    amount_due: 6000,
    amount_paid: 0,
    status: 'unpaid',
    paid_on: null,
    receipt_no: null,
  },
  {
    id: 'fee-001-03',
    student_id: 'stud-001',
    month: '2026-03-01',
    amount_due: 6000,
    amount_paid: 2000,
    status: 'partial',
    paid_on: '2026-03-05',
    receipt_no: 'REC-2026-0301',
  },
  {
    id: 'fee-001-02',
    student_id: 'stud-001',
    month: '2026-02-01',
    amount_due: 6000,
    amount_paid: 6000,
    status: 'paid',
    paid_on: '2026-02-08',
    receipt_no: 'REC-2026-0219',
  },
  {
    id: 'fee-001-01',
    student_id: 'stud-001',
    month: '2026-01-01',
    amount_due: 6000,
    amount_paid: 6000,
    status: 'paid',
    paid_on: '2026-01-07',
    receipt_no: 'REC-2026-0145',
  },

  // Student 2 (UA-2026-0002) - FSc Pre-Med (Fee 7,500)
  {
    id: 'fee-002-04',
    student_id: 'stud-002',
    month: '2026-04-01',
    amount_due: 7500,
    amount_paid: 7500,
    status: 'paid',
    paid_on: '2026-04-04',
    receipt_no: 'REC-2026-0402',
  },
  {
    id: 'fee-002-03',
    student_id: 'stud-002',
    month: '2026-03-01',
    amount_due: 7500,
    amount_paid: 7500,
    status: 'paid',
    paid_on: '2026-03-06',
    receipt_no: 'REC-2026-0388',
  },
  {
    id: 'fee-002-02',
    student_id: 'stud-002',
    month: '2026-02-01',
    amount_due: 7500,
    amount_paid: 7500,
    status: 'paid',
    paid_on: '2026-02-05',
    receipt_no: 'REC-2026-0255',
  },
];

// MOCK ONLY: Payment Proofs store (one pending and one rejected for student 1)
let mockPaymentProofsStore: PaymentProof[] = [
  {
    id: 'proof-001',
    student_id: 'stud-001',
    fee_record_id: 'fee-001-04', // April 2026
    method: 'jazzcash',
    transaction_id: 'JC9876543210',
    amount: 6000,
    screenshot_path: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    status: 'pending',
    reject_reason: null,
    reviewed_at: null,
    created_at: '2026-04-05T14:30:00Z',
  },
  {
    id: 'proof-002',
    student_id: 'stud-001',
    fee_record_id: 'fee-001-03', // March 2026
    method: 'easypaisa',
    transaction_id: 'EP1234567890',
    amount: 4000,
    screenshot_path: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    status: 'rejected',
    reject_reason: 'Transaction ID not recognized by payment gateway. Screenshot was unclear. Please verify transaction ID on your Easypaisa app and submit again.',
    reviewed_at: '2026-03-12T11:00:00Z',
    created_at: '2026-03-10T09:15:00Z',
  },
];

// Additional announcements with student audience
const mockStudentAnnouncements: Announcement[] = [
  ...mockAnnouncements,
  {
    id: 'ann-2',
    title_en: 'First Term Diagnostic Exam Schedule Announced',
    title_ur: 'فرسٹ ٹرم تشخیصی امتحانی شیڈول کا باقاعدہ اعلان',
    body_en: 'All Matric and FSc enrolled students are notified that comprehensive first-term diagnostic tests will commence from Monday. Timetables have been posted on classroom notice boards.',
    body_ur: 'تمام میٹرک اور ایف ایس سی کے طلبہ کو مطلع کیا جاتا ہے کہ فرسٹ ٹرم امتحانی ٹیسٹ پیر سے شروع ہو رہے ہیں۔ تفصیلی ڈیٹ شیٹ کلاس نوٹس بورڈز پر آویزاں کر دی گئی ہے۔',
    audience: 'students',
    is_published: true,
    published_at: '2026-04-02T08:30:00Z',
  },
  {
    id: 'ann-3',
    title_en: 'Ramadan Timing & Friday Assembly Schedule',
    title_ur: 'رمضان المبارک کے تدریسی اوقات اور جمعۃ المبارک شیڈول',
    body_en: 'Academy shifts have been revised for the holy month of Ramadan. Morning batches will commence at 08:30 AM and evening batches will conclude before Maghrib prayers.',
    body_ur: 'ماہِ مبارک کے پیشِ نظر اکیڈمی کے اوقات میں خصوصی تبدیلی کی گئی ہے۔ صبح کے سیشنز 08:30 بجے جبکہ شام کے سیشنز نمازِ مغرب سے قبل اختتام پذیر ہوں گے۔',
    audience: 'students',
    is_published: true,
    published_at: '2026-03-15T10:00:00Z',
  },
  {
    id: 'ann-4',
    title_en: 'Monthly Fee Submission Reminder',
    title_ur: 'ماہانہ فیس کی بروقت ادائیگی کی یاد دہانی',
    body_en: 'Parents and students are requested to clear monthly dues by the 10th of every month. Online payment proofs can be uploaded directly via this portal.',
    body_ur: 'والدین اور طلبہ سے گزارش ہے کہ ہر ماہ کی 10 تاریخ تک واجبات ادا فرمائیں۔ آن لائن ادائیگی کی رسیدیں براہ راست اس پورٹل پر جمع کی جا سکتی ہیں۔',
    audience: 'students',
    is_published: true,
    published_at: '2026-03-05T09:00:00Z',
  },
];

const SIMULATED_LATENCY_MS = 250;

/**
 * Fetch Student Profile by Roll Number
 */
export async function getStudentProfile(rollNo: string): Promise<Student | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const normalized = rollNo.trim().toUpperCase();
      const student = mockStudents.find((s) => s.roll_no === normalized);
      resolve(student ? { ...student } : null);
    }, SIMULATED_LATENCY_MS);
  });
}

/**
 * Fetch Class Details for a Student
 */
export async function getStudentClass(classId: string): Promise<ClassItem | undefined> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const cls = mockClasses.find((c) => c.id === classId);
      resolve(cls ? { ...cls } : undefined);
    }, SIMULATED_LATENCY_MS);
  });
}

/**
 * Fetch Fee Records for a Student
 */
export async function getFeeRecords(studentId: string): Promise<FeeRecord[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const records = mockFeeRecordsStore
        .filter((r) => r.student_id === studentId)
        .sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime());
      resolve([...records]);
    }, SIMULATED_LATENCY_MS);
  });
}

/**
 * Fetch Payment Proofs for a Student
 */
export async function getPaymentProofs(studentId: string): Promise<PaymentProof[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const proofs = mockPaymentProofsStore
        .filter((p) => p.student_id === studentId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      resolve([...proofs]);
    }, SIMULATED_LATENCY_MS);
  });
}

export interface SubmitPaymentProofInput {
  student_id: string;
  fee_record_id: string;
  method: PaymentMethod;
  transaction_id: string;
  amount: number;
  screenshot_file?: File;
  screenshot_url?: string;
  simulateError?: 'network' | 'duplicate' | 'pending_exists';
}

/**
 * Submit a new Payment Proof with strict validation and duplicate checks
 */
export async function submitPaymentProof(
  input: SubmitPaymentProofInput
): Promise<{ success: boolean; proof?: PaymentProof; error?: string }> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (input.simulateError === 'network') {
        reject(new Error('Network error. Please check your internet connection and try again.'));
        return;
      }

      const normalizedTxId = input.transaction_id.trim().toUpperCase();

      // 1. Transaction ID regex validation (6 to 30 alphanumeric characters)
      if (!/^[A-Z0-9]{6,30}$/.test(normalizedTxId)) {
        resolve({
          success: false,
          error: 'Transaction ID must be between 6 and 30 letters and numbers without spaces.',
        });
        return;
      }

      // 2. Duplicate protection across all existing proofs
      const isDuplicateTx = mockPaymentProofsStore.some(
        (p) => p.transaction_id.toUpperCase() === normalizedTxId
      );
      if (isDuplicateTx || input.simulateError === 'duplicate') {
        resolve({
          success: false,
          error: 'This transaction ID has already been submitted. Please check your receipt details.',
        });
        return;
      }

      // 3. Check if this month already has a pending proof
      const hasPendingForMonth = mockPaymentProofsStore.some(
        (p) =>
          p.fee_record_id === input.fee_record_id &&
          p.student_id === input.student_id &&
          p.status === 'pending'
      );
      if (hasPendingForMonth || input.simulateError === 'pending_exists') {
        resolve({
          success: false,
          error: 'A payment proof is already pending review for this month. You cannot submit another proof until the current one is verified or rejected.',
        });
        return;
      }

      // 4. Validate amount against fee record remaining due
      const feeRecord = mockFeeRecordsStore.find((f) => f.id === input.fee_record_id);
      if (!feeRecord) {
        resolve({ success: false, error: 'Fee record not found.' });
        return;
      }

      const remainingDue = feeRecord.amount_due - feeRecord.amount_paid;
      if (input.amount <= 0 || input.amount > remainingDue) {
        resolve({
          success: false,
          error: `Amount must be greater than 0 and cannot exceed the remaining due of PKR ${remainingDue.toLocaleString()}.`,
        });
        return;
      }

      // 5. Generate mock receipt URL or convert file to object URL
      let screenshotUrl = input.screenshot_url || '';
      if (input.screenshot_file) {
        screenshotUrl = URL.createObjectURL(input.screenshot_file);
      }
      if (!screenshotUrl) {
        screenshotUrl = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80';
      }

      const newProof: PaymentProof = {
        id: `proof-${Date.now()}`,
        student_id: input.student_id,
        fee_record_id: input.fee_record_id,
        method: input.method,
        transaction_id: normalizedTxId,
        amount: input.amount,
        screenshot_path: screenshotUrl,
        status: 'pending',
        reject_reason: null,
        reviewed_at: null,
        created_at: new Date().toISOString(),
      };

      mockPaymentProofsStore.unshift(newProof);

      resolve({
        success: true,
        proof: newProof,
      });
    }, 600);
  });
}

/**
 * Fetch Published Announcements for Portal (both public and students audience)
 */
export async function getPortalAnnouncements(): Promise<Announcement[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const items = mockStudentAnnouncements
        .filter((a) => a.is_published && (a.audience === 'public' || a.audience === 'students'))
        .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
      resolve([...items]);
    }, SIMULATED_LATENCY_MS);
  });
}

/**
 * DEVELOPER / REVIEWER HELPERS:
 * These allow live testing of proof status transitions (Pending -> Verified / Rejected)
 * and fee status updates directly from the test panel.
 */
export async function devVerifyProof(proofId: string): Promise<boolean> {
  const proof = mockPaymentProofsStore.find((p) => p.id === proofId);
  if (!proof) return false;

  proof.status = 'verified';
  proof.reviewed_at = new Date().toISOString();
  proof.reject_reason = null;

  // Update corresponding fee record to paid
  const fee = mockFeeRecordsStore.find((f) => f.id === proof.fee_record_id);
  if (fee) {
    fee.amount_paid = Math.min(fee.amount_due, fee.amount_paid + proof.amount);
    fee.status = fee.amount_paid >= fee.amount_due ? 'paid' : 'partial';
    fee.paid_on = new Date().toISOString().split('T')[0];
    fee.receipt_no = `REC-${Date.now().toString().slice(-6)}`;
  }
  return true;
}

export async function devRejectProof(proofId: string, reason: string): Promise<boolean> {
  const proof = mockPaymentProofsStore.find((p) => p.id === proofId);
  if (!proof) return false;

  proof.status = 'rejected';
  proof.reviewed_at = new Date().toISOString();
  proof.reject_reason = reason;
  return true;
}

export function devResetPortalData(): void {
  // Re-seed default state
  mockFeeRecordsStore = [
    {
      id: 'fee-001-04',
      student_id: 'stud-001',
      month: '2026-04-01',
      amount_due: 6000,
      amount_paid: 0,
      status: 'unpaid',
      paid_on: null,
      receipt_no: null,
    },
    {
      id: 'fee-001-03',
      student_id: 'stud-001',
      month: '2026-03-01',
      amount_due: 6000,
      amount_paid: 2000,
      status: 'partial',
      paid_on: '2026-03-05',
      receipt_no: 'REC-2026-0301',
    },
    {
      id: 'fee-001-02',
      student_id: 'stud-001',
      month: '2026-02-01',
      amount_due: 6000,
      amount_paid: 6000,
      status: 'paid',
      paid_on: '2026-02-08',
      receipt_no: 'REC-2026-0219',
    },
    {
      id: 'fee-001-01',
      student_id: 'stud-001',
      month: '2026-01-01',
      amount_due: 6000,
      amount_paid: 6000,
      status: 'paid',
      paid_on: '2026-01-07',
      receipt_no: 'REC-2026-0145',
    },
    {
      id: 'fee-002-04',
      student_id: 'stud-002',
      month: '2026-04-01',
      amount_due: 7500,
      amount_paid: 7500,
      status: 'paid',
      paid_on: '2026-04-04',
      receipt_no: 'REC-2026-0402',
    },
    {
      id: 'fee-002-03',
      student_id: 'stud-002',
      month: '2026-03-01',
      amount_due: 7500,
      amount_paid: 7500,
      status: 'paid',
      paid_on: '2026-03-06',
      receipt_no: 'REC-2026-0388',
    },
    {
      id: 'fee-002-02',
      student_id: 'stud-002',
      month: '2026-02-01',
      amount_due: 7500,
      amount_paid: 7500,
      status: 'paid',
      paid_on: '2026-02-05',
      receipt_no: 'REC-2026-0255',
    },
  ];

  mockPaymentProofsStore = [
    {
      id: 'proof-001',
      student_id: 'stud-001',
      fee_record_id: 'fee-001-04',
      method: 'jazzcash',
      transaction_id: 'JC9876543210',
      amount: 6000,
      screenshot_path: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      status: 'pending',
      reject_reason: null,
      reviewed_at: null,
      created_at: '2026-04-05T14:30:00Z',
    },
    {
      id: 'proof-002',
      student_id: 'stud-001',
      fee_record_id: 'fee-001-03',
      method: 'easypaisa',
      transaction_id: 'EP1234567890',
      amount: 4000,
      screenshot_path: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      status: 'rejected',
      reject_reason: 'Transaction ID not recognized by payment gateway. Screenshot was unclear. Please verify transaction ID on your Easypaisa app and submit again.',
      reviewed_at: '2026-03-12T11:00:00Z',
      created_at: '2026-03-10T09:15:00Z',
    },
  ];
}
