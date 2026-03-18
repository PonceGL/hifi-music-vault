import { NavigationLinks } from "@/components/layout/NavigationLinks";
import { useNavigation } from "@/hooks/useNavigation";
import { useIsMobile } from "@/hooks/useMediaQuery";

export function TopBar() {
    const { isOpen, toggleMenu } = useNavigation();
    const isMobile = useIsMobile();

    return (
        <header className="h-16 border-b border-gray-200 bg-white flex items-center px-4 shrink-0">

            {/* Botón de Menú (Hamburguesa). Siempre visible, su acción depende del contexto */}
            <button
                onClick={toggleMenu}
                className="p-2 mr-4 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none"
                aria-label="Toggle menu"
            >
                {/* <Menu /> */}
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Lógica de los Tabs Superiores: Solo en Escritorio y solo si el Sidebar está cerrado */}
            {!isMobile && !isOpen && (
                <div className="flex-1 animate-in fade-in duration-300">
                    <NavigationLinks layout="horizontal" />
                </div>
            )}

            {/* Espacio reservado (Portal Target) para el Paso 5: Los Toolbar Actions */}
            <div id="toolbar-portal-target" className="ml-auto flex items-center space-x-2"></div>

        </header>
    );
}