import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { usePlaylistRefresh } from '@/hooks/usePlaylistRefresh';
import { PlaylistRefreshContext } from '@/contexts/PlaylistRefreshContext';

describe('usePlaylistRefresh hook', () => {
    let consoleErrorSpy: any;

    beforeEach(() => {
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it('should_throw_an_error_when_used_outside_of_PlaylistRefreshProvider', () => {
        expect(() => {
            renderHook(() => usePlaylistRefresh());
        }).toThrow('usePlaylistRefresh must be used within a PlaylistRefreshProvider');
    });

    it('should_return_context_value_when_used_inside_PlaylistRefreshProvider', () => {
        const mockContextValue = {
            refreshKey: 0,
            triggerRefresh: vi.fn(),
        } as any;

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <PlaylistRefreshContext.Provider value={mockContextValue}>
                {children}
            </PlaylistRefreshContext.Provider>
        );

        const { result } = renderHook(() => usePlaylistRefresh(), { wrapper });

        expect(result.current).toBe(mockContextValue);
    });
});
