import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAppConfig } from '../../hooks/useAppConfig';

const CONFIG_KEY = 'hifi-music-vault-config';

describe('useAppConfig', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('Initial state', () => {
    it('should initialize with empty config', () => {
      const { result } = renderHook(() => useAppConfig());

      expect(result.current.config).toEqual({
        inboxPath: '',
        libraryPath: '',
      });
      expect(result.current.isLoaded).toBe(true);
    });

    it('should load config from localStorage on mount', () => {
      const mockConfig = {
        inboxPath: '/test/inbox',
        libraryPath: '/test/library',
      };

      localStorage.setItem(CONFIG_KEY, JSON.stringify(mockConfig));

      const { result } = renderHook(() => useAppConfig());

      expect(result.current.config).toEqual(mockConfig);
      expect(result.current.isLoaded).toBe(true);
    });

    it('should handle invalid JSON in localStorage', () => {
      localStorage.setItem(CONFIG_KEY, 'invalid-json');

      const { result } = renderHook(() => useAppConfig());

      expect(result.current.config).toEqual({
        inboxPath: '',
        libraryPath: '',
      });
      expect(result.current.isLoaded).toBe(true);
      expect(console.error).toHaveBeenCalledWith(
        'Error loading config from localStorage:',
        expect.any(Error)
      );
    });

    it('should handle missing config in localStorage', () => {
      const { result } = renderHook(() => useAppConfig());

      expect(result.current.config).toEqual({
        inboxPath: '',
        libraryPath: '',
      });
      expect(result.current.isLoaded).toBe(true);
    });
  });

  describe('saveConfig', () => {
    it('should save partial config to localStorage', () => {
      const { result } = renderHook(() => useAppConfig());

      act(() => {
        result.current.saveConfig({ inboxPath: '/new/inbox' });
      });

      expect(result.current.config).toEqual({
        inboxPath: '/new/inbox',
        libraryPath: '',
      });

      const stored = localStorage.getItem(CONFIG_KEY);
      expect(stored).toBe(
        JSON.stringify({
          inboxPath: '/new/inbox',
          libraryPath: '',
        })
      );
      expect(console.log).toHaveBeenCalledWith(
        'Config saved to localStorage:',
        {
          inboxPath: '/new/inbox',
          libraryPath: '',
        }
      );
    });

    it('should merge config with existing values', () => {
      const mockConfig = {
        inboxPath: '/existing/inbox',
        libraryPath: '/existing/library',
      };

      localStorage.setItem(CONFIG_KEY, JSON.stringify(mockConfig));

      const { result } = renderHook(() => useAppConfig());

      act(() => {
        result.current.saveConfig({ libraryPath: '/new/library' });
      });

      expect(result.current.config).toEqual({
        inboxPath: '/existing/inbox',
        libraryPath: '/new/library',
      });
    });

    it('should handle localStorage errors when saving', () => {
      const { result } = renderHook(() => useAppConfig());

      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      act(() => {
        result.current.saveConfig({ inboxPath: '/test' });
      });

      expect(result.current.config).toEqual({
        inboxPath: '/test',
        libraryPath: '',
      });
      expect(console.error).toHaveBeenCalledWith(
        'Error saving config to localStorage:',
        expect.any(Error)
      );
    });
  });

  describe('setInboxPath', () => {
    it('should update inbox path', () => {
      const { result } = renderHook(() => useAppConfig());

      act(() => {
        result.current.setInboxPath('/new/inbox');
      });

      expect(result.current.config.inboxPath).toBe('/new/inbox');
      expect(result.current.config.libraryPath).toBe('');

      const stored = localStorage.getItem(CONFIG_KEY);
      expect(stored).toBe(
        JSON.stringify({
          inboxPath: '/new/inbox',
          libraryPath: '',
        })
      );
    });

    it('should preserve library path when updating inbox path', () => {
      const mockConfig = {
        inboxPath: '/old/inbox',
        libraryPath: '/existing/library',
      };

      localStorage.setItem(CONFIG_KEY, JSON.stringify(mockConfig));

      const { result } = renderHook(() => useAppConfig());

      act(() => {
        result.current.setInboxPath('/new/inbox');
      });

      expect(result.current.config).toEqual({
        inboxPath: '/new/inbox',
        libraryPath: '/existing/library',
      });
    });
  });

  describe('setLibraryPath', () => {
    it('should update library path', () => {
      const { result } = renderHook(() => useAppConfig());

      act(() => {
        result.current.setLibraryPath('/new/library');
      });

      expect(result.current.config.inboxPath).toBe('');
      expect(result.current.config.libraryPath).toBe('/new/library');

      const stored = localStorage.getItem(CONFIG_KEY);
      expect(stored).toBe(
        JSON.stringify({
          inboxPath: '',
          libraryPath: '/new/library',
        })
      );
    });

    it('should preserve inbox path when updating library path', () => {
      const mockConfig = {
        inboxPath: '/existing/inbox',
        libraryPath: '/old/library',
      };

      localStorage.setItem(CONFIG_KEY, JSON.stringify(mockConfig));

      const { result } = renderHook(() => useAppConfig());

      act(() => {
        result.current.setLibraryPath('/new/library');
      });

      expect(result.current.config).toEqual({
        inboxPath: '/existing/inbox',
        libraryPath: '/new/library',
      });
    });
  });

  describe('Integration scenarios', () => {
    it('should handle multiple updates in sequence', () => {
      const { result } = renderHook(() => useAppConfig());

      act(() => {
        result.current.setInboxPath('/inbox1');
      });

      expect(result.current.config.inboxPath).toBe('/inbox1');

      act(() => {
        result.current.setLibraryPath('/library1');
      });

      expect(result.current.config).toEqual({
        inboxPath: '/inbox1',
        libraryPath: '/library1',
      });

      act(() => {
        result.current.setInboxPath('/inbox2');
      });

      expect(result.current.config).toEqual({
        inboxPath: '/inbox2',
        libraryPath: '/library1',
      });
    });

    it('should handle saveConfig with both paths', () => {
      const { result } = renderHook(() => useAppConfig());

      act(() => {
        result.current.saveConfig({
          inboxPath: '/complete/inbox',
          libraryPath: '/complete/library',
        });
      });

      expect(result.current.config).toEqual({
        inboxPath: '/complete/inbox',
        libraryPath: '/complete/library',
      });

      const stored = localStorage.getItem(CONFIG_KEY);
      expect(JSON.parse(stored!)).toEqual({
        inboxPath: '/complete/inbox',
        libraryPath: '/complete/library',
      });
    });

    it('should maintain state consistency across re-renders', () => {
      const { result, rerender } = renderHook(() => useAppConfig());

      act(() => {
        result.current.setInboxPath('/test/inbox');
      });

      rerender();

      expect(result.current.config.inboxPath).toBe('/test/inbox');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string paths', () => {
      const { result } = renderHook(() => useAppConfig());

      act(() => {
        result.current.setInboxPath('');
        result.current.setLibraryPath('');
      });

      expect(result.current.config).toEqual({
        inboxPath: '',
        libraryPath: '',
      });
    });

    it('should handle special characters in paths', () => {
      const { result } = renderHook(() => useAppConfig());

      const specialPath = '/path/with spaces/and-special_chars@123';

      act(() => {
        result.current.setInboxPath(specialPath);
      });

      expect(result.current.config.inboxPath).toBe(specialPath);

      const stored = localStorage.getItem(CONFIG_KEY);
      expect(JSON.parse(stored!).inboxPath).toBe(specialPath);
    });

    it('should handle very long paths', () => {
      const { result } = renderHook(() => useAppConfig());

      const longPath = '/very/long/path/' + 'segment/'.repeat(100);

      act(() => {
        result.current.setLibraryPath(longPath);
      });

      expect(result.current.config.libraryPath).toBe(longPath);
    });
  });
});
