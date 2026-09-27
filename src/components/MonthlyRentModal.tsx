"use client";

import React, { useState } from "react";
import { formatIQD } from "@/types/patient";
import { useLanguage } from "@/context/LanguageContext";
import { formatMonthName } from "@/utils/date";
import {
  Building2,
  Calendar,
  X,
  Plus,
  Trash2,
  Check,
  DollarSign,
  TrendingDown,
} from "lucide-react";

interface MonthlyRentModalProps {
  isOpen: boolean;
  onClose: () => void;
  rentMap: Record<string, number>;
  availableMonths: string[];
  onSaveRent: (month: string, amount: number) => Promise<void>;
}

export function MonthlyRentModal({
  isOpen,
  onClose,
  rentMap,
  availableMonths,
  onSaveRent,
}: MonthlyRentModalProps) {
  const { language, t } = useLanguage();
  const [selectedMonth, setSelectedMonth] = useState(
    availableMonths[0] || new Date().toISOString().substring(0, 7)
  );
  const [rentAmount, setRentAmount] = useState(
    String(rentMap[selectedMonth] || "")
  );
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const formatMonthLabel = (ym: string) => {
    return formatMonthName(ym, language) || ym;
  };

  const handleMonthChange = (ym: string) => {
    setSelectedMonth(ym);
    setRentAmount(rentMap[ym] ? String(rentMap[ym]) : "");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMonth) return;
    setIsSaving(true);
    try {
      const amount = Math.max(0, Number(rentAmount) || 0);
      await onSaveRent(selectedMonth, amount);
    } catch (err) {
      console.error("Failed to save rent:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveRent = async (ym: string) => {
    await onSaveRent(ym, 0);
    if (selectedMonth === ym) {
      setRentAmount("");
    }
  };

  // List of months with recorded rent
  const recordedMonths = Object.keys(rentMap)
    .filter((k) => (rentMap[k] || 0) > 0)
    .sort((a, b) => b.localeCompare(a));

  const totalRentAllTime = Object.values(rentMap).reduce(
    (sum, val) => sum + (val || 0),
    0
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border-0 sm:border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-150 max-h-[90dvh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                {t.monthlyClinicRent}
              </h3>
              <p className="text-[11px] text-slate-400">
                {t.adjustRentSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Form to Set / Adjust Rent */}
          <form
            onSubmit={handleSave}
            className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 space-y-3.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-violet-500" />
                <span>{t.selectMonthAndAmount}</span>
              </span>
              {rentMap[selectedMonth] > 0 && (
                <span className="text-[11px] font-bold text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-950/60 px-2 py-0.5 rounded-full">
                  {t.currentRent}: {formatIQD(rentMap[selectedMonth])}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Month Dropdown */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  {t.clinicMonth}
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => handleMonthChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                >
                  {availableMonths.map((ym) => (
                    <option key={ym} value={ym}>
                      {formatMonthLabel(ym)} {rentMap[ym] ? `(${formatIQD(rentMap[ym])})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  {t.rentPaidIQD}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <DollarSign className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    placeholder={t.rentPlaceholder}
                    value={rentAmount}
                    onChange={(e) => setRentAmount(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Quick Amount Presets */}
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-[10px] text-slate-400 font-medium">{t.quickPreset}</span>
              {[250000, 400000, 500000, 600000, 750000, 1000000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setRentAmount(String(preset))}
                  className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-200/70 hover:bg-violet-100 dark:bg-slate-800 dark:hover:bg-violet-950/60 text-slate-700 dark:text-slate-300 hover:text-violet-700 dark:hover:text-violet-300 font-semibold transition-colors cursor-pointer"
                >
                  {preset / 1000}k
                </button>
              ))}
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-2 pt-1">
              {rentMap[selectedMonth] > 0 && (
                <button
                  type="button"
                  onClick={() => handleRemoveRent(selectedMonth)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                >
                  {t.removeRent}
                </button>
              )}
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isSaving ? t.saving : t.saveRent}</span>
              </button>
            </div>
          </form>

          {/* Recorded Months Ledger */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t.recordedMonthsHistory} ({recordedMonths.length})
              </span>
              <span className="text-xs font-mono font-bold text-violet-600 dark:text-violet-400">
                {t.allTimeRentTotal}: {formatIQD(totalRentAllTime)}
              </span>
            </div>

            {recordedMonths.length === 0 ? (
              <div className="p-6 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                <p className="text-xs text-slate-400">
                  {t.noRentRecorded}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
                {recordedMonths.map((ym) => (
                  <div
                    key={ym}
                    className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {formatMonthLabel(ym)}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {ym}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-xs text-violet-700 dark:text-violet-300">
                        {formatIQD(rentMap[ym])}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleMonthChange(ym)}
                        className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        {t.edit}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveRent(ym)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title={t.delete}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60 flex-shrink-0">
          <div className="text-[11px] text-slate-500">
            {t.adjustRentSubtitle}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
          >
            {t.done}
          </button>
        </div>
      </div>
    </div>
  );
}
