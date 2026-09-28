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
  const maxIncome = Math.max(...monthBuckets.map((b) => b.totalPaid), 1);

  const toggleMonth = (key: string) => {
    setExpandedMonth((curr) => (curr === key ? null : key));
  };

  return (
    <div className="space-y-6">
      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Income */}
        <div className="p-4 sm:p-5 rounded-2xl border border-emerald-200/70 dark:border-emerald-900/50 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/10 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              {t.totalIncome}
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-200/60 dark:bg-emerald-800/40 text-emerald-700 dark:text-emerald-300">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight font-mono">
            {formatIQD(grandPaid)}
          </div>
          <p className="text-[10px] sm:text-xs text-emerald-600/70 dark:text-emerald-400/60 mt-1">
            {t.paidByPatients}
          </p>
        </div>

        {/* Total Expenses */}
        <div className="p-4 sm:p-5 rounded-2xl border border-amber-200/70 dark:border-amber-900/50 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/10 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
              {t.totalExpenses}
            </span>
            <div className="p-1.5 rounded-lg bg-amber-200/60 dark:bg-amber-800/40 text-amber-700 dark:text-amber-300">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-700 dark:text-amber-400 tracking-tight font-mono">
            {formatIQD(grandExpenses)}
          </div>
          <p className="text-[10px] sm:text-xs text-amber-600/70 dark:text-amber-400/60 mt-1">
            {t.expensesLogged}
          </p>
        </div>

        {/* Net Profit */}
        <div className="p-4 sm:p-5 rounded-2xl border border-indigo-200/70 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/30 dark:to-indigo-900/10 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
              {t.netProfit}
            </span>
            <div className="p-1.5 rounded-lg bg-indigo-200/60 dark:bg-indigo-800/40 text-indigo-700 dark:text-indigo-300">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-xl sm:text-2xl font-black tracking-tight font-mono ${
              grandNetProfit >= 0
                ? "text-indigo-700 dark:text-indigo-300"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {formatIQD(grandNetProfit)}
          </div>
          <p className="text-[10px] sm:text-xs text-indigo-600/70 dark:text-indigo-400/60 mt-1">
            {t.incomeMinusExpenses}
          </p>
        </div>

        {/* Unpaid Debts */}
        <div className="p-4 sm:p-5 rounded-2xl border border-rose-200/70 dark:border-rose-900/50 bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-950/30 dark:to-rose-900/10 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
              {t.unpaidDebts}
            </span>
            <div className="p-1.5 rounded-lg bg-rose-200/60 dark:bg-rose-800/40 text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-700 dark:text-rose-400 tracking-tight font-mono">
            {formatIQD(grandDebt)}
          </div>
          <p className="text-[10px] sm:text-xs text-rose-600/70 dark:text-rose-400/60 mt-1">
            {t.patientOwes}
          </p>
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
                maxIncome > 0
                  ? Math.max(4, Math.round((bucket.totalPaid / maxIncome) * 100))
                  : 0;

              return (
                <div
                  key={bucket.key}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-xs overflow-hidden transition-all"
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
                          <span className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            {bucket.label}
                          </span>
                        </button>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                          {bucket.caseCount} {t.patients}
                        </span>
                        <span className="hidden sm:inline px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          {bucket.visitCount} {bucket.visitCount === 1 ? t.visit : t.visits}
                        </span>
                      </div>

                      {/* Net Profit Pill */}
                      <div className="flex items-center gap-2">
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

                    {/* Progress Bar of Income */}
                    <div className="relative h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-3">
                      <div
                        className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 rounded-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>

                    {/* Financial metrics breakdown row: 3 Clean KPIs */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
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
                    </div>
                  </div>

                  {/* Expanded Patient List */}
                  {isExpanded && bucket.patients.length > 0 && (
                    <div className="border-t border-slate-100 dark:border-slate-800">
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
