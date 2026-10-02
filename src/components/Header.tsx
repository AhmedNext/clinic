"use client";

import { useState, useRef, useEffect } from "react";
import { ClinicLogo } from "./ClinicLogo";
import {
  Users,
  CalendarClock,
  ShieldCheck,
  LogOut,
  TrendingUp,
  Package,
  UserPlus,
  Building2,
  Database,
  ChevronDown,
  Stethoscope,
  User,
  Sun,
  Moon,
  Globe,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Language } from "@/i18n/translations";
import { useAuth } from "@/context/AuthContext";
import { useClinicSettings } from "@/context/ClinicSettingsContext";

interface HeaderProps {
  activeTab: "patients" | "appointments" | "materials" | "reports";
  onTabChange: (tab: "patients" | "appointments" | "materials" | "reports") => void;
  onOpenAddModal?: () => void;
  patientCount: number;
  appointmentCount: number;
  materialCount?: number;
  onOpenStaffModal?: () => void;
  onOpenClinicSettings?: () => void;
  onOpenImportDatabase?: () => void;
  onSignOut?: () => void;
}

export function Header({
  activeTab,
  onTabChange,
  patientCount,
  appointmentCount,
  materialCount = 0,
  onOpenStaffModal,
  onOpenClinicSettings,
  onOpenImportDatabase,
  onSignOut,
}: HeaderProps) {
  const { t, lang, setLang } = useLanguage();
  const { isDoctor, userName, badgeLabel, signOut } = useAuth();
  const { settings } = useClinicSettings();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("light");

  const handleSignOutClick = onSignOut || signOut;

  const displayName = isDoctor
    ? settings.clinicName || userName || t.doctorTitle
    : userName || t.receptionistTitle;

  // Initialize and synchronize current theme
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setCurrentTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const nextTheme = currentTheme === "light" ? "dark" : "light";
    setCurrentTheme(nextTheme);
    localStorage.setItem("clinic_theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Close profile dropdown when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
      }
    }
    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isProfileOpen]);

  return (
    <>
      {/* Top Header: Clean, balanced 3-zone layout with Clinical Precision Palette */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors shadow-2xs">
        <div className="w-full px-3 sm:px-6 xl:px-10">
          <div className="h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
            {/* Left: Brand Identity & Status */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div
                onClick={isDoctor ? onOpenClinicSettings : undefined}
                className={`relative group flex-shrink-0 ${isDoctor ? "cursor-pointer" : ""}`}
                title={isDoctor ? t.clinicSettings : undefined}
              >
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl p-0.5 bg-gradient-to-tr from-sky-500 via-sky-600 to-teal-400 shadow-md shadow-sky-500/20 ring-2 ring-sky-500/20 transition-all duration-300 group-hover:scale-105">
                  <div className="w-full h-full rounded-[10px] sm:rounded-[14px] bg-slate-900 overflow-hidden relative flex items-end justify-center">
                    <ClinicLogo className="w-full h-full p-0.5 drop-shadow-sm" />
                  </div>
                </div>
                {/* Live cloud sync pulsating dot */}
                <span
                  title={t.activeCloud}
                  className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full shadow-xs ring-1 ring-emerald-400/50 flex items-center justify-center"
                >
                  <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h1 className="text-sm sm:text-base lg:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none truncate max-[380px]:hidden">
                    {displayName}
                  </h1>

                  {/* Compact Role Badge */}
                  <span
                    title={isDoctor ? t.roleDoctorDesc : t.roleSecretaryDesc}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold border shadow-2xs whitespace-nowrap flex-shrink-0 transition-all ${
                      isDoctor
                        ? "bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border-sky-200/90 dark:border-sky-800"
                        : "bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200/90 dark:border-amber-800"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isDoctor ? "bg-sky-500" : "bg-amber-500"
                      } animate-pulse`}
                    />
                    <span>{badgeLabel}</span>
                  </span>
                </div>
                {/* Dynamic Doctor Subtitle */}
                <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                  {isDoctor
                    ? (settings.doctorName
                        ? (settings.doctorName.toLowerCase().startsWith("dr") || settings.doctorName.startsWith("د.")
                            ? settings.doctorName
                            : `Dr. ${settings.doctorName}`)
                        : t.doctorTitle)
                    : t.roleSecretaryDesc}
                </p>
              </div>
            </div>

            {/* Center: Primary Navigation Tabs */}
            <nav className="hidden sm:flex items-center p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
              {/* Tab: Patients */}
              <button
                type="button"
                onClick={() => onTabChange("patients")}
                title={t.tabPatients}
                aria-label={t.tabPatients}
                className={`relative flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "patients"
                    ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Users className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                  {patientCount > 0 && (
                    <span className="sm:hidden absolute -top-1.5 -right-2 rtl:-right-auto rtl:-left-2 px-1 min-w-[14px] h-[14px] flex items-center justify-center rounded-full text-[8.5px] font-black bg-sky-600 text-white ring-2 ring-white dark:ring-slate-900 shadow-xs">
                      {patientCount > 99 ? "99+" : patientCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline">{t.tabPatients}</span>
                <span
                  className={`hidden sm:inline-flex px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeTab === "patients"
                      ? "bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400"
                      : "bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {patientCount}
                </span>
              </button>

              {/* Tab: Appointments */}
              <button
                type="button"
                onClick={() => onTabChange("appointments")}
                title={t.tabAppointments}
                aria-label={t.tabAppointments}
                className={`relative flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "appointments"
                    ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <CalendarClock className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                  {appointmentCount > 0 && (
                    <span className="sm:hidden absolute -top-1.5 -right-2 rtl:-right-auto rtl:-left-2 px-1 min-w-[14px] h-[14px] flex items-center justify-center rounded-full text-[8.5px] font-black bg-sky-600 text-white ring-2 ring-white dark:ring-slate-900 shadow-xs">
                      {appointmentCount > 99 ? "99+" : appointmentCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline">{t.tabAppointments}</span>
                <span
                  className={`hidden sm:inline-flex px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeTab === "appointments"
                      ? "bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400"
                      : "bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {appointmentCount}
                </span>
              </button>

              {/* Tab: Materials (Doctor Only) */}
              {isDoctor && (
                <button
                  type="button"
                  onClick={() => onTabChange("materials")}
                  title={t.tabMaterials}
                  aria-label={t.tabMaterials}
                  className={`relative flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "materials"
                      ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <div className="relative flex items-center justify-center">
                    <Package className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                    {materialCount > 0 && (
                      <span className="sm:hidden absolute -top-1.5 -right-2 rtl:-right-auto rtl:-left-2 px-1 min-w-[14px] h-[14px] flex items-center justify-center rounded-full text-[8.5px] font-black bg-sky-600 text-white ring-2 ring-white dark:ring-slate-900 shadow-xs">
                        {materialCount > 99 ? "99+" : materialCount}
                      </span>
                    )}
                  </div>
                  <span className="hidden sm:inline">{t.tabMaterials}</span>
                  {materialCount > 0 && (
                    <span
                      className={`hidden sm:inline-flex px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        activeTab === "materials"
                          ? "bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400"
                          : "bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {materialCount}
                    </span>
                  )}
                </button>
              )}

              {/* Tab: Reports (Doctor Only) */}
              {isDoctor && (
                <button
                  type="button"
                  onClick={() => onTabChange("reports")}
                  title={t.tabReports}
                  aria-label={t.tabReports}
                  className={`relative flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "reports"
                      ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <TrendingUp className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                  <span className="hidden sm:inline">{t.tabReports}</span>
                </button>
              )}
            </nav>

            {/* Right: Doctor / User Profile Menu */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
              {/* Doctor / User Profile Dropdown Menu */}
              <div ref={profileRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  aria-expanded={isProfileOpen}
                  aria-haspopup="true"
                  title={displayName}
                  className={`flex items-center gap-1.5 sm:gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl sm:rounded-2xl border transition-all cursor-pointer ${
                    isProfileOpen
                      ? "bg-slate-100 dark:bg-slate-800 border-sky-500/50 ring-2 ring-sky-500/20 shadow-xs"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs"
                  }`}
                >
                  {/* Doctor/User Avatar */}
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-xs ${
                      isDoctor
                        ? "bg-gradient-to-tr from-sky-600 to-teal-600"
                        : "bg-gradient-to-tr from-amber-500 to-amber-600"
                    }`}
                  >
                    {isDoctor ? (
                      <Stethoscope className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                    ) : (
                      <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                    )}
                  </div>

                  {/* Name & Role label */}
                  <div className="hidden md:flex flex-col text-left rtl:text-right min-w-0 max-w-[120px]">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-none">
                      {isDoctor ? settings.doctorName || displayName : displayName}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-none mt-1 truncate">
                      {badgeLabel}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md leading-none">
                    {lang.toUpperCase()}
                  </span>

                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${
                      isProfileOpen ? "rotate-180 text-sky-500" : ""
                    }`}
                  />
                </button>

                {/* Profile Menu: Bottom Sheet on Mobile (< sm), Floating Dropdown on Desktop (>= sm) */}
                {isProfileOpen && (
                  <>
                    {/* Mobile Backdrop Overlay (< sm) */}
                    <div
                      className="sm:hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
                      onClick={() => setIsProfileOpen(false)}
                      aria-hidden="true"
                    />

                    {/* Menu Container: Slide-up Drawer on Mobile, Popover Card on Desktop */}
                    <div
                      className="fixed sm:absolute bottom-0 sm:bottom-auto right-0 sm:top-full left-0 sm:left-auto rtl:sm:right-auto rtl:sm:left-0 sm:mt-2 w-full sm:w-80 bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl sm:shadow-xl p-3 sm:p-2 z-50 animate-in slide-in-from-bottom sm:slide-in-from-top-2 sm:fade-in sm:zoom-in-95 duration-200 max-h-[85dvh] overflow-y-auto no-scrollbar ring-1 ring-black/5 dark:ring-white/5"
                    >
                      {/* Mobile Bottom Sheet Drag Handle (< sm) */}
                      <div className="sm:hidden flex justify-center pb-2 pt-0.5">
                        <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                      </div>

                      {/* Profile Header */}
                      <div className="p-3 sm:p-2.5 rounded-2xl sm:rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 mb-2 sm:mb-1.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-11 h-11 sm:w-10 sm:h-10 rounded-2xl sm:rounded-xl flex items-center justify-center font-black text-sm text-white shadow-md flex-shrink-0 ${
                              isDoctor
                                ? "bg-gradient-to-tr from-sky-600 to-teal-600"
                                : "bg-gradient-to-tr from-amber-500 to-amber-600"
                            }`}
                          >
                            {isDoctor ? (
                              <Stethoscope className="w-5 h-5 text-white" />
                            ) : (
                              <User className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate">
                              {isDoctor ? settings.doctorName || displayName : displayName}
                            </h4>
                            <p className="text-xs sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                              {settings.clinicName || t.clinicSubtitle}
                            </p>
                          </div>
                        </div>

                        {/* Badges: Role + Clinic Pro + Active Cloud */}
                        <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 sm:px-2 py-0.5 rounded-full text-[11px] sm:text-[10px] font-bold border ${
                              isDoctor
                                ? "bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800"
                                : "bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isDoctor ? "bg-sky-500" : "bg-amber-500"
                              }`}
                            />
                            <span>{badgeLabel}</span>
                          </span>

                          {isDoctor && (
                            <span className="inline-flex items-center gap-1 px-2.5 sm:px-2 py-0.5 rounded-full text-[11px] sm:text-[10px] font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800">
                              <ShieldCheck className="w-3 h-3 text-sky-500" />
                              <span>{t.clinicPro}</span>
                            </span>
                          )}

                          <span className="inline-flex items-center gap-1 px-2.5 sm:px-2 py-0.5 rounded-full text-[11px] sm:text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>{t.activeCloud}</span>
                          </span>
                        </div>
                      </div>

                      {/* Secondary Actions */}
                      <div className="space-y-1 sm:space-y-0.5">
                        {/* Clinic Settings (Doctor Only) */}
                        {isDoctor && onOpenClinicSettings && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsProfileOpen(false);
                              onOpenClinicSettings();
                            }}
                            className="w-full flex items-center justify-between p-2.5 sm:p-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-sky-50/70 dark:hover:bg-sky-950/40 hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 sm:w-7 sm:h-7 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-sky-100 dark:group-hover:bg-sky-900/60 flex items-center justify-center text-slate-500 group-hover:text-sky-600 dark:text-slate-400 dark:group-hover:text-sky-400 transition-colors">
                                <Building2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                              </div>
                              <div className="text-left rtl:text-right">
                                <div className="font-bold leading-tight text-xs">{t.clinicSettings}</div>
                                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                                  {t.editClinicProfile}
                                </div>
                              </div>
                            </div>
                          </button>
                        )}

                        {/* Manage Staff (Doctor Only) */}
                        {isDoctor && onOpenStaffModal && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsProfileOpen(false);
                              onOpenStaffModal();
                            }}
                            className="w-full flex items-center justify-between p-2.5 sm:p-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-amber-50/70 dark:hover:bg-amber-950/40 hover:text-amber-700 dark:hover:text-amber-300 transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 sm:w-7 sm:h-7 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/60 flex items-center justify-center text-slate-500 group-hover:text-amber-600 dark:text-slate-400 dark:group-hover:text-amber-400 transition-colors">
                                <UserPlus className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                              </div>
                              <div className="text-left rtl:text-right">
                                <div className="font-bold leading-tight text-xs">{t.manageStaff}</div>
                                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                                  {t.activeStaff}
                                </div>
                              </div>
                            </div>
                          </button>
                        )}

                        {/* Import Database CSV (Doctor Only) */}
                        {isDoctor && onOpenImportDatabase && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsProfileOpen(false);
                              onOpenImportDatabase();
                            }}
                            className="w-full flex items-center justify-between p-2.5 sm:p-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-sky-50/70 dark:hover:bg-sky-950/40 hover:text-sky-700 dark:hover:text-sky-300 transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 sm:w-7 sm:h-7 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-sky-100 dark:group-hover:bg-sky-900/60 flex items-center justify-center text-slate-500 group-hover:text-sky-600 dark:text-slate-400 dark:group-hover:text-sky-400 transition-colors">
                                <Database className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                              </div>
                              <div className="text-left rtl:text-right">
                                <div className="font-bold leading-tight text-xs">{t.importDatabase}</div>
                                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                                  {t.uploadCsvFile}
                                </div>
                              </div>
                            </div>
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                              CSV
                            </span>
                          </button>
                        )}

                        {/* Theme Mode Toggle Row */}
                        <div className="flex items-center justify-between p-2.5 sm:p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 sm:w-7 sm:h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                              {currentTheme === "dark" ? (
                                <Moon className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-sky-400" />
                              ) : (
                                <Sun className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-amber-500" />
                              )}
                            </div>
                            <div className="text-left rtl:text-right">
                              <div className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-tight">
                                {t.theme}
                              </div>
                              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                                {currentTheme === "dark" ? t.darkMode : t.lightMode}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              currentTheme === "dark" ? "bg-sky-600" : "bg-slate-200"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                currentTheme === "dark"
                                  ? "translate-x-4 rtl:-translate-x-4"
                                  : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>

                        {/* Language Selection */}
                        <div className="p-2.5 sm:p-2 rounded-2xl sm:rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80">
                          <div className="flex items-center justify-between mb-1.5 px-0.5">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                              <Globe className="w-3.5 h-3.5 text-sky-500" />
                              <span>{t.language}</span>
                            </div>
                            <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                              {lang.toUpperCase()}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-1 bg-slate-200/60 dark:bg-slate-900 p-1 rounded-xl">
                            {[
                              { code: "ku", label: "کوردی", flag: "☀️" },
                              { code: "ar", label: "العربية", flag: "🇮🇶" },
                              { code: "en", label: "English", flag: "🇬🇧" },
                            ].map((item) => (
                              <button
                                key={item.code}
                                type="button"
                                onClick={() => setLang(item.code as Language)}
                                className={`flex items-center justify-center gap-1 py-2 sm:py-1.5 px-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  lang === item.code
                                    ? "bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs scale-[1.02]"
                                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/40 dark:hover:bg-slate-800/40"
                                }`}
                              >
                                <span className="text-xs">{item.flag}</span>
                                <span className="text-[11px] truncate">{item.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Sign Out */}
                      {handleSignOutClick && (
                        <div className="pt-2 sm:pt-1.5 mt-2 sm:mt-1.5 border-t border-slate-100 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={() => {
                              setIsProfileOpen(false);
                              handleSignOutClick();
                            }}
                            className="w-full flex items-center gap-2.5 p-2.5 sm:p-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          >
                            <div className="w-8 h-8 sm:w-7 sm:h-7 rounded-lg bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-500">
                              <LogOut className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                            </div>
                            <span>{t.signOut}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Floating Island Bottom Navigation */}
      <div
        className={`sm:hidden fixed bottom-3 inset-x-4 ${
          isDoctor ? "max-w-[280px]" : "max-w-[170px]"
        } mx-auto z-40 transition-all`}
      >
        <nav
          aria-label="Mobile Navigation"
          className="w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-1.5 ring-1 ring-black/5 dark:ring-white/5"
        >
          <div className={`grid ${isDoctor ? "grid-cols-4" : "grid-cols-2"} items-center gap-1`}>
            {/* Tab 1: Patients */}
            <button
              type="button"
              onClick={() => onTabChange("patients")}
              title={t.tabPatients}
              aria-label={t.tabPatients}
              className={`relative flex items-center justify-center py-2.5 px-1.5 rounded-xl transition-all duration-200 cursor-pointer ${
                activeTab === "patients"
                  ? "bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 shadow-2xs"
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Users
                  className={`w-5 h-5 transition-transform duration-200 ${
                    activeTab === "patients" ? "scale-110 stroke-[2.4]" : "stroke-[2]"
                  }`}
                />
                {patientCount > 0 && (
                  <span className="absolute -top-2 -right-3 rtl:-right-auto rtl:-left-3 px-1.5 min-w-[16px] h-4 flex items-center justify-center rounded-full text-[8.5px] font-black bg-sky-600 text-white ring-2 ring-white dark:ring-slate-900 shadow-xs pointer-events-none">
                    {patientCount > 99 ? "99+" : patientCount}
                  </span>
                )}
              </div>
            </button>

            {/* Tab 2: Appointments */}
            <button
              type="button"
              onClick={() => onTabChange("appointments")}
              title={t.tabAppointments}
              aria-label={t.tabAppointments}
              className={`relative flex items-center justify-center py-2.5 px-1.5 rounded-xl transition-all duration-200 cursor-pointer ${
                activeTab === "appointments"
                  ? "bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 shadow-2xs"
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <div className="relative flex items-center justify-center">
                <CalendarClock
                  className={`w-5 h-5 transition-transform duration-200 ${
                    activeTab === "appointments" ? "scale-110 stroke-[2.4]" : "stroke-[2]"
                  }`}
                />
                {appointmentCount > 0 && (
                  <span className="absolute -top-2 -right-3 rtl:-right-auto rtl:-left-3 px-1.5 min-w-[16px] h-4 flex items-center justify-center rounded-full text-[8.5px] font-black bg-sky-600 text-white ring-2 ring-white dark:ring-slate-900 shadow-xs pointer-events-none">
                    {appointmentCount > 99 ? "99+" : appointmentCount}
                  </span>
                )}
              </div>
            </button>

            {/* Tab 3: Materials (Doctor Only) */}
            {isDoctor && (
              <button
                type="button"
                onClick={() => onTabChange("materials")}
                title={t.tabMaterials}
                aria-label={t.tabMaterials}
                className={`relative flex items-center justify-center py-2.5 px-1.5 rounded-xl transition-all duration-200 cursor-pointer ${
                  activeTab === "materials"
                    ? "bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 shadow-2xs"
                    : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Package
                    className={`w-5 h-5 transition-transform duration-200 ${
                      activeTab === "materials" ? "scale-110 stroke-[2.4]" : "stroke-[2]"
                    }`}
                  />
                  {materialCount > 0 && (
                    <span className="absolute -top-2 -right-3 rtl:-right-auto rtl:-left-3 px-1.5 min-w-[16px] h-4 flex items-center justify-center rounded-full text-[8.5px] font-black bg-sky-600 text-white ring-2 ring-white dark:ring-slate-900 shadow-xs pointer-events-none">
                      {materialCount > 99 ? "99+" : materialCount}
                    </span>
                  )}
                </div>
              </button>
            )}

            {/* Tab 4: Reports (Doctor Only) */}
            {isDoctor && (
              <button
                type="button"
                onClick={() => onTabChange("reports")}
                title={t.tabReports}
                aria-label={t.tabReports}
                className={`relative flex items-center justify-center py-2.5 px-1.5 rounded-xl transition-all duration-200 cursor-pointer ${
                  activeTab === "reports"
                    ? "bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 shadow-2xs"
                    : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <TrendingUp
                    className={`w-5 h-5 transition-transform duration-200 ${
                      activeTab === "reports" ? "scale-110 stroke-[2.4]" : "stroke-[2]"
                    }`}
                  />
                </div>
              </button>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}
