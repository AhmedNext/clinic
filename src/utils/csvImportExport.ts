import { Patient, Gender, PatientHistoryEntry } from "@/types/patient";

// Standard CSV Header for template and export
export const CSV_COLUMNS = [
  "Name",
  "Phone",
  "Gender",
  "Age",
  "Date",
  "Total Amount",
  "Paid Amount",
  "Debt Amount",
  "Notes",
  "Medical History",
];

// Helper to escape CSV cell according to RFC 4180
export function escapeCsvCell(cell: unknown): string {
  if (cell === null || cell === undefined) return "";
  const str = String(cell);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r") || str.includes(";")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Download a formatted CSV template
export function downloadSamplePatientCsv() {
  const sampleHeaders = [
    "Name",
    "Phone",
    "Gender",
    "Age",
    "Date",
    "Total Amount",
    "Paid Amount",
    "Debt Amount",
    "Notes",
    "Medical History",
  ];

  const sampleRows = [
    [
      "أحمد محمد / Ahmed Mohammed",
      "07501234567",
      "male",
      "28",
      new Date().toISOString().substring(0, 10),
      "75000",
      "50000",
      "25000",
      "حشوة تجميلية للسن 16 / Composite filling tooth 16",
      "لا يوجد أمراض مزمنة / None",
    ],
    [
      "سارة علي / Sara Ali",
      "07709876543",
      "female",
      "32",
      new Date().toISOString().substring(0, 10),
      "120000",
      "120000",
      "0",
      "تنظيف وتبييض أسنان / Scaling and polishing",
      "حساسية بنسلين / Penicillin allergy",
    ],
  ];

  const csvContent =
    "\uFEFF" + // UTF-8 BOM so Excel opens Arabic correctly
    sampleHeaders.map(escapeCsvCell).join(",") +
    "\n" +
    sampleRows.map((row) => row.map(escapeCsvCell).join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `dental_patients_template.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export current patients to CSV backup
export function exportPatientsToCsv(patients: Patient[], clinicName?: string) {
  const headers = [
    "Name",
    "Phone",
    "Gender",
    "Age",
    "Date",
    "Total Amount (IQD)",
    "Paid Amount (IQD)",
    "Debt Amount (IQD)",
    "Notes / Treatment",
    "Medical History",
  ];

  const rows = patients.map((p) => [
    p.name,
    p.phone || "",
    p.gender,
    p.age ?? "",
    p.date || "",
    p.totalAmount ?? 0,
    p.paidAmount ?? 0,
    p.debtAmount ?? 0,
    p.notes || "",
    p.medicalHistory || "",
  ]);

  const csvContent =
    "\uFEFF" +
    headers.map(escapeCsvCell).join(",") +
    "\n" +
    rows.map((row) => row.map(escapeCsvCell).join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const cleanClinic = (clinicName || "clinic").replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, "_");
  link.setAttribute("href", url);
  link.setAttribute("download", `${cleanClinic}_patients_${new Date().toISOString().substring(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Parse lines RFC 4180 style
export function parseCsvRows(text: string): string[][] {
  const cleanText = text.replace(/^\uFEFF/, ""); // Remove BOM
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;

  // Detect delimiter: check if first line has more semicolons than commas
  const firstLine = cleanText.split(/\r?\n/)[0] || "";
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semiCount = (firstLine.match(/;/g) || []).length;
  const delimiter = semiCount > commaCount ? ";" : ",";

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter) {
        currentRow.push(currentField.trim());
        currentField = "";
      } else if (char === "\r") {
        if (nextChar === "\n") i++;
        currentRow.push(currentField.trim());
        if (currentRow.some((f) => f.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = "";
      } else if (char === "\n") {
        currentRow.push(currentField.trim());
        if (currentRow.some((f) => f.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = "";
      } else {
        currentField += char;
      }
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

// Map column name to standard field
function normalizeHeader(header: string): string {
  const h = header.toLowerCase().replace(/[\s_\-–—]/g, "");
  if (/^(name|patientname|patient|الاسم|اسمالمريض|ناو|ناوینەخۆش)$/.test(h)) return "name";
  if (/^(phone|mobile|tel|cell|الهاتف|رقمالهاتف|الموبايل|مۆبایل|ژمارەیمۆبایل)$/.test(h)) return "phone";
  if (/^(gender|sex|الجنس|نوع|رەگەز)$/.test(h)) return "gender";
  if (/^(age|العمر|سن|تەمەن)$/.test(h)) return "age";
  if (/^(date|visitdate|entrydate|التاريخ|تاريخالزيارة|تاريخ|بەروار)$/.test(h)) return "date";
  if (/^(total|totalamount|fee|price|cost|amount|المبلغ|المجموع|السعر|کۆیگشتی|کۆ)$/.test(h)) return "totalAmount";
  if (/^(paid|paidamount|payment|المدفوع|الواصل|دراو)$/.test(h)) return "paidAmount";
  if (/^(debt|debtamount|balance|remaining|الديون|الباقي|قەرز)$/.test(h)) return "debtAmount";
  if (/^(notes|treatment|note|description|diagnosis|الملاحظات|ملاحظات|العلاج|التشخيص|تێبینی|چارەسەر)$/.test(h)) return "notes";
  if (/^(medicalhistory|conditions|diseases|التاريخالطبي|أمراضمزمنة|مێژووپزیشکی)$/.test(h)) return "medicalHistory";
  return "";
}

function parseNumber(val: string | undefined): number {
  if (!val) return 0;
  // Strip anything that is not digit or decimal point or minus
  const clean = val.replace(/[^0-9.-]/g, "");
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : Math.round(num);
}

function parseGender(val: string | undefined): Gender {
  if (!val) return "male";
  const v = val.toLowerCase().trim();
  if (
    v.startsWith("f") ||
    v.includes("أنثى") ||
    v.includes("انثى") ||
    v.includes("مؤنث") ||
    v.includes("مێ") ||
    v.includes("ئافرەت") ||
    v.includes("female")
  ) {
    return "female";
  }
  return "male";
}

function parseDate(val: string | undefined): string {
  const fallback = new Date().toISOString().substring(0, 10);
  if (!val) return fallback;
  const trimmed = val.trim();

  // If already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  // DD/MM/YYYY or DD-MM-YYYY
  const dmy = trimmed.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (dmy) {
    const day = dmy[1].padStart(2, "0");
    const month = dmy[2].padStart(2, "0");
    const year = dmy[3];
    return `${year}-${month}-${day}`;
  }

  // MM/DD/YYYY
  const mdy = trimmed.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
  if (mdy) {
    const year = mdy[1];
    const month = mdy[2].padStart(2, "0");
    const day = mdy[3].padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const parsed = Date.parse(trimmed);
  if (!isNaN(parsed)) {
    return new Date(parsed).toISOString().substring(0, 10);
  }

  return fallback;
}

export interface ParsedCsvResult {
  patients: Patient[];
  totalRows: number;
  validRows: number;
  errors: string[];
}

export function parsePatientsCsv(csvText: string): ParsedCsvResult {
  const rows = parseCsvRows(csvText);
  if (rows.length < 2) {
    return {
      patients: [],
      totalRows: 0,
      validRows: 0,
      errors: ["File is empty or contains no data rows."],
    };
  }

  const rawHeaders = rows[0];
  const headerMap: { [colIndex: number]: string } = {};

  rawHeaders.forEach((raw, idx) => {
    const mapped = normalizeHeader(raw);
    if (mapped) {
      headerMap[idx] = mapped;
    }
  });

  // Check if at least "name" was identified, or fall back to positional matching
  const hasName = Object.values(headerMap).includes("name");
  if (!hasName) {
    // Positional fallback: 0: name, 1: phone, 2: gender, 3: age, 4: date, 5: total, 6: paid, 7: debt, 8: notes, 9: medicalHistory
    const fallbackCols = [
      "name",
      "phone",
      "gender",
      "age",
      "date",
      "totalAmount",
      "paidAmount",
      "debtAmount",
      "notes",
      "medicalHistory",
    ];
    fallbackCols.forEach((col, idx) => {
      if (idx < rawHeaders.length) {
        headerMap[idx] = col;
      }
    });
  }

  const patients: Patient[] = [];
  const errors: string[] = [];
  const now = Date.now();

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (row.length === 0 || row.every((c) => c === "")) continue;

    const rowObj: Record<string, string> = {};
    row.forEach((cell, idx) => {
      const field = headerMap[idx];
      if (field) {
        rowObj[field] = cell;
      }
    });

    const name = (rowObj.name || "").trim();
    if (!name) {
      errors.push(`Row ${r + 1}: Skipped (patient name is missing)`);
      continue;
    }

    const gender = parseGender(rowObj.gender);
    const age = rowObj.age ? parseInt(rowObj.age, 10) : undefined;
    const phone = (rowObj.phone || "").trim();
    const date = parseDate(rowObj.date);
    const totalAmount = parseNumber(rowObj.totalAmount);
    const paidAmount = parseNumber(rowObj.paidAmount);
    const debtAmount =
      rowObj.debtAmount !== undefined
        ? parseNumber(rowObj.debtAmount)
        : Math.max(0, totalAmount - paidAmount);
    const notes = (rowObj.notes || "").trim();
    const medicalHistory = (rowObj.medicalHistory || "").trim();

    const patientId = `pat-${now}-${Math.random().toString(36).substring(2, 6)}-${r}`;

    // Smart visit chain parser: check if notes contains [YYYY-MM-DD: Procedure (amount)]
    const visitRegex = /\[(\d{4}-\d{2}-\d{2}):\s*([^(\]]+?)(?:\s*\(([0-9,.\s]+)\))?\]/g;
    const visitMatches = Array.from(notes.matchAll(visitRegex));

    let history: PatientHistoryEntry[] = [];
    if (visitMatches.length > 0) {
      visitMatches.forEach((m, idx) => {
        const vDate = m[1];
        const vTitle = m[2].trim();
        const vFee = m[3] ? parseNumber(m[3]) : 0;
        history.push({
          id: `hist-${now}-${r}-${idx}`,
          date: vDate,
          title: vTitle,
          notes: "",
          fee: vFee,
          paid: vFee,
          debt: 0,
          createdAt: now + idx,
        });
      });
      // Sort newest first
      history.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    } else {
      history = [
        {
          id: `hist-${now}-${r}`,
          date,
          title: notes ? notes.slice(0, 60) : "Initial Visit",
          notes: notes || "Imported from database CSV",
          fee: totalAmount,
          paid: paidAmount,
          debt: debtAmount,
          createdAt: now,
        },
      ];
    }

    const patient: Patient = {
      id: patientId,
      name,
      gender,
      age: isNaN(age ?? NaN) ? undefined : age,
      phone,
      date,
      totalAmount: Math.max(totalAmount, paidAmount + debtAmount),
      paidAmount,
      debtAmount,
      notes,
      medicalHistory: medicalHistory === "None" ? "" : medicalHistory,
      history,
      teeth: [],
      createdAt: now,
    };

    patients.push(patient);
  }

  return {
    patients,
    totalRows: rows.length - 1,
    validRows: patients.length,
    errors,
  };
}
