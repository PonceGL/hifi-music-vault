import { FolderPicker } from "@/components/FolderPicker"
import { Button } from "@/components/ui/button"
import { useAppConfig } from "@/hooks/useAppConfig"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { Folder } from "lucide-react"

export function SetupPage() {
    const { config, isLoaded, setInboxPath, setLibraryPath, clearConfig } = useAppConfig()
    const navigate = useNavigate()
    const [isSaving, setIsSaving] = useState(false)

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
        <section className="w-full flex flex-col justify-center items-center gap-20">
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
                            Cancelar
                        </Button>

                        <Button
                            variant="outline"
                            onClick={handleContinue}
                            disabled={isSaving}
                        >
                            {isSaving ? "Guardando..." : "Guardar y continuar"}
                        </Button>
                    </div>
                </div>
            )}
        </section>
    )
}