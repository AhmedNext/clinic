import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ALL_TEETH, ToothRecord, ToothInfo, CATEGORY_COLORS } from "@/types/dental";

describe("Dental Chart & Odontogram logic", () => {
  it("contains exactly 32 permanent teeth in FDI World Dental Federation notation", () => {
    assert.equal(ALL_TEETH.length, 32);
    const uniqueNumbers = new Set(ALL_TEETH.map((t) => t.number));
    assert.equal(uniqueNumbers.size, 32);
  });

  it("has exactly 8 teeth in each of the 4 dental quadrants", () => {
    const q1 = ALL_TEETH.filter((t) => t.number >= 11 && t.number <= 18); // Upper Right
    const q2 = ALL_TEETH.filter((t) => t.number >= 21 && t.number <= 28); // Upper Left
    const q3 = ALL_TEETH.filter((t) => t.number >= 31 && t.number <= 38); // Lower Left
    const q4 = ALL_TEETH.filter((t) => t.number >= 41 && t.number <= 48); // Lower Right

    assert.equal(q1.length, 8);
    assert.equal(q2.length, 8);
    assert.equal(q3.length, 8);
    assert.equal(q4.length, 8);
  });

  it("accurately categorizes upper and lower jaws", () => {
    const upper = ALL_TEETH.filter((t) => t.jaw === "upper");
    const lower = ALL_TEETH.filter((t) => t.jaw === "lower");

    assert.equal(upper.length, 16);
    assert.equal(lower.length, 16);
  });

  it("accurately categorizes tooth types: molars, premolars, canines, incisors", () => {
    const molars = ALL_TEETH.filter((t) => t.category === "molar");
    const premolars = ALL_TEETH.filter((t) => t.category === "premolar");
    const canines = ALL_TEETH.filter((t) => t.category === "canine");
    const incisors = ALL_TEETH.filter((t) => t.category === "incisor");

    assert.equal(molars.length, 12);     // 3 per quadrant * 4
    assert.equal(premolars.length, 8);   // 2 per quadrant * 4
    assert.equal(canines.length, 4);     // 1 per quadrant * 4
    assert.equal(incisors.length, 8);    // 2 per quadrant * 4
  });

  it("has color tokens defined for all tooth categories", () => {
    const categories: ("molar" | "premolar" | "canine" | "incisor")[] = [
      "molar",
      "premolar",
      "canine",
      "incisor",
    ];
    for (const cat of categories) {
      assert.ok(CATEGORY_COLORS[cat]);
      assert.ok(CATEGORY_COLORS[cat].text);
      assert.ok(CATEGORY_COLORS[cat].bg);
    }
  });

  it("calculates chart total price correctly across multiple teeth records", () => {
    const records: ToothRecord[] = [
      { toothNumber: 16, status: "root_canal", price: 150000 },
      { toothNumber: 17, status: "crown", price: 200000 },
      { toothNumber: 11, status: "filling", price: 50000 },
      { toothNumber: 21, status: "decay" }, // no price
    ];

    const totalPrice = records.reduce((sum, r) => sum + (r.price || 0), 0);
    assert.equal(totalPrice, 400000);
  });
});
