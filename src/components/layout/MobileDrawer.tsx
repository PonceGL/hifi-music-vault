import { NavigationLinks } from "@/components/layout/NavigationLinks";
import { useNavigation } from "@/hooks/useNavigation";
import { X } from "lucide-react";

export function MobileDrawer() {
    const { isOpen, closeMenu } = useNavigation();

    return (
        // Solo visible en pantallas pequeñas (oculto en md y superior)
        <div className="md:hidden">
            {/* Overlay oscuro: Aparece gradualmente y al hacer clic cierra el menú */}
            <div
                className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={closeMenu}
            />

            {/* Panel lateral (Drawer): Se desliza desde la izquierda */}
            <div
                className={`fixed inset-y-0 left-0 w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out shadow-xl ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="p-4 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-6 px-2">
                        <h2 className="text-lg font-bold text-gray-800">Mi Música</h2>
                        <button onClick={closeMenu} className="text-gray-500 hover:text-gray-800 p-1">
                            <X />
                        </button>
                    </div>

                    {/* Le pasamos closeMenu a onItemClick para que al navegar se cierre el Drawer */}
                    <NavigationLinks layout="vertical" onItemClick={closeMenu} />
                </div>
            </div>
        </div>
    );
}