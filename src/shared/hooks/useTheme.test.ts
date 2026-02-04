// vitest globals available via config
import { renderHook, act } from '@testing-library/react';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock document.body.classList
const mockClassList = {
  add: vi.fn(),
  remove: vi.fn(),
  toggle: vi.fn(),
  contains: vi.fn(() => false),
};

Object.defineProperty(document.body, 'classList', {
  value: mockClassList,
  writable: true,
});

import { useTheme } from './useTheme';

describe('useTheme', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    mockClassList.add.mockClear();
    mockClassList.remove.mockClear();
    mockClassList.toggle.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with light theme by default', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe('light');
    });

    it('should initialize with saved theme from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('dark');

      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe('dark');
    });

    it('should apply theme on initialization', () => {
      localStorageMock.getItem.mockReturnValue('light');

      renderHook(() => useTheme());

      expect(mockClassList.remove).toHaveBeenCalledWith('dark', 'light');
      expect(mockClassList.add).toHaveBeenCalledWith('light');
    });
  });

  describe('toggleDarkMode', () => {
    it('should toggle from light to dark', () => {
      localStorageMock.getItem.mockReturnValue('light');

      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.toggleDarkMode();
      });

      expect(result.current.theme).toBe('dark');
    });

    it('should toggle from dark to light', () => {
      localStorageMock.getItem.mockReturnValue('dark');

      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.toggleDarkMode();
      });

      expect(result.current.theme).toBe('light');
    });

    it('should persist theme to localStorage', () => {
      localStorageMock.getItem.mockReturnValue('light');

      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.toggleDarkMode();
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith('labgate-theme', 'dark');
    });
  });

  describe('setTheme', () => {
    it('should set theme to dark', () => {
      localStorageMock.getItem.mockReturnValue('light');

      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.theme).toBe('dark');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('labgate-theme', 'dark');
    });

    it('should set theme to light', () => {
      localStorageMock.getItem.mockReturnValue('dark');

      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.setTheme('light');
      });

      expect(result.current.theme).toBe('light');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('labgate-theme', 'light');
    });

    it('should set theme to system', () => {
      localStorageMock.getItem.mockReturnValue('light');

      // Mock matchMedia for system theme
      const mockMatchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      Object.defineProperty(window, 'matchMedia', { value: mockMatchMedia, writable: true });

      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.setTheme('system');
      });

      expect(result.current.theme).toBe('system');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('labgate-theme', 'system');
    });
  });

  describe('isDark state', () => {
    it('should return isDark false for light theme', () => {
      localStorageMock.getItem.mockReturnValue('light');

      const { result } = renderHook(() => useTheme());

      expect(result.current.isDark).toBe(false);
    });

    it('should return isDark true for dark theme', () => {
      localStorageMock.getItem.mockReturnValue('dark');

      const { result } = renderHook(() => useTheme());

      expect(result.current.isDark).toBe(true);
    });
  });
});
