"use client";

import React from "react";
import { Patient, calculateDebt, formatIQD } from "@/types/patient";
import { Users, Banknote, AlertCircle, CheckCircle } from "lucide-react";

interface StatsOverviewProps {
  patients: Patient[];
  monthSubtitle?: string;
}

export function StatsOverview({ patients, monthSubtitle }: StatsOverviewProps) {
  const total = patients.length;

  // Financial calculations in Iraqi Dinar (IQD)
  const totalPaid = patients.reduce(
    (sum, p) => sum + (typeof p.paidAmount === "number" ? p.paidAmount : 0),
    0
  );

  const totalDebt = patients.reduce(
    (sum, p) =>
      sum + calculateDebt(p.totalAmount, p.paidAmount, p.debtAmount),
    0
  );

  const debtCasesCount = patients.filter(
    (p) => calculateDebt(p.totalAmount, p.paidAmount, p.debtAmount) > 0
  ).length;

  const fullyPaidCount = patients.filter(
    (p) => calculateDebt(p.totalAmount, p.paidAmount, p.debtAmount) === 0
  ).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 mb-4 sm:mb-6">
      {/* Total Cases */}
      <div className="p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5 sm:mb-2">
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">
            Total Cases {monthSubtitle && <span className="text-indigo-500 font-bold lowercase">({monthSubtitle})</span>}
          </span>
          <div className="p-1 sm:p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          {total}
        </div>
        <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 sm:mt-1 truncate">
          {patients.filter((p) => p.gender === "male").length} ♂ •{" "}
          {patients.filter((p) => p.gender === "female").length} ♀
        </p>
      </div>

      {/* Total Paid Collected */}
      <div className="p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5 sm:mb-2">
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">Total Paid</span>
          <div className="p-1 sm:p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="text-base sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight truncate">
          {formatIQD(totalPaid)}
        </div>
        <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 sm:mt-1 truncate">
          {fullyPaidCount} cases settled
        </p>
      </div>

      {/* Outstanding Debts */}
      <div className="p-3 sm:p-4 rounded-2xl border border-rose-200/70 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5 sm:mb-2">
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Unpaid Debts
          </span>
          <div className="p-1 sm:p-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="text-base sm:text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight truncate">
          {formatIQD(totalDebt)}
        </div>
        <p className="text-[10px] sm:text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-0.5 sm:mt-1 font-medium truncate">
          {debtCasesCount} {debtCasesCount === 1 ? "patient owes" : "patients owe"}
        </p>
      </div>

      {/* Overall Total Value */}
      <div className="p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5 sm:mb-2">
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">Total Billed</span>
          <div className="p-1 sm:p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <Banknote className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="text-base sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight truncate">
          {formatIQD(totalPaid + totalDebt)}
        </div>
        <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 sm:mt-1 truncate">
          {totalPaid + totalDebt > 0
            ? `${Math.round((totalPaid / (totalPaid + totalDebt)) * 100)}% collection`
            : "No billing yet"}
        </p>
      </div>
    </div>
  );
}
