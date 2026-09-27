import { Language } from "@/i18n/translations";

export const MONTH_NAMES_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const MONTH_NAMES_SHORT_EN = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export const MONTH_NAMES_AR = [
  "كانون الثاني", "شباط", "آذار", "نيسان", "أيار", "حزيران",
  "تموز", "آب", "أيلول", "تشرين الأول", "تشرين الثاني", "كانون الأول"
];

export const MONTH_NAMES_KU = [
  "کانوونی دووەم", "شوبات", "ئازار", "نیسان", "ئایار", "حوزەیران",
  "تەممووز", "ئاب", "ئەیلوول", "تشرینی یەکەم", "تشرینی دووەم", "کانوونی یەکەم"
];

export const WEEKDAY_NAMES: Record<Language, string[]> = {
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  ar: ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"],
  ku: ["یەکشەم", "دووشەم", "سێشەم", "چوارشەم", "پێنجشەم", "هەینی", "شەممە"],
};

export function getMonthName(monthIndex: number, lang: Language = "en", short = false): string {
  const safeIdx = Math.max(0, Math.min(11, monthIndex));
  if (lang === "ar") return MONTH_NAMES_AR[safeIdx];
  if (lang === "ku") return MONTH_NAMES_KU[safeIdx];
  return short ? MONTH_NAMES_SHORT_EN[safeIdx] : MONTH_NAMES_EN[safeIdx];
}

export function formatMonthName(yearMonth: string, lang: Language = "en"): string {
  if (!yearMonth) return "";
  try {
    const [year, month] = yearMonth.split("-");
    const mIdx = parseInt(month, 10) - 1;
    if (isNaN(mIdx) || mIdx < 0 || mIdx > 11) return yearMonth;
    const name = getMonthName(mIdx, lang);
    return `${name} ${year}`;
  } catch {
    return yearMonth;
  }
}

/**
 * Deterministic date formatting that produces the exact same output
 * on Node SSR, Windows Chrome, iOS Safari, and Android Chrome.
 * Avoids any React hydration mismatch errors.
 */
export function formatStaticDate(dateString: string, lang: Language = "en"): string {
  if (!dateString) return "";
  try {
    const parts = dateString.split("-");
    if (parts.length >= 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day) && month >= 1 && month <= 12) {
        const mName = getMonthName(month - 1, lang, lang === "en");
        if (lang === "ar" || lang === "ku") {
          return `${day} ${mName} ${year}`;
        }
        return `${mName} ${day}, ${year}`;
      }
    }
    return dateString;
  } catch {
    return dateString;
  }
}
