import { ToothRecord } from "./dental";

export type Gender = "male" | "female";

export type PaymentStatus = "paid" | "partial" | "unpaid";

export interface PatientHistoryEntry {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // e.g. "10:30 AM"
  title: string; // e.g. "Follow-up Visit", "Initial Consultation", "Lab Work", "Treatment"
  notes: string;
  fee?: number;
  paid?: number;
  debt?: number;
  createdAt?: number;
}

export interface Patient {
  id: string;
  name: string;
  gender: Gender;
  age?: number;
  phone?: string;
  date: string; // YYYY-MM-DD (latest visit/consultation)
  time?: string; // e.g. "10:30 AM"
  totalAmount?: number; // Total fee/charges for this case in Iraqi Dinar (IQD)
  paidAmount?: number;  // Amount paid by the patient in Iraqi Dinar (IQD)
  debtAmount?: number;  // Remaining unpaid balance / debt in Iraqi Dinar (IQD)
  notes?: string;
  medicalHistory?: string; // Past medical history, allergies, chronic conditions
  history?: PatientHistoryEntry[]; // Chronological log of past visits and consultations
  teeth?: ToothRecord[]; // Dental odontogram records (teeth worked on/treated)
  createdAt?: number;
}

export function calculateDebt(total?: number, paid?: number, explicitDebt?: number): number {
  const t = typeof total === "number" && !isNaN(total) ? Math.max(0, total) : 0;
  const p = typeof paid === "number" && !isNaN(paid) ? Math.max(0, paid) : 0;

  if (typeof explicitDebt === "number" && !isNaN(explicitDebt)) {
    // If total amount exists and paid is 0 while explicitDebt is 0, the actual unpaid debt is total
    if (t > 0 && p === 0 && explicitDebt === 0) {
      return t;
    }
    return Math.max(0, explicitDebt);
  }

  return Math.max(0, t - p);
}

export function getPaymentStatus(patient: Patient): PaymentStatus {
  const paid = patient.paidAmount ?? 0;
  const debt = calculateDebt(patient.totalAmount, patient.paidAmount, patient.debtAmount);
  
  if (debt === 0) return "paid";
  if (paid > 0 && debt > 0) return "partial";
  return "unpaid";
}

/**
 * Format any amount into Iraqi Dinar (IQD / د.ع)
 * e.g. 25000 -> "25,000 IQD"
 */
export function formatIQD(amount?: number): string {
  const val = typeof amount === "number" && !isNaN(amount) ? amount : 0;
  const numStr = new Intl.NumberFormat("en-US").format(Math.round(val)).replace(/,\s+/g, ",");
  return `${numStr} IQD`;
}

/**
 * Clean phone number into international WhatsApp format (e.g. 0770 123 4567 -> 9647701234567)
 */
export function getWhatsAppNumber(phone?: string): string {
  if (!phone) return "";
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00964")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = "964" + digits.slice(1);
  else if (!digits.startsWith("964") && digits.length === 10) digits = "964" + digits;
  return digits;
}

export interface WhatsAppMessageParams {
  phone?: string;
  patientName?: string;
  clinicName?: string;
  date?: string;
  time?: string;
  language?: "en" | "ar" | "ku";
  gender?: "male" | "female";
}

export function getWhatsAppUrl(
  phoneOrOptions?: string | WhatsAppMessageParams,
  patientName?: string,
  clinicName?: string,
  date?: string,
  time?: string,
  language: "en" | "ar" | "ku" = "ku",
  gender?: "male" | "female"
): string {
  let opts: WhatsAppMessageParams;

  if (typeof phoneOrOptions === "object" && phoneOrOptions !== null) {
    opts = phoneOrOptions;
  } else {
    opts = {
      phone: phoneOrOptions,
      patientName,
      clinicName,
      date,
      time,
      language,
      gender,
    };
  }

  const num = getWhatsAppNumber(opts.phone);
  if (!num) return "#";

  const lang = opts.language || "ku";
  const clinic =
    opts.clinicName?.trim() ||
    (lang === "ar" ? "عيادة طب الأسنان" : lang === "ku" ? "کلینیکی ددان" : "Dental Clinic");
  const name = opts.patientName?.trim() || "";
  const dateStr = opts.date?.trim();
  const timeStr = opts.time?.trim();
  const isFemale = opts.gender === "female";

  let message = "";

  if (lang === "ku") {
    const title = isFemale ? "خاتوو" : "کاک";
    if (dateStr && timeStr) {
      message = `سڵاو ${title} ${name}، بیرخستنەوەی نۆرەکەت لە کلینیکی ${clinic} لە بەرواری ${dateStr} کاتژمێر ${timeStr}. تکایە لە کاتی خۆیدا ئامادەبە.`;
    } else if (dateStr) {
      message = `سڵاو ${title} ${name}، بیرخستنەوەی نۆرەکەت لە کلینیکی ${clinic} لە بەرواری ${dateStr}. تکایە لە کاتی خۆیدا ئامادەبە.`;
    } else {
      message = `سڵاو ${title} ${name}، لە کلینیکی ${clinic}. پەیوەست بە سەردان و چاودێری ددانەکانت، تکایە پەیوەندیمان پێوە بکە.`;
    }
  } else if (lang === "ar") {
    const title = isFemale ? "أستاذة" : "أستاذ";
    if (dateStr && timeStr) {
      message = `مرحباً ${title} ${name}، نود تذكيرك بموعدك في عيادة ${clinic} بتاريخ ${dateStr} الساعة ${timeStr}. يرجى الحضور في الموعد المحدد.`;
    } else if (dateStr) {
      message = `مرحباً ${title} ${name}، نود تذكيرك بموعدك في عيادة ${clinic} بتاريخ ${dateStr}. يرجى الحضور في الموعد المحدد.`;
    } else {
      message = `مرحباً ${title} ${name}، من عيادة ${clinic}. نود الاطمئنان على صحتكم ومتابعة علاجكم، يرجى التواصل معنا لأي استفسار.`;
    }
  } else {
    // English
    const title = isFemale ? "Ms." : opts.gender === "male" ? "Mr." : "";
    const greeting = title ? `Hello ${title} ${name}` : `Hello ${name || "there"}`;
    if (dateStr && timeStr) {
      message = `${greeting}, this is a reminder for your upcoming appointment at ${clinic} on ${dateStr} at ${timeStr}. Please arrive on time.`;
    } else if (dateStr) {
      message = `${greeting}, this is a reminder for your upcoming appointment at ${clinic} on ${dateStr}. Please arrive on time.`;
    } else {
      message = `${greeting}, from ${clinic}. Regarding your dental consultation and appointment, please let us know if you have any questions.`;
    }
  }

  return `https://wa.me/${num}?text=${encodeURIComponent(message.trim())}`;
}

