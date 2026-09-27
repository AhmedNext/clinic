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

// Initial starter seed so doctor starts with realistic clinic inventory
export const DEFAULT_CLINIC_MATERIALS: ClinicMaterial[] = [
  {
    id: "mat-1",
    name: "Filtek Z250 Composite (3M)",
    category: "Restorative",
    unit: "Syringe (4g)",
    quantity: 6,
    minQuantity: 2,
    costPrice: 22000,
    patientPrice: 40000,
    supplier: "Baghdad Dental Depot",
    purchaseDate: "2026-09-01",
    expiryDate: "2028-05-15",
    notes: "Universal composite A2/A3 shade",
    createdAt: 1726000000000,
  },
  {
    id: "mat-2",
    name: "Zirconia Blank / CAD Block",
    category: "Prosthetics",
    unit: "Disc/Crown",
    quantity: 12,
    minQuantity: 4,
    costPrice: 45000,
    patientPrice: 150000,
    supplier: "Erbil Milling Center",
    purchaseDate: "2026-08-20",
    expiryDate: "2030-01-01",
    notes: "High translucency multi-layer zirconia",
    createdAt: 1726000000001,
  },
  {
    id: "mat-3",
    name: "ProTaper Gold Rotary Files",
    category: "Endodontics",
    unit: "Pack (6 files)",
    quantity: 4,
    minQuantity: 2,
    costPrice: 32000,
    patientPrice: 90000,
    supplier: "Dentsply Sirona Iraq",
    purchaseDate: "2026-09-10",
    expiryDate: "2029-12-31",
    notes: "SX-F3 rotary shaping files",
    createdAt: 1726000000002,
  },
  {
    id: "mat-4",
    name: "Septanest Articaine 4% Anesthesia",
    category: "General",
    unit: "Box (50 carpules)",
    quantity: 3,
    minQuantity: 1,
    costPrice: 28000,
    patientPrice: 10000,
    supplier: "Medical Syndicate Store",
    purchaseDate: "2026-09-15",
    expiryDate: "2027-11-30",
    notes: "1:100,000 epinephrine cartridges",
    createdAt: 1726000000003,
  },
  {
    id: "mat-5",
    name: "Bio-Oss Bone Graft (0.5g)",
    category: "Surgery",
    unit: "Vial",
    quantity: 2,
    minQuantity: 2,
    costPrice: 85000,
    patientPrice: 200000,
    supplier: "Geistlich Biomaterials",
    purchaseDate: "2026-08-05",
    expiryDate: "2028-03-20",
    notes: "Small granules for extraction socket preservation",
    createdAt: 1726000000004,
  },
  {
    id: "mat-6",
    name: "Ultrasonic Scaler Tips (EMS type)",
    category: "Hygiene",
    unit: "Piece",
    quantity: 5,
    minQuantity: 2,
    costPrice: 15000,
    patientPrice: 35000,
    supplier: "Dental Care Iraq",
    purchaseDate: "2026-07-12",
    expiryDate: "2032-01-01",
    notes: "Supragingival scaling tips A/P",
    createdAt: 1726000000005,
  },
];
