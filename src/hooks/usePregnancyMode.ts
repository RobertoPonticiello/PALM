import { useEffect, useState } from "react";

const KEY = "palm.pregnancyMode";

export const getPregnancyMode = (): boolean => {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};

export const setPregnancyMode = (on: boolean) => {
  try {
    if (on) localStorage.setItem(KEY, "1");
    else localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
  window.dispatchEvent(new CustomEvent("palm:pregnancy-changed", { detail: on }));
};

/** Pregnancy-mode toggle, currently scoped to Chiara only. */
export const usePregnancyMode = () => {
  const [on, setOn] = useState<boolean>(getPregnancyMode());
  useEffect(() => {
    const onChange = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (typeof d === "boolean") setOn(d);
      else setOn(getPregnancyMode());
    };
    window.addEventListener("palm:pregnancy-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("palm:pregnancy-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);
  return { on, toggle: () => setPregnancyMode(!on), set: setPregnancyMode };
};