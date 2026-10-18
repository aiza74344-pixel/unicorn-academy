import {
  ClassItem,
  Announcement,
  SiteSettings,
  Topper,
  Teacher,
  GalleryItem,
  FaqItem,
  Testimonial,
  Stats,
  ContactMessage,
  AdmissionFormData,
  AdmissionStatusResult,
} from '../types';
export * from './portal';

import {
  mockClasses,
  mockTeachers,
  mockAnnouncements,
  mockSiteSettings,
  mockToppers,
  mockGalleryItems,
  mockFaqs,
  mockTestimonials,
  mockStats,
} from '../data/mock';

const SIMULATED_LATENCY_MS = 250;

/**
 * Service to fetch academy classes.
 * UI must consume data solely via these services.
 */
export async function getClasses(): Promise<ClassItem[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockClasses].sort((a, b) => a.sort_order - b.sort_order));
    }, SIMULATED_LATENCY_MS);
  });
}

/**
 * Service to fetch academy site settings.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ ...mockSiteSettings });
    }, SIMULATED_LATENCY_MS);
  });
}

/**
 * Service to fetch announcements.
 */
export async function getAnnouncements(): Promise<Announcement[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockAnnouncements]);
    }, SIMULATED_LATENCY_MS);
  });
}

/**
 * Service to fetch toppers.
 */
export async function getToppers(): Promise<Topper[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockToppers].sort((a, b) => a.sort_order - b.sort_order));
    }, SIMULATED_LATENCY_MS);
  });
}

/**
 * Service to fetch active teachers.
 */
export async function getTeachers(): Promise<Teacher[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        mockTeachers
          .filter((t) => t.is_active)
          .sort((a, b) => a.sort_order - b.sort_order)
      );
    }, SIMULATED_LATENCY_MS);
  });
}

/**
 * Service to fetch gallery items.
 */
export async function getGalleryItems(): Promise<GalleryItem[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockGalleryItems].sort((a, b) => a.sort_order - b.sort_order));
    }, SIMULATED_LATENCY_MS);
  });
}

/**
 * Service to fetch FAQs.
 */
export async function getFaqs(): Promise<FaqItem[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockFaqs].sort((a, b) => a.sort_order - b.sort_order));
    }, SIMULATED_LATENCY_MS);
  });
}

/**
 * Service to fetch published testimonials.
 */
export async function getTestimonials(): Promise<Testimonial[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockTestimonials.filter((item) => item.is_published));
    }, SIMULATED_LATENCY_MS);
  });
}

/**
 * Service to fetch key stats.
 */
export async function getStats(): Promise<Stats> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ ...mockStats });
    }, SIMULATED_LATENCY_MS);
  });
}

/**
 * Service to submit a contact message.
 */
export async function submitContactMessage(
  data: ContactMessage,
  simulateError = false
): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (simulateError) {
        reject(new Error('Network error simulated.'));
      } else {
        console.log('Contact message received:', data);
        resolve({
          success: true,
          message: 'Thank you! Your message has been received.',
        });
      }
    }, 600);
  });
}

// In-memory sequence counter and status store for submitted admissions
let mockAdmissionSeq = 126;
const submittedAdmissionsStore = new Map<string, AdmissionStatusResult>([
  [
    'ADM-000123',
    {
      reference_no: 'ADM-000123',
      status: 'pending',
      student_name_masked: 'A*** K***',
      class_name_en: 'Class 9 (Matric Science)',
      class_name_ur: 'نویں جماعت (میٹرک سائنس)',
    },
  ],
  [
    'ADM-000124',
    {
      reference_no: 'ADM-000124',
      status: 'approved',
      student_name_masked: 'M*** H***',
      class_name_en: 'FSc (Pre-Medical)',
      class_name_ur: 'ایف ایس سی (پری میڈیکل)',
    },
  ],
  [
    'ADM-000125',
    {
      reference_no: 'ADM-000125',
      status: 'rejected',
      reject_reason:
        'Seat quota is full for the selected timing shift. Please apply for the alternate morning/evening batch.',
      student_name_masked: 'Z*** A***',
      class_name_en: 'Class 10 (Matric Science)',
      class_name_ur: 'دسویں جماعت (میٹرک سائنس)',
    },
  ],
]);

