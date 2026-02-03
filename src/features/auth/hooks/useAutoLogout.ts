import { useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '../store/authStore';

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const THROTTLE_DELAY = 100; // Throttle event handlers to at most once per 100ms

export function useAutoLogout() {
  const { isAuthenticated, updateLastActivity, clearSession } = useAuthStore();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Track the last event handler call time to prevent excessive resets
  const lastEventTimeRef = useRef<number>(0);

  const resetTimer = useCallback(() => {
    // Clear existing timeout before creating new one to prevent timer leak
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

    // Throttled event handler to prevent timer leak from rapid events
    const handleActivity = () => {
      const now = Date.now();
      const timeSinceLastEvent = now - lastEventTimeRef.current;
      
      // Skip if called too frequently to prevent timer leak
      if (timeSinceLastEvent < THROTTLE_DELAY) {
        return;
      }
      lastEventTimeRef.current = now;
      
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
