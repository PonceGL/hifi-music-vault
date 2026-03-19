import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as themeUtils from '../../lib/theme';

const { getTheme, setTheme, applyTheme } = themeUtils;

const THEME_STORAGE_KEY = "hifi-music-vault-theme";

// Capture the listener added during module initialization (import)
// This must happen BEFORE any clearAllMocks() calls in beforeEach
const matchMediaMock = vi.mocked(window.matchMedia);
const initialResult = matchMediaMock.mock.results[0];
const initialAddEventListenerMock = initialResult && initialResult.type === 'return' ? vi.mocked(initialResult.value.addEventListener) : null;
const changeCall = initialAddEventListenerMock?.mock.calls.find(call => call[0] === 'change');
const systemThemeListener = changeCall ? (changeCall[1] as EventListener) : null;

describe('theme utility', () => {
    beforeEach(() => {
        // Mock localStorage
        const localStorageMock = (function () {
            let store: Record<string, string> = {};
            return {
                getItem: vi.fn((key: string) => store[key] || null),
                setItem: vi.fn((key: string, value: string) => {
                    store[key] = value.toString();
                }),
                clear: vi.fn(() => {
                    store = {};
                }),
                removeItem: vi.fn((key: string) => {
                    delete store[key];
                }),
            };
        })();
        Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

        // Mock documentElement.classList
        const classListMock = {
            add: vi.fn(),
            remove: vi.fn(),
            contains: vi.fn(),
        };
        Object.defineProperty(document.documentElement, 'classList', { value: classListMock, writable: true });

        vi.clearAllMocks();
        window.localStorage.clear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('getTheme', () => {
        it('should return "system" if no theme is stored', () => {
            expect(getTheme()).toBe('system');
        });

        it('should return the stored theme', () => {
            window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');
            expect(getTheme()).toBe('dark');
        });
    });

    describe('setTheme', () => {
        it('should store the theme and apply it', () => {
            setTheme('dark');
            expect(window.localStorage.setItem).toHaveBeenCalledWith(THEME_STORAGE_KEY, 'dark');
            expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark');
        });
    });

    describe('applyTheme', () => {
        it('should apply light theme', () => {
            window.localStorage.setItem(THEME_STORAGE_KEY, 'light');
            applyTheme();
            expect(document.documentElement.classList.remove).toHaveBeenCalledWith('light', 'dark');
            expect(document.documentElement.classList.add).toHaveBeenCalledWith('light');
        });

        it('should apply dark theme', () => {
            window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');
            applyTheme();
            expect(document.documentElement.classList.remove).toHaveBeenCalledWith('light', 'dark');
            expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark');
        });

        it('should apply light theme from system preference', () => {
            window.localStorage.setItem(THEME_STORAGE_KEY, 'system');
            vi.mocked(window.matchMedia).mockImplementationOnce((query: string) => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            }));
            applyTheme();
            expect(document.documentElement.classList.add).toHaveBeenCalledWith('light');
        });

        it('should apply dark theme from system preference', () => {
            window.localStorage.setItem(THEME_STORAGE_KEY, 'system');
            vi.mocked(window.matchMedia).mockImplementationOnce((query: string) => ( {
                matches: query === '(prefers-color-scheme: dark)',
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            }));
            applyTheme();
            expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark');
        });
    });

    describe('system theme change listener', () => {
        it('should re-apply theme when system preference changes and theme is "system"', () => {
            expect(systemThemeListener).toBeDefined();
            if (!systemThemeListener) return;

            window.localStorage.setItem(THEME_STORAGE_KEY, 'system');
            
            // Mock matchMedia for the call inside applyTheme()
            vi.mocked(window.matchMedia).mockImplementationOnce((query: string) => ({
                matches: query === '(prefers-color-scheme: dark)',
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            }));

            // Trigger the callback
            systemThemeListener({} as Event);

            expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark');
        });

        it('should NOT re-apply theme when system preference changes and theme is NOT "system"', () => {
            expect(systemThemeListener).toBeDefined();
            if (!systemThemeListener) return;

            window.localStorage.setItem(THEME_STORAGE_KEY, 'light');
            vi.clearAllMocks();

            // Trigger the callback
            systemThemeListener({} as Event);

            // applyTheme should NOT have been called (or at least classList shouldn't change based on system)
            expect(document.documentElement.classList.add).not.toHaveBeenCalled();
        });
    });
});
