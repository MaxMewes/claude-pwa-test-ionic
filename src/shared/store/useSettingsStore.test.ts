// vitest globals available via config
import { act, renderHook } from '@testing-library/react';
import { useSettingsStore } from './useSettingsStore';

describe('useSettingsStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useSettingsStore());
    act(() => {
      result.current.reset();
    });
  });

  describe('initial state', () => {
    it('should have empty favorites array by default', () => {
      const { result } = renderHook(() => useSettingsStore());
      expect(result.current.favorites).toEqual([]);
    });

    it('should have previewMode disabled by default', () => {
      const { result } = renderHook(() => useSettingsStore());
      expect(result.current.previewMode).toBe(false);
    });

    it('should have resultsPeriod set to today by default', () => {
      const { result } = renderHook(() => useSettingsStore());
      expect(result.current.resultsPeriod).toBe('today');
    });
  });

  describe('favorites management', () => {
    it('should add a favorite', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.addFavorite(123);
      });

      expect(result.current.favorites).toContain(123);
    });

    it('should not add duplicate favorites', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.addFavorite(123);
        result.current.addFavorite(123);
      });

      expect(result.current.favorites.filter((id) => id === 123)).toHaveLength(1);
    });

    it('should add multiple different favorites', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.addFavorite(1);
        result.current.addFavorite(2);
        result.current.addFavorite(3);
      });

      expect(result.current.favorites).toEqual([1, 2, 3]);
    });

    it('should remove a favorite', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.addFavorite(123);
        result.current.addFavorite(456);
      });

      act(() => {
        result.current.removeFavorite(123);
      });

      expect(result.current.favorites).not.toContain(123);
      expect(result.current.favorites).toContain(456);
    });

    it('should not error when removing non-existent favorite', () => {
      const { result } = renderHook(() => useSettingsStore());

      expect(() => {
        act(() => {
          result.current.removeFavorite(999);
        });
      }).not.toThrow();
    });

    it('should correctly check if item is favorite', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.addFavorite(123);
      });

      expect(result.current.isFavorite(123)).toBe(true);
      expect(result.current.isFavorite(456)).toBe(false);
    });

    it('should toggle favorite on', () => {
      const { result } = renderHook(() => useSettingsStore());

      let newState: boolean;
      act(() => {
        newState = result.current.toggleFavorite(123);
      });

      expect(newState!).toBe(true);
      expect(result.current.favorites).toContain(123);
    });

    it('should toggle favorite off', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.addFavorite(123);
      });

      let newState: boolean;
      act(() => {
        newState = result.current.toggleFavorite(123);
      });

      expect(newState!).toBe(false);
      expect(result.current.favorites).not.toContain(123);
    });

    it('should get all favorites', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.addFavorite(1);
        result.current.addFavorite(2);
        result.current.addFavorite(3);
      });

      const favorites = result.current.getFavorites();
      expect(favorites).toEqual([1, 2, 3]);
    });
  });

  describe('preview mode', () => {
    it('should toggle preview mode on', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.togglePreviewMode();
      });

      expect(result.current.previewMode).toBe(true);
    });

    it('should toggle preview mode off', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.togglePreviewMode();
        result.current.togglePreviewMode();
      });

      expect(result.current.previewMode).toBe(false);
    });

    it('should set preview mode directly', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.setPreviewMode(true);
      });

      expect(result.current.previewMode).toBe(true);

      act(() => {
        result.current.setPreviewMode(false);
      });

      expect(result.current.previewMode).toBe(false);
    });
  });

  describe('results period', () => {
    it('should set results period to today', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.setResultsPeriod('today');
      });

      expect(result.current.resultsPeriod).toBe('today');
    });

    it('should set results period to 7days', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.setResultsPeriod('7days');
      });

      expect(result.current.resultsPeriod).toBe('7days');
    });

    it('should set results period to 30days', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.setResultsPeriod('30days');
      });

      expect(result.current.resultsPeriod).toBe('30days');
    });

    it('should set results period to all', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.setResultsPeriod('all');
      });

      expect(result.current.resultsPeriod).toBe('all');
    });

    it('should set results period to archive', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.setResultsPeriod('archive');
      });

      expect(result.current.resultsPeriod).toBe('archive');
    });
  });

  describe('reset', () => {
    it('should reset all settings to defaults', () => {
      const { result } = renderHook(() => useSettingsStore());

      // Make some changes
      act(() => {
        result.current.addFavorite(123);
        result.current.addFavorite(456);
        result.current.setPreviewMode(true);
        result.current.setResultsPeriod('archive');
      });

      // Verify changes
      expect(result.current.favorites).toEqual([123, 456]);
      expect(result.current.previewMode).toBe(true);
      expect(result.current.resultsPeriod).toBe('archive');

      // Reset
      act(() => {
        result.current.reset();
      });

      // Verify defaults
      expect(result.current.favorites).toEqual([]);
      expect(result.current.previewMode).toBe(false);
      expect(result.current.resultsPeriod).toBe('today');
    });
  });

  describe('state sharing across hooks', () => {
    it('should share state between multiple hook instances', () => {
      const { result: result1 } = renderHook(() => useSettingsStore());
      const { result: result2 } = renderHook(() => useSettingsStore());

      act(() => {
        result1.current.addFavorite(999);
      });

      expect(result2.current.favorites).toContain(999);
    });
  });
});
