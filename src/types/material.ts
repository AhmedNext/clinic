export type ExpenseCategory = "materials" | "rent" | "utilities" | "lab" | "other";

export interface ClinicMaterial {
  id: string;
  date: string;       // 1. Date of expense (YYYY-MM-DD)
  supplier: string;   // 2. Supplier / Description / Payee
  costPrice: number;  // 3. Total money spent (IQD)
  category?: ExpenseCategory | string; // 4. Category
  name?: string;      // Alias for supplier in dental chart
  patientPrice?: number;
  notes?: string;
  createdAt: number;
  updatedAt?: number;
}

export type ClinicExpense = ClinicMaterial;
export type NewClinicMaterial = Omit<ClinicMaterial, "id" | "createdAt">;
export type NewClinicExpense = NewClinicMaterial;

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "materials",
  "rent",
  "utilities",
  "lab",
  "other",
];

export const DEFAULT_CLINIC_MATERIALS: ClinicMaterial[] = [];

