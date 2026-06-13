import { useSyncExternalStore } from "react";
import {
  subscribe,
  getSnapshot,
  getProfile,
  type ProfileStore,
} from "@/lib/store";
import type { ProfileId } from "@/lib/mockData";

export const useStore = () =>
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

export const useProfileStore = (id: ProfileId): ProfileStore => {
  useStore();
  return getProfile(id);
};
