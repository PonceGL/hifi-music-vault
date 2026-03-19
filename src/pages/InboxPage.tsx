import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAppConfig } from "@/hooks/useAppConfig"
import { useInbox } from "@/hooks/useInbox"
import { MusicTable } from "@/components/MusicTable"
import { TitleBar } from "@/components/layout/TitleBar"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from "lucide-react"

/**
 * Página de Inbox
 * 
 * Responsabilidades:
 * - Escanear carpeta de descargas (inbox)
 * - Mostrar vista previa de archivos a organizar
 * - Ejecutar organización (mover archivos a biblioteca)
 * 
 * Esta página usa el hook useInbox para toda la lógica de estado.
 */
export function InboxPage() {
    const { config } = useAppConfig()
    const navigate = useNavigate()

    const {
        scanResults,
        isScanning,
        isOrganizing,
        error,
        scanInbox,
        organize,
    } = useInbox()

    const [hasScanned, setHasScanned] = useState(false)

    // Auto-scan en mount
    useEffect(() => {
        if (!hasScanned && config.inboxPath && config.libraryPath) {
            performScan()
            setHasScanned(true)
        }
    }, [config.inboxPath, config.libraryPath, hasScanned])

    const performScan = async () => {
        if (!config.inboxPath || !config.libraryPath) {
            console.error("Missing inbox or library path")
            return
        }

        try {
            await scanInbox(config.inboxPath, config.libraryPath)
        } catch (err) {
            console.error("Error scanning inbox:", err)
        }
    }

    const handleOrganize = async () => {
        if (!config.libraryPath) return

        try {
            await organize(config.libraryPath)

            // Después de organizar exitosamente, navegar a la biblioteca
            navigate("/")
        } catch (err) {
            console.error("Error organizing:", err)
        }
    }

    return (
        <section className="w-full flex flex-col justify-start items-center gap-8">
            <TitleBar title="Inbox" />

            <div className="w-full max-w-6xl flex flex-col gap-6">
                {/* Header con info y acciones */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-bold tracking-tight">Carpeta de Descargas</h1>
                        <p className="text-muted-foreground">
                            {scanResults.length > 0
                                ? `${scanResults.length} archivos encontrados listos para organizar`
                                : "No hay archivos pendientes de organizar"
                            }
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={performScan}
                            disabled={isScanning}
                        >
                            {isScanning ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Escaneando...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Escanear
                                </>
                            )}
                        </Button>

                        {scanResults.length > 0 && (
                            <Button
                                onClick={handleOrganize}
                                disabled={isOrganizing}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                {isOrganizing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Organizando...
                                    </>
                                ) : (
                                    `Organizar ${scanResults.length} Archivos`
                                )}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Loading State */}
                {isScanning && (
                    <div className="flex flex-col items-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-muted-foreground mt-2">Escaneando carpeta de descargas...</p>
                    </div>
                )}

                {/* Error State */}
                {error && !isScanning && (
                    <div className="w-full p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
                        <p className="text-sm font-medium text-red-900 dark:text-red-100">
                            Error: {error}
                        </p>
                    </div>
                )}

                {/* Empty State */}
                {!isScanning && !error && scanResults.length === 0 && (
                    <div className="text-center py-20 border rounded-md bg-slate-50 dark:bg-slate-900 border-dashed">
                        <p className="text-muted-foreground mb-4">
                            La carpeta de descargas está vacía.
                        </p>
                        <Button variant="link" onClick={performScan}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Escanear nuevamente
                        </Button>
                    </div>
                )}

                {/* Results Table */}
                {!isScanning && !error && scanResults.length > 0 && (
                    <div className="w-full">
                        <MusicTable data={scanResults} />

                        {/* Info sobre la organización */}
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
                            <p className="text-sm text-blue-900 dark:text-blue-100">
                                <strong>ℹ️ Información:</strong> Al hacer clic en "Organizar",
                                los archivos se moverán desde tu carpeta de descargas a la biblioteca,
                                organizándolos por Artista y Álbum.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}