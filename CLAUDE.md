# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Palm** — "healthcare in your hands" — is a mobile-first, phone-frame clickable demo of a multi-profile family healthcare companion app, in **Italian**. Most data is mocked (see `src/lib/mockData.ts`); the only truly live feature is the **Palm AI chat**, which calls Supabase edge functions backed by the Lovable AI Gateway (`google/gemini-3-flash-preview`).

The app and the in-app AI assistant are both named **Palm**. An older name "Lulla" has been removed from the product but survives in some localStorage/sessionStorage keys (e.g. `lulla:demo`).

## Commands

Main app (Vite + React, run from repo root):

```bash
npm install          # bun.lockb also present; npm is the default for app scripts
npm run dev          # Vite dev server on http://localhost:8080
npm run build        # production build
npm run build:dev    # build in development mode (keeps lovable-tagger)
npm run lint         # ESLint over the repo
npm run preview      # serve the production build
npm test             # vitest run (jsdom + Testing Library)
npm run test:watch   # vitest watch mode
npx vitest run src/test/example.test.ts   # single file
npx vitest run -t "name of test"          # single test by name
```

Marketing video (separate sub-project in `remotion/`, uses **Bun + React 19**, its own `node_modules`):

```bash
cd remotion && bun install
bun run scripts/render.mjs   # renders the promo video via @remotion/renderer + headless chromium
```

Note: `remotion/CLAUDE.md` is a generic Bun starter template and does **not** describe this project — ignore it for app work.

## Architecture

### State: no store framework, three "ambient" settings + one data store

There is no Redux/Zustand. State is hand-rolled around `localStorage` + custom `window` events, each exposed as a hook that also listens to the `storage` event for cross-tab sync:

- **Active profile** — `useActiveProfile` / `palm.activeProfile` / `palm:profile-changed` event.
- **Language** — `useLanguage` / `palm.lang` / `palm:lang-changed` event.
- **Pregnancy mode** — `usePregnancyMode` / `palm.pregnancyMode` / `palm:pregnancy-changed` event (Chiara only).
- **Per-profile data store** — `src/lib/store.ts` (logs, meds, checklist, appointments) persisted to `palm.store.v1`, consumed via `useStore` / `useProfileStore` (`useSyncExternalStore`). Mutate it through the exported `addLog`/`addMedication`/`addAppointment`/`setChecklistDone` functions — they call `persist()` which both writes localStorage and notifies subscribers.

Changing the active profile/language/pregnancy mode re-renders most of the UI, so these three settings are the backbone of the app.

### Profiles

