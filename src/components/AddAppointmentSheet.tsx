import { useState } from "react";
import { X } from "lucide-react";
import { addAppointment, type Appointment } from "@/lib/store";
import { useActiveProfile } from "@/hooks/useActiveProfile";
import { toast } from "@/hooks/use-toast";
import { useT } from "@/lib/i18n";

const ICONS = ["🩺", "👶", "💉", "🧪", "🤰", "🧠"];
const COLORS: Appointment["color"][] = ["pastel-blue", "pastel-mint", "pastel-lavender"];
const COLOR_CLASS: Record<Appointment["color"], string> = {
  "pastel-blue": "bg-pastel-blue",
  "pastel-mint": "bg-pastel-mint",
  "pastel-lavender": "bg-pastel-lavender",
};

const IT_MONTHS = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];

function formatDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${IT_MONTHS[m - 1]} ${y}`;
}

type Props = { onClose: () => void };

export const AddAppointmentSheet = ({ onClose }: Props) => {
  const { id } = useActiveProfile();
  const { t } = useT(id);
  const [title, setTitle] = useState("");
  const [dateIso, setDateIso] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [prep, setPrep] = useState("");
  const [icon, setIcon] = useState<string>(ICONS[0]);
  const [color, setColor] = useState<Appointment["color"]>("pastel-blue");

  const canSave = title.trim() && dateIso && time;

  const save = () => {
    if (!canSave) return;
    addAppointment(id, {
      title: title.trim(),
      date: formatDate(dateIso),
      time,
      icon,
      color,
      location: location.trim() || undefined,
      prep: prep.trim() || undefined,
      source: "manual",
    });
    toast({ title: t("Appuntamento aggiunto") });
    onClose();
  };

  return (
    <div
      data-palm-no-translate
      className="fixed inset-0 z-[100] animate-fade-in flex items-end justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[416px] glass rounded-t-3xl p-5 pb-7 shadow-float animate-slide-up-fade max-h-[88vh] flex flex-col"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-foreground/15" />
        <div className="flex items-start justify-between mb-1">
          <div>
            <div className="font-display text-xl font-semibold">{t("Nuovo appuntamento")}</div>
            <div className="text-xs text-muted-foreground">
              {t("Palm te lo ricorderà al momento giusto.")}
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-white/50 flex items-center justify-center"
            aria-label={t("Chiudi")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 overflow-y-auto scrollbar-hide -mx-1 px-1 mt-3">
          <label className="block">
            <div className="text-[11px] uppercase tracking-wider font-bold text-foreground/60 mb-1">{t("Titolo")}</div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("Es. Visita pediatra")}
              className="w-full rounded-2xl bg-white/70 px-4 py-3 text-sm shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <div className="text-[11px] uppercase tracking-wider font-bold text-foreground/60 mb-1">{t("Data")}</div>
              <input
                type="date"
                value={dateIso}
                onChange={(e) => setDateIso(e.target.value)}
                className="w-full rounded-2xl bg-white/70 px-3 py-3 text-sm shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </label>
            <label className="block">
              <div className="text-[11px] uppercase tracking-wider font-bold text-foreground/60 mb-1">{t("Ora")}</div>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-2xl bg-white/70 px-3 py-3 text-sm shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </label>
          </div>

          <label className="block">
            <div className="text-[11px] uppercase tracking-wider font-bold text-foreground/60 mb-1">{t("Luogo")}</div>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t("Es. Studio dr. Bianchi")}
              className="w-full rounded-2xl bg-white/70 px-4 py-3 text-sm shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </label>

          <label className="block">
            <div className="text-[11px] uppercase tracking-wider font-bold text-foreground/60 mb-1">{t("Da preparare")}</div>
            <textarea
              value={prep}
              onChange={(e) => setPrep(e.target.value)}
              rows={2}
              placeholder={t("Es. Portare ultimo esame del sangue")}
              className="w-full rounded-2xl bg-white/70 px-4 py-3 text-sm shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </label>

          <div>
            <div className="text-[11px] uppercase tracking-wider font-bold text-foreground/60 mb-1.5">{t("Icona")}</div>
            <div className="flex gap-2">
              {ICONS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setIcon(em)}
                  className={`h-11 w-11 rounded-2xl flex items-center justify-center text-xl shadow-soft transition-all ${
                    icon === em ? "bg-primary/15 ring-2 ring-primary/40 scale-105" : "bg-white/70"
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-wider font-bold text-foreground/60 mb-1.5">{t("Colore")}</div>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={c}
                  className={`h-10 w-10 rounded-2xl ${COLOR_CLASS[c]} shadow-soft transition-all ${
                    color === c ? "ring-2 ring-foreground/60 scale-105" : ""
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl bg-white/70 py-3 text-sm font-semibold shadow-soft"
          >
            {t("Annulla")}
          </button>
          <button
            onClick={save}
            disabled={!canSave}
            className="flex-[2] rounded-2xl bg-primary text-primary-foreground py-3 text-sm font-semibold shadow-soft disabled:opacity-50"
          >
            {t("Salva appuntamento")}
          </button>
        </div>
      </div>
    </div>
  );
};
