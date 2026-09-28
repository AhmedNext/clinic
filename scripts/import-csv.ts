/**
 * CSV Import Tool for Clinic System
 * 
 * Usage:
 *   npx tsx scripts/import-csv.ts data/templates/patients_template.csv
 */
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// Read Supabase credentials from .env.local
const envFile = fs.readFileSync(path.resolve(process.cwd(), ".env.local"), "utf-8");
const env: Record<string, string> = {};
for (const line of envFile.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, "");
  }
}

const supabaseUrl = env["NEXT_PUBLIC_SUPABASE_URL"];
const supabaseAnonKey = env["NEXT_PUBLIC_SUPABASE_ANON_KEY"];

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

function parseCsv(content: string): Record<string, string>[] {
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Basic CSV line parser (handles quotes)
    const values: string[] = [];
    let current = "";
    let insideQuotes = false;
    for (const char of lines[i]) {
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === "," && !insideQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = values[idx]?.replace(/^"|"$/g, "").trim() || "";
    });
    rows.push(rowObj);
  }

  return rows;
}

async function run() {
  const targetFile = process.argv[2] || "data/templates/patients_template.csv";
  const fullPath = path.resolve(process.cwd(), targetFile);

  if (!fs.existsSync(fullPath)) {
    console.error(`File not found: ${fullPath}`);
    process.exit(1);
  }

  console.log(`Reading CSV from: ${fullPath}`);
  const content = fs.readFileSync(fullPath, "utf-8");
  const rows = parseCsv(content);

  console.log(`Found ${rows.length} rows to import.`);

  const now = Date.now();
  const dbRows = rows.map((r, index) => {
    const paid = parseFloat(r.paid_amount?.replace(/[^\d.]/g, "") || "0") || 0;
    const debt = parseFloat(r.debt_amount?.replace(/[^\d.]/g, "") || "0") || 0;
    const total = parseFloat(r.total_amount?.replace(/[^\d.]/g, "") || "0") || (paid + debt);
    const date = r.date || new Date().toISOString().slice(0, 10);
    const patientId = r.id || `pat-${now + index}-${Math.random().toString(36).substring(2, 6)}`;

    // Initial visit history entry
    const initialHistory = [
      {
        id: `hist-${now + index}`,
        date,
        title: "Initial Visit",
        notes: r.notes || "",
        fee: total,
        paid,
        debt,
        createdAt: now + index,
      },
    ];

    return {
      id: patientId,
      name: r.name || "Unnamed Patient",
      gender: r.gender?.toLowerCase() === "female" || r.gender?.toLowerCase() === "f" ? "female" : "male",
      age: r.age ? parseInt(r.age, 10) : null,
      phone: r.phone || null,
      date,
      total_amount: total,
      paid_amount: paid,
      debt_amount: debt,
      notes: r.notes || null,
      medical_history: r.medical_history || null,
      history: initialHistory,
      teeth: [],
      created_at: now + index,
      updated_at: new Date().toISOString(),
    };
  });

  console.log(`Uploading ${dbRows.length} patients to Supabase...`);
  const { error } = await supabase.from("patients").upsert(dbRows);

  if (error) {
    console.error("Import failed:", error);
    process.exit(1);
  }

  console.log(`✅ Successfully imported ${dbRows.length} patients into your clinic database!`);
}

run();
