"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { translations } from "@/translations";

type Language = "ko" | "en";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: keyof typeof translations) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("ko");

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "ko" ? "en" : "ko"));
  };

  const t = (key: keyof typeof translations): string => {
    if (!translations[key]) return key as string;
    return translations[key][language];
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
