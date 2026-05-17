import type { LucideIcon } from "lucide-react";
import { Library, Users, Disc3, ListMusic, HeartPulse } from "lucide-react";
import { APP_ROUTES, AppRoute } from "@/constants/appRoutes";

export interface NavItem {
  href: AppRoute;
  icon: LucideIcon;
  label: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { href: APP_ROUTES.library, icon: Library, label: "Biblioteca" },
  { href: APP_ROUTES.artists, icon: Users, label: "Artistas" },
  { href: APP_ROUTES.albums, icon: Disc3, label: "Álbumes" },
  { href: APP_ROUTES.playlists, icon: ListMusic, label: "Playlists" },
  { href: APP_ROUTES.health, icon: HeartPulse, label: "Health" },
] as const;

export const SIDEBAR_NAV_ARIA_LABEL = "Navegación principal";
export const TOGGLE_COLLAPSE_LABEL = "Colapsar barra lateral";
export const TOGGLE_EXPAND_LABEL = "Expandir barra lateral";
export const STATS_TRACKS_LABEL = "tracks";
export const STATS_SPACE_LABEL = "disponible";
