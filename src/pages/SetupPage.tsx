import { FolderPicker } from "@/components/FolderPicker"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function SetupPage() {
    const [inboxPath, setInboxPath] = useState<string>("")
    const [libraryPath, setLibraryPath] = useState<string>("")

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
                        {inboxPath && (
                            <div className="mb-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                                    Selected: <span className="font-mono">{inboxPath}</span>
                                </p>
                            </div>
                        )}
                    </div>
                    <FolderPicker
                        onSelect={(path) => {
                            console.log("Inbox path selected:", path)
                            setInboxPath(path)
                        }}
                        initialPath={inboxPath || undefined}
                    />
                </div>

                {/* Library Folder Picker */}
                <div className="flex flex-col gap-4 w-full max-w-2xl">
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Library Folder</h2>
                        <p className="text-sm text-muted-foreground mb-4">
                            Select the folder where your organized music library will be stored
                        </p>
                        {libraryPath && (
                            <div className="mb-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                                    Selected: <span className="font-mono">{libraryPath}</span>
                                </p>
                            </div>
                        )}
                    </div>
                    <FolderPicker
                        onSelect={(path) => {
                            console.log("Library path selected:", path)
                            setLibraryPath(path)
                        }}
                        initialPath={libraryPath || undefined}
                    />
                </div>
            </div>

            <div className="w-full flex justify-center items-center">
                {inboxPath && libraryPath && (
                    <Button
                        variant="outline"
                        onClick={() => {
                            console.log("Save paths")
                            console.log("Inbox path:", inboxPath)
                            console.log("Library path:", libraryPath)
                        }}
                    >
                        Save paths and continue
                    </Button>
                )}
            </div>
        </main>
    )
}