"use client";

import { ClinicLogo } from "./ClinicLogo";
import { Plus, Users, CalendarClock, ShieldCheck, LogOut, TrendingUp, Package, UserPlus, Building2 } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useClinicSettings } from "@/context/ClinicSettingsContext";

interface HeaderProps {
  activeTab: "patients" | "appointments" | "materials" | "reports";
  onTabChange: (tab: "patients" | "appointments" | "materials" | "reports") => void;
  onOpenAddModal: () => void;
  patientCount: number;
  appointmentCount: number;
  materialCount?: number;
  onOpenStaffModal?: () => void;
  onOpenClinicSettings?: () => void;
  onSignOut?: () => void;
}

export function Header({
  activeTab,
  onTabChange,
  onOpenAddModal,
  patientCount,
  appointmentCount,
  materialCount = 0,
  onOpenStaffModal,
  onOpenClinicSettings,
  onSignOut,
}: HeaderProps) {
  const { t } = useLanguage();
  const { isDoctor, userName, badgeLabel, signOut } = useAuth();
  const { settings } = useClinicSettings();

  const handleSignOutClick = onSignOut || signOut;

  const displayName = isDoctor
    ? settings.clinicName || userName || t.doctorTitle
    : userName || t.receptionistTitle;

  return (
    <>
      {/* Top Header: Brand Logos + Action Logos */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md transition-colors shadow-2xs">
        <div className="w-full px-3 sm:px-6 xl:px-10">
          <div className="h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
            {/* Logo, Brand & Role Badge */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div
                onClick={isDoctor ? onOpenClinicSettings : undefined}
                className={`relative group flex-shrink-0 ${isDoctor ? "cursor-pointer" : ""}`}
                title={isDoctor ? t.clinicSettings : undefined}
              >
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl p-0.5 bg-gradient-to-tr from-indigo-500 via-violet-500 to-cyan-400 shadow-md shadow-indigo-500/25 ring-2 ring-indigo-500/20 transition-all duration-300 group-hover:scale-105">
                  <div className="w-full h-full rounded-[10px] sm:rounded-[14px] bg-gradient-to-b from-slate-800 to-slate-950 overflow-hidden relative flex items-end justify-center">
                    <ClinicLogo className="w-full h-full p-0.5 drop-shadow-sm" />
                  </div>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-500 border-2 border-white dark:border-slate-950 rounded-full shadow-xs ring-1 ring-emerald-400/50 flex items-center justify-center">
                  <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
                  <h1 className="text-sm sm:text-base lg:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none truncate">
                    {displayName}
                  </h1>

                  {/* Role Badge (e.g. 'دکتۆر / Doctor' or 'سکرتێر / Receptionist') */}
                  <span
                    title={isDoctor ? t.roleDoctorDesc : t.roleSecretaryDesc}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold border shadow-2xs whitespace-nowrap flex-shrink-0 transition-all ${
                      isDoctor
                        ? "bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200/90 dark:border-indigo-800"
                        : "bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200/90 dark:border-amber-800"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isDoctor ? "bg-indigo-500" : "bg-amber-500"
                      } animate-pulse`}
                    />
                    <span>{badgeLabel}</span>
                  </span>

                  {/* Doctor verified badge on desktop */}
                  {isDoctor && (
                    <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex-shrink-0">
                      <ShieldCheck className="w-3 h-3 text-indigo-500" />
                      {t.clinicPro}
                    </span>
                  )}

                  {/* Live cloud sync indicator */}
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex-shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {t.activeCloud}
                  </span>
                </div>
                <p className="hidden sm:block text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate mt-0.5">
                  {isDoctor
                    ? settings.doctorName
                      ? `${settings.doctorName} • ${t.clinicSubtitle}`
                      : t.clinicSubtitle
                    : t.roleSecretaryDesc}
                </p>
              </div>
            </div>

            {/* Desktop Center Navigation Tabs (Materials & Reports hidden for Secretary) */}
            <nav className="hidden sm:flex items-center p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              {/* Tab: Patients (Allowed for both Doctor and Secretary) */}
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

              {/* Tab: Appointments (Allowed for both Doctor and Secretary) */}
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

              {/* Tab: Materials (Doctor Only - MUST HIDE for Secretary) */}
              {isDoctor && (
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
              )}

              {/* Tab: Reports (Doctor Only - MUST HIDE for Secretary) */}
              {isDoctor && (
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
              )}
            </nav>

            {/* Right Controls: Staff Management, Clinic Settings, Add Patient, Role Preview, Language, Theme, Logout */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {/* Doctor Control: Staff & Secretary Management */}
              {isDoctor && onOpenStaffModal && (
                <button
                  type="button"
                  onClick={onOpenStaffModal}
                  title={t.manageStaff}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border border-amber-200/90 dark:border-amber-800/80 bg-amber-50/80 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 shadow-2xs transition-all cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5 text-amber-500" />
                  <span className="hidden md:inline">{t.manageStaff}</span>
                </button>
              )}

              {/* Doctor Control: Clinic Settings (White-label customization) */}
              {isDoctor && onOpenClinicSettings && (
                <button
                  type="button"
                  onClick={onOpenClinicSettings}
                  title={t.clinicSettings}
                  className="hidden sm:flex w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all cursor-pointer items-center justify-center flex-shrink-0"
                >
                  <Building2 className="w-4 h-4" />
                </button>
              )}

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

              {handleSignOutClick && (
                <button
                  onClick={handleSignOutClick}
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

      {/* Mobile Floating Island Bottom Navigation */}
      <div
        className={`sm:hidden fixed bottom-3 inset-x-4 ${
          isDoctor ? "max-w-[280px]" : "max-w-[170px]"
        } mx-auto z-40 transition-all`}
      >
        <nav
          aria-label="Mobile Navigation"
          className="w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-2xl shadow-indigo-950/20 p-1.5 ring-1 ring-black/5 dark:ring-white/5"
        >
          <div className={`grid ${isDoctor ? "grid-cols-4" : "grid-cols-2"} items-center gap-1`}>
            {/* Tab 1: Patients (Doctor & Secretary) */}
            <button
              type="button"
              onClick={() => onTabChange("patients")}
              title={t.tabPatients}
              aria-label={t.tabPatients}
              className={`relative flex items-center justify-center py-2.5 px-1.5 rounded-xl transition-all duration-200 cursor-pointer ${
                activeTab === "patients"
                  ? "bg-gradient-to-b from-indigo-50 to-indigo-100/70 dark:from-indigo-950/80 dark:to-indigo-900/40 text-indigo-600 dark:text-indigo-400 shadow-2xs"
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
                  <span className="absolute -top-1.5 -right-2 rtl:-right-auto rtl:-left-2 px-1 min-w-[15px] h-[15px] flex items-center justify-center rounded-full text-[9px] font-black bg-indigo-600 text-white ring-2 ring-white dark:ring-slate-900 shadow-xs">
                    {patientCount > 99 ? "99+" : patientCount}
                  </span>
                )}
              </div>
            </button>

            {/* Tab 2: Appointments (Doctor & Secretary) */}
            <button
              type="button"
              onClick={() => onTabChange("appointments")}
              title={t.tabAppointments}
              aria-label={t.tabAppointments}
              className={`relative flex items-center justify-center py-2.5 px-1.5 rounded-xl transition-all duration-200 cursor-pointer ${
                activeTab === "appointments"
                  ? "bg-gradient-to-b from-indigo-50 to-indigo-100/70 dark:from-indigo-950/80 dark:to-indigo-900/40 text-indigo-600 dark:text-indigo-400 shadow-2xs"
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
                  <span className="absolute -top-1.5 -right-2 rtl:-right-auto rtl:-left-2 px-1 min-w-[15px] h-[15px] flex items-center justify-center rounded-full text-[9px] font-black bg-indigo-600 text-white ring-2 ring-white dark:ring-slate-900 shadow-xs">
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
                    ? "bg-gradient-to-b from-indigo-50 to-indigo-100/70 dark:from-indigo-950/80 dark:to-indigo-900/40 text-indigo-600 dark:text-indigo-400 shadow-2xs"
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
                    <span className="absolute -top-1.5 -right-2 rtl:-right-auto rtl:-left-2 px-1 min-w-[15px] h-[15px] flex items-center justify-center rounded-full text-[9px] font-black bg-indigo-600 text-white ring-2 ring-white dark:ring-slate-900 shadow-xs">
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
                    ? "bg-gradient-to-b from-indigo-50 to-indigo-100/70 dark:from-indigo-950/80 dark:to-indigo-900/40 text-indigo-600 dark:text-indigo-400 shadow-2xs"
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
