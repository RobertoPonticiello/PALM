import { useState } from "react";
import { Sparkles, ArrowUp } from "lucide-react";
import { useActiveProfile } from "@/hooks/useActiveProfile";
import { useT } from "@/lib/i18n";

/**
 * Floating "Chiedi a Palm" composer.
 * Sits above the BottomNav, on every screen, always one tap away.
 * Tapping it (or submitting) opens the full chat panel via the
 * `palm:open-chat` custom event the rest of the app already listens to.
 */
export const PalmChatBar = () => {
  const { id } = useActiveProfile();
  const { t } = useT(id);
  const [draft, setDraft] = useState("");

  const open = (prefill?: string) => {
    window.dispatchEvent(
      new CustomEvent("palm:open-chat", {
        detail: prefill ? { prefill } : undefined,
      }),
    );
    setDraft("");
  };

  return (
    // Positioned ABOVE the BottomNav AND above the floating "+" Plus button
    // (which sticks ~32px up from the nav). 112px of bottom offset leaves
    // enough breathing room so the two never touch.
    <div className="absolute left-0 right-0 bottom-[112px] z-30 px-4 pointer-events-none">
      <div className="relative pointer-events-auto animate-slide-up-fade">
        {/* Forest-green glow — deep + saturated so Palm clearly stands out
            against the cream background. Layered: crisp ring, mid halo,
            wide ambient bloom. */}
        <div className="absolute -inset-[2px] rounded-[2rem] bg-primary/40 blur-[6px] animate-pulse-soft pointer-events-none" />
        <div className="absolute -inset-[8px] rounded-[2.2rem] bg-primary/30 blur-xl animate-pulse-soft pointer-events-none" />
        <div className="absolute -inset-[14px] rounded-[2.4rem] bg-primary-glow/25 blur-3xl pointer-events-none" />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            open(draft.trim() || undefined);
          }}
          className="relative flex items-center gap-2 bg-white/95 backdrop-blur-md rounded-[1.6rem] pl-2.5 pr-1.5 py-1.5 shadow-float ring-2 ring-primary/50 border border-primary/20"
        >
          <button
            type="button"
            onClick={() => open()}
            aria-label={t("Chiedi a Palm")}
            className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-soft ring-1 ring-primary/40"
          >
            <Sparkles className="h-5 w-5 text-primary-foreground" strokeWidth={2.2} />
          </button>
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onFocus={(e) => {
              // We use the proper chat composer inside the panel for typing —
              // tapping here just opens the full chat experience.
              e.currentTarget.blur();
              open();
            }}
            placeholder={t("Chiedi a Palm")}
            className="flex-1 bg-transparent outline-none text-[15px] font-semibold text-primary placeholder:text-primary/60 min-w-0"
            aria-label={t("Chiedi a Palm")}
          />
          <button
            type="submit"
            aria-label="Invia"
            className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shrink-0 active:scale-90 transition-transform shadow-soft"
          >
            <ArrowUp className="h-4.5 w-4.5 text-primary-foreground" strokeWidth={2.4} />
          </button>
        </form>
      </div>
    </div>
  );
};