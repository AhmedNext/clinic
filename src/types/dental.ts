export type ToothCategory = "molar" | "premolar" | "canine" | "incisor";
export type ToothJaw = "upper" | "lower";
export type ToothSide = "right" | "left";

export type ToothTreatment =
  | "treated"     // General treatment completed
  | "filling"     // Composite / Amalgam filling
  | "root_canal"  // Endodontic therapy
  | "crown"       // Prosthetic crown
  | "extraction"  // Tooth extracted / missing
  | "decay";      // Cavity / Caries noted

export interface ToothRecord {
  toothNumber: number; // 11-18, 21-28, 31-38, 41-48 (FDI notation)
  status: ToothTreatment;
  procedure?: string;
  material?: string;
  price?: number; // In Iraqi Dinar (IQD)
  notes?: string;
  updatedAt?: number;
}

export interface ToothInfo {
  number: number;
  name: string;
  arabicName: string;
  category: ToothCategory;
  jaw: ToothJaw;
  side: ToothSide;
  order: number;
}

// 32 Permanent Teeth according to FDI World Dental Federation notation (matching diagram)
export const ALL_TEETH: ToothInfo[] = [
  // --- UPPER JAW (Maxilla) ---
  // Right Side (Quadrant 1)
  { number: 18, name: "Upper Right 3rd Molar (Wisdom)", arabicName: "ضرس العقل العلوي الأيمن", category: "molar", jaw: "upper", side: "right", order: 1 },
  { number: 17, name: "Upper Right 2nd Molar", arabicName: "الضرس الثاني العلوي الأيمن", category: "molar", jaw: "upper", side: "right", order: 2 },
  { number: 16, name: "Upper Right 1st Molar", arabicName: "الضرس الأول العلوي الأيمن", category: "molar", jaw: "upper", side: "right", order: 3 },
  { number: 15, name: "Upper Right 2nd Premolar", arabicName: "الضاحك الثاني العلوي الأيمن", category: "premolar", jaw: "upper", side: "right", order: 4 },
  { number: 14, name: "Upper Right 1st Premolar", arabicName: "الضاحك الأول العلوي الأيمن", category: "premolar", jaw: "upper", side: "right", order: 5 },
  { number: 13, name: "Upper Right Canine", arabicName: "الناب العلوي الأيمن", category: "canine", jaw: "upper", side: "right", order: 6 },
  { number: 12, name: "Upper Right Lateral Incisor", arabicName: "الرباعية العلوية اليمنى", category: "incisor", jaw: "upper", side: "right", order: 7 },
  { number: 11, name: "Upper Right Central Incisor", arabicName: "الثنية العلوية اليمنى", category: "incisor", jaw: "upper", side: "right", order: 8 },

  // Left Side (Quadrant 2)
  { number: 21, name: "Upper Left Central Incisor", arabicName: "الثنية العلوية اليسرى", category: "incisor", jaw: "upper", side: "left", order: 9 },
  { number: 22, name: "Upper Left Lateral Incisor", arabicName: "الرباعية العلوية اليسرى", category: "incisor", jaw: "upper", side: "left", order: 10 },
  { number: 23, name: "Upper Left Canine", arabicName: "الناب العلوي الأيسر", category: "canine", jaw: "upper", side: "left", order: 11 },
  { number: 24, name: "Upper Left 1st Premolar", arabicName: "الضاحك الأول العلوي الأيسر", category: "premolar", jaw: "upper", side: "left", order: 12 },
  { number: 25, name: "Upper Left 2nd Premolar", arabicName: "الضاحك الثاني العلوي الأيسر", category: "premolar", jaw: "upper", side: "left", order: 13 },
  { number: 26, name: "Upper Left 1st Molar", arabicName: "الضرس الأول العلوي الأيسر", category: "molar", jaw: "upper", side: "left", order: 14 },
  { number: 27, name: "Upper Left 2nd Molar", arabicName: "الضرس الثاني العلوي الأيسر", category: "molar", jaw: "upper", side: "left", order: 15 },
  { number: 28, name: "Upper Left 3rd Molar (Wisdom)", arabicName: "ضرس العقل العلوي الأيسر", category: "molar", jaw: "upper", side: "left", order: 16 },

  // --- LOWER JAW (Mandible) ---
  // Right Side (Quadrant 4)
  { number: 48, name: "Lower Right 3rd Molar (Wisdom)", arabicName: "ضرس العقل السفلي الأيمن", category: "molar", jaw: "lower", side: "right", order: 17 },
  { number: 47, name: "Lower Right 2nd Molar", arabicName: "الضرس الثاني السفلي الأيمن", category: "molar", jaw: "lower", side: "right", order: 18 },
  { number: 46, name: "Lower Right 1st Molar", arabicName: "الضرس الأول السفلي الأيمن", category: "molar", jaw: "lower", side: "right", order: 19 },
  { number: 45, name: "Lower Right 2nd Premolar", arabicName: "الضاحك الثاني السفلي الأيمن", category: "premolar", jaw: "lower", side: "right", order: 20 },
  { number: 44, name: "Lower Right 1st Premolar", arabicName: "الضاحك الأول السفلي الأيمن", category: "premolar", jaw: "lower", side: "right", order: 21 },
  { number: 43, name: "Lower Right Canine", arabicName: "الناب السفلي الأيمن", category: "canine", jaw: "lower", side: "right", order: 22 },
  { number: 42, name: "Lower Right Lateral Incisor", arabicName: "الرباعية السفلية اليمنى", category: "incisor", jaw: "lower", side: "right", order: 23 },
  { number: 41, name: "Lower Right Central Incisor", arabicName: "الثنية السفلية اليمنى", category: "incisor", jaw: "lower", side: "right", order: 24 },

  // Left Side (Quadrant 3)
  { number: 31, name: "Lower Left Central Incisor", arabicName: "الثنية السفلية اليسرى", category: "incisor", jaw: "lower", side: "left", order: 25 },
  { number: 32, name: "Lower Left Lateral Incisor", arabicName: "الرباعية السفلية اليسرى", category: "incisor", jaw: "lower", side: "left", order: 26 },
  { number: 33, name: "Lower Left Canine", arabicName: "الناب السفلي الأيسر", category: "canine", jaw: "lower", side: "left", order: 27 },
  { number: 34, name: "Lower Left 1st Premolar", arabicName: "الضاحك الأول السفلي الأيسر", category: "premolar", jaw: "lower", side: "left", order: 28 },
  { number: 35, name: "Lower Left 2nd Premolar", arabicName: "الضاحك الثاني السفلي الأيسر", category: "premolar", jaw: "lower", side: "left", order: 29 },
  { number: 36, name: "Lower Left 1st Molar", arabicName: "الضرس الأول السفلي الأيسر", category: "molar", jaw: "lower", side: "left", order: 30 },
  { number: 37, name: "Lower Left 2nd Molar", arabicName: "الضرس الثاني السفلي الأيسر", category: "molar", jaw: "lower", side: "left", order: 31 },
  { number: 38, name: "Lower Left 3rd Molar (Wisdom)", arabicName: "ضرس العقل السفلي الأيسر", category: "molar", jaw: "lower", side: "left", order: 32 },
];

