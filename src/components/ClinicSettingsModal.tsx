"use client";

import React, { useState, useEffect } from "react";
import { X, Building2, User, Phone, MapPin, Check, Sparkles, Database } from "lucide-react";
import { useClinicSettings } from "@/context/ClinicSettingsContext";
import { useLanguage } from "@/context/LanguageContext";

interface ClinicSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenImportDatabase?: () => void;
}

export function ClinicSettingsModal({ isOpen, onClose, onOpenImportDatabase }: ClinicSettingsModalProps) {
  const { t } = useLanguage();
  const { settings, updateSettings } = useClinicSettings();

  const [clinicName, setClinicName] = useState(settings.clinicName);
  const [doctorName, setDoctorName] = useState(settings.doctorName);
  const [phone, setPhone] = useState(settings.phone || "");
  const [address, setAddress] = useState(settings.address || "");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setClinicName(settings.clinicName);
      setDoctorName(settings.doctorName);
      setPhone(settings.phone || "");
      setAddress(settings.address || "");
      setIsSaved(false);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      clinicName: clinicName.trim() || "Dental Clinic",
      doctorName: doctorName.trim() || "Doctor",
      phone: phone.trim(),
      address: address.trim(),
    });
    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-none">
                {t.clinicSettings}
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {t.editClinicProfile}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t.clinicName}
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                placeholder="e.g. Al-Noor Dental Clinic"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t.doctorName}
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                placeholder="e.g. Dr. Ahmed"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t.clinicPhone}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="+964 750 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t.clinicAddress}
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. City Center, 60m Street"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          </div>

          {/* Database Import & Export Section */}
          {onOpenImportDatabase && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenImportDatabase();
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/80 bg-emerald-50/60 dark:bg-emerald-950/40 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{t.importDatabase}</span>
                </div>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">CSV</span>
              </button>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>{t.settingsSaved}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t.save}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
