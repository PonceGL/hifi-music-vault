import { useNavigation } from "@/hooks/useNavigation";
import { PanelLeft } from "lucide-react";

export const PORTAL_ID = "toolbar-portal-target"
export const TITLE_ID = "title-portal-target"

export function TopBar() {
    const { toggleMenu } = useNavigation();

    return (
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center px-4 shrink-0">

            {/* Botón de Menú (Hamburguesa). Siempre visible, su acción depende del contexto */}
            <button
                onClick={toggleMenu}
                className="p-2 mr-4 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none cursor-pointer"
                aria-label="Toggle menu"
            >
                <PanelLeft />
            </button>

            {/* Espacio reservado (Title Target) */}
            <div id={TITLE_ID} className="mr-auto flex items-center"></div>

            {/* Espacio reservado (Portal Target), Los Toolbar Actions */}
            <div id={PORTAL_ID} className="ml-auto flex items-center space-x-2 [&>*:nth-child(n+4)]:hidden"></div>

        </header>
    );
}