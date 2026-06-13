import { useEffect, useState } from "react";
import { ProfileId, profiles, profileOrder } from "@/lib/mockData";

const KEY = "palm.activeProfile";

export const setActiveProfile = (id: ProfileId) => {
  try {
    localStorage.setItem(KEY, id);
  } catch {
    /* noop */
  }
  window.dispatchEvent(new CustomEvent("palm:profile-changed", { detail: id }));
};

export const getActiveProfile = (): ProfileId => {
  try {
    const v = localStorage.getItem(KEY) as ProfileId | null;
    if (v && profileOrder.includes(v)) return v;
  } catch {
    /* noop */
  }
  return "matteo";
};

export const useActiveProfile = () => {
  const [id, setId] = useState<ProfileId>(getActiveProfile());

  useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent).detail as ProfileId | undefined;
      if (detail) setId(detail);
      else setId(getActiveProfile());
    };
    window.addEventListener("palm:profile-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("palm:profile-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  return { id, profile: profiles[id], setProfile: setActiveProfile };
};
