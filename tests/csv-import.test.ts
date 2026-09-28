import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  parseCsvRows,
  parsePatientsCsv,
  escapeCsvCell,
} from "../src/utils/csvImportExport";

describe("CSV Import & Export Logic", () => {
  describe("escapeCsvCell", () => {
    it("escapes cells containing commas, quotes, and newlines", () => {
      assert.equal(escapeCsvCell("Simple"), "Simple");
      assert.equal(escapeCsvCell("Hello, World"), '"Hello, World"');
      assert.equal(escapeCsvCell('Dr. "Ahmed"'), '"Dr. ""Ahmed"""');
      assert.equal(escapeCsvCell("Line1\nLine2"), '"Line1\nLine2"');
      assert.equal(escapeCsvCell(null), "");
      assert.equal(escapeCsvCell(undefined), "");
    });
  });

  describe("parseCsvRows", () => {
    it("parses comma-separated rows with quotes correctly", () => {
      const csv = `Name,Phone,Notes\n"Ali, Ahmed",07501234567,"Patient noted: ""no pain"""\nSara,07701112233,Regular checkup`;
      const rows = parseCsvRows(csv);
      assert.equal(rows.length, 3);
      assert.deepEqual(rows[0], ["Name", "Phone", "Notes"]);
      assert.deepEqual(rows[1], ["Ali, Ahmed", "07501234567", 'Patient noted: "no pain"']);
      assert.deepEqual(rows[2], ["Sara", "07701112233", "Regular checkup"]);
    });

    it("parses semicolon-separated CSVs seamlessly", () => {
      const csv = `Name;Phone;Date\nKarim;07801234567;2026-03-15\nZainab;07509876543;2026-03-16`;
      const rows = parseCsvRows(csv);
      assert.equal(rows.length, 3);
      assert.deepEqual(rows[0], ["Name", "Phone", "Date"]);
      assert.deepEqual(rows[1], ["Karim", "07801234567", "2026-03-15"]);
    });
  });

  describe("parsePatientsCsv", () => {
    it("parses standard English CSV with full fields", () => {
      const csv = `Name,Phone,Gender,Age,Date,Total Amount,Paid Amount,Debt Amount,Notes,Medical History
Ahmed Mohammed,07501234567,male,28,2026-04-10,100000,75000,25000,Root canal tooth 16,None
Sara Ali,07709876543,female,32,2026-04-11,50000,50000,0,Scaling,Penicillin allergy`;

      const result = parsePatientsCsv(csv);
      assert.equal(result.validRows, 2);
      assert.equal(result.errors.length, 0);

      const p1 = result.patients[0];
      assert.equal(p1.name, "Ahmed Mohammed");
      assert.equal(p1.phone, "07501234567");
      assert.equal(p1.gender, "male");
      assert.equal(p1.age, 28);
      assert.equal(p1.totalAmount, 100000);
      assert.equal(p1.paidAmount, 75000);
      assert.equal(p1.debtAmount, 25000);
      assert.equal(p1.history?.length, 1);
      assert.equal(p1.history?.[0].paid, 75000);
      assert.equal(p1.history?.[0].debt, 25000);

      const p2 = result.patients[1];
      assert.equal(p2.name, "Sara Ali");
      assert.equal(p2.gender, "female");
      assert.equal(p2.debtAmount, 0);
    });

    it("parses Arabic headers and values accurately", () => {
      const csv = `الاسم,رقم الهاتف,الجنس,العمر,التاريخ,المبلغ,المدفوع,الديون,ملاحظات,التاريخ الطبي
حيدر جاسم,07801234567,ذكر,45,2026-05-01,"150,000 د.ع","100,000","50,000",قلع جراحي,ضغط دم مرتفع
مريم كمال,07503334444,أنثى,24,2026-05-02,80000,80000,0,حشوة كومبوزيت,لا يوجد`;

      const result = parsePatientsCsv(csv);
      assert.equal(result.validRows, 2);

      const p1 = result.patients[0];
      assert.equal(p1.name, "حيدر جاسم");
      assert.equal(p1.gender, "male");
      assert.equal(p1.age, 45);
      assert.equal(p1.totalAmount, 150000);
      assert.equal(p1.paidAmount, 100000);
      assert.equal(p1.debtAmount, 50000);

      const p2 = result.patients[1];
      assert.equal(p2.name, "مريم كمال");
      assert.equal(p2.gender, "female");
      assert.equal(p2.paidAmount, 80000);
    });

    it("parses Kurdish headers and handles missing amounts by computing debt", () => {
      const csv = `ناوی نەخۆش,ژمارەی مۆبایل,ڕەگەز,تەمەن,بەروار,کۆی گشتی,دراو
ئاراس عومەر,07705556677,نێر,30,2026-06-12,90000,60000`;

      const result = parsePatientsCsv(csv);
      assert.equal(result.validRows, 1);

      const p = result.patients[0];
      assert.equal(p.name, "ئاراس عومەر");
      assert.equal(p.gender, "male");
      assert.equal(p.totalAmount, 90000);
      assert.equal(p.paidAmount, 60000);
      assert.equal(p.debtAmount, 30000); // 90000 - 60000
    });

    it("skips invalid rows with empty name and reports errors", () => {
      const csv = `Name,Phone,Gender\n,07500000000,male\nValid Patient,07501112222,female`;
      const result = parsePatientsCsv(csv);
      assert.equal(result.validRows, 1);
      assert.equal(result.errors.length, 1);
      assert.equal(result.patients[0].name, "Valid Patient");
    });
  });
});
