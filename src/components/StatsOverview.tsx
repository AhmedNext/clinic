"use client";

import React from "react";
import { Patient, calculateDebt, formatIQD, getPatientMonthlyStats } from "@/types/patient";
import { ClinicMaterial } from "@/types/material";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import {
  Users,
  AlertCircle,
  CheckCircle,
  Boxes,
  TrendingUp,
  Settings,
  CalendarClock,
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
  rentMap = {},
  selectedMonth,
  monthSubtitle,
  appointmentCount = 0,
  onOpenRentModal,
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

  // Material spend (for selected month if filtered, else all-time)
  const filteredMaterials = isMonthFiltered
    ? materials.filter((m) => m.date?.startsWith(selectedMonth!))
    : materials;

  const totalMaterialCost = filteredMaterials.reduce(
    (sum, m) => sum + (m.costPrice || 0),
    0
  );

  // Clinic Rent (for selected month if filtered, else sum of all recorded rent)
  const clinicRent = isMonthFiltered
    ? (rentMap[selectedMonth!] || 0)
    : Object.values(rentMap).reduce((sum, v) => sum + (v || 0), 0);

  // Net Worth = Total Income minus Material Spend minus Clinic Rent!
  const netWorth = totalPaid - totalMaterialCost - clinicRent;

  const debtCasesCount = isMonthFiltered
    ? patients.filter((p) => getPatientMonthlyStats(p, selectedMonth!).debt > 0).length
    : patients.filter(
        (p) => calculateDebt(p.totalAmount, p.paidAmount, p.debtAmount) > 0
      ).length;

  const maleCount = patients.filter((p) => p.gender === "male").length;
  const femaleCount = patients.filter((p) => p.gender === "female").length;

  const recordedRentCount = Object.keys(rentMap).filter((k) => (rentMap[k] || 0) > 0).length;

  return (
    <div
      className={`grid grid-cols-1 min-[380px]:grid-cols-2 ${
        isDoctor ? "sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6" : "md:grid-cols-3"
      } gap-2.5 sm:gap-3.5 mb-4 sm:mb-6`}
    >
      {/* 1. Total Patients / Cases (Visible to Both Doctor and Secretary) */}
      <div className="p-3 sm:p-3.5 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50/40 via-white to-white dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-900 shadow-2xs hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 group">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 truncate">
            {t.totalPatients} {monthSubtitle && <span className="text-indigo-500 lowercase font-medium">({monthSubtitle})</span>}
          </span>
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Users className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          {total}
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate font-medium">
          <span className="text-sky-600 dark:text-sky-400 font-semibold">{maleCount} ♂</span> • <span className="text-rose-500 dark:text-rose-400 font-semibold">{femaleCount} ♀</span>
        </p>
      </div>

      {/* For Secretary: Show Appointments Overview Card */}
      {!isDoctor && (
        <div className="p-3 sm:p-3.5 rounded-2xl border border-sky-100 dark:border-sky-900/40 bg-gradient-to-br from-sky-50/40 via-white to-white dark:from-sky-950/20 dark:via-slate-900 dark:to-slate-900 shadow-2xs hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 truncate">
              {t.tabAppointments}
            </span>
            <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex-shrink-0 group-hover:bg-sky-600 group-hover:text-white transition-colors">
              <CalendarClock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {appointmentCount}
          </div>
          <p className="text-[10px] text-sky-600/90 dark:text-sky-400/80 mt-0.5 truncate font-medium">
            {t.scheduleSubtitle}
          </p>
        </div>
      )}

      {/* 2. Total Income (Doctor ONLY - MUST HIDE for Secretary) */}
      {isDoctor && (
        <div className="p-3 sm:p-3.5 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/40 bg-gradient-to-br from-emerald-50/60 via-white to-white dark:from-emerald-950/25 dark:via-slate-900 dark:to-slate-900 shadow-2xs hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 truncate">
              {t.totalIncome}
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-100/80 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex-shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <CheckCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-sm sm:text-lg font-black text-emerald-700 dark:text-emerald-400 tracking-tight truncate font-mono">
            {formatIQD(totalPaid)}
          </div>
          <p className="text-[10px] text-emerald-600/90 dark:text-emerald-400/80 mt-0.5 truncate font-medium">
            {t.paidByPatients}
          </p>
        </div>
      )}

      {/* 3. Total Material Spend (Doctor ONLY - MUST HIDE for Secretary) */}
      {isDoctor && (
        <div className="p-3 sm:p-3.5 rounded-2xl border border-amber-200/80 dark:border-amber-900/40 bg-gradient-to-br from-amber-50/60 via-white to-white dark:from-amber-950/25 dark:via-slate-900 dark:to-slate-900 shadow-2xs hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 truncate">
              {t.materialSpend}
            </span>
            <div className="p-1.5 rounded-lg bg-amber-100/80 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex-shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Boxes className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-sm sm:text-lg font-black text-amber-700 dark:text-amber-400 tracking-tight truncate font-mono">
            {formatIQD(totalMaterialCost)}
          </div>
          <p className="text-[10px] text-amber-600/90 dark:text-amber-400/80 mt-0.5 truncate font-medium">
            {filteredMaterials.length} {t.expensesLogged}
          </p>
        </div>
      )}

      {/* 4. Monthly Clinic Rent (Doctor ONLY - MUST HIDE for Secretary) */}
      {isDoctor && (
        <div className="p-3 sm:p-3.5 rounded-2xl border border-violet-200/80 dark:border-violet-900/40 bg-gradient-to-br from-violet-50/60 via-white to-white dark:from-violet-950/25 dark:via-slate-900 dark:to-slate-900 shadow-2xs hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-violet-700 dark:text-violet-400 truncate">
              {t.clinicRent}
            </span>
            <button
              type="button"
              onClick={onOpenRentModal}
              className="p-1.5 rounded-lg bg-violet-100/80 dark:bg-violet-900/60 hover:bg-violet-600 hover:text-white dark:hover:bg-violet-600 text-violet-700 dark:text-violet-300 flex-shrink-0 transition-colors cursor-pointer"
              title={t.adjustMonthRent}
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-sm sm:text-lg font-black text-violet-700 dark:text-violet-300 tracking-tight truncate font-mono">
            {formatIQD(clinicRent)}
          </div>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-[10px] text-violet-600/90 dark:text-violet-400/80 truncate font-medium">
              {isMonthFiltered ? `${monthSubtitle} ${t.clinicRent}` : `${recordedRentCount} ${t.clinicRent}`}
            </p>
            <button
              type="button"
              onClick={onOpenRentModal}
              className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
            >
              {t.adjust}
            </button>
          </div>
        </div>
      )}

      {/* 5. Net Worth (Doctor ONLY - MUST HIDE for Secretary) */}
      {isDoctor && (
        <div className="p-3 sm:p-3.5 rounded-2xl border border-indigo-200/90 dark:border-indigo-800/60 bg-gradient-to-br from-indigo-100/40 via-white to-indigo-50/20 dark:from-indigo-950/40 dark:via-slate-900 dark:to-indigo-950/20 shadow-2xs hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 ring-1 ring-indigo-500/10 group">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 truncate">
              {t.netWorth}
            </span>
            <div className="p-1.5 rounded-lg bg-indigo-100/80 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-sm sm:text-lg font-black text-indigo-700 dark:text-indigo-300 tracking-tight truncate font-mono">
            {formatIQD(netWorth)}
          </div>
          <p className="text-[10px] text-indigo-600/90 dark:text-indigo-400/80 mt-0.5 truncate font-medium">
            {t.incomeMinusExpenses}
          </p>
        </div>
      )}

      {/* 6. Unpaid Patient Debts (Visible to Both Doctor and Secretary to collect fees) */}
      <div
        className={`p-3 sm:p-3.5 rounded-2xl border shadow-2xs hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 group ${
          totalDebt > 0
            ? "border-rose-200/80 dark:border-rose-900/40 bg-gradient-to-br from-rose-50/60 via-white to-white dark:from-rose-950/25 dark:via-slate-900 dark:to-slate-900"
            : "border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90"
        }`}
      >
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
          <span
            className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider truncate ${
              totalDebt > 0 ? "text-rose-700 dark:text-rose-400" : "text-slate-600 dark:text-slate-400"
            }`}
          >
            {t.unpaidDebts}
          </span>
          <div
            className={`p-1.5 rounded-lg flex-shrink-0 group-hover:scale-105 transition-transform ${
              totalDebt > 0
                ? "bg-rose-100/80 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300"
                : "bg-slate-100 dark:bg-slate-800 text-slate-400"
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
          </div>
        </div>
        <div
          className={`text-sm sm:text-lg font-black tracking-tight truncate font-mono ${
            totalDebt > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-slate-100"
          }`}
        >
          {formatIQD(totalDebt)}
        </div>
        <p
          className={`text-[10px] mt-0.5 truncate font-medium ${
            totalDebt > 0 ? "text-rose-600/90 dark:text-rose-400/80" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          {totalDebt > 0
            ? `${debtCasesCount} ${debtCasesCount === 1 ? t.patientOwes : t.patientsOwe}`
            : t.allSettled}
        </p>
      </div>
    </div>
  );
}
