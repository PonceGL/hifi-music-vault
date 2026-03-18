import { useState, useEffect } from 'react';

// 1. Hook genérico: le pasas cualquier media query de CSS y te devuelve un booleano
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState<boolean>(false);

    useEffect(() => {
        const media = window.matchMedia(query);

        // Establecemos el estado inicial sin esperar al primer cambio
        if (media.matches !== matches) {
            setMatches(media.matches);
        }

        // Definimos la función que escuchará los cambios
        const listener = (event: MediaQueryListEvent) => {
            setMatches(event.matches);
        };

        // Usamos la API moderna para escuchar cambios en la media query
        media.addEventListener('change', listener);

        // Función de limpieza (cleanup) cuando el componente se desmonta
        return () => {
            media.removeEventListener('change', listener);
        };
    }, [matches, query]);

    return matches;
}

// 2. Hook semántico: específico para tu lógica de negocio
export function useIsMobile(): boolean {
    // 768px es el breakpoint clásico que separa móviles de tablets/desktop.
    return useMediaQuery('(max-width: 768px)');
}