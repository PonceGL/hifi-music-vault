import { FolderPicker } from "@/components/FolderPicker"
import { Button } from "@/components/ui/button"
import { useAppConfig } from "@/hooks/useAppConfig"
import { useNavigate } from "react-router-dom"
import { useState } from "react"

export function SetupPage() {
    const { config, isLoaded, setInboxPath, setLibraryPath } = useAppConfig()
    const navigate = useNavigate()
    const [isSaving, setIsSaving] = useState(false)

    if (!isLoaded) {
        return (
            <main className="w-full flex flex-col justify-center items-center min-h-screen">
                <p className="text-muted-foreground">Loading configuration...</p>
            </main>
        )
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
        <main className="w-full flex flex-col justify-start items-center p-8 gap-20">
            <h1 className="text-3xl font-bold mb-8">Setup</h1>

            <div className="w-full flex flex-col items-center justify-center gap-12 md:flex-row md:items-start">
                {/* Inbox Folder Picker */}
                <div className="flex flex-col gap-4 w-full max-w-2xl">
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Inbox Folder</h2>
                        <p className="text-sm text-muted-foreground mb-4">
                            Select the folder where new music files will be placed
                        </p>
                        {config.inboxPath && (
                            <div className="mb-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                                    Selected: <span className="font-mono">{config.inboxPath}</span>
                                </p>
                            </div>
                        )}
                    </div>
                    <FolderPicker
                        onSelect={(path) => {
                            console.log("Inbox path selected:", path)
                            setInboxPath(path)
                        }}
                        initialPath={config.inboxPath || undefined}
                    />
                </div>

                {/* Library Folder Picker */}
                <div className="flex flex-col gap-4 w-full max-w-2xl">
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Library Folder</h2>
                        <p className="text-sm text-muted-foreground mb-4">
                            Select the folder where your organized music library will be stored
                        </p>
                        {config.libraryPath && (
                            <div className="mb-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                                    Selected: <span className="font-mono">{config.libraryPath}</span>
                                </p>
                            </div>
                        )}
                    </div>
                    <FolderPicker
                        onSelect={(path) => {
                            console.log("Library path selected:", path)
                            setLibraryPath(path)
                        }}
                        initialPath={config.libraryPath || undefined}
                    />
                </div>
            </div>

            <div className="w-full flex justify-center items-center">
                {config.inboxPath && config.libraryPath && (
                    <Button
                        variant="outline"
                        onClick={handleContinue}
                        disabled={isSaving}
                    >
                        {isSaving ? "Saving..." : "Continue to Library"}
                    </Button>
                )}
            </div>
        </main>
    )
}