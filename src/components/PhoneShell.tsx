import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { ChatBubble } from "./ChatBubble";
import { PalmChatBar } from "./PalmChatBar";
import { useLanguage } from "@/hooks/useLanguage";
import { useActiveProfile } from "@/hooks/useActiveProfile";

interface PhoneShellProps {
  children: ReactNode;
  showNav?: boolean;
  showChat?: boolean;
  background?: string;
}

export const PhoneShell = ({ children, showNav = true, showChat = true, background = "bg-background" }: PhoneShellProps) => {
  // Round 2: Arabic + RTL is enabled ONLY for the baby profile (Romeo).
  // For everything else we keep the LTR Italian layout.
  const { isRtl, lang } = useLanguage();
  const { id } = useActiveProfile();
  const rtl = isRtl && id === "matteo";
  return (
    <div
      className="min-h-screen w-full gradient-hero flex items-center justify-center p-0 md:p-6"
      dir={rtl ? "rtl" : "ltr"}
      lang={rtl ? lang : undefined}
    >
      {/* Phone frame */}
      <div className="relative mx-auto w-full max-w-[440px] md:max-w-[400px]">
        <div className="relative h-[100dvh] md:h-[860px] md:rounded-[3rem] md:border-[12px] md:border-foreground/90 md:shadow-float overflow-hidden">
          <div className={`relative h-full w-full ${background} overflow-hidden`}>
            {/* iOS notch (desktop) */}
            <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 h-7 w-32 rounded-b-3xl bg-foreground/90 z-50" />
            {/* Extra bottom padding so the floating Palm bar + nav don't cover content.
                When the nav/chat are hidden (full-screen flows like AddProfile) we drop
                the padding so sticky CTAs at the bottom of the page stay visible. */}
            <div className={`relative h-full overflow-y-auto scrollbar-hide ${showNav || showChat ? "pb-44" : "pb-6"}`}>
              {children}
            </div>
            {showChat && showNav && <PalmChatBar />}
            {showNav && <BottomNav />}
            {showChat && <ChatBubble />}
          </div>
        </div>
      </div>
    </div>
  );
};
