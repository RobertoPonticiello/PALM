import { useState } from "react";
import { Globe, Check } from "lucide-react";
import { languages } from "@/lib/mockData";
import { useLanguage, type LangCode } from "@/hooks/useLanguage";

export const LanguageSwitcher = () => {
  const [open, setOpen] = useState(false);
  const { lang, setLang } = useLanguage();
  const current = languages.find((l) => l.code === lang) ?? languages[0];
  const labelByLang: Record<LangCode, string> = {
    it: "IT",
    en: "EN",
    es: "ES",
    ar: "AR",
    zh: "ZH",
    ro: "RO",
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        data-palm-no-translate
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass shadow-soft text-sm font-medium"
        aria-label="Cambia lingua"
      >
        <span className="text-base">{current.flag}</span>
        <span className="text-xs">{labelByLang[lang]}</span>
        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      {open && (
        <div data-palm-no-translate className="fixed inset-0 z-[100] animate-fade-in flex items-end justify-center" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[416px] glass rounded-t-3xl p-4 pb-6 shadow-float animate-slide-up-fade max-h-[80vh] flex flex-col"
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-foreground/15" />
            <div className="font-display text-xl font-semibold mb-1">Scegli la tua lingua</div>
            <div className="text-xs text-muted-foreground mb-4">Palm parla la tua lingua, naturalmente.</div>
            <div className="space-y-1 overflow-y-auto scrollbar-hide -mx-1 px-1">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLang(l.code as LangCode);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-white/60 transition-colors"
                >
                  <span className="text-2xl">{l.flag}</span>
                  <span className="flex-1 text-left text-sm font-medium">{l.label}</span>
                  {lang === l.code && <Check className="h-5 w-5 text-primary" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
