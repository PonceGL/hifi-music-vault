import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { PORTAL_ID } from '@/components/layout/TopBar';
import type { LucideIcon } from 'lucide-react';

interface ToolbarActionProps {
    icon: LucideIcon;      // Obligatorio: Recibe el componente del ícono (ej. Search, Plus, Play)
    onClick: () => void;   // Obligatorio: La acción a ejecutar
    label?: string;        // Opcional: Texto que acompañará al ícono en Desktop
    disabled?: boolean;
    isActive?: boolean;
}

export function ToolbarAction({ icon: Icon, onClick, label, disabled, isActive }: ToolbarActionProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Si no está montado, no dibujamos nada
    if (!mounted) return null;

    const targetNode = document.getElementById(PORTAL_ID);
    if (!targetNode) return null;

    // ESTÉTICA ESTRICTA: 
    // Aquí definimos el "molde" inquebrantable de nuestro botón.
    const buttonContent = (
        <button
            onClick={onClick}
            title={label} // Accesibilidad: muestra tooltip en hover (ideal para cuando el texto está oculto en móvil)
            className={
                `flex justify-start items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                    ? 'bg-gray-200 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
            }
            aria-label={label}
            disabled={disabled}
        >
            <Icon className={`w-5 h-5 ${label ? 'mr-2' : ''}`} strokeWidth={2} />

            {/* El label se oculta en móvil (hidden) y se muestra a partir de tablet (md:inline) */}
            {label && (
                <span className="hidden lg:inline text-sm font-medium whitespace-nowrap">
                    {label}
                </span>
            )}
        </button>
    );

    return createPortal(buttonContent, targetNode);
}