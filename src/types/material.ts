export interface ClinicMaterial {
  id: string;
  name: string;
  category: "Restorative" | "Endodontics" | "Prosthetics" | "Surgery" | "Hygiene" | "Orthodontics" | "General";
  unit: string;
  quantity: number;
  minQuantity: number;
  costPrice: number;       // Spent by doctor / clinic (IQD)
  patientPrice: number;    // Default fee charged to patient (IQD)
  supplier?: string;
  purchaseDate?: string;   // YYYY-MM-DD
  expiryDate?: string;     // YYYY-MM-DD
  notes?: string;
  createdAt: number;
  updatedAt?: number;
}

export const MATERIAL_CATEGORIES: ClinicMaterial["category"][] = [
  "Restorative",
  "Endodontics",
  "Prosthetics",
  "Surgery",
  "Hygiene",
  "Orthodontics",
  "General",
];

// Starts empty so doctor adds their own real clinic materials
export const DEFAULT_CLINIC_MATERIALS: ClinicMaterial[] = [];
