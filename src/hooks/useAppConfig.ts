import { useState, useEffect } from "react"

interface AppConfig {
    inboxPath: string
    libraryPath: string
}

const CONFIG_KEY = "hifi-music-vault-config"

export function useAppConfig() {
    const [config, setConfig] = useState<AppConfig>({
        inboxPath: "",
        libraryPath: ""
    })
    const [isLoaded, setIsLoaded] = useState(false)

    // Load config from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(CONFIG_KEY)
            if (stored) {
                const parsed = JSON.parse(stored) as AppConfig
                setConfig(parsed)
            }
        } catch (error) {
            console.error("Error loading config from localStorage:", error)
        } finally {
            setIsLoaded(true)
        }
    }, [])

    // Save config to localStorage
    const saveConfig = (newConfig: Partial<AppConfig>) => {
        const updated = { ...config, ...newConfig }
        setConfig(updated)
        try {
            localStorage.setItem(CONFIG_KEY, JSON.stringify(updated))
            console.log("Config saved to localStorage:", updated)
        } catch (error) {
            console.error("Error saving config to localStorage:", error)
        }
    }

    // Update individual paths
    const setInboxPath = (path: string) => {
        saveConfig({ inboxPath: path })
    }

    const setLibraryPath = (path: string) => {
        saveConfig({ libraryPath: path })
    }

    return {
        config,
        isLoaded,
        setInboxPath,
        setLibraryPath,
        saveConfig
    }
}
