export type Theme = "light" | "dark" | "system";

const THEME_STORAGE_KEY = "hifi-music-vault-theme";

export function getTheme(): Theme {
    return (localStorage.getItem(THEME_STORAGE_KEY) as Theme) || "system";
}

export function setTheme(theme: Theme) {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    applyTheme();
}

export function applyTheme() {
    const theme = getTheme();
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
        root.classList.add(systemTheme);
    } else {
        root.classList.add(theme);
    }
}

// Add listener for system theme changes
if (typeof window !== "undefined") {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
        if (getTheme() === "system") {
            applyTheme();
        }
    });
}
