import { useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '../store/authStore';

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export function useAutoLogout() {
  const { isAuthenticated, updateLastActivity, clearSession } = useAuthStore();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Track the last reset time to prevent excessive resets
  const lastResetRef = useRef<number>(0);
  const RESET_DEBOUNCE = 100; // Only reset timer at most once per 100ms

  const resetTimer = useCallback(() => {
    // Debounce rapid resetTimer calls to prevent timer leak
    const now = Date.now();
    if (now - lastResetRef.current < RESET_DEBOUNCE) {
      return;
    }
    lastResetRef.current = now;

    // Clear existing timeout before creating new one
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (isAuthenticated) {
      updateLastActivity();
      timeoutRef.current = setTimeout(() => {
        clearSession();
      }, INACTIVITY_TIMEOUT);
    }
  }, [isAuthenticated, updateLastActivity, clearSession]);

  useEffect(() => {
    if (!isAuthenticated) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];

    const handleActivity = () => {
      resetTimer();
    };

    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    resetTimer();

    // Cleanup function - ensures all timers and listeners are removed
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isAuthenticated, resetTimer]);

  return { resetTimer };
}
