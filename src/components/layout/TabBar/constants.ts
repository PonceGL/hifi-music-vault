import type { LucideIcon } from "lucide-react";
import { Library, Users, Disc3, ListMusic } from "lucide-react";

export interface TabItem {
  href: string;
  icon: LucideIcon;
  label: string;
}

export const TAB_ITEMS: readonly TabItem[] = [
  { href: "/library", icon: Library, label: "Biblioteca" },
  { href: "/artists", icon: Users, label: "Artistas" },
  { href: "/albums", icon: Disc3, label: "Álbumes" },
  { href: "/playlists", icon: ListMusic, label: "Playlists" },
] as const;

export const TAB_BAR_ARIA_LABEL = "Navegación mobile";
