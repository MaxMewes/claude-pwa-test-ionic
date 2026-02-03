import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const THROTTLE_DELAY = 1000; // Throttle activity events to max 1 per second

export function useAutoLogout() {
  const { isAuthenticated, updateLastActivity, clearSession } = useAuthStore();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityTimeRef = useRef<number>(0);

  // Store functions in refs to avoid dependency issues
  const updateLastActivityRef = useRef(updateLastActivity);
  const clearSessionRef = useRef(clearSession);
  const isAuthenticatedRef = useRef(isAuthenticated);

  // Keep refs updated
  updateLastActivityRef.current = updateLastActivity;
  clearSessionRef.current = clearSession;
  isAuthenticatedRef.current = isAuthenticated;

  // Exposed resetTimer function for external use
  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (isAuthenticatedRef.current) {
      updateLastActivityRef.current();
      timeoutRef.current = setTimeout(() => {
        clearSessionRef.current();
      }, INACTIVITY_TIMEOUT);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    // Throttled activity handler to prevent excessive timer resets
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastActivityTimeRef.current < THROTTLE_DELAY) {
        return; // Skip if last activity was less than THROTTLE_DELAY ago
      }
      lastActivityTimeRef.current = now;
      resetTimer();
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'] as const;

    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    // Initial timer start
    resetTimer();

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
