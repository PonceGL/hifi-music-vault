import { UploadIcon } from "lucide-react"
import type { ReactNode } from "react"
import { createContext, useContext } from "react"
import type { DropEvent, DropzoneOptions, FileRejection } from "react-dropzone"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DropzoneContextType {
  src?: File[] | string
  accept?: DropzoneOptions["accept"]
  maxSize?: DropzoneOptions["maxSize"]
  minSize?: DropzoneOptions["minSize"]
  maxFiles?: DropzoneOptions["maxFiles"]
  dropDirectory?: boolean
}

const renderBytes = (bytes: number) => {
  const units = ["B", "KB", "MB", "GB", "TB", "PB"]
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(2)}${units[unitIndex]}`
}

const DropzoneContext = createContext<DropzoneContextType | undefined>(undefined)

export type DropzoneProps = Omit<DropzoneOptions, "onDrop"> &
  Omit<React.HTMLAttributes<HTMLButtonElement>, "onDrop"> & {
    src?: File[] | string
    className?: string
    onDrop?: (acceptedFiles: File[], fileRejections: FileRejection[], event: DropEvent) => void
    children?: ReactNode
    dropDirectory?: boolean
    onDirectoryDrop?: (directory: string) => void
  }

export const Dropzone = ({
  accept,
  maxFiles = 1,
  maxSize,
  minSize,
  onDrop,
  onError,
  disabled,
  src,
  className,
  children,
  onDirectoryDrop,
  dropDirectory,
  ...props
}: DropzoneProps) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxFiles,
    maxSize,
    minSize,
    onError,
    disabled,
    onDrop: (acceptedFiles, fileRejections, event) => {
      if (fileRejections.length > 0) {
        const message = fileRejections.at(0)?.errors.at(0)?.message
        onError?.(new Error(message))
        return
      }

      if (dropDirectory && acceptedFiles.length > 0) {
        // Try to get the folder name from the first file's path
        // standard webkitRelativePath is "Folder/File.ext"
        const firstFile = acceptedFiles[0]
        const path = firstFile.webkitRelativePath
          ? firstFile.webkitRelativePath.split("/")[0]
          : (firstFile as any).path
            ? (firstFile as any).path.split("/")[0]
            : firstFile.name

        onDirectoryDrop?.(path)
        // We also call onDrop in case the user wants the files too, 
        // but typically onDirectoryDrop supercedes if they only want path.
      }

      onDrop?.(acceptedFiles, fileRejections, event)
    },
    ...props,
  })

  return (
    <DropzoneContext.Provider
      key={JSON.stringify(src)}
      value={{ src, accept, maxSize, minSize, maxFiles, dropDirectory }}
    >
      <Button
        className={cn(
          "relative h-auto w-full flex-col overflow-hidden p-8",
          isDragActive && "outline-none ring-1 ring-ring",
          className,
        )}
        disabled={disabled}
        type="button"
        variant="outline"
        {...getRootProps(props as any)}
      >
        <input
          {...getInputProps()}
          disabled={disabled}
          {...(dropDirectory ? { webkitdirectory: "true", directory: "true" } as any : {})}
        />
        {children}
      </Button>
    </DropzoneContext.Provider>
  )
}

const useDropzoneContext = () => {
  const context = useContext(DropzoneContext)

  if (!context) {
    throw new Error("useDropzoneContext must be used within a Dropzone")
  }

  return context
}

export interface DropzoneContentProps {
  children?: ReactNode
  className?: string
}

const maxLabelItems = 3

export const DropzoneContent = ({ children, className }: DropzoneContentProps) => {
  const { src } = useDropzoneContext()

  if (!src) {
    return null
  }

  if (children) {
    return children
  }

  const isFolder = typeof src === "string"

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <UploadIcon size={16} />
      </div>
      <p className="my-2 w-full truncate font-medium text-sm">
        {isFolder ? (
          src
        ) : (
          (src as File[]).length > maxLabelItems
            ? `${new Intl.ListFormat("en").format(
              (src as File[]).slice(0, maxLabelItems).map(file => file.name),
            )} and ${(src as File[]).length - maxLabelItems} more`
            : new Intl.ListFormat("en").format((src as File[]).map(file => file.name))
        )}
      </p>
      <p className="w-full text-wrap text-muted-foreground text-xs">
        {isFolder ? "Folder selected" : "Drag and drop or click to replace"}
      </p>
    </div>
  )
}

export interface DropzoneEmptyStateProps {
  children?: ReactNode
  className?: string
}

export const DropzoneEmptyState = ({ children, className }: DropzoneEmptyStateProps) => {
  const { src, accept, maxSize, minSize, maxFiles, dropDirectory } = useDropzoneContext()

  if (src) {
    return null
  }

  if (children) {
    return children
  }

  let caption = ""

  if (accept) {
    caption += "Accepts "
    caption += new Intl.ListFormat("en").format(Object.keys(accept))
  }

  if (minSize && maxSize) {
    caption += ` between ${renderBytes(minSize)} and ${renderBytes(maxSize)}`
  } else if (minSize) {
    caption += ` at least ${renderBytes(minSize)}`
  } else if (maxSize) {
    caption += ` less than ${renderBytes(maxSize)}`
  }

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <UploadIcon size={16} />
      </div>
      <p className="my-2 w-full truncate text-wrap font-medium text-sm">
        {dropDirectory ? "Upload a folder" : `Upload ${maxFiles === 1 ? "a file" : "files"}`}
      </p>
      <p className="w-full truncate text-wrap text-muted-foreground text-xs">
        Drag and drop or click to upload
      </p>
      {caption && <p className="text-wrap text-muted-foreground text-xs">{caption}.</p>}
    </div>
  )
}

// Demo
import { useState } from "react"

export function Demo() {
  const [files, setFiles] = useState<File[]>()

  return (
    <div className="fixed inset-0 flex items-center justify-center p-8">
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
  )
}
