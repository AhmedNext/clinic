"use client";

import React, { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Language } from "@/i18n/translations";

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const languages: { code: Language; name: string; nativeName: string; flag: string }[] = [
    { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
    { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇮🇶" },
    { code: "ku", name: "Kurdish", nativeName: "کوردی (سۆرانی)", flag: "☀️" },
  ];

  const current = languages.find((l) => l.code === lang) || languages[0];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        title="Change clinic language"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-2xs transition-all cursor-pointer active:scale-95 group"
      >
        <Globe className="w-3.5 h-3.5 text-indigo-500 group-hover:rotate-45 transition-transform duration-300" />
        <span className="hidden sm:inline font-mono uppercase text-[11px] tracking-wider">
          {current.code.toUpperCase()}
        </span>
        <span className="sm:hidden text-xs">{current.flag}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-48 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
            Language • زمان • اللغة
          </div>
          {languages.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => {
                setLang(l.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold transition-colors cursor-pointer ${
                lang === l.code
                  ? "bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-700 dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{l.flag}</span>
                <span>{l.nativeName}</span>
              </div>
              {lang === l.code && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
