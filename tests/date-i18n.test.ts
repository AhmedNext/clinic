import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatStaticDate, formatMonthName, getMonthName } from "@/utils/date";
import { translations, Translations } from "@/i18n/translations";

describe("Date Formatting & Internationalization (i18n)", () => {
  describe("formatStaticDate", () => {
    it("formats ISO date strings deterministically in English", () => {
      assert.equal(formatStaticDate("2026-09-28", "en"), "Sep 28, 2026");
      assert.equal(formatStaticDate("2026-01-05", "en"), "Jan 5, 2026");
    });

    it("formats ISO date strings deterministically in Arabic", () => {
      const arDate = formatStaticDate("2026-09-28", "ar");
      assert.ok(arDate.includes("28"));
      assert.ok(arDate.includes("2026"));
      assert.ok(arDate.includes("أيلول"));
    });

    it("formats ISO date strings deterministically in Kurdish", () => {
      const kuDate = formatStaticDate("2026-09-28", "ku");
      assert.ok(kuDate.includes("28"));
      assert.ok(kuDate.includes("2026"));
      assert.ok(kuDate.includes("ئەیلوول"));
    });

    it("handles invalid or empty dates without throwing errors", () => {
      assert.equal(formatStaticDate(""), "");
      assert.equal(formatStaticDate("invalid-date"), "invalid-date");
    });
  });

  describe("formatMonthName", () => {
    it("formats year-month in English", () => {
      assert.equal(formatMonthName("2026-09", "en"), "September 2026");
      assert.equal(formatMonthName("2026-01", "en"), "January 2026");
    });

    it("formats year-month in Arabic", () => {
      assert.equal(formatMonthName("2026-09", "ar"), "أيلول 2026");
    });

    it("formats year-month in Kurdish", () => {
      assert.equal(formatMonthName("2026-09", "ku"), "ئەیلوول 2026");
    });
  });

  describe("Translations dictionary completeness", () => {
    const en = (translations.en as unknown) as Record<string, string>;
    const ar = (translations.ar as unknown) as Record<string, string>;
    const ku = (translations.ku as unknown) as Record<string, string>;

    const enKeys = Object.keys(en);

    it("has English, Arabic, and Kurdish language dictionaries", () => {
      assert.ok(en, "English dictionary must exist");
      assert.ok(ar, "Arabic dictionary must exist");
      assert.ok(ku, "Kurdish dictionary must exist");
    });

    it("ensures all English keys exist in Arabic without missing translations", () => {
      const missingInArabic: string[] = [];
      for (const key of enKeys) {
        if (!ar[key] || ar[key].trim() === "") {
          missingInArabic.push(key);
        }
      }
      assert.deepEqual(
        missingInArabic,
        [],
        `Missing keys in Arabic: ${missingInArabic.join(", ")}`
      );
    });

    it("ensures all English keys exist in Kurdish without missing translations", () => {
      const missingInKurdish: string[] = [];
      for (const key of enKeys) {
        if (!ku[key] || ku[key].trim() === "") {
          missingInKurdish.push(key);
        }
      }
      assert.deepEqual(
        missingInKurdish,
        [],
        `Missing keys in Kurdish: ${missingInKurdish.join(", ")}`
      );
    });
  });
});
