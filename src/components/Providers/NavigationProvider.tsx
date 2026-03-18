import { NavigationContext } from '@/contexts/NavigationContext';
import { useState, useCallback } from 'react'
import type { ReactNode } from 'react'

export function NavigationProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    const openMenu = useCallback(() => setIsOpen(true), []);
    const closeMenu = useCallback(() => setIsOpen(false), []);
    const toggleMenu = useCallback(() => setIsOpen((prev) => !prev), []);

    return (
        <NavigationContext.Provider value={{ isOpen, openMenu, closeMenu, toggleMenu }}>
            {children}
        </NavigationContext.Provider>
    );
};