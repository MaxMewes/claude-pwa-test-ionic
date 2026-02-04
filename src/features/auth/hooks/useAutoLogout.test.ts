// vitest globals available via config
import { renderHook, act } from '@testing-library/react';

// Mock authStore
const mockUpdateLastActivity = vi.fn();
const mockClearSession = vi.fn();

vi.mock('../store/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    isAuthenticated: false,
    updateLastActivity: mockUpdateLastActivity,
    clearSession: mockClearSession,
  })),
}));

import { useAutoLogout } from './useAutoLogout';
import { useAuthStore } from '../store/authStore';

const mockUseAuthStore = vi.mocked(useAuthStore);

describe('useAutoLogout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('when not authenticated', () => {
    beforeEach(() => {
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        updateLastActivity: mockUpdateLastActivity,
        clearSession: mockClearSession,
      } as ReturnType<typeof useAuthStore>);
    });

    it('should not set up activity listeners', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

      renderHook(() => useAutoLogout());

      // Should not be called with our specific activity events
      expect(addEventListenerSpy).not.toHaveBeenCalledWith('mousedown', expect.any(Function));
      expect(addEventListenerSpy).not.toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(addEventListenerSpy).not.toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(addEventListenerSpy).not.toHaveBeenCalledWith('scroll', expect.any(Function));
      expect(addEventListenerSpy).not.toHaveBeenCalledWith('touchstart', expect.any(Function));
    });

    it('should return resetTimer function', () => {
      const { result } = renderHook(() => useAutoLogout());

      expect(result.current.resetTimer).toBeDefined();
      expect(typeof result.current.resetTimer).toBe('function');
    });

    it('should not update activity when resetTimer called', () => {
      const { result } = renderHook(() => useAutoLogout());

      act(() => {
        result.current.resetTimer();
      });

      expect(mockUpdateLastActivity).not.toHaveBeenCalled();
    });
  });

  describe('when authenticated', () => {
    beforeEach(() => {
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: true,
        updateLastActivity: mockUpdateLastActivity,
        clearSession: mockClearSession,
      } as ReturnType<typeof useAuthStore>);
    });

    it('should set up activity listeners', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

      renderHook(() => useAutoLogout());

      // Should listen for activity events
      expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
    });

    it('should update last activity on mount', () => {
      renderHook(() => useAutoLogout());

      expect(mockUpdateLastActivity).toHaveBeenCalled();
    });

    it('should remove event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      const { unmount } = renderHook(() => useAutoLogout());

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
    });

    it('should return resetTimer function', () => {
      const { result } = renderHook(() => useAutoLogout());

      expect(result.current.resetTimer).toBeDefined();
      expect(typeof result.current.resetTimer).toBe('function');
    });

    it('should update activity when resetTimer is called', () => {
      const { result } = renderHook(() => useAutoLogout());

      mockUpdateLastActivity.mockClear();

      act(() => {
        result.current.resetTimer();
      });

      expect(mockUpdateLastActivity).toHaveBeenCalled();
    });
  });

  describe('event handling', () => {
    it('should call resetTimer on activity events', () => {
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: true,
        updateLastActivity: mockUpdateLastActivity,
        clearSession: mockClearSession,
      } as ReturnType<typeof useAuthStore>);

      renderHook(() => useAutoLogout());

      // Clear initial call
      mockUpdateLastActivity.mockClear();

      // Simulate activity event
      act(() => {
        document.dispatchEvent(new MouseEvent('mousedown'));
      });

      expect(mockUpdateLastActivity).toHaveBeenCalled();
    });

    it('should call resetTimer on keydown event', () => {
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: true,
        updateLastActivity: mockUpdateLastActivity,
        clearSession: mockClearSession,
      } as ReturnType<typeof useAuthStore>);

      renderHook(() => useAutoLogout());

      mockUpdateLastActivity.mockClear();

      act(() => {
        document.dispatchEvent(new KeyboardEvent('keydown'));
      });

      expect(mockUpdateLastActivity).toHaveBeenCalled();
    });

    it('should call resetTimer on scroll event', () => {
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: true,
        updateLastActivity: mockUpdateLastActivity,
        clearSession: mockClearSession,
      } as ReturnType<typeof useAuthStore>);

      renderHook(() => useAutoLogout());

      mockUpdateLastActivity.mockClear();

      act(() => {
        document.dispatchEvent(new Event('scroll'));
      });

      expect(mockUpdateLastActivity).toHaveBeenCalled();
    });
  });

  describe('cleanup on auth state change', () => {
    it('should clean up listeners when auth state changes to false', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      mockUseAuthStore.mockReturnValue({
        isAuthenticated: true,
        updateLastActivity: mockUpdateLastActivity,
        clearSession: mockClearSession,
      } as ReturnType<typeof useAuthStore>);

      const { rerender } = renderHook(() => useAutoLogout());

      // Change auth state
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        updateLastActivity: mockUpdateLastActivity,
        clearSession: mockClearSession,
      } as ReturnType<typeof useAuthStore>);

      rerender();

      expect(removeEventListenerSpy).toHaveBeenCalled();
    });
  });
});
