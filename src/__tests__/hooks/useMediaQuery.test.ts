import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useMediaQuery, useIsMobile } from '@/hooks/useMediaQuery';

const originalMatchMedia = window.matchMedia;

describe('useMediaQuery hook', () => {
    let mockAddEventListener: any;
    let mockRemoveEventListener: any;

    beforeEach(() => {
        mockAddEventListener = vi.fn();
        mockRemoveEventListener = vi.fn();

        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation((query) => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: vi.fn(), // deprecated API sometimes checked by React internals
                removeListener: vi.fn(),
                addEventListener: mockAddEventListener,
                removeEventListener: mockRemoveEventListener,
                dispatchEvent: vi.fn(),
            })),
        });
    });

    afterEach(() => {
        window.matchMedia = originalMatchMedia;
        vi.clearAllMocks();
    });

    it('should_return_false_if_no_match', () => {
        const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'));
        expect(result.current).toBe(false);
    });

    it('should_return_true_if_matches', () => {
        window.matchMedia = vi.fn().mockImplementation((query) => ({
            matches: true,
            media: query,
            addEventListener: mockAddEventListener,
            removeEventListener: mockRemoveEventListener,
        })) as any;

        const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'));
        expect(result.current).toBe(true);
    });

    it('should_update_when_media_query_changes', () => {
        let currentMatches = false;
        window.matchMedia = vi.fn().mockImplementation((query) => ({
            get matches() { return currentMatches; },
            media: query,
            addEventListener: mockAddEventListener,
            removeEventListener: mockRemoveEventListener,
        })) as any;

        const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'));
        
        expect(result.current).toBe(false);
        
        // Simular el evento change instanciando un evento custom (no importa el tipo real para el dispatch)
        const changeEvent = new Event('change') as any;
        changeEvent.matches = true;
        currentMatches = true; // Update internal mock state so useEffect does not instantly revert the state on rerender

        act(() => {
            // El callback se pasa como segundo argumento de addEventListener
            // Since window.matchMedia is mocked and called multiple times, the listener corresponds to the last call
            // wait, we can just grab the very last listener registered:
            const listener = mockAddEventListener.mock.calls[mockAddEventListener.mock.calls.length - 1][1];
            listener(changeEvent);
        });

        expect(result.current).toBe(true);
    });

    it('should_cleanup_listeners_on_unmount', () => {
        const { unmount } = renderHook(() => useMediaQuery('(min-width: 1024px)'));
        unmount();
        expect(mockRemoveEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });
});

describe('useIsMobile hook', () => {
    beforeEach(() => {
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation((query) => ({
                matches: query === '(max-width: 768px)', // Simulamos que es true solo para mobile
                media: query,
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
            })),
        });
    });

    afterEach(() => {
        window.matchMedia = originalMatchMedia;
        vi.clearAllMocks();
    });

    it('should_call_useMediaQuery_with_correct_breakpoint', () => {
        const { result } = renderHook(() => useIsMobile());
        
        expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 768px)');
        expect(result.current).toBe(true);
    });
});
