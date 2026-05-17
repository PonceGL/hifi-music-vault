import type { LucideIcon } from "lucide-react";
import { Library, Users, Disc3, ListMusic } from "lucide-react";
import { APP_ROUTES } from "@/constants/appRoutes";

export interface TabItem {
  href: string;
  icon: LucideIcon;
  label: string;
}

export const TAB_ITEMS: readonly TabItem[] = [
  { href: APP_ROUTES.library, icon: Library, label: "Biblioteca" },
  { href: APP_ROUTES.artists, icon: Users, label: "Artistas" },
  { href: APP_ROUTES.albums, icon: Disc3, label: "Álbumes" },
  { href: APP_ROUTES.playlists, icon: ListMusic, label: "Playlists" },
] as const;

export const TAB_BAR_ARIA_LABEL = "Navegación mobile";
