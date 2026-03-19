import type { PropsWithChildren } from 'react';

interface CardProps {
    className?: string;
}

/**
 * Card - Contenedor base siguiendo Material 3 Expressive.
 * Proporciona el radio de borde y la elevación estándar de la aplicación.
 */
export function Card({ children, className = "" }: PropsWithChildren<CardProps>) {
    return (
        <div
            className={`
        rounded-[2.5rem] 
        bg-white 
        p-6 
        shadow-sm 
        border 
        border-slate-100 
        dark:bg-slate-900 
        dark:border-slate-800 
        transition-all 
        hover:shadow-md
        ${className}
      `.trim()}
        >
            {children}
        </div>
    );
}