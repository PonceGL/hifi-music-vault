import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useNavigation } from '@/hooks/useNavigation';
import { NavigationContext } from '@/contexts/NavigationContext';

describe('useNavigation hook', () => {
    let consoleErrorSpy: any;

    beforeEach(() => {
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it('should_throw_an_error_when_used_outside_of_NavigationProvider', () => {
        expect(() => {
            renderHook(() => useNavigation());
        }).toThrow('useNavigation debe ser usado dentro de un NavigationProvider');
    });

    it('should_return_navigation_context_value_when_used_inside_NavigationProvider', () => {
        const mockContextValue = {
            currentView: 'library',
            setCurrentView: vi.fn(),
            currentPlaylistId: null,
            setCurrentPlaylistId: vi.fn(),
            searchQuery: '',
            setSearchQuery: vi.fn(),
        } as any;

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <NavigationContext.Provider value={mockContextValue}>
                {children}
            </NavigationContext.Provider>
        );

        const { result } = renderHook(() => useNavigation(), { wrapper });

        expect(result.current).toBe(mockContextValue);
    });
});
