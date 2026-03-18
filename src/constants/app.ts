export const VIEW_MODES = {
    INBOX: 'inbox',
    LIBRARY: 'library',
} as const;

export type ViewMode = typeof VIEW_MODES[keyof typeof VIEW_MODES];

export const ROUTES = {
    HOME: '/',
    INBOX: '/inbox',
    LIBRARY: '/library',
    PLAYLISTS: '/playlists',
    SETTINGS: '/settings',
} as const;