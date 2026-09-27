export interface ClinicMaterial {
  id: string;
  date: string;       // 1. Date of purchase (YYYY-MM-DD)
  supplier: string;   // 2. Supplier / Material description
  costPrice: number;  // 3. Total money spent (IQD)
  name?: string;      // Alias for supplier in dental chart
  patientPrice?: number;
  notes?: string;
  createdAt: number;
  updatedAt?: number;
}

export type NewClinicMaterial = Omit<ClinicMaterial, "id" | "createdAt">;

export const DEFAULT_CLINIC_MATERIALS: ClinicMaterial[] = [];