/**
 * NOTE FOR STAGE D: submitAdmission will call POST /api/admission
 * (server-side validation, Turnstile verification, file upload).
 * The form UI will not require changes when that happens.
 */
export async function submitAdmission(
  data: AdmissionFormData,
  simulateError?: 'network' | 'server'
): Promise<{ reference_no: string }> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (simulateError === 'network') {
        reject(new Error('Network connection failed.'));
        return;
      }
      if (simulateError === 'server') {
        reject(new Error('Internal server error occurred.'));
        return;
      }

      // Generate sequence number like ADM-000126
      const seqStr = String(mockAdmissionSeq++).padStart(6, '0');
      const refNo = `ADM-${seqStr}`;

      // Mask student name for privacy (e.g. Muhammad Ali -> M*** A***)
      const parts = data.student_name.trim().split(/\s+/);
      const masked = parts
        .map((p) => (p.length > 0 ? `${p[0]}***` : '***'))
        .join(' ');

      // Store in memory so tracking works immediately
      const matchedClass = mockClasses.find((c) => c.id === data.class_id);
      submittedAdmissionsStore.set(refNo, {
        reference_no: refNo,
        status: 'pending',
        student_name_masked: masked,
        class_name_en: matchedClass?.name_en || 'Selected Academic Class',
        class_name_ur: matchedClass?.name_ur || 'منتخب کردہ کلاس',
      });

      console.log('Admission submitted successfully:', refNo, data);
      resolve({ reference_no: refNo });
    }, 700);
  });
}

/**
 * Service to retrieve admission request status by reference number.
 */
export async function getAdmissionStatus(
  referenceNo: string
): Promise<AdmissionStatusResult | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const normalized = referenceNo.trim().toUpperCase();
      const record = submittedAdmissionsStore.get(normalized);
      resolve(record ? { ...record } : null);
    }, 400);
  });
}

/**
 * NOTE FOR STAGE E: In Stage E this will call POST /api/chat.
 * The ChatWidget UI consumes this service and will not require changes when that happens.
 */
