import { createContext, useContext, useState, ReactNode } from "react";

export type Locale = "it" | "en";

const LangContext = createContext<{
  locale: Locale;
  setLocale: (l: Locale) => void;
} | null>(null);

export const LandingLangProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window === "undefined") return "it";
    const saved = localStorage.getItem("palm-landing-lang");
    if (saved === "it" || saved === "en") return saved;
    return navigator.language?.toLowerCase().startsWith("en") ? "en" : "it";
  });
  const update = (l: Locale) => {
    setLocale(l);
    if (typeof window !== "undefined") localStorage.setItem("palm-landing-lang", l);
  };
  return (
    <LangContext.Provider value={{ locale, setLocale: update }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLandingLang = () => {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLandingLang must be used inside LandingLangProvider");
  return ctx;
};
