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
    <>
      {/* Mobile 2x2 KPI Stats Grid (Screens < sm) */}
      <div className="sm:hidden mb-4">
        {isDoctor ? (
          <div className="grid grid-cols-2 gap-2">
            {/* 1. Total Income */}
            <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                <span className="text-[10px] font-bold tracking-tight text-emerald-700 dark:text-emerald-400 truncate">
                  {t.totalIncome}
                </span>
                <div className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                  <CheckCircle className="w-3 h-3" />
                </div>
              </div>
              <div>
                <div className="text-xs sm:text-sm font-semibold tracking-tight tabular-nums text-emerald-700 dark:text-emerald-400 truncate font-mono">
                  {formatIQD(totalPaid)}
                </div>
                <p className="text-[9px] text-slate-400 truncate mt-0.5">
                  {total} {t.totalPatients.toLowerCase()}
                </p>
              </div>
            </div>

            {/* 2. Total Expenses */}
            <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                <span className="text-[10px] font-bold tracking-tight text-slate-700 dark:text-slate-300 truncate">
                  {t.totalExpenses}
                </span>
                <div className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex-shrink-0">
                  <Boxes className="w-3 h-3" />
                </div>
              </div>
              <div>
                <div className="text-xs sm:text-sm font-semibold tracking-tight tabular-nums text-slate-900 dark:text-slate-100 truncate font-mono">
                  {formatIQD(totalExpenseCost)}
                </div>
                <p className="text-[9px] text-slate-400 truncate mt-0.5">
                  {filteredMaterials.length} {t.expensesLogged}
                </p>
              </div>
            </div>

            {/* 3. Net Profit */}
            <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                <span className="text-[10px] font-bold tracking-tight text-sky-700 dark:text-sky-300 truncate">
                  {t.netProfit}
                </span>
                <div className="p-1 rounded-md bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex-shrink-0">
                  <TrendingUp className="w-3 h-3" />
                </div>
              </div>
              <div>
                <div className="text-xs sm:text-sm font-semibold tracking-tight tabular-nums text-sky-700 dark:text-sky-300 truncate font-mono">
                  {formatIQD(netProfit)}
                </div>
                <p className="text-[9px] text-slate-400 truncate mt-0.5">
                  {appointmentCount} {t.appointments.toLowerCase()}
                </p>
              </div>
            </div>

            {/* 4. Unpaid Debts */}
            <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                <span
                  className={`text-[10px] font-bold tracking-tight truncate ${
                    totalDebt > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {t.unpaidDebts}
                </span>
                <div
                  className={`p-1 rounded-md flex-shrink-0 ${
                    totalDebt > 0
                      ? "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  }`}
                >
                  <AlertCircle className="w-3 h-3" />
                </div>
              </div>
              <div>
                <div
                  className={`text-xs sm:text-sm font-semibold tracking-tight tabular-nums truncate font-mono ${
                    totalDebt > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-slate-100"
                  }`}
                >
                  {formatIQD(totalDebt)}
                </div>
                <p className="text-[9px] text-slate-400 truncate mt-0.5">
                  {totalDebt > 0 ? `${debtCasesCount} ${t.patientOwes}` : t.allSettled}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Secretary Mobile 2-card Grid */
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                <span className="text-[10px] font-bold tracking-tight text-slate-700 dark:text-slate-300 truncate">
                  {t.totalPatients}
                </span>
                <div className="p-1 rounded-md bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex-shrink-0">
                  <Users className="w-3 h-3" />
                </div>
              </div>
              <div className="text-sm font-semibold tracking-tight tabular-nums text-slate-900 dark:text-slate-50">
                {total}
              </div>
            </div>

            <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                <span className="text-[10px] font-bold tracking-tight text-slate-700 dark:text-slate-300 truncate">
                  {t.tabAppointments}
                </span>
                <div className="p-1 rounded-md bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex-shrink-0">
                  <CalendarClock className="w-3 h-3" />
                </div>
              </div>
              <div className="text-sm font-semibold tracking-tight tabular-nums text-slate-900 dark:text-slate-50">
                {appointmentCount}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Responsive Grid (Screens >= sm) */}
      <div
        className={`hidden sm:grid ${
          isDoctor ? "sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5" : "sm:grid-cols-2 md:grid-cols-3"
        } sm:gap-3.5 mb-4 sm:mb-6`}
      >
        {/* 1. Total Patients / Cases */}
        <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-sky-300 dark:hover:border-sky-600/40 transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1.5 text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-[11px] sm:text-xs font-bold tracking-tight text-slate-700 dark:text-slate-300 whitespace-nowrap">
              {t.totalPatients} {monthSubtitle ? `(${monthSubtitle})` : ""}
            </span>
            <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex-shrink-0">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-semibold tracking-tight tabular-nums text-slate-900 dark:text-slate-50">
              {total}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate font-medium">
              <span className="text-sky-600 dark:text-sky-400 font-semibold">{maleCount} ♂</span> • <span className="text-rose-500 dark:text-rose-400 font-semibold">{femaleCount} ♀</span>
            </p>
          </div>
        </div>

        {/* For Secretary: Show Appointments Overview Card */}
        {!isDoctor && (
          <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-sky-300 dark:hover:border-sky-600/40 transition-all duration-200 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1.5 text-slate-500 dark:text-slate-400 mb-1.5">
              <span className="text-[11px] sm:text-xs font-bold tracking-tight text-slate-700 dark:text-slate-300 whitespace-nowrap">
                {t.tabAppointments}
              </span>
              <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex-shrink-0">
                <CalendarClock className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-semibold tracking-tight tabular-nums text-slate-900 dark:text-slate-50">
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
          <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-600/40 transition-all duration-200 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1.5 text-slate-500 dark:text-slate-400 mb-1.5">
              <span className="text-[11px] sm:text-xs font-bold tracking-tight text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                {t.totalIncome}
              </span>
              <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                <CheckCircle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-semibold tracking-tight tabular-nums text-emerald-700 dark:text-emerald-400 truncate font-mono">
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
          <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1.5 text-slate-500 dark:text-slate-400 mb-1.5">
              <span className="text-[11px] sm:text-xs font-bold tracking-tight text-slate-700 dark:text-slate-300 whitespace-nowrap">
                {t.totalExpenses}
              </span>
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex-shrink-0">
                <Boxes className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-semibold tracking-tight tabular-nums text-slate-900 dark:text-slate-100 truncate font-mono">
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
          <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-sky-300 dark:hover:border-sky-600/40 transition-all duration-200 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1.5 text-slate-500 dark:text-slate-400 mb-1.5">
              <span className="text-[11px] sm:text-xs font-bold tracking-tight text-sky-700 dark:text-sky-300 whitespace-nowrap">
                {t.netProfit}
              </span>
              <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex-shrink-0">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-semibold tracking-tight tabular-nums text-sky-700 dark:text-sky-300 truncate font-mono">
                {formatIQD(netProfit)}
              </div>
            </div>
          </div>
        )}

        {/* 5. Unpaid Patient Debts (Clinical Rose) */}
        <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-rose-300 dark:hover:border-rose-700/40 transition-all duration-200 flex flex-col justify-between">
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
              className={`text-base sm:text-lg font-semibold tracking-tight tabular-nums truncate font-mono ${
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
    </>
  );
}
