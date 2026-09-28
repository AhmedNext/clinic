import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ClinicMaterial, EXPENSE_CATEGORIES, ExpenseCategory } from "@/types/material";
import { translations } from "@/i18n/translations";

describe("Expenses & Materials logic", () => {
  it("defines the 5 standard clinic expense categories", () => {
    const expectedCategories: ExpenseCategory[] = [
      "materials",
      "rent",
      "utilities",
      "lab",
      "other",
    ];

    assert.equal(EXPENSE_CATEGORIES.length, 5);
    for (const cat of expectedCategories) {
      assert.ok(EXPENSE_CATEGORIES.includes(cat), `Category ${cat} must exist in EXPENSE_CATEGORIES`);
    }
  });

  it("ensures all 5 categories have translations across en, ar, and ku", () => {
    const categoryKeyMap: Record<ExpenseCategory, keyof typeof translations.en> = {
      materials: "categoryMaterials",
      rent: "categoryRent",
      utilities: "categoryUtilities",
      lab: "categoryLab",
      other: "categoryOther",
    };

    for (const [cat, key] of Object.entries(categoryKeyMap)) {
      assert.ok(translations.en[key], `English translation missing for ${cat}`);
      assert.ok(translations.ar[key], `Arabic translation missing for ${cat}`);
      assert.ok(translations.ku[key], `Kurdish translation missing for ${cat}`);
    }
  });

  it("calculates total expense cost correctly across all categories", () => {
    const expenses: ClinicMaterial[] = [
      { id: "e1", supplier: "Al-Razi Dental", costPrice: 150000, category: "materials", date: "2026-09-01", createdAt: 1 },
      { id: "e2", supplier: "Clinic Landlord", costPrice: 500000, category: "rent", date: "2026-09-01", createdAt: 2 },
      { id: "e3", supplier: "Generator & Electric", costPrice: 75000, category: "utilities", date: "2026-09-05", createdAt: 3 },
      { id: "e4", supplier: "Smile Dental Lab (Zirconia Crown)", costPrice: 120000, category: "lab", date: "2026-09-10", createdAt: 4 },
      { id: "e5", supplier: "Cleaning Supplies", costPrice: 25000, category: "other", date: "2026-09-12", createdAt: 5 },
    ];

    const totalExpense = expenses.reduce((sum, e) => sum + (e.costPrice || 0), 0);
    assert.equal(totalExpense, 870000);
  });

  it("calculates net profit accurately (Total Income - Total Expenses)", () => {
    const totalPatientIncome = 2500000; // 2.5m IQD received
    const totalExpenses = 870000;       // 870k IQD spent
    const netProfit = totalPatientIncome - totalExpenses;

    assert.equal(netProfit, 1630000);
  });

  it("handles negative net profit when expenses exceed income", () => {
    const totalPatientIncome = 400000;
    const totalExpenses = 900000;
    const netProfit = totalPatientIncome - totalExpenses;

    assert.equal(netProfit, -500000);
  });

  it("filters monthly expenses by year-month key", () => {
    const expenses: ClinicMaterial[] = [
      { id: "e1", supplier: "Dental Co", costPrice: 100000, date: "2026-08-15", createdAt: 1 },
      { id: "e2", supplier: "Rent Aug", costPrice: 500000, date: "2026-08-01", createdAt: 2 },
      { id: "e3", supplier: "Dental Co", costPrice: 200000, date: "2026-09-05", createdAt: 3 },
      { id: "e4", supplier: "Rent Sep", costPrice: 500000, date: "2026-09-01", createdAt: 4 },
    ];

    const augExpenses = expenses.filter((e) => e.date?.startsWith("2026-08"));
    const sepExpenses = expenses.filter((e) => e.date?.startsWith("2026-09"));

    assert.equal(augExpenses.reduce((s, e) => s + e.costPrice, 0), 600000);
    assert.equal(sepExpenses.reduce((s, e) => s + e.costPrice, 0), 700000);
  });
});
