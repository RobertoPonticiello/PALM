import { useNavigate, useLocation } from "react-router-dom";
import { Home, Plus, GraduationCap, FileText, FileBarChart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useActiveProfile } from "@/hooks/useActiveProfile";
import { useT } from "@/lib/i18n";

const tabs = [
  { to: "/dashboard", icon: Home, label: "Casa" },
  { to: "/learn", icon: GraduationCap, label: "Impara" },
  { to: "/log", icon: Plus, label: "Registra", primary: true },
  { to: "/documents", icon: FileText, label: "Docs" },
  { to: "/report", icon: FileBarChart, label: "Report" },
];

export const BottomNav = () => {
  const nav = useNavigate();
  const loc = useLocation();
  const { id } = useActiveProfile();
  const { t } = useT(id);
  // The "+" Log button is only meaningful for the baby profile (Romeo).
  // For adult/geriatric profiles we hide it for now.
  const visibleTabs = id === "matteo" ? tabs : tabs.filter((t) => !t.primary);

  return (
    <nav className="absolute bottom-0 left-0 right-0 z-30 px-3 pb-3 pt-2">
      <div className="glass mx-auto flex h-16 items-center justify-around rounded-full px-2 shadow-float">
        {visibleTabs.map((tab) => {
          const active = loc.pathname === tab.to;
          const Icon = tab.icon;
          if (tab.primary) {
            return (
              <button
                key={tab.to}
                onClick={() => nav(tab.to)}
                aria-label={tab.label}
                className="-mt-8 flex h-16 w-16 items-center justify-center rounded-full gradient-sunset shadow-float transition-transform active:scale-90"
              >
              <Icon className="h-7 w-7 text-white" strokeWidth={2.5} />
              </button>
            );
          }
          return (
            <button
              key={tab.to}
              onClick={() => nav(tab.to)}
              aria-label={tab.label}
              className={cn(
                "flex h-12 w-12 flex-col items-center justify-center gap-0.5 rounded-2xl transition-all no-tap-highlight",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className={cn("h-5 w-5 transition-transform", active && "scale-110")} strokeWidth={active ? 2.5 : 2} />
              <span className={cn("text-[10px] font-medium", active && "font-semibold")}>{t(tab.label)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
