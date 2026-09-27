"use client";

import React from "react";
import { Plus, Users, Calendar, ShieldCheck, LogOut, BarChart3, Boxes } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

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
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md transition-colors">
      <div className="w-full px-4 sm:px-6 xl:px-10">
        {/* Top Bar: Brand + Quick Actions */}
        <div className="h-14 sm:h-16 flex items-center justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/25 ring-2 ring-indigo-500/20 flex-shrink-0">
              <span className="text-base sm:text-lg">🦷</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none">
                  Dr.Qayssar Dental
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  <ShieldCheck className="w-3 h-3 text-indigo-500" />
                  Clinic Pro
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Supabase Cloud
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                Dental Clinic Management
              </p>
            </div>
          </div>

          {/* Desktop Center Navigation Tabs (hidden on mobile, shown on md+) */}
          <nav className="hidden md:flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <button
              onClick={() => onTabChange("patients")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "patients"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Patients</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === "patients"
                    ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                    : "bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                {patientCount}
              </span>
            </button>

            <button
              onClick={() => onTabChange("appointments")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "appointments"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Appointments</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === "appointments"
                    ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                    : "bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                {appointmentCount}
              </span>
            </button>

            <button
              onClick={() => onTabChange("materials")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "materials"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>Materials</span>
              {materialCount > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
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
              onClick={() => onTabChange("reports")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "reports"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Reports</span>
            </button>
          </nav>

          {/* Right Controls: Theme Toggle + Add Patient Button + Sign out */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {activeTab === "patients" && (
              <button
                onClick={onOpenAddModal}
                className="inline-flex items-center gap-1 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/25 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">Add Patient</span>
                <span className="sm:hidden font-bold">Add</span>
              </button>
            )}

            {onSignOut && (
              <button
                onClick={onSignOut}
                title="Log out from clinic system"
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-500 hover:border-rose-200 dark:hover:border-rose-900/50 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Full-Width Segmented Tab Switcher (shown on mobile, hidden on md+) */}
        <div className="md:hidden pb-2.5 pt-0.5">
          <nav className="w-full grid grid-cols-4 p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <button
              onClick={() => onTabChange("patients")}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "patients"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span className="truncate">Patients</span>
            </button>

            <button
              onClick={() => onTabChange("appointments")}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "appointments"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span className="truncate">Appts</span>
            </button>

            <button
              onClick={() => onTabChange("materials")}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "materials"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              <span className="truncate">Supply</span>
            </button>

            <button
              onClick={() => onTabChange("reports")}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "reports"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="truncate">Reports</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
