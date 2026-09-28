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
  if (typeof explicitDebt === "number" && !isNaN(explicitDebt)) {
    return Math.max(0, explicitDebt);
  }
  const t = total ?? 0;
  const p = paid ?? 0;
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
  return `${new Intl.NumberFormat("en-US").format(Math.round(val))} IQD`;
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

export function getWhatsAppUrl(phone?: string, patientName?: string, clinicName?: string): string {
  const num = getWhatsAppNumber(phone);
  if (!num) return "#";
  const clinic = clinicName?.trim() || "Dental Clinic";
  const msg = encodeURIComponent(
    `Hello ${patientName || ""}, from ${clinic}. Regarding your dental appointment:`
  );
  return `https://wa.me/${num}?text=${msg}`;
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

  if (history.length > 0) {
    const hasHistoryInMonth = monthHistory.length > 0;
    const historyTotalPaid = history.reduce((s, h) => s + (h.paid ?? 0), 0);

    // If history entries have explicit payments logged or visits occurred in this month
    if (historyTotalPaid > 0 || hasHistoryInMonth) {
      const monthPaid = monthHistory.reduce((s, h) => s + (h.paid ?? 0), 0);
      const monthDebt = monthHistory.reduce((s, h) => s + (h.debt ?? 0), 0);
      return {
        paid: monthPaid,
        debt: monthDebt,
        visits: monthHistory.length,
        hasActivity: hasHistoryInMonth,
      };
    }
  }

  // Fallback for initial/legacy patients without multiple history entries:
  const matchesDate = Boolean(patient.date && patient.date.startsWith(monthKey));
  if (matchesDate) {
    const debt = calculateDebt(patient.totalAmount, patient.paidAmount, patient.debtAmount);
    return {
      paid: patient.paidAmount ?? 0,
      debt,
      visits: Math.max(1, history.length),
      hasActivity: true,
    };
  }

  return {
    paid: 0,
    debt: 0,
    visits: 0,
    hasActivity: false,
  };
}
