import matteoPhoto from "@/assets/avatar-matteo.jpg";
import chiaraPhoto from "@/assets/avatar-chiara.jpg";
import riccardoPhoto from "@/assets/avatar-riccardo.jpg";
import sofiaPhoto from "@/assets/avatar-sofia.jpg";
import type { ProfileId } from "./mockData";

export const profilePhotos: Record<ProfileId, string> = {
  matteo: matteoPhoto,
  chiara: chiaraPhoto,
  riccardo: riccardoPhoto,
  sofia: sofiaPhoto,
};