"use client";

import React from "react";
import { Patient, calculateDebt, formatIQD, getPatientMonthlyStats } from "@/types/patient";
import { ClinicMaterial } from "@/types/material";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import {
  Users,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  CalendarClock,
  Boxes,
} from "lucide-react";

interface StatsOverviewProps {
  patients: Patient[];
  materials?: ClinicMaterial[];
  rentMap?: Record<string, number>;
  selectedMonth?: string;
  monthSubtitle?: string;
  appointmentCount?: number;
  onOpenRentModal?: () => void;
}

export function StatsOverview({
  patients,
  materials = [],
  selectedMonth,
  monthSubtitle,
  appointmentCount = 0,
}: StatsOverviewProps) {
  const { t } = useLanguage();
  const { isDoctor } = useAuth();
  const total = patients.length;
  const isMonthFiltered = Boolean(selectedMonth && selectedMonth !== "all");

  // Total money collected from patients (month-specific when filtered, else all-time)
  const totalPaid = isMonthFiltered
    ? patients.reduce(
        (sum, p) => sum + getPatientMonthlyStats(p, selectedMonth!).paid,
        0
      )
    : patients.reduce(
        (sum, p) => sum + (typeof p.paidAmount === "number" ? p.paidAmount : 0),
        0
      );

  // Total unpaid debt patients owe (month-specific when filtered, else all-time)
  const totalDebt = isMonthFiltered
    ? patients.reduce(
        (sum, p) => sum + getPatientMonthlyStats(p, selectedMonth!).debt,
        0
      )
    : patients.reduce(
        (sum, p) =>
          sum + calculateDebt(p.totalAmount, p.paidAmount, p.debtAmount),
        0
      );

  // Expenses (for selected month if filtered, else all-time)
  const filteredMaterials = isMonthFiltered
    ? materials.filter((m) => m.date?.startsWith(selectedMonth!))
    : materials;

  const totalExpenseCost = filteredMaterials.reduce(
    (sum, m) => sum + (m.costPrice || 0),
    0
  );

  // Net Profit = Total Income - Total Expenses!
  const netProfit = totalPaid - totalExpenseCost;

  const debtCasesCount = isMonthFiltered
    ? patients.filter((p) => getPatientMonthlyStats(p, selectedMonth!).debt > 0).length
    : patients.filter(
        (p) => calculateDebt(p.totalAmount, p.paidAmount, p.debtAmount) > 0
      ).length;

  const maleCount = patients.filter((p) => p.gender === "male").length;
  const femaleCount = patients.filter((p) => p.gender === "female").length;

  return (
    <div
      className={`flex overflow-x-auto gap-3 snap-x snap-mandatory no-scrollbar pb-2 sm:pb-0 sm:grid ${
        isDoctor ? "sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5" : "sm:grid-cols-2 md:grid-cols-3"
      } sm:gap-3.5 mb-4 sm:mb-6`}
    >
      {/* 1. Total Patients / Cases (Visible to Both Doctor and Secretary) */}
      <div className="min-w-[170px] sm:min-w-0 flex-1 snap-start p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-sky-300 dark:hover:border-sky-600/40 transition-all duration-200 flex flex-col justify-between">
        <div className="flex items-center justify-between gap-1.5 text-slate-500 dark:text-slate-400 mb-1.5">
          <span className="text-[11px] sm:text-xs font-bold tracking-tight text-slate-700 dark:text-slate-300 whitespace-nowrap">
            {t.totalPatients} {monthSubtitle ? `(${monthSubtitle})` : ""}
          </span>
          <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex-shrink-0">
            <Users className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
            {total}
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate font-medium">
            <span className="text-sky-600 dark:text-sky-400 font-semibold">{maleCount} ♂</span> • <span className="text-rose-500 dark:text-rose-400 font-semibold">{femaleCount} ♀</span>
          </p>
        </div>
      </div>

      {/* For Secretary: Show Appointments Overview Card */}
      {!isDoctor && (
        <div className="min-w-[170px] sm:min-w-0 flex-1 snap-start p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-sky-300 dark:hover:border-sky-600/40 transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1.5 text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-[11px] sm:text-xs font-bold tracking-tight text-slate-700 dark:text-slate-300 whitespace-nowrap">
              {t.tabAppointments}
            </span>
            <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex-shrink-0">
              <CalendarClock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
              {appointmentCount}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate font-medium">
              {t.scheduleSubtitle}
            </p>
          </div>
        </div>
      )}

      {/* 2. Total Income (Doctor ONLY) */}
      {isDoctor && (
        <div className="min-w-[170px] sm:min-w-0 flex-1 snap-start p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-600/40 transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1.5 text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-[11px] sm:text-xs font-bold tracking-tight text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
              {t.totalIncome}
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
              <CheckCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-sm sm:text-lg font-black text-emerald-700 dark:text-emerald-400 tracking-tight truncate font-mono">
              {formatIQD(totalPaid)}
            </div>
            <p className="text-[10px] text-emerald-600/90 dark:text-emerald-400/80 mt-1 truncate font-medium">
              {t.paidByPatients}
            </p>
          </div>
        </div>
      )}

      {/* 3. Total Expenses (Doctor ONLY) */}
      {isDoctor && (
        <div className="min-w-[170px] sm:min-w-0 flex-1 snap-start p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1.5 text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-[11px] sm:text-xs font-bold tracking-tight text-slate-700 dark:text-slate-300 whitespace-nowrap">
              {t.totalExpenses}
            </span>
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex-shrink-0">
              <Boxes className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-sm sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight truncate font-mono">
              {formatIQD(totalExpenseCost)}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate font-medium">
              {filteredMaterials.length} {t.expensesLogged}
            </p>
          </div>
        </div>
      )}

      {/* 4. Net Profit (Doctor ONLY) */}
      {isDoctor && (
        <div className="min-w-[170px] sm:min-w-0 flex-1 snap-start p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-sky-300 dark:hover:border-sky-600/40 transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1.5 text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-[11px] sm:text-xs font-bold tracking-tight text-sky-700 dark:text-sky-300 whitespace-nowrap">
              {t.netProfit}
            </span>
            <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex-shrink-0">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-sm sm:text-lg font-black text-sky-700 dark:text-sky-300 tracking-tight truncate font-mono">
              {formatIQD(netProfit)}
            </div>
            <p className="text-[10px] text-sky-600/90 dark:text-sky-400/80 mt-1 truncate font-medium">
              {t.incomeMinusExpenses}
            </p>
          </div>
        </div>
      )}

      {/* 5. Unpaid Patient Debts (Strict Warning Rose) */}
      <div className="min-w-[170px] sm:min-w-0 flex-1 snap-start p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-rose-300 dark:hover:border-rose-700/40 transition-all duration-200 flex flex-col justify-between">
        <div className="flex items-center justify-between gap-1.5 text-slate-500 dark:text-slate-400 mb-1.5">
          <span
            className={`text-[11px] sm:text-xs font-bold tracking-tight whitespace-nowrap ${
              totalDebt > 0
                ? "text-rose-600 dark:text-rose-400"
                : "text-slate-700 dark:text-slate-300"
            }`}
          >
            {t.unpaidDebts}
          </span>
          <div
            className={`p-1.5 rounded-lg flex-shrink-0 ${
              totalDebt > 0
                ? "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500"
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <div
            className={`text-sm sm:text-lg font-black tracking-tight truncate font-mono ${
              totalDebt > 0
                ? "text-rose-600 dark:text-rose-400"
                : "text-slate-900 dark:text-slate-100"
            }`}
          >
            {formatIQD(totalDebt)}
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate font-medium">
            {totalDebt > 0
              ? `${debtCasesCount} ${
                  debtCasesCount === 1 ? t.patientOwes : t.patientsOwe
                }`
              : t.allSettled}
          </p>
        </div>
      </div>
    </div>
  );
}
