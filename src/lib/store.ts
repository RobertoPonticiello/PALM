/**
 * Lightweight per-profile log + medication store, persisted to localStorage.
 * Subscribers re-render via `useStore` (uses useSyncExternalStore).
 */
import type { ProfileId } from "./mockData";

const KEY = "palm.store.v1";

export type LogEntry = {
  id: string;
  ts: number;
  kind: "weight" | "feed" | "diaper" | "spitup" | "med";
  detail: string;
};

export type Medication = {
  id: string;
  name: string;
  dose?: string;
  schedule?: string;
  addedAt: number;
  source: "chat" | "log" | "manual";
};

export type ChecklistOverrides = Record<string, boolean>;

export type Appointment = {
  id: string;
  title: string;
  date: string; // human-readable, e.g. "23 mag 2026"
  time: string; // e.g. "10:30"
  icon: string;
  color: "pastel-blue" | "pastel-mint" | "pastel-lavender";
  location?: string;
  prep?: string;
  addedAt: number;
  source: "chat" | "manual";
};

export type ProfileStore = {
  logs: LogEntry[];
  meds: Medication[];
  checklist: ChecklistOverrides;
  appointments: Appointment[];
};

export type StoreShape = Record<ProfileId, ProfileStore>;

const empty = (): ProfileStore => ({ logs: [], meds: [], checklist: {}, appointments: [] });

let state: StoreShape = load();
const listeners = new Set<() => void>();

function load(): StoreShape {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(KEY) : null;
    if (!raw) return { matteo: empty(), chiara: empty(), riccardo: empty(), sofia: empty() };
    const parsed = JSON.parse(raw) as Partial<StoreShape>;
    return {
      matteo: { ...empty(), ...(parsed.matteo ?? {}) },
      chiara: { ...empty(), ...(parsed.chiara ?? {}) },
      riccardo: { ...empty(), ...(parsed.riccardo ?? {}) },
      sofia: { ...empty(), ...(parsed.sofia ?? {}) },
    };
  } catch {
    return { matteo: empty(), chiara: empty(), riccardo: empty(), sofia: empty() };
  }
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* noop */
  }
  listeners.forEach((l) => l());
}

export function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function getSnapshot(): StoreShape {
  return state;
}

export function getProfile(id: ProfileId): ProfileStore {
  return state[id];
}

function update(id: ProfileId, patch: Partial<ProfileStore>) {
  state = { ...state, [id]: { ...state[id], ...patch } };
  persist();
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function formatLogTime(ts: number): string {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, "0")}:${d
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

export function addLog(
  id: ProfileId,
  kind: LogEntry["kind"],
  detail: string,
): LogEntry {
  const entry: LogEntry = { id: uid(), ts: Date.now(), kind, detail };
  update(id, { logs: [entry, ...state[id].logs].slice(0, 50) });
  return entry;
}

export function addMedication(
  id: ProfileId,
  name: string,
  opts: { dose?: string; schedule?: string; source?: Medication["source"] } = {},
): Medication {
  const existing = state[id].meds.find(
    (m) => m.name.toLowerCase() === name.toLowerCase(),
  );
  if (existing) return existing;
  const med: Medication = {
    id: uid(),
    name,
    dose: opts.dose,
    schedule: opts.schedule,
    addedAt: Date.now(),
    source: opts.source ?? "manual",
  };
  update(id, { meds: [...state[id].meds, med] });
  addLog(id, "med", `${name}${opts.dose ? ` · ${opts.dose}` : ""} · aggiunta alle terapie`);
  return med;
}

export function removeMedication(id: ProfileId, medId: string) {
  update(id, { meds: state[id].meds.filter((m) => m.id !== medId) });
}

export function addAppointment(
  id: ProfileId,
  appt: Omit<Appointment, "id" | "addedAt" | "source"> & { source?: Appointment["source"] },
): Appointment {
  const entry: Appointment = {
    id: uid(),
    addedAt: Date.now(),
    source: appt.source ?? "manual",
    title: appt.title,
    date: appt.date,
    time: appt.time,
    icon: appt.icon || "📅",
    color: appt.color || "pastel-blue",
    location: appt.location,
    prep: appt.prep,
  };
  update(id, { appointments: [...state[id].appointments, entry] });
  addLog(id, "med", `Appuntamento aggiunto · ${appt.title} · ${appt.date} ${appt.time}`);
  return entry;
}

export function removeAppointment(id: ProfileId, apptId: string) {
  update(id, { appointments: state[id].appointments.filter((a) => a.id !== apptId) });
}

export function setChecklistDone(id: ProfileId, itemId: string, done: boolean) {
  update(id, { checklist: { ...state[id].checklist, [itemId]: done } });
}

export function getChecklistDone(
  id: ProfileId,
  itemId: string,
  fallback: boolean,
): boolean {
  const v = state[id].checklist[itemId];
  return typeof v === "boolean" ? v : fallback;
}

export function _resetAll() {
  state = { matteo: empty(), chiara: empty(), riccardo: empty(), sofia: empty() };
  persist();
}