export const CATEGORY_COLORS: Record<ToothCategory, { text: string; bg: string; border: string; label: string }> = {
  molar: {
    text: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/60",
    border: "border-blue-200 dark:border-blue-800",
    label: "molars",
  },
  premolar: {
    text: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/60",
    border: "border-purple-200 dark:border-purple-800",
    label: "premolars",
  },
  canine: {
    text: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950/60",
    border: "border-rose-200 dark:border-rose-800",
    label: "canine",
  },
  incisor: {
    text: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-50 dark:bg-cyan-950/60",
    border: "border-cyan-200 dark:border-cyan-800",
    label: "incisors",
  },
};

export const TREATMENT_METADATA: Record<ToothTreatment, { label: string; color: string; badgeBg: string; badgeBorder: string; badgeText: string }> = {
  treated: {
    label: "Worked On / Treated",
    color: "#10b981", // Emerald
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/60",
    badgeBorder: "border-emerald-300 dark:border-emerald-800",
    badgeText: "text-emerald-700 dark:text-emerald-300",
  },
  filling: {
    label: "Filling (Composite)",
    color: "#f59e0b", // Amber
    badgeBg: "bg-amber-50 dark:bg-amber-950/60",
    badgeBorder: "border-amber-300 dark:border-amber-800",
    badgeText: "text-amber-700 dark:text-amber-300",
  },
  root_canal: {
    label: "Root Canal (Endo)",
    color: "#8b5cf6", // Purple
    badgeBg: "bg-purple-50 dark:bg-purple-950/60",
    badgeBorder: "border-purple-300 dark:border-purple-800",
    badgeText: "text-purple-700 dark:text-purple-300",
  },
  crown: {
    label: "Crown / Bridge",
    color: "#3b82f6", // Blue
    badgeBg: "bg-blue-50 dark:bg-blue-950/60",
    badgeBorder: "border-blue-300 dark:border-blue-800",
    badgeText: "text-blue-700 dark:text-blue-300",
  },
  extraction: {
    label: "Extracted / Missing",
    color: "#ef4444", // Red
    badgeBg: "bg-rose-50 dark:bg-rose-950/60",
    badgeBorder: "border-rose-300 dark:border-rose-800",
    badgeText: "text-rose-700 dark:text-rose-300",
  },
  decay: {
    label: "Decay / Needs Work",
    color: "#f97316", // Orange
    badgeBg: "bg-orange-50 dark:bg-orange-950/60",
    badgeBorder: "border-orange-300 dark:border-orange-800",
    badgeText: "text-orange-700 dark:text-orange-300",
  },
};
