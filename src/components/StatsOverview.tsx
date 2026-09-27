"use client";

import React from "react";
import { Patient, calculateDebt, formatIQD } from "@/types/patient";
import { ClinicMaterial } from "@/types/material";
import { Users, AlertCircle, CheckCircle, Boxes, TrendingUp } from "lucide-react";

interface StatsOverviewProps {
  patients: Patient[];
  materials?: ClinicMaterial[];
  monthSubtitle?: string;
}

export function StatsOverview({ patients, materials = [], monthSubtitle }: StatsOverviewProps) {
  const total = patients.length;

  // Total money collected from patients
  const totalPaid = patients.reduce(
    (sum, p) => sum + (typeof p.paidAmount === "number" ? p.paidAmount : 0),
    0
  );

  // Total unpaid debt patients owe
  const totalDebt = patients.reduce(
    (sum, p) =>
      sum + calculateDebt(p.totalAmount, p.paidAmount, p.debtAmount),
    0
  );

  // Total Billed = Total case charges
  const totalBilled = totalPaid + totalDebt;

  // Total money spent on clinic materials / suppliers
  const totalMaterialCost = materials.reduce(
    (sum, m) => sum + (m.costPrice || 0),
    0
  );

  // Net Worth (Clinic Profit) = Total Income from patients minus Material Costs
  const netWorth = totalPaid - totalMaterialCost;

  const debtCasesCount = patients.filter(
    (p) => calculateDebt(p.totalAmount, p.paidAmount, p.debtAmount) > 0
  ).length;

  const maleCount = patients.filter((p) => p.gender === "male").length;
  const femaleCount = patients.filter((p) => p.gender === "female").length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 mb-4 sm:mb-6">
      {/* 1. Total Patients / Cases */}
      <div className="p-3 sm:p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 truncate">
            Patients {monthSubtitle && <span className="text-indigo-500 lowercase font-medium">({monthSubtitle})</span>}
          </span>
          <div className="p-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex-shrink-0">
            <Users className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          {total}
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
          {maleCount} ♂ • {femaleCount} ♀
        </p>
      </div>

      {/* 2. Total Billed (Total Value of Procedures) */}
      <div className="p-3 sm:p-3.5 rounded-2xl border border-blue-200/80 dark:border-blue-900/40 bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-950/20 dark:to-slate-900 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 truncate">
            Total Billed
          </span>
          <div className="p-1 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex-shrink-0">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-sm sm:text-lg font-black text-blue-700 dark:text-blue-400 tracking-tight truncate">
          {formatIQD(totalBilled)}
        </div>
        <p className="text-[10px] text-blue-600/80 dark:text-blue-400/70 mt-0.5 truncate font-medium">
          Total case charges
        </p>
      </div>

      {/* 3. Total Income (Collected from Patients) */}
      <div className="p-3 sm:p-3.5 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/40 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-slate-900 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 truncate">
            Total Income
          </span>
          <div className="p-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex-shrink-0">
            <CheckCircle className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-sm sm:text-lg font-black text-emerald-700 dark:text-emerald-400 tracking-tight truncate">
          {formatIQD(totalPaid)}
        </div>
        <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/70 mt-0.5 truncate font-medium">
          Paid by patients
        </p>
      </div>

      {/* 4. Total Material Spend (Supplier Expenses) */}
      <div className="p-3 sm:p-3.5 rounded-2xl border border-amber-200/80 dark:border-amber-900/40 bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-950/20 dark:to-slate-900 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 truncate">
            Material Spend
          </span>
          <div className="p-1 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex-shrink-0">
            <Boxes className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-sm sm:text-lg font-black text-amber-700 dark:text-amber-400 tracking-tight truncate">
          {formatIQD(totalMaterialCost)}
        </div>
        <p className="text-[10px] text-amber-600/80 dark:text-amber-400/70 mt-0.5 truncate font-medium">
          {materials.length} {materials.length === 1 ? "expense" : "expenses"} logged
        </p>
      </div>

      {/* 5. Net Worth (Total Income - Material Spend) */}
      <div className="p-3 sm:p-3.5 rounded-2xl border border-violet-200/80 dark:border-violet-900/40 bg-gradient-to-br from-violet-50/50 to-white dark:from-violet-950/20 dark:to-slate-900 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-violet-700 dark:text-violet-400 truncate">
            Net Worth
          </span>
          <div className="p-1 rounded-lg bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300 flex-shrink-0">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-sm sm:text-lg font-black text-violet-700 dark:text-violet-300 tracking-tight truncate">
          {formatIQD(netWorth)}
        </div>
        <p className="text-[10px] text-violet-600/80 dark:text-violet-400/70 mt-0.5 truncate font-medium">
          Income - Materials
        </p>
      </div>

      {/* 6. Unpaid Patient Debts */}
      <div className={`p-3 sm:p-3.5 rounded-2xl border shadow-2xs ${
        totalDebt > 0
          ? "border-rose-200/80 dark:border-rose-900/40 bg-gradient-to-br from-rose-50/50 to-white dark:from-rose-950/20 dark:to-slate-900"
          : "border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90"
      }`}>
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
          <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider truncate ${
            totalDebt > 0 ? "text-rose-700 dark:text-rose-400" : "text-slate-600 dark:text-slate-400"
          }`}>
            Unpaid Debts
          </span>
          <div className={`p-1 rounded-lg flex-shrink-0 ${
            totalDebt > 0
              ? "bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300"
              : "bg-slate-100 dark:bg-slate-800 text-slate-400"
          }`}>
            <AlertCircle className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className={`text-sm sm:text-lg font-black tracking-tight truncate ${
          totalDebt > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-slate-100"
        }`}>
          {formatIQD(totalDebt)}
        </div>
        <p className={`text-[10px] mt-0.5 truncate font-medium ${
          totalDebt > 0 ? "text-rose-600/80 dark:text-rose-400/70" : "text-slate-400 dark:text-slate-500"
        }`}>
          {totalDebt > 0
            ? `${debtCasesCount} ${debtCasesCount === 1 ? "patient owes" : "patients owe"}`
            : "All settled ✓"}
        </p>
      </div>
    </div>
  );
}

