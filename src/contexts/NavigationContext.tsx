import { createContext } from 'react';
import type { ReactNode } from 'react';

export interface NavigationContextType {
    isOpen: boolean;
    openMenu: () => void;
    closeMenu: () => void;
    toggleMenu: () => void;
}

export const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export interface NavigationProviderProps {
    children: ReactNode;
}