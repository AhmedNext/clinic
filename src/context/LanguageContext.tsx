"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, Translations, translations } from "@/i18n/translations";
import { DirectionProvider } from "@radix-ui/react-direction";

interface LanguageContextType {
  lang: Language;
  language: Language;
  setLang: (lang: Language) => void;
  t: Translations;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  language: "en",
  setLang: () => {},
  t: translations.en,
  isRTL: false,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("clinic_language") as Language | null;
    if (saved && (saved === "en" || saved === "ar" || saved === "ku")) {
      setLangState(saved);
      applyDirection(saved);
    } else {
      applyDirection("en");
    }
    setMounted(true);
  }, []);

  const applyDirection = (selectedLang: Language) => {
    const isRtlLang = selectedLang === "ar" || selectedLang === "ku";
    if (typeof document !== "undefined") {
      document.documentElement.dir = isRtlLang ? "rtl" : "ltr";
      document.documentElement.lang = selectedLang;
    }
  };

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("clinic_language", newLang);
    applyDirection(newLang);
  };

  const isRTL = lang === "ar" || lang === "ku";
  const t = translations[lang] || translations.en;

  return (
    <LanguageContext.Provider value={{ lang, language: lang, setLang, t, isRTL }}>
      <DirectionProvider dir={isRTL ? "rtl" : "ltr"}>
        {children}
      </DirectionProvider>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
