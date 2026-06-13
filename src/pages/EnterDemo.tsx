import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Activates the isolated demo mode (sticky via sessionStorage) and
 * forwards to the dashboard. Use this URL when the Lovable preview
 * iframe strips query strings (`?demo=1` doesn't survive its redirects).
 *
 *   /demo        → enable demo, then go to /dashboard
 *   /demo?off=1  → disable demo, then go to /dashboard
 */
export default function EnterDemo() {
  const nav = useNavigate();
  useEffect(() => {
    try {
      const off = new URLSearchParams(window.location.search).get("off") === "1";
      if (off) sessionStorage.removeItem("lulla:demo");
      else sessionStorage.setItem("lulla:demo", "1");
    } catch {}
    nav("/dashboard", { replace: true });
  }, [nav]);
  return null;
}