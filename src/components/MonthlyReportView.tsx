"use client";

import React, { useMemo, useState } from "react";
import { Patient, formatIQD, getPatientMonthlyStats } from "@/types/patient";
import { ClinicMaterial } from "@/types/material";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Boxes,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { PatientAvatar } from "./PatientAvatar";
import { useLanguage } from "@/context/LanguageContext";
import { formatMonthName } from "@/utils/date";

interface MonthlyReportViewProps {
  patients: Patient[];
  materials?: ClinicMaterial[];
  rentMap?: Record<string, number>;
  onViewHistory: (patient: Patient) => void;
  onOpenRentModal?: () => void;
}

export interface MonthPatientRecord extends Patient {
  monthPaid: number;
  monthDebt: number;
  monthVisits: number;
}

interface MonthBucket {
  key: string; // 'YYYY-MM'
  label: string; // 'Sep 2026'
  patients: MonthPatientRecord[];
  totalPaid: number;
  totalDebt: number;
  totalBilled: number;
  expenseCost: number;
  netProfit: number;
  caseCount: number;
  visitCount: number;
}

export function MonthlyReportView({
  patients,
  materials = [],
  onViewHistory,
}: MonthlyReportViewProps) {
  const { t, language } = useLanguage();
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

  const monthBuckets: MonthBucket[] = useMemo(() => {
    // Collect all unique months from patient dates, history entries, and expenses
    const monthKeys = new Set<string>();

    patients.forEach((p) => {
      if (p.date) monthKeys.add(p.date.substring(0, 7));
      p.history?.forEach((h) => {
        if (h.date) monthKeys.add(h.date.substring(0, 7));
      });
    });

    materials.forEach((m) => {
      if (m.date) monthKeys.add(m.date.substring(0, 7));
    });

    return Array.from(monthKeys)
      .sort((a, b) => b.localeCompare(a))
      .map((key) => {
        let totalPaid = 0;
        let totalDebt = 0;
        let visitCount = 0;
        const monthPatients: MonthPatientRecord[] = [];

        patients.forEach((p) => {
          const stats = getPatientMonthlyStats(p, key);
          if (stats.hasActivity) {
            totalPaid += stats.paid;
            totalDebt += stats.debt;
            visitCount += stats.visits;
            monthPatients.push({
              ...p,
              monthPaid: stats.paid,
              monthDebt: stats.debt,
              monthVisits: stats.visits,
            });
          }
        });

        // Expenses in this month (All categories combined: materials, rent, utilities, lab, other)
        const monthExpenses = materials.filter((m) => m.date?.startsWith(key));
        const expenseCost = monthExpenses.reduce(
          (s, m) => s + (m.costPrice || 0),
          0
        );

        // Net Profit = Monthly Income - Monthly Total Expenses
        const netProfit = totalPaid - expenseCost;
        const label = formatMonthName(key, language);

        return {
          key,
          label,
          patients: monthPatients,
          totalPaid,
          totalDebt,
          totalBilled: totalPaid + totalDebt,
          expenseCost,
          netProfit,
          caseCount: monthPatients.length,
          visitCount,
        };
      });
  }, [patients, materials, language]);

  const grandPaid = monthBuckets.reduce((s, b) => s + b.totalPaid, 0);
  const grandDebt = monthBuckets.reduce((s, b) => s + b.totalDebt, 0);
  const grandExpenses = monthBuckets.reduce((s, b) => s + b.expenseCost, 0);
  const grandNetProfit = grandPaid - grandExpenses;
  const highestMonthIncome = useMemo(() => {
    return Math.max(...monthBuckets.map((b) => b.totalPaid), 0);
  }, [monthBuckets]);

  const toggleMonth = (key: string) => {
    setExpandedMonth((curr) => (curr === key ? null : key));
  };

  return (
    <div className="space-y-6">
      {/* ── Summary Cards (Compact 2x2 on mobile, 4-column on desktop) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {/* Total Income */}
        <div className="p-3 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
              {t.totalIncome}
            </span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
              <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div>
            <div className="text-base sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight font-mono tabular-nums truncate">
              {formatIQD(grandPaid)}
            </div>
            <p className="text-[9px] sm:text-xs text-slate-400 dark:text-slate-500 mt-0.5 sm:mt-1 truncate">
              {t.paidByPatients}
            </p>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="p-3 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
              {t.totalExpenses}
            </span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex-shrink-0">
              <Boxes className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div>
            <div className="text-base sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight font-mono tabular-nums truncate">
              {formatIQD(grandExpenses)}
            </div>
            <p className="text-[9px] sm:text-xs text-slate-400 dark:text-slate-500 mt-0.5 sm:mt-1 truncate">
              {t.expensesLogged}
            </p>
          </div>
        </div>

        {/* Net Profit */}
        <div className="p-3 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
              {t.netProfit}
            </span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div>
            <div
              className={`text-base sm:text-2xl font-black tracking-tight font-mono tabular-nums truncate ${
                grandNetProfit >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {formatIQD(grandNetProfit)}
            </div>
            <p className="text-[9px] sm:text-xs text-slate-400 dark:text-slate-500 mt-0.5 sm:mt-1 truncate">
              {t.incomeMinusExpenses}
            </p>
          </div>
        </div>

        {/* Unpaid Debts */}
        <div className="p-3 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
              {t.unpaidDebts}
            </span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex-shrink-0">
              <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div>
            <div className="text-base sm:text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight font-mono tabular-nums truncate">
              {formatIQD(grandDebt)}
            </div>
            <p className="text-[9px] sm:text-xs text-slate-400 dark:text-slate-500 mt-0.5 sm:mt-1 truncate">
              {t.patientOwes}
            </p>
          </div>
        </div>
      </div>

      {/* ── Monthly Breakdown ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
            <Calendar className="w-4 h-4 text-indigo-500" />
            {t.monthlyReports}
          </h2>
        </div>

        {monthBuckets.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-500">{t.noTreatmentHistory}</p>
            <p className="text-xs text-slate-400 mt-1">{t.addPatientsOrExpensesToView}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {monthBuckets.map((bucket) => {
              const isExpanded = expandedMonth === bucket.key;
              const barWidth =
                highestMonthIncome > 0
                  ? Math.min(100, Math.max(0, Math.round((bucket.totalPaid / highestMonthIncome) * 100)))
                  : 0;

              const profitMargin =
                bucket.totalPaid > 0
                  ? Math.round((bucket.netProfit / bucket.totalPaid) * 100)
                  : bucket.expenseCost > 0
                  ? -100
                  : 0;

              return (
                <div
                  key={bucket.key}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden transition-all"
                >
                  {/* Month Header Row */}
                  <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleMonth(bucket.key)}
                          className="flex items-center gap-2 text-left rtl:text-right cursor-pointer group"
                        >
                          <div className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                            )}
                          </div>
                          <span className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400">
                            {bucket.label}
                          </span>
                        </button>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
                          {bucket.caseCount} {t.patients}
                        </span>
                        <span className="hidden sm:inline px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          {bucket.visitCount} {bucket.visitCount === 1 ? t.visit : t.visits}
                        </span>
                      </div>

                      {/* Header Right: Profit Margin & Net Profit */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Profit Margin Pill */}
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
                          <span className="text-[10px] text-slate-400 font-medium">{t.profitMargin}:</span>
                          <span
                            className={`font-mono font-bold ${
                              profitMargin >= 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {profitMargin}%
                          </span>
                        </div>

                        {/* Net Profit Pill */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-slate-400 font-medium">{t.netProfit}:</span>
                          <span
                            className={`text-sm font-black px-2.5 py-1 rounded-xl font-mono ${
                              bucket.netProfit >= 0
                                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                            }`}
                          >
                            {formatIQD(bucket.netProfit)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar of Income (Strictly scaled by highest earning month) */}
                    <div className="relative h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-3">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>

                    {/* Financial metrics breakdown row: 4 Clean KPIs */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {/* Income */}
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-0.5">
                          {t.totalIncome}
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-sm">
                          {formatIQD(bucket.totalPaid)}
                        </span>
                      </div>

                      {/* Total Expenses */}
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-0.5">
                          {t.totalExpenses}
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-sm">
                          {formatIQD(bucket.expenseCost)}
                        </span>
                      </div>

                      {/* Debts */}
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block mb-0.5">
                          {t.unpaidDebts}
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-sm">
                          {formatIQD(bucket.totalDebt)}
                        </span>
                      </div>

                      {/* Profit Margin */}
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">
                          {t.profitMargin}
                        </span>
                        <span
                          className={`font-bold font-mono text-sm ${
                            profitMargin >= 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {profitMargin}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Patient List */}
                  {isExpanded && bucket.patients.length > 0 && (
                    <div className="border-t border-slate-100 dark:border-slate-800">
                      {/* Clean Sub-Header filling empty space */}
                      <div className="px-4 py-2 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-600 dark:text-slate-400">
                          {t.tabPatients} ({bucket.patients.length})
                        </span>
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          {t.profitMargin}:{" "}
                          <span
                            className={`font-mono ${
                              profitMargin >= 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {profitMargin}%
                          </span>
                        </span>
                      </div>
                      <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {bucket.patients
                          .sort((a, b) => b.monthPaid - a.monthPaid || (b.date || "").localeCompare(a.date || ""))
                          .map((p) => {
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => onViewHistory(p)}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-colors cursor-pointer text-left rtl:text-right"
                              >
                                <PatientAvatar gender={p.gender} size="sm" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                                    {p.name}
                                  </p>
                                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                                    {p.monthVisits} {p.monthVisits === 1 ? t.visit : t.visits} ({bucket.label})
                                  </p>
                                </div>
                                <div className="text-right rtl:text-left flex-shrink-0">
                                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                                    {formatIQD(p.monthPaid)}
                                  </p>
                                  {p.monthDebt > 0 && (
                                    <p className="text-[10px] font-semibold text-rose-500 font-mono">
                                      {t.owesLabel} {formatIQD(p.monthDebt)}
                                    </p>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
