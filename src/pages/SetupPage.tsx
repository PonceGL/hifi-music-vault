import { Dropzone, DropzoneContent, DropzoneEmptyState } from "@/components/ui/dropzone"
import { useState } from "react"

export function SetupPage() {
    const [files, setFiles] = useState<File[]>()

    return (
        <main className="w-full flex flex-col justify-start items-center">
            <h1 className="text-3xl font-bold underline">Setup</h1>
            <div className="w-full p-8 flex items-center justify-center gap-20">
                <Dropzone
                    src={files}
                    onDrop={acceptedFiles => setFiles(acceptedFiles)}
                    accept={{ "image/*": [".png", ".jpg", ".jpeg", ".gif"] }}
                    maxSize={5 * 1024 * 1024}
                    className="w-full max-w-md"
                >
                    <DropzoneContent />
                    <DropzoneEmptyState />
                </Dropzone>

                <Dropzone
                    src={files}
                    onDrop={acceptedFiles => setFiles(acceptedFiles)}
                    accept={{ "image/*": [".png", ".jpg", ".jpeg", ".gif"] }}
                    maxSize={5 * 1024 * 1024}
                    className="w-full max-w-md"
                >
                    <DropzoneContent />
                    <DropzoneEmptyState />
                </Dropzone>
            </div>
        </main>
    )
}