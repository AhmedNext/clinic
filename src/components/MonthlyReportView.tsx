"use client";

import React, { useMemo, useState } from "react";
import { Patient, calculateDebt, formatIQD } from "@/types/patient";
import {
  Calendar,
  TrendingUp,
  Users,
  ChevronDown,
  ChevronRight,
  Banknote,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { PatientAvatar } from "./PatientAvatar";

interface MonthlyReportViewProps {
  patients: Patient[];
  onViewHistory: (patient: Patient) => void;
}

interface MonthBucket {
  key: string; // 'YYYY-MM'
  label: string; // 'Sep 2026'
  patients: Patient[];
  totalPaid: number;
  totalDebt: number;
  totalBilled: number;
  caseCount: number;
  visitCount: number;
}

export function MonthlyReportView({
  patients,
  onViewHistory,
}: MonthlyReportViewProps) {
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

  const monthBuckets: MonthBucket[] = useMemo(() => {
    const map = new Map<string, Patient[]>();

    patients.forEach((p) => {
      const ym = p.date?.substring(0, 7);
      if (!ym) return;
      if (!map.has(ym)) map.set(ym, []);
      map.get(ym)!.push(p);
    });

    return Array.from(map.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, pts]) => {
        const totalPaid = pts.reduce((s, p) => s + (p.paidAmount ?? 0), 0);
        const totalDebt = pts.reduce(
          (s, p) => s + calculateDebt(p.totalAmount, p.paidAmount, p.debtAmount),
          0
        );
        const visitCount = pts.reduce((s, p) => s + (p.history?.length ?? 0), 0);

        const [year, month] = key.split("-");
        const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
        const label = d.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });

        return {
          key,
          label,
          patients: pts,
          totalPaid,
          totalDebt,
          totalBilled: totalPaid + totalDebt,
          caseCount: pts.length,
          visitCount,
        };
      });
  }, [patients]);

  const grandPaid = monthBuckets.reduce((s, b) => s + b.totalPaid, 0);
  const grandDebt = monthBuckets.reduce((s, b) => s + b.totalDebt, 0);
  const grandBilled = grandPaid + grandDebt;
  const maxBilled = Math.max(...monthBuckets.map((b) => b.totalBilled), 1);

  const toggleMonth = (key: string) => {
    setExpandedMonth((curr) => (curr === key ? null : key));
  };

  return (
    <div className="space-y-6">
      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl border border-emerald-200/70 dark:border-emerald-900/50 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/10 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              Total Income Collected
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-200/60 dark:bg-emerald-800/40 text-emerald-700 dark:text-emerald-300">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight">
            {formatIQD(grandPaid)}
          </div>
          <p className="text-[10px] sm:text-xs text-emerald-600/70 dark:text-emerald-400/60 mt-1">
            Across {monthBuckets.length} {monthBuckets.length === 1 ? "month" : "months"}
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-rose-200/70 dark:border-rose-900/50 bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-950/30 dark:to-rose-900/10 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
              Unpaid Debts
            </span>
            <div className="p-1.5 rounded-lg bg-rose-200/60 dark:bg-rose-800/40 text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
            {formatIQD(grandDebt)}
          </div>
          <p className="text-[10px] sm:text-xs text-rose-600/70 dark:text-rose-400/60 mt-1">
            {grandBilled > 0
              ? `${Math.round((grandDebt / grandBilled) * 100)}% unpaid`
              : "All accounts paid"}
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-indigo-200/70 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/30 dark:to-indigo-900/10 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
              Total Case Charges
            </span>
            <div className="p-1.5 rounded-lg bg-indigo-200/60 dark:bg-indigo-800/40 text-indigo-700 dark:text-indigo-300">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-black text-indigo-700 dark:text-indigo-300 tracking-tight">
            {formatIQD(grandBilled)}
          </div>
          <p className="text-[10px] sm:text-xs text-indigo-600/70 dark:text-indigo-400/60 mt-1">
            {patients.length} total patient cases
          </p>
        </div>
      </div>

      {/* ── Monthly Breakdown ── */}
      <div>
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
          <Calendar className="w-4 h-4 text-indigo-500" />
          Monthly Breakdown
        </h2>

        {monthBuckets.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-500">No patient data yet</p>
            <p className="text-xs text-slate-400 mt-1">Add patients to see monthly reports here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {monthBuckets.map((bucket) => {
              const isExpanded = expandedMonth === bucket.key;
              const barWidth =
                maxBilled > 0
                  ? Math.max(4, Math.round((bucket.totalBilled / maxBilled) * 100))
                  : 0;
              const paidWidth =
                bucket.totalBilled > 0
                  ? Math.round((bucket.totalPaid / bucket.totalBilled) * barWidth)
                  : 0;

              return (
                <div
                  key={bucket.key}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-xs overflow-hidden transition-all"
                >
                  {/* Month Header Row */}
                  <button
                    type="button"
                    onClick={() => toggleMonth(bucket.key)}
                    className="w-full flex items-center gap-3 sm:gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <div className="flex-shrink-0 text-slate-400">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {bucket.label}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                            {bucket.caseCount} {bucket.caseCount === 1 ? "patient" : "patients"}
                          </span>
                          <span className="hidden sm:inline px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                            {bucket.visitCount} {bucket.visitCount === 1 ? "visit" : "visits"}
                          </span>
                        </div>
                        <span className="text-sm font-black text-slate-900 dark:text-slate-100 flex-shrink-0">
                          {formatIQD(bucket.totalBilled)}
                        </span>
                      </div>

                      {/* Bar chart */}
                      <div className="relative h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full bg-rose-200 dark:bg-rose-900/60 transition-all duration-500"
                          style={{ width: `${barWidth}%` }}
                        />
                        <div
                          className="absolute inset-y-0 left-0 rounded-full bg-emerald-400 dark:bg-emerald-500 transition-all duration-500"
                          style={{ width: `${paidWidth}%` }}
                        />
                      </div>

                      {/* Legend */}
                      <div className="flex items-center gap-4 mt-1.5 text-[10px] sm:text-[11px]">
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 dark:bg-emerald-500 inline-block" />
                          Paid: {formatIQD(bucket.totalPaid)}
                        </span>
                        {bucket.totalDebt > 0 && (
                          <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold">
                            <span className="w-2 h-2 rounded-full bg-rose-200 dark:bg-rose-900/60 inline-block" />
                            Debt: {formatIQD(bucket.totalDebt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Expanded Patient List */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 dark:border-slate-800">
                      <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {bucket.patients
                          .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
                          .map((p) => {
                            const debt = calculateDebt(p.totalAmount, p.paidAmount, p.debtAmount);
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => onViewHistory(p)}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-colors cursor-pointer text-left"
                              >
                                <PatientAvatar gender={p.gender} size="sm" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                                    {p.name}
                                  </p>
                                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                                    {p.date} • {p.history?.length ?? 0} visits
                                  </p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                    {formatIQD(p.paidAmount ?? 0)}
                                  </p>
                                  {debt > 0 && (
                                    <p className="text-[10px] font-semibold text-rose-500">
                                      Owes {formatIQD(debt)}
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