export interface PatientMonthlyStats {
  paid: number;
  debt: number;
  visits: number;
  hasActivity: boolean;
}

/**
 * Calculates payments, debt, and visits made specifically within a given month (YYYY-MM).
 * Distributes multi-month treatments across their respective calendar months based on history entries.
 */
export function getPatientMonthlyStats(patient: Patient, monthKey: string): PatientMonthlyStats {
  const history = patient.history || [];
  const monthHistory = history.filter((h) => h.date && h.date.startsWith(monthKey));
  const hasHistoryInMonth = monthHistory.length > 0;
  const matchesDate = Boolean(patient.date && patient.date.startsWith(monthKey));

  const totalPatientPaid =
    typeof patient.paidAmount === "number" && !isNaN(patient.paidAmount)
      ? Math.max(0, patient.paidAmount)
      : 0;

  const currentPatientDebt = calculateDebt(
    patient.totalAmount,
    patient.paidAmount,
    patient.debtAmount
  );

  // If there are no history entries at all
  if (history.length === 0) {
    if (matchesDate) {
      return {
        paid: totalPatientPaid,
        debt: currentPatientDebt,
        visits: 1,
        hasActivity: true,
      };
    }
    return { paid: 0, debt: 0, visits: 0, hasActivity: false };
  }

  // If there is only 1 history entry, or all history entries belong to this same month:
  const allHistoryInThisMonth = history.every(
    (h) => h.date && h.date.startsWith(monthKey)
  );
  if (allHistoryInThisMonth && (hasHistoryInMonth || matchesDate)) {
    return {
      paid: totalPatientPaid,
      debt: currentPatientDebt,
      visits: Math.max(1, monthHistory.length),
      hasActivity: true,
    };
  }

  // Multi-month case:
  const historyTotalPaid = history.reduce((s, h) => s + (h.paid ?? 0), 0);

  if (historyTotalPaid > 0) {
    let monthPaid = monthHistory.reduce((s, h) => s + (h.paid ?? 0), 0);

    // If patient profile has a surplus paidAmount (e.g. updated via EditModal or SettleDebt),
    // allocate the surplus to the patient's primary/latest consultation month:
    if (totalPatientPaid > historyTotalPaid && matchesDate) {
      monthPaid += totalPatientPaid - historyTotalPaid;
    }

    const monthDebt = monthHistory.reduce((s, h) => s + (h.debt ?? 0), 0);
    // Ensure month debt doesn't exceed current remaining patient debt if all settled
    const effectiveDebt =
      currentPatientDebt === 0 ? 0 : Math.min(monthDebt, currentPatientDebt);

    return {
      paid: monthPaid,
      debt: effectiveDebt,
      visits: monthHistory.length,
      hasActivity: hasHistoryInMonth || (matchesDate && totalPatientPaid > 0),
    };
  }

  // Fallback: If history entries exist but have 0 paid logged
  if (matchesDate) {
    return {
      paid: totalPatientPaid,
      debt: currentPatientDebt,
      visits: Math.max(1, monthHistory.length),
      hasActivity: true,
    };
  }

  return {
    paid: 0,
    debt: 0,
    visits: monthHistory.length,
    hasActivity: hasHistoryInMonth,
  };
}

export const QUICK_IQD_CHIPS = [10000, 15000, 25000, 50000, 100000] as const;

export function cleanNumberInput(val: string): string {
  if (!val) return "";
  // Strip English commas, Arabic commas (،), spaces, and any non-digit characters
  return val.replace(/[,،\s]/g, "").replace(/[^0-9]/g, "");
}

export function formatNumberWithCommas(val: string | number): string {
  if (val === undefined || val === null || val === "") return "";
  const digits = String(val).replace(/[,،\s]/g, "").replace(/[^0-9]/g, "");
  if (!digits) return "";
  const normalized = digits.replace(/^0+(?=\d)/, "");
  return Number(normalized).toLocaleString("en-US").replace(/,\s+/g, ",");
}

export function parseCleanNumber(val: string | number | undefined | null): number {
  if (val === undefined || val === null || val === "") return 0;
  const digits = String(val).replace(/[,،\s]/g, "").replace(/[^0-9]/g, "");
  const num = parseInt(digits, 10);
  return isNaN(num) ? 0 : num;
}