export async function sendChatMessage(
  userText: string,
  preferredLang: 'en' | 'ur'
): Promise<{ text: string; isError?: boolean }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lower = userText.toLowerCase().trim();
      const hasUrdu = /[\u0600-\u06FF]/.test(userText);
      const isUrdu = hasUrdu || preferredLang === 'ur';

      // 1. Admission keyword
      if (
        lower.includes('admission') ||
        lower.includes('apply') ||
        lower.includes('register') ||
        lower.includes('داخلہ') ||
        lower.includes('درخواست')
      ) {
        resolve({
          text: isUrdu
            ? 'یونیکورن اکیڈمی میں تعلیمی سیشن 2026-27 کے لیے پریپ تا ایف ایس سی داخلے جاری ہیں۔ آپ ویب سائٹ پر "ابھی داخلہ لیں" کے ذریعے آن لائن درخواست دے سکتے ہیں یا ہمارے مین کیمپس تشریف لا سکتے ہیں۔'
            : 'Admissions are open for academic session 2026-27 for Prep through FSc. You can apply online via the "Apply Now" button or visit our campus on Main College Road, Sadiqabad.',
        });
        return;
      }

      // 2. Classes / Courses keyword
      if (
        lower.includes('class') ||
        lower.includes('course') ||
        lower.includes('subject') ||
        lower.includes('کلاس') ||
        lower.includes('کورس') ||
        lower.includes('مضامین')
      ) {
        resolve({
          text: isUrdu
            ? 'ہم چار شعبہ جات پیش کرتے ہیں: پرائمری (پریپ تا پنجم)، مڈل (چھٹی تا آٹھویں)، میٹرک (نویں و دسویں سائنس / کمپیوٹر)، اور ایف ایس سی (پری میڈیکل، پری انجینئرنگ، آئی سی ایس، اور ایف اے)۔'
            : 'We offer 4 distinct academic wings: Primary (Prep to 5), Middle (6 to 8), Matric Science & Computer (9 & 10), and Intermediate (FSc Pre-Medical, Pre-Eng, ICS & FA).',
        });
        return;
      }

      // 3. Fees keyword
      if (
        lower.includes('fee') ||
        lower.includes('charge') ||
        lower.includes('cost') ||
        lower.includes('فیس') ||
        lower.includes('پیسے') ||
        lower.includes('ماہانہ')
      ) {
        resolve({
          text: isUrdu
            ? 'ہماری ماہانہ ٹیوشن فیس کلاس کے مطابق ہے: پرائمری 3,500 تا 4,600 روپے، مڈل 4,800 تا 5,500 روپے، میٹرک 6,000 تا 6,500 روپے، اور ایف ایس سی 6,500 تا 7,500 روپے ماہانہ ہے۔ پوزیشن ہولڈرز کے لیے خصوصی وظائف موجود ہیں۔'
            : 'Monthly tuition fees vary by level: Primary (Rs. 3,500 - 4,600), Middle (Rs. 4,800 - 5,500), Matric (Rs. 6,000 - 6,500), and FSc (Rs. 6,500 - 7,500). Merit scholarships are available for high achievers.',
        });
        return;
      }

      // 4. Timing keyword
      if (
        lower.includes('timing') ||
        lower.includes('time') ||
        lower.includes('schedule') ||
        lower.includes('اوقات') ||
        lower.includes('وقت')
      ) {
        resolve({
          text: isUrdu
            ? 'پرائمری کلاسز صبح 08:00 بجے تا دوپہر 01:30 بجے ہوتی ہیں۔ مڈل سیشن دوپہر 02:00 تا شام 05:30 بجے تک ہوتا ہے۔ میٹرک اور ایف ایس سی شام 03:00 بجے سے 07:45 بجے تک منعقد ہوتے ہیں۔'
            : 'Class timings: Primary morning shift 08:00 AM - 01:30 PM; Middle shift 02:00 PM - 05:30 PM; Matric & FSc evening sessions 03:00 PM - 07:45 PM.',
        });
        return;
      }

      // 5. Contact keyword
      if (
        lower.includes('contact') ||
        lower.includes('phone') ||
        lower.includes('call') ||
        lower.includes('whatsapp') ||
        lower.includes('address') ||
        lower.includes('location') ||
        lower.includes('رابطہ') ||
        lower.includes('فون') ||
        lower.includes('پتہ') ||
        lower.includes('کہاں')
      ) {
        resolve({
          text: isUrdu
            ? 'یونیکورن اکیڈمی مین کالج روڈ صادق آباد پر واقع ہے۔ آپ ہمیں فون پر 0300-0000000 یا واٹس ایپ 923000000000 پر صبح 8 سے رات 8 بجے تک رابطہ کر سکتے ہیں۔'
            : 'Unicorn Academy is located on Main College Road, Sadiqabad. Call us at 0300-0000000 or message via WhatsApp: +92 300 0000000 (Mon-Sat: 8 AM - 8 PM).',
        });
        return;
      }

      // Fallback
      resolve({
        text: isUrdu
          ? 'معذرت، فی الحال میرے پاس یہ مخصوص معلومات دستیاب نہیں ہیں۔ براہ کرم ہمارے داخلہ ڈیسک پر 0300-0000000 پر کال کریں یا واٹس ایپ پر 923000000000 پر رابطہ فرمائیں۔'
          : "I don't have that specific information right now. Please call our admission desk at 0300-0000000 or WhatsApp us at +92 300 0000000.",
      });
    }, 750);
  });
}
