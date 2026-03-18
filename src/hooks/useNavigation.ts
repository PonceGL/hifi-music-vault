import { useContext } from 'react';
import { NavigationContext, type NavigationContextType } from "@/contexts/NavigationContext";

export function useNavigation(): NavigationContextType {
    const context = useContext(NavigationContext);

    if (context === undefined) {
        throw new Error('useNavigation debe ser usado dentro de un NavigationProvider');
    }

    return context;
};