"use client";

import React, { useState, useMemo, useRef } from "react";
import { ClinicMaterial, NewClinicMaterial } from "@/types/material";
import { formatIQD } from "@/types/patient";
import { useLanguage } from "@/context/LanguageContext";
import {
  Boxes,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  Search,
  X,
  Store,
  Receipt,
  Sparkles,
  Pencil,
} from "lucide-react";

interface MaterialsViewProps {
  materials: ClinicMaterial[];
  onAddMaterial: (data: NewClinicMaterial) => Promise<void>;
  onUpdateMaterial?: (updated: ClinicMaterial) => Promise<void>;
  onDeleteMaterial: (id: string) => Promise<void>;
}

/**
 * Format raw number/string into comma-separated thousands
 * e.g. 95000 -> "95,000", 110000 -> "110,000"
 * Also normalizes Eastern Arabic numerals if typed/pasted
 */
function formatNumberWithCommas(val: number | string): string {
  if (val === undefined || val === null || val === "") return "";
  const raw = String(val)
    .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString())
    .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString())
    .replace(/\D/g, "");
  if (!raw) return "";
  const normalized = raw.replace(/^0+(?=\d)/, "");
  return normalized.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function MaterialsView({
  materials,
  onAddMaterial,
  onUpdateMaterial,
  onDeleteMaterial,
}: MaterialsViewProps) {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ClinicMaterial | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const costInputRef = useRef<HTMLInputElement>(null);

  // Exactly 3 fields for the doctor:
  // 1. DATE
  // 2. SUPPLIER / MATERIAL
  // 3. TOTAL MONEY SPENT
  const [formDate, setFormDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [formSupplier, setFormSupplier] = useState("");
  const [formCostPrice, setFormCostPrice] = useState("");

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormDate(new Date().toISOString().substring(0, 10));
    setFormSupplier("");
    setFormCostPrice("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ClinicMaterial) => {
    setEditingItem(item);
    setFormDate(item.date || new Date().toISOString().substring(0, 10));
    setFormSupplier(item.supplier || "");
    setFormCostPrice(formatNumberWithCommas(item.costPrice));
    setIsModalOpen(true);
  };

  const handleCostPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const oldCursor = input.selectionStart || 0;
    const digitsBeforeCursor = input.value.slice(0, oldCursor).replace(/\D/g, "").length;

    const formatted = formatNumberWithCommas(input.value);
    setFormCostPrice(formatted);

    // Keep cursor properly positioned relative to digits
    requestAnimationFrame(() => {
      if (!costInputRef.current) return;
      let targetIndex = 0;
      let digitCount = 0;
      while (targetIndex < formatted.length && digitCount < digitsBeforeCursor) {
        if (/\d/.test(formatted[targetIndex])) {
          digitCount++;
        }
        targetIndex++;
      }
      costInputRef.current.setSelectionRange(targetIndex, targetIndex);
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSupplier.trim()) return;

    setIsSubmitting(true);
    try {
      const cleanNumber = Number(formCostPrice.replace(/,/g, "")) || 0;
      const amount = Math.max(0, cleanNumber);

      if (editingItem && onUpdateMaterial) {
        await onUpdateMaterial({
          ...editingItem,
          date: formDate || new Date().toISOString().substring(0, 10),
          supplier: formSupplier.trim(),
          costPrice: amount,
        });
      } else {
        await onAddMaterial({
          date: formDate || new Date().toISOString().substring(0, 10),
          supplier: formSupplier.trim(),
          costPrice: amount,
        });
      }
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      console.error("Save material error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Financial Stats
  const totalSpend = useMemo(() => {
    return materials.reduce((sum, m) => sum + (m.costPrice || 0), 0);
  }, [materials]);

  // Filter by Supplier search
  const filteredMaterials = useMemo(() => {
    return materials
      .filter((item) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          item.supplier?.toLowerCase().includes(q) ||
          item.date?.includes(q)
        );
      })
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }, [materials, searchQuery]);

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200/70 dark:border-slate-800/70">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Boxes className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {t.materials}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t.materialsSubtitle}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-bold shadow-sm shadow-amber-600/25 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ {t.materials}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Card 1: Total Money Spent */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-900/50 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              {t.totalMaterialSpendCard}
            </span>
            <div className="w-7 h-7 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-mono font-black text-amber-700 dark:text-amber-400 tracking-tight">
            {formatIQD(totalSpend)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">
            {t.totalSpendSubtitle}
          </p>
        </div>

        {/* Card 2: Total Recorded Purchases */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              {t.totalPurchases}
            </span>
            <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Receipt className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {materials.length} <span className="text-xs font-normal text-slate-400">{t.records}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">
            {t.supplierReceiptsLogged}
          </p>
        </div>

        {/* Card 3: Quick Explanation */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              {t.clinicNetWorthImpact}
            </span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            {t.netWorthImpactDesc}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder={t.searchMaterials}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-2xs"
        />
      </div>

      {/* Expenses Table */}
      {filteredMaterials.length === 0 ? (
        <div className="p-10 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 mx-auto flex items-center justify-center mb-3">
            <Boxes className="w-6 h-6" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">
            {t.addPatientsOrExpensesToView}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            {t.addMaterialDesc}
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold cursor-pointer transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addMaterialExpense}</span>
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4">{t.date}</th>
                  <th className="py-3 px-4">{t.supplierMaterialCol}</th>
                  <th className="py-3 px-4 text-right">{t.totalMoneySpentCol}</th>
                  <th className="py-3 px-4 text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {filteredMaterials.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Date */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.date}</span>
                      </div>
                    </td>

                    {/* Supplier */}
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-2">
                        <Store className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        <span>{item.supplier}</span>
                      </div>
                    </td>

                    {/* Total Money Spent */}
                    <td className="py-3 px-4 text-right font-mono font-bold text-sm text-amber-700 dark:text-amber-400 whitespace-nowrap">
                      {formatIQD(item.costPrice)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        {onUpdateMaterial && (
                          <button
                            onClick={() => handleOpenEdit(item)}
                            title={t.edit}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteMaterial(item.id)}
                          title={t.delete}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL: EXACTLY 3 FIELDS ================= */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold">
                  <Boxes className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-slate-100 text-sm">
                    {editingItem ? t.editMaterialExpense : t.addMaterialExpense}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {editingItem ? t.editMaterialDesc : t.addMaterialDesc}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-5 space-y-4">
              {/* Field 1: DATE */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  1. {t.purchaseDate} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Field 2: SUPPLIER */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  2. {t.supplierMaterialName} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Store className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder={t.supplierPlaceholder}
                    value={formSupplier}
                    onChange={(e) => setFormSupplier(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Field 3: TOTAL MONEY SPENT */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    3. {t.totalMoneySpent} (IQD) *
                  </label>
                  {formCostPrice && (
                    <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400">
                      {formCostPrice} IQD
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-500">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <input
                    ref={costInputRef}
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="e.g. 95,000"
                    value={formCostPrice}
                    onChange={handleCostPriceChange}
                    className="w-full pl-10 pr-14 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-mono font-bold"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-xs font-bold text-slate-400">
                    IQD
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-sm shadow-amber-600/30 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? t.saving : t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
