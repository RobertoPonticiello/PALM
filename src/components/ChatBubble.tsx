import { useEffect, useState } from "react";
import { ChatPanel } from "./ChatPanel";

export const ChatBubble = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent).detail as { prefill?: string } | undefined;
      if (detail?.prefill) {
        // Stash prefill in sessionStorage so the panel can pick it up on mount
        sessionStorage.setItem("palm:chat-prefill", detail.prefill);
      }
      setOpen(true);
    };
    window.addEventListener("palm:open-chat", onOpen);
    // Backwards-compat with older event name
    window.addEventListener("lulla:open-chat", onOpen);
    return () => {
      window.removeEventListener("palm:open-chat", onOpen);
      window.removeEventListener("lulla:open-chat", onOpen);
    };
  }, []);

  if (!open) return null;
  return <ChatPanel onClose={() => setOpen(false)} />;
};
