import { Folder, Sun, Moon, Monitor, Settings2 } from "lucide-react"
import { getTheme, setTheme } from "@/lib/theme"
import type { Theme } from "@/lib/theme"
import { useEffect, useState } from "react"
import { FolderPicker } from "@/components/FolderPicker"
import { Button } from "@/components/ui/button"
import { useAppConfig } from "@/hooks/useAppConfig"
import { useNavigate } from "react-router-dom"
import { TitleBar } from "@/components/layout/TitleBar"
import { SettingsCard } from '@/components/SettingsCard';
import { PathDisplay } from '@/components/PathDisplay';
import { ThemeToggleItem } from '@/components/ThemeToggleItem';

export function SetupPage() {
    const { config, isLoaded, setInboxPath, setLibraryPath } = useAppConfig();
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);
    const [theme, setThemeState] = useState<Theme>("system");

    useEffect(() => {
        setThemeState(getTheme());
    }, []);

    const handleThemeChange = (newTheme: Theme) => {
        setThemeState(newTheme);
        setTheme(newTheme);
    };

    const handleSaveConfig = async () => {
        setIsSaving(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
            const response = await fetch(`${apiUrl}/api/config`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    inboxPath: config.inboxPath,
                    libraryPath: config.libraryPath,
                }),
            });

            if (!response.ok) throw new Error("Failed to save");
            navigate("/library");
        } catch (error) {
            console.error(error);
            alert("Error al guardar la configuración.");
        } finally {
            setIsSaving(false);
        }
    };

    if (!isLoaded) {
        return (
            <section className="flex min-h-screen items-center justify-center">
                <p className="text-muted-foreground animate-pulse">Cargando...</p>
            </section>
        );
    }

    // Determina si estamos en flujo de configuración inicial
    const isInitialSetup = !config.inboxPath || !config.libraryPath;

    return (
        <section className="flex w-full flex-col gap-8 pb-12">
            <TitleBar title="Ajustes" />

            <div className="mx-auto w-full max-w-6xl md:px-8">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                    {/* SECCIÓN: CARPETA DE DESCARGAS */}
                    <SettingsCard
                        title="Descargas"
                        description="Origen de tus archivos"
                        icon={<Folder className="text-primary" />}
                    >
                        {config.inboxPath ? (
                            <PathDisplay
                                path={config.inboxPath}
                                onClear={() => setInboxPath("")}
                            />
                        ) : (
                            <FolderPicker onSelect={setInboxPath} />
                        )}
                    </SettingsCard>

                    {/* SECCIÓN: CARPETA DE BIBLIOTECA */}
                    <SettingsCard
                        title="Biblioteca"
                        description="Destino organizado"
                        icon={<Folder className="text-primary" />}
                    >
                        {config.libraryPath ? (
                            <PathDisplay
                                path={config.libraryPath}
                                onClear={() => setLibraryPath("")}
                            />
                        ) : (
                            <FolderPicker onSelect={setLibraryPath} />
                        )}
                    </SettingsCard>
                </div>

                {/* SECCIÓN: APARIENCIA (M3 Container) */}
                <div className="mt-8">
                    <SettingsCard
                        title="Personalización"
                        description="Estilo visual de la interfaz"
                        icon={<Settings2 className="text-tertiary" />}
                    >
                        <div className="flex flex-col gap-4 rounded-2xl bg-slate-100/50 p-4 dark:bg-slate-900/50">
                            <ThemeToggleItem
                                icon={<Monitor size={20} />}
                                label="Seguir Sistema"
                                active={theme === "system"}
                                onChange={(checked: boolean) => handleThemeChange(checked ? "system" : "light")}
                            />

                            {theme !== "system" && (
                                <ThemeToggleItem
                                    icon={theme === "dark" ? <Moon size={20} /> : <Sun size={20} />}
                                    label={theme === "dark" ? "Modo Oscuro" : "Modo Claro"}
                                    active={theme === "dark"}
                                    onChange={(checked: boolean) => handleThemeChange(checked ? "dark" : "light")}
                                />
                            )}
                        </div>
                    </SettingsCard>
                </div>

                {/* BOTÓN DE ACCIÓN (Solo Onboarding) */}
                {!isInitialSetup && (
                    <div className="mt-12 flex justify-center animate-in fade-in zoom-in duration-500">
                        <Button
                            size="lg"
                            onClick={handleSaveConfig}
                            disabled={isSaving}
                            className="h-14 rounded-3xl px-12 text-lg font-bold shadow-lg transition-all hover:scale-105 cursor-pointer"
                        >
                            {isSaving ? "Guardando..." : "Finalizar Configuración"}
                        </Button>
                    </div>
                )}
            </div>
        </section>
    );
}