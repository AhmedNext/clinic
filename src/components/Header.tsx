"use client";

import React from "react";
import Image from "next/image";
import { Plus, Users, CalendarClock, ShieldCheck, LogOut, TrendingUp, Package } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { useLanguage } from "@/context/LanguageContext";

interface HeaderProps {
  activeTab: "patients" | "appointments" | "materials" | "reports";
  onTabChange: (tab: "patients" | "appointments" | "materials" | "reports") => void;
  onOpenAddModal: () => void;
  patientCount: number;
  appointmentCount: number;
  materialCount?: number;
  onSignOut?: () => void;
}

export function Header({
  activeTab,
  onTabChange,
  onOpenAddModal,
  patientCount,
  appointmentCount,
  materialCount = 0,
  onSignOut,
}: HeaderProps) {
  const { t } = useLanguage();

  return (
    <>
      {/* Top Header: Brand Logos + Action Logos */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md transition-colors shadow-2xs">
        <div className="w-full px-3 sm:px-6 xl:px-10">
          <div className="h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
            {/* Logo & Brand */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="relative group cursor-pointer flex-shrink-0">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl p-0.5 bg-gradient-to-tr from-indigo-500 via-violet-500 to-cyan-400 shadow-md shadow-indigo-500/25 ring-2 ring-indigo-500/20 transition-all duration-300 group-hover:scale-105">
                  <div className="w-full h-full rounded-[10px] sm:rounded-[14px] bg-gradient-to-b from-slate-800 to-slate-950 overflow-hidden relative flex items-end justify-center">
                    <Image
                      src="/dr.png"
                      alt="Dr. Qayssar Dental"
                      width={48}
                      height={48}
                      priority
                      className="w-full h-full object-cover object-top scale-115 drop-shadow-sm"
                    />
                  </div>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-500 border-2 border-white dark:border-slate-950 rounded-full shadow-xs ring-1 ring-emerald-400/50 flex items-center justify-center">
                  <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h1 className="text-sm sm:text-base lg:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none truncate">
                    Dr.Qayssar<span className="hidden sm:inline"> Dental</span>
                  </h1>
                  {/* Verified & Cloud Badges as sleek icons on mobile */}
                  <span
                    title={t.clinicPro}
                    className="w-5 h-5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 sm:hidden"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                  </span>
                  <span
                    title={t.activeCloud}
                    className="w-5 h-5 rounded-md bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 sm:hidden"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </span>
                  {/* Desktop text badges */}
                  <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex-shrink-0">
                    <ShieldCheck className="w-3 h-3 text-indigo-500" />
                    {t.clinicPro}
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex-shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {t.activeCloud}
                  </span>
                </div>
                <p className="hidden sm:block text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate mt-0.5">
                  {t.clinicSubtitle}
                </p>
              </div>
            </div>

            {/* Desktop Center Navigation Tabs (hidden on mobile, shown on sm+) */}
            <nav className="hidden sm:flex items-center p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <button
                type="button"
                onClick={() => onTabChange("patients")}
                title={t.tabPatients}
                aria-label={t.tabPatients}
                className={`relative flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "patients"
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Users className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                  {patientCount > 0 && (
                    <span className="sm:hidden absolute -top-1.5 -right-2 rtl:-right-auto rtl:-left-2 px-1 min-w-[14px] h-[14px] flex items-center justify-center rounded-full text-[8.5px] font-black bg-indigo-600 text-white ring-2 ring-white dark:ring-slate-900 shadow-xs">
                      {patientCount > 99 ? "99+" : patientCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline">{t.tabPatients}</span>
                <span
                  className={`hidden sm:inline-flex px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeTab === "patients"
                      ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                      : "bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {patientCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onTabChange("appointments")}
                title={t.tabAppointments}
                aria-label={t.tabAppointments}
                className={`relative flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "appointments"
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <CalendarClock className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                  {appointmentCount > 0 && (
                    <span className="sm:hidden absolute -top-1.5 -right-2 rtl:-right-auto rtl:-left-2 px-1 min-w-[14px] h-[14px] flex items-center justify-center rounded-full text-[8.5px] font-black bg-indigo-600 text-white ring-2 ring-white dark:ring-slate-900 shadow-xs">
                      {appointmentCount > 99 ? "99+" : appointmentCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline">{t.tabAppointments}</span>
                <span
                  className={`hidden sm:inline-flex px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeTab === "appointments"
                      ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                      : "bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {appointmentCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onTabChange("materials")}
                title={t.tabMaterials}
                aria-label={t.tabMaterials}
                className={`relative flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "materials"
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Package className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                  {materialCount > 0 && (
                    <span className="sm:hidden absolute -top-1.5 -right-2 rtl:-right-auto rtl:-left-2 px-1 min-w-[14px] h-[14px] flex items-center justify-center rounded-full text-[8.5px] font-black bg-indigo-600 text-white ring-2 ring-white dark:ring-slate-900 shadow-xs">
                      {materialCount > 99 ? "99+" : materialCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline">{t.tabMaterials}</span>
                {materialCount > 0 && (
                  <span
                    className={`hidden sm:inline-flex px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      activeTab === "materials"
                        ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                        : "bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {materialCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => onTabChange("reports")}
                title={t.tabReports}
                aria-label={t.tabReports}
                className={`relative flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "reports"
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <TrendingUp className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">{t.tabReports}</span>
              </button>
            </nav>

            {/* Right Controls: Logo-First Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {activeTab === "patients" && (
                <>
                  {/* Mobile Quick Add Icon */}
                  <button
                    onClick={onOpenAddModal}
                    title={t.addPatient}
                    className="sm:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 active:scale-95 transition-all cursor-pointer flex-shrink-0"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                  </button>

                  {/* Desktop Full Button */}
                  <button
                    onClick={onOpenAddModal}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-600/30 hover:shadow-indigo-600/40 active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>{t.addPatient}</span>
                  </button>
                </>
              )}

              <LanguageToggle />
              <ThemeToggle />

              {onSignOut && (
                <button
                  onClick={onSignOut}
                  title={t.signOutTooltip}
                  className="hidden sm:flex w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-500 hover:border-rose-200 dark:hover:border-rose-900/50 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-all cursor-pointer items-center justify-center flex-shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
