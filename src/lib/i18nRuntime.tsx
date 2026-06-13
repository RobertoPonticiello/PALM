import { type LangCode } from "@/hooks/useLanguage";
import { EN_MAP, EN_DICT } from "./i18nDict";

/**
 * Runtime IT → EN translator (STATIC ONLY).
 *
 * After repeated user reports of "text changing in real time", we removed
 * the AI-backed runtime translation. The flow is now:
 *
 *   1. EN_MAP (whole-string) lookup — instant, deterministic.
 *   2. EN_DICT (longest-substring) sweep — instant, deterministic.
 *   3. If nothing matched, the original Italian string stays in place.
 *      No queue, no fetch, no re-translation, no DOM flicker.
 *
 * A MutationObserver still translates new nodes that React mounts later
 * (route changes, modals, toasts), but every translation is synchronous,
 * so it happens in the same paint as the mount — no visible swap.
 */

const TRANSLATED = Symbol.for("palm.translatedNode");
const TRANSLATED_GEN = Symbol.for("palm.translatedGen");
const ATTR_TRANSLATED = "data-palm-tx";
const TRANSLATABLE_ATTRS = ["placeholder", "aria-label", "alt", "title"] as const;

let translationGen = 0;

// Purge prior AI-cache versions that contained hallucinated mappings
// (e.g. "pending results"). Safe to keep forever — it's a cheap removeItem.
try {
  localStorage.removeItem("palm.tx.cache.v1");
  localStorage.removeItem("palm.tx.cache.v2");
  localStorage.removeItem("palm.tx.cache.v3");
  localStorage.removeItem("palm.tx.pending.v1");
} catch { /* noop */ }

function translateString(input: string): string {
  if (!input) return input;
  const trimmed = input.trim();
  if (!trimmed) return input;
  const direct = EN_MAP[trimmed];
  if (direct !== undefined) {
    return input.replace(trimmed, direct);
  }
  // Substring sweep — longest matches win (EN_DICT is pre-sorted).
  let out = input;
  for (const [it, en] of EN_DICT) {
    if (it.length < 3) continue;
    if (out.includes(it)) {
      out = out.split(it).join(en);
    }
  }
  return out;
}

function shouldSkip(node: Node): boolean {
  let p: Node | null = node;
  while (p) {
    if (p.nodeType === Node.ELEMENT_NODE) {
      const el = p as Element;
      const tag = el.tagName;
      if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") return true;
      if (el.hasAttribute("data-palm-no-translate")) return true;
      if (el instanceof HTMLElement && el.isContentEditable) return true;
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) return true;
    }
    p = p.parentNode;
  }
  return false;
}

function translateTextNode(node: Text) {
  const w = node as Text & { [k: symbol]: string | number | undefined };
  const orig = node.nodeValue ?? "";
  if (!orig.trim()) return;
  if (w[TRANSLATED] === orig && w[TRANSLATED_GEN] === translationGen) return;
  if (shouldSkip(node)) return;
  const next = translateString(orig);
  if (next !== orig) {
    node.nodeValue = next;
  }
  w[TRANSLATED] = node.nodeValue ?? "";
  w[TRANSLATED_GEN] = translationGen;
}

function translateAttrs(el: Element) {
  if (shouldSkip(el)) return;
  for (const a of TRANSLATABLE_ATTRS) {
    const v = el.getAttribute(a);
    if (!v) continue;
    const cached = el.getAttribute(`${ATTR_TRANSLATED}-${a}`);
    if (cached === v) continue;
    const next = translateString(v);
    if (next !== v) {
      el.setAttribute(a, next);
      el.setAttribute(`${ATTR_TRANSLATED}-${a}`, next);
    } else {
      el.setAttribute(`${ATTR_TRANSLATED}-${a}`, v);
    }
  }
}

function walk(root: Node) {
  if (root.nodeType === Node.TEXT_NODE) {
    translateTextNode(root as Text);
    return;
  }
  if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
  if (root.nodeType === Node.ELEMENT_NODE) {
    const el = root as Element;
    if (el.tagName === "SCRIPT" || el.tagName === "STYLE" || el.tagName === "NOSCRIPT") return;
    if (el.hasAttribute?.("data-palm-no-translate")) return;
    if (el instanceof HTMLElement && el.isContentEditable) return;
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) return;
    translateAttrs(el);
  }
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let n: Node | null = walker.nextNode();
  while (n) {
    if (n.nodeType === Node.TEXT_NODE) translateTextNode(n as Text);
    else if (n.nodeType === Node.ELEMENT_NODE) translateAttrs(n as Element);
    n = walker.nextNode();
  }
}

let installed = false;
let observer: MutationObserver | null = null;
let langWatcherInstalled = false;

function install() {
  if (installed) return;
  installed = true;
  document.documentElement.setAttribute("lang", "en");
  walk(document.body);
  observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === "characterData" && m.target.nodeType === Node.TEXT_NODE) {
        translateTextNode(m.target as Text);
      } else if (m.type === "childList") {
        m.addedNodes.forEach((n) => walk(n));
      } else if (m.type === "attributes" && m.target.nodeType === Node.ELEMENT_NODE) {
        const el = m.target as Element;
        const aname = m.attributeName ?? "";
        if ((TRANSLATABLE_ATTRS as readonly string[]).includes(aname)) {
          el.removeAttribute(`${ATTR_TRANSLATED}-${aname}`);
          translateAttrs(el);
        }
      }
    }
  });
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: [...TRANSLATABLE_ATTRS],
  });
}

function uninstall() {
  if (!installed) return;
  observer?.disconnect();
  observer = null;
  installed = false;
  // Reload to restore original Italian source strings cleanly.
  window.location.reload();
}

function syncRuntime(lang: LangCode) {
  if (lang === "en") install();
  else if (installed) uninstall();
  else document.documentElement.setAttribute("lang", lang);
}

export function bootstrapI18nRuntime(lang: LangCode) {
  syncRuntime(lang);
  if (langWatcherInstalled) return;
  langWatcherInstalled = true;
  const onChange = (e: Event) => {
    const next = (e as CustomEvent<LangCode | undefined>).detail;
    syncRuntime(next ?? "it");
  };
  window.addEventListener("palm:lang-changed", onChange);
}

/**
 * Imperative translator — useful for code paths that build strings outside
 * the React render tree (toast.success, PDF generator, document.title…).
 */
export function tr(input: string, lang?: LangCode): string {
  const active = lang ?? (typeof window !== "undefined" ? (localStorage.getItem("palm.lang") as LangCode | null) : null);
  if (active !== "en") return input;
  return translateString(input);
}