Four profiles, defined in `src/lib/mockData.ts`. **`ProfileId` values are `matteo | chiara | sofia | riccardo`** — note that the id **`matteo` renders as the baby "Romeo"** (legacy id from a former name; don't "fix" this mismatch). Roles: `chiara` (mother, the actual user), `matteo`/Romeo (NICU-graduate newborn), `sofia` (3yo toddler), `riccardo` (79yo father / geriatric).

`mockData.ts` is the large content file holding per-profile dashboards, documents, AI-extracted document summaries, doctor-facing reports, the curated educational-video catalog, and the bookable mock doctors. When adding profile-specific UI data, this is the file.

### Routing

`src/App.tsx` — flat `react-router-dom` routes. `/` is the marketing `Landing`; `/dashboard`, `/log`, `/documents`, `/report`, `/learn`, `/app` (ProfileSelect), `/add-profile`. `/checklist` exists but is intentionally **not** in `BottomNav` (order: Casa · Impara · Registra (FAB) · Docs · Report). `/demo` (`EnterDemo`) flips demo mode on and redirects to the dashboard. `@/` aliases `src/`.

### The AI chat (the real feature)

`src/components/ChatPanel.tsx` is the heart of the app and is large/intricate. It:

- Streams SSE from the `chat` edge function, **accumulates the full reply silently**, then splits it into 1–3 bubbles and types each out (this avoids the reflow bugs that earlier token-by-token rendering caused — keep this approach).
- Parses & executes inline **`[[ACTION:...]]` tags** the model emits (e.g. `[[ACTION:add_medication name="..." dose="..."]]`, `log_weight`, `log_feed`, `log_diaper`, `log_spitup`, `add_appointment`) to write into `src/lib/store.ts`. The tag grammar must stay in sync between `ACTIONS_GUIDE` in the edge function and `executeActionTags` here.
- Drives the multi-stage **Palm Doctor booking flow** (`chat → doctor-specialty → doctor-list → doctor-confirm → screening → doctor-booked`), the graceful-close escalation panel, the ER-prep ("PS-prep") card, and doctor-summary PDF (`src/lib/generateDoctorPdf.ts`).
- Surfaces **at most one educational video card per session**, gated by a thicket of regex heuristics over both user and assistant text (baby profile only). Read the comments before touching — many guards encode specific past bugs ("asked for doctor → got bath video").
- Renders the RAG "Fonte verificata" card from a custom SSE metadata event (see below).

**Demo mode** is isolated and sticky: `?demo=1` (or visiting `/demo`) sets `sessionStorage["lulla:demo"]`, which makes `send()` pass `demo: true` so the edge function swaps in a completely different system prompt (`DEMO_PROMPT`). `?demo=0` / `/demo?off=1` clears it. Default app behavior is untouched by demo mode.

### Supabase edge functions (`supabase/functions/`)

Deployed on Lovable Cloud; they read secrets from `Deno.env` (`LOVABLE_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`). The frontend calls them at `${VITE_SUPABASE_URL}/functions/v1/<name>`.

- **`chat`** — the big one. Builds the system prompt from `BASE_PROMPT + ACTIONS_GUIDE + <profile context> + MEDICAL_SKILL`, with special-cased `CHIARA_PREGNANCY_CONTEXT` and `DEMO_PROMPT`, plus an English-language override block. **Most of Palm's conversational behavior lives in these prompt constants** (tone rules, escalation gating, red-flag handling, video-trigger announcements, formatting rules) — behavior changes usually mean editing this file, not the React code. `MEDICAL_SKILL` (`supabase/functions/chat/medicalSkill.ts`) is the anti-hallucination / source-grounding layer appended to every non-demo prompt. The **AI provider is selectable** via `AI_PROVIDER` (`openai` | `lovable`): it defaults to OpenAI (`OPENAI_MODEL`, default `gpt-4o`, `temperature 0.2`) when `OPENAI_API_KEY` is set, else the Lovable gateway. Both speak the same OpenAI-style streaming format, so the `palm-meta` SSE event and the frontend parser are provider-agnostic.
- **`screening-questions`** — generates 4–5 pre-consult screening questions as JSON; has a hardcoded `fallback()`.
- **`translate`** — the only function with `verify_jwt = false` in `supabase/config.toml`.

### RAG ("controlled-source" knowledge base)

- Table `public.rag_chunks` + RPC `public.search_rag_chunks(...)` (`supabase/migrations/`). **Despite the pgvector migration, retrieval is keyword/tsvector**, not embeddings — the Lovable Gateway `/embeddings` endpoint isn't enabled on this workspace.
- In `chat/index.ts`: `RAG_SOURCES` holds `{ id, label, triggers (regex) }`. `pickRagSource` matches the recent conversation; on a hit, top chunks are injected under a `FONTE AUTORITATIVA` header instructing the model to cite "secondo la Linea Guida SIP 2023".
- **Streaming protocol**: the function emits a custom `event: palm-meta\ndata: {"rag":{...}}\n\n` SSE event **before** the model tokens; `ChatPanel` tracks `pendingEvent` to parse it and attaches the metadata to the first assistant bubble.
- Only source loaded: `SIP-2023-bronchiolitis`. Scope guard matters — prompt rules forbid citing SIP for things it doesn't cover (e.g. domiciliary nasal washes). To add a source: insert chunks with a new `source` slug, then add a `RAG_SOURCES` entry.

### Internationalization (two separate systems)

1. **Runtime IT→EN** (`src/lib/i18nRuntime.tsx`, bootstrapped in `main.tsx`): a `MutationObserver` that statically rewrites DOM text/attributes IT→EN via `EN_MAP`/`EN_DICT` from `src/lib/i18nDict.ts`. **Synchronous only** — an earlier AI-backed runtime translator was removed because it caused visible flicker; do not reintroduce async translation here.
2. **Profile-aware dictionary** (`src/lib/i18n.ts`, `useT(profileId)`): only the **Arabic-on-baby** path (`AR_ROMEO`, with RTL) is a real translation; every other (lang, profile) pair falls back to the Italian source string by design.

**Bilingual rule:** every new or changed user-visible string ships with its English translation in `src/lib/i18nDict.ts` in the same edit. Never add Italian-only copy.

### Design system — "Forest & Sage"

- All colors are HSL CSS variables in `src/index.css`, surfaced through Tailwind (`tailwind.config.ts`). **Use design tokens; never hardcode colors.**
- Custom utility classes (not Tailwind-generated) live in `src/index.css` `@layer utilities`: `glass`, `gradient-dawn/sunset/mint/sky/warm/baby/parent/hero`, `shadow-soft/card/float/glow`, `text-gradient`, `scrollbar-hide`. These gradient/shadow names are referenced as className strings throughout `mockData.ts` and components.
- **Legacy `pastel-*` token names (peach/pink/lavender/blue/mint/...) are remapped to sage/eucalyptus/cream/sand hues — the names no longer match the colors.**
- **Tailwind dynamic class names (`` bg-`${var}` ``) do not work** — always map to a static class string.
- Fonts: **Fraunces** (display/headings, `.font-display`) and **Plus Jakarta Sans** (body). Don't use Inter/Poppins.

## Conventions & gotchas

- `.lovable/memory/` contains hand-written project memory (characters, RAG notes, chat-empathy rules) worth reading for product intent.
- localStorage/sessionStorage keys are namespaced `palm.*`, except the legacy demo flag `lulla:demo`.
- Env files are gitignored. The client `.env` holds only `VITE_SUPABASE_*` (publishable key, client-safe — Vite ships every `VITE_*` var to the browser). **Server secrets** (`OPENAI_API_KEY`, `LOVABLE_API_KEY`, `AI_PROVIDER`, `OPENAI_MODEL`) must live in the edge-function environment / Supabase secrets — **never** in a `VITE_*` var. See `.env.example` and `supabase/functions/.env.example`.
- ESLint config disables `@typescript-eslint/no-unused-vars` and sets `react-refresh/only-export-components` to warn.
- `src/integrations/supabase/client.ts` and `types.ts` are generated by Lovable — avoid hand-editing.
