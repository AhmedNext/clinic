"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Clock,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  Filter,
  Search,
} from "lucide-react";
import { Appointment, AppointmentStatus } from "@/types/appointment";
import { Patient } from "@/types/patient";
import { DayAppointmentsModal } from "./DayAppointmentsModal";
import { useLanguage } from "@/context/LanguageContext";

interface AppointmentsViewProps {
  appointments: Appointment[];
  patients: Patient[];
  onAddAppointment: (data: Omit<Appointment, "id" | "createdAt">) => void;
  onToggleStatus: (id: string, newStatus: AppointmentStatus) => void;
  onDeleteAppointment: (id: string) => void;
}

export function AppointmentsView({
  appointments,
  patients,
  onAddAppointment,
  onToggleStatus,
  onDeleteAppointment,
}: AppointmentsViewProps) {
  const { t } = useLanguage();
  // Calendar month state (defaults to current date, or September 2026 if matching sample data)
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed (8 = Sept)

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const weekDayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
  };

  // Build grid of days for the full month
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days: {
      dateString: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }[] = [];

    // Format helper YYYY-MM-DD with zero-padding
    const toYMD = (year: number, monthIndex: number, day: number) => {
      const mStr = String(monthIndex + 1).padStart(2, "0");
      const dStr = String(day).padStart(2, "0");
      return `${year}-${mStr}-${dStr}`;
    };

    const now = new Date();
    const todayYMD = toYMD(now.getFullYear(), now.getMonth(), now.getDate());

    // 1. Previous month trailing days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonthIdx = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = toYMD(prevYear, prevMonthIdx, dayNum);

      days.push({
        dateString: dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateStr === todayYMD,
      });
    }

    // 2. Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = toYMD(currentYear, currentMonth, day);
      days.push({
        dateString: dateStr,
        dayNumber: day,
        isCurrentMonth: true,
        isToday: dateStr === todayYMD,
      });
    }

    // 3. Next month leading days (to complete 35 or 42 grid cells)
    const totalSlots = days.length <= 35 ? 35 : 42;
    const remainingSlots = totalSlots - days.length;
    for (let day = 1; day <= remainingSlots; day++) {
      const nextMonthIdx = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = toYMD(nextYear, nextMonthIdx, day);

      days.push({
        dateString: dateStr,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: dateStr === todayYMD,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Index appointments by dateString
  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    appointments.forEach((apt) => {
      const list = map.get(apt.date) || [];
      list.push(apt);
      map.set(apt.date, list);
    });
    return map;
  }, [appointments]);

  // Filtered month statistics
  const currentMonthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(
    2,
    "0"
  )}`;
  const currentMonthAppointments = appointments.filter((a) =>
    a.date.startsWith(currentMonthPrefix)
  );

  const completedCount = currentMonthAppointments.filter(
    (a) => a.status === "completed"
  ).length;
  const scheduledCount = currentMonthAppointments.filter(
    (a) => a.status === "scheduled"
  ).length;

  const selectedDateAppointments = selectedDate
    ? appointmentsByDate.get(selectedDate) || []
    : [];

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Month Navigation & Stats Header */}
      <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Month Selector */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/25">
            <CalendarIcon className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {monthNames[currentMonth]} {currentYear}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive Full Month Schedule • Click any day to book
            </p>
          </div>
        </div>

        {/* Quick Month Metrics & Nav Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Month Stats Badges */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {currentMonthAppointments.length} Booked
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-sky-600 dark:text-sky-400 font-medium">
              {scheduledCount} Scheduled
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              {completedCount} Done
            </span>
          </div>

          {/* Navigation buttons */}
          <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-50 dark:bg-slate-950">
            <button
              onClick={handlePrevMonth}
              aria-label="Previous Month"
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
            </button>
            <button
              onClick={handleGoToday}
              className="px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              aria-label="Next Month"
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>

          {/* Direct Book Today Button */}
          <button
            onClick={() => {
              const now = new Date();
              const todayStr = `${now.getFullYear()}-${String(
                now.getMonth() + 1
              ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
              setSelectedDate(todayStr);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/25 cursor-pointer transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Book Patient</span>
          </button>
        </div>
      </div>

      {/* --- CALENDAR BOARD --- */}
      <div className="w-full overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/60 text-center">
          {weekDayNames.map((day, idx) => (
            <div
              key={day}
              className={`py-3 text-[11px] sm:text-xs font-bold uppercase tracking-wider ${
                idx === 0 || idx === 6
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800/60 bg-slate-100/30 dark:bg-slate-950/20">
          {calendarDays.map((cell) => {
            const dayAppointments = appointmentsByDate.get(cell.dateString) || [];
            const hasAppointments = dayAppointments.length > 0;

            return (
              <div
                key={cell.dateString}
                onClick={() => setSelectedDate(cell.dateString)}
                className={`
                  min-h-[56px] sm:min-h-[120px] p-1 sm:p-2.5 transition-all duration-150 cursor-pointer flex flex-col justify-between group active:scale-[0.98]
                  ${
                    cell.isCurrentMonth
                      ? "bg-white dark:bg-slate-900 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20"
                      : "bg-slate-50/60 dark:bg-slate-950/40 opacity-45 hover:opacity-80"
                  }
                  ${cell.isToday ? "ring-2 ring-indigo-500 ring-inset" : ""}
                `}
              >
                {/* Day Number Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`
                      w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl flex items-center justify-center text-xs font-bold font-mono transition-transform group-hover:scale-105
                      ${
                        cell.isToday
                          ? "bg-indigo-600 text-white shadow-xs font-extrabold"
                          : cell.isCurrentMonth
                          ? "text-slate-800 dark:text-slate-200"
                          : "text-slate-400 dark:text-slate-600"
                      }
                    `}
                  >
                    {cell.dayNumber}
                  </span>

                  {hasAppointments && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                      {dayAppointments.length}
                    </span>
                  )}
                </div>

                {/* Mobile indicators (< sm): colored dots */}
                <div className="sm:hidden flex items-center justify-center gap-1 mt-1">
                  {dayAppointments.slice(0, 3).map((apt) => (
                    <span
                      key={apt.id}
                      className={`w-1.5 h-1.5 rounded-full ${
                        apt.status === "completed"
                          ? "bg-emerald-500"
                          : "bg-sky-500"
                      }`}
                    />
                  ))}
                  {dayAppointments.length > 3 && (
                    <span className="text-[8px] font-bold text-slate-400">
                      +
                    </span>
                  )}
                </div>

                {/* Desktop Appointment Previews (>= sm) */}
                <div className="hidden sm:flex mt-1 space-y-1 overflow-hidden flex-1 flex-col justify-start">
                  {dayAppointments.slice(0, 2).map((apt) => {
                    const isDone = apt.status === "completed";
                    return (
                      <div
                        key={apt.id}
                        className={`text-[10px] sm:text-[11px] px-1.5 py-1 rounded-lg border font-medium truncate flex items-center justify-between gap-1 shadow-2xs ${
                          isDone
                            ? "bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60 line-through"
                            : "bg-indigo-50/90 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 border-indigo-200/80 dark:border-indigo-800/60"
                        }`}
                        title={`${apt.patientName} (${apt.time}) - ${apt.phone}`}
                      >
                        <span className="truncate font-semibold">
                          {apt.patientName}
                        </span>
                        <span className="text-[9px] opacity-75 font-mono flex-shrink-0">
                          {apt.time.split(" ")[0]}
                        </span>
                      </div>
                    );
                  })}

                  {dayAppointments.length > 2 && (
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 pl-1">
                      +{dayAppointments.length - 2} more
                    </span>
                  )}
                </div>

                {/* Subtle Hover Action prompt */}
                <div className="hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity pt-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 items-center justify-end">
                  <span>+ Book</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Appointments Modal */}
      {selectedDate && (
        <DayAppointmentsModal
          isOpen={Boolean(selectedDate)}
          dateString={selectedDate}
          appointments={selectedDateAppointments}
          existingPatients={patients}
          onClose={() => setSelectedDate(null)}
          onAddAppointment={onAddAppointment}
          onToggleStatus={onToggleStatus}
          onDeleteAppointment={onDeleteAppointment}
        />
      )}
    </div>
  );
}
