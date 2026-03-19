import { Folder, Sun, Moon, Monitor, MoonIcon } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { getTheme, setTheme } from "@/lib/theme"
import type { Theme } from "@/lib/theme"
import { useEffect, useState } from "react"
import { FolderPicker } from "@/components/FolderPicker"
import { Button } from "@/components/ui/button"
import { useAppConfig } from "@/hooks/useAppConfig"
import { useNavigate } from "react-router-dom"

export function SetupPage() {
    const { config, isLoaded, setInboxPath, setLibraryPath, clearConfig } = useAppConfig()
    const navigate = useNavigate()
    const [isSaving, setIsSaving] = useState(false)
    const [theme, setThemeState] = useState<Theme>("system")

    useEffect(() => {
        setThemeState(getTheme())
    }, [])

    const handleThemeChange = (newTheme: Theme) => {
        setThemeState(newTheme)
        setTheme(newTheme)
    }

    if (!isLoaded) {
        return (
            <main className="w-full flex flex-col justify-center items-center min-h-screen">
                <p className="text-muted-foreground">Loading configuration...</p>
            </main>
        )
    }

    const handleCancel = () => {
        clearConfig()
        console.log("Configuration cancelled")
        console.log(config)
    }

    const handleContinue = async () => {
        setIsSaving(true)
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001"
            const response = await fetch(`${apiUrl}/api/config`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inboxPath: config.inboxPath,
                    libraryPath: config.libraryPath,
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to save configuration')
            }

            const data = await response.json()
            console.log('Configuration saved to server:', data)

            // Navigate to library page
            navigate('/library')
        } catch (error) {
            console.error('Error saving configuration:', error)
            alert('Failed to save configuration. Please try again.')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <section className="w-full flex flex-col justify-center items-center gap-20 pb-8">
            <h1 className="text-3xl font-bold">Ajustes</h1>

            <div className={`w-full flex flex-col items-center justify-center gap-12 lg:grid ${config.inboxPath && config.libraryPath ? "lg:grid-cols-1" : "lg:grid-cols-2"} lg:justify-around lg:align-start`}>
                {/*  carpeta de descargas Picker */}
                <div className="flex flex-col justify-start items-start gap-4 w-full">
                    <div>
                        <h2 className="flex items-center gap-2 text-xl font-semibold mb-2">
                            <Folder />
                            Carpeta de Descargas
                        </h2>
                        <p className="text-sm text-muted-foreground mb-4">
                            Carpeta donde se guardan las descargas
                        </p>

                        {config.inboxPath && (
                            <Button
                                variant="outline"
                                onClick={() => { }}
                                disabled={true}
                                className="justify-start min-w-[320px] md:min-w-[450px]"
                            >
                                <span className="hidden md:inline-block">
                                    Selected:
                                </span>
                                <span className="font-mono">{config.inboxPath.slice(-40)}</span>
                            </Button>
                        )}
                    </div>
                    {!config.inboxPath && (
                        <FolderPicker
                            onSelect={(path) => {
                                console.log("Inbox path selected:", path)
                                setInboxPath(path)
                            }}
                            initialPath={config.inboxPath || undefined}
                        />
                    )}
                </div>

                {/* Carpeta de biblioteca Picker */}
                <div className="flex flex-col justify-start items-start gap-4 w-full">
                    <div>
                        <h2 className="flex items-center gap-2 text-xl font-semibold mb-2">
                            <Folder />
                            Carpeta de Biblioteca
                        </h2>
                        <p className="text-sm text-muted-foreground mb-4">
                            Carpeta donde se guardara la biblioteca organizada
                        </p>

                        {config.libraryPath && (

                            <Button
                                variant="outline"
                                onClick={() => { }}
                                disabled={true}
                                className="justify-start min-w-[320px] md:min-w-[450px]"
                            >
                                <span className="hidden md:inline-block">
                                    Selected:
                                </span>
                                <span className="font-mono">{config.libraryPath.slice(-40)}</span>
                            </Button>
                        )}
                    </div>
                    {!config.libraryPath && (
                        <FolderPicker
                            onSelect={(path) => {
                                console.log("Library path selected:", path)
                                setLibraryPath(path)
                            }}
                            initialPath={config.libraryPath || undefined}
                        />
                    )}
                </div>
            </div>

            {config.inboxPath && config.libraryPath && (
                <div className="w-full flex flex-col items-center justify-center gap-12">
                    <div className="w-full max-w-2xl grid grid-cols-2 gap-5">
                        <Button
                            variant="destructive"
                            onClick={handleCancel}
                        >
                            Limpiar
                        </Button>

                        <Button
                            variant="outline"
                            onClick={handleContinue}
                            disabled={isSaving}
                        >
                            {isSaving ? "Guardando..." : "Continuar"}
                        </Button>
                    </div>
                </div>
            )}
            {/* Sección de Apariencia */}
            <div className="w-full flex flex-col items-start justify-center gap-8 border-t dark:border-slate-800 pt-12">
                <div className="flex flex-col items-start gap-2">
                    <h2 className="flex items-start gap-2 text-xl font-semibold">
                        <MoonIcon />
                        <span>Apariencia</span>
                    </h2>
                    <p className="text-sm text-muted-foreground text-center">
                        Personaliza cómo se ve la aplicación
                    </p>
                </div>

                <div className="flex flex-col gap-6 w-full max-w-md bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="system-theme" className="flex items-center gap-2 font-medium">
                                <Monitor size={18} />
                                Mismo que el sistema
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Se ajusta automáticamente
                            </p>
                        </div>
                        <Switch
                            id="system-theme"
                            checked={theme === "system"}
                            onCheckedChange={(checked) => {
                                handleThemeChange(checked ? "system" : "light")
                            }}
                        />
                    </div>

                    {theme !== "system" && (
                        <div className="flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="dark-mode" className="flex items-center gap-2 font-medium">
                                    {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
                                    {theme === "dark" ? "Modo Oscuro" : "Modo Claro"}
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Desactiva el modo {theme === "dark" ? "oscuro" : "claro"}
                                </p>
                            </div>
                            <Switch
                                id="dark-mode"
                                checked={theme === "dark"}
                                onCheckedChange={(checked) => {
                                    handleThemeChange(checked ? "dark" : "light")
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}