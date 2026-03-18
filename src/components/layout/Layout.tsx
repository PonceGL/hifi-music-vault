import { type PropsWithChildren } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileDrawer } from '@/components/layout/MobileDrawer';
import { NavigationProvider } from '@/components/Providers/NavigationProvider';

export function Layout({ children }: PropsWithChildren) {
    return (
        <NavigationProvider>
            {/* Contenedor principal: 
        - h-dvh asegura que ocupe el alto exacto de la pantalla dinámica en móviles.
        - overflow-hidden evita que la página entera haga scroll; el scroll lo hará solo el 'main'.
      */}
            <div className="flex h-dvh overflow-hidden bg-white text-gray-900">

                {/* Menú lateral fijo para Desktop (maneja su propia visibilidad interna) */}
                <Sidebar />

                {/* Menú superpuesto para Móvil */}
                <MobileDrawer />

                {/* Columna derecha: contiene el TopBar y el área de contenido (Outlet) */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                    {/* Barra superior constante */}
                    <TopBar />

                    {/* Área de contenido principal:
            - flex-1 toma el espacio vertical restante debajo del TopBar.
            - overflow-y-auto permite hacer scroll independiente solo en el contenido.
          */}
                    <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
                        {children}
                    </main>

                </div>
            </div>
        </NavigationProvider>
    );

}