import { useEffect, useState } from "react";

export type LangCode = "it" | "en" | "es" | "ar" | "zh" | "ro";

const KEY = "palm.lang";
const VALID_LANGS: LangCode[] = ["it", "en", "es", "ar", "zh", "ro"];

export const RTL_LANGS: LangCode[] = ["ar"];

export const setLanguage = (code: LangCode) => {
  if (!VALID_LANGS.includes(code)) return;
  try {
    localStorage.setItem(KEY, code);
  } catch {
    /* noop */
  }
  window.dispatchEvent(new CustomEvent("palm:lang-changed", { detail: code }));
};

export const getLanguage = (): LangCode => {
  try {
    const v = localStorage.getItem(KEY) as LangCode | null;
    if (v && VALID_LANGS.includes(v)) return v;
  } catch {
    /* noop */
  }
  return "it";
};

/** Active language across the app, with live updates. */
export const useLanguage = () => {
  const [lang, setLang] = useState<LangCode>(getLanguage());

  useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent).detail as LangCode | undefined;
      if (detail) setLang(detail);
      else setLang(getLanguage());
    };
    window.addEventListener("palm:lang-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("palm:lang-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  return { lang, setLang: setLanguage, isRtl: RTL_LANGS.includes(lang) };
};