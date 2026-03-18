import { NavigationContext } from '@/contexts/NavigationContext';
import { useState, useCallback } from 'react'
import type { ReactNode } from 'react'

export function NavigationProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            const isMobile = window.matchMedia('(max-width: 768px)').matches;
            return !isMobile;
        }
        return false;
    });

    const openMenu = useCallback(() => setIsOpen(true), []);
    const closeMenu = useCallback(() => setIsOpen(false), []);
    const toggleMenu = useCallback(() => setIsOpen((prev) => !prev), []);

    return (
        <NavigationContext.Provider value={{ isOpen, openMenu, closeMenu, toggleMenu }}>
            {children}
        </NavigationContext.Provider>
    );
};