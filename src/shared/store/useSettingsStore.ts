/**
 * Zustand Store for User Settings
 * Manages persistent settings like favorites, stored in localStorage.
 * Pattern follows labgate-pwa implementation.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SettingsState {
  // Favorites stored per sender (senderId -> resultIds[])
  favorites: Record<string, number[]>;

  // Actions
  addFavorite: (senderId: string | number, resultId: number) => void;
  removeFavorite: (senderId: string | number, resultId: number) => void;
  isFavorite: (senderId: string | number, resultId: number) => boolean;
  toggleFavorite: (senderId: string | number, resultId: number) => boolean; // Returns new state
  getFavorites: (senderId: string | number) => number[];
}

const STORAGE_KEY = 'labgate-settings';

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      favorites: {},

      addFavorite: (senderId, resultId) => {
        const key = String(senderId);
        set((state) => ({
          favorites: {
            ...state.favorites,
            [key]: [...new Set([...(state.favorites[key] || []), resultId])],
          },
        }));
      },

      removeFavorite: (senderId, resultId) => {
        const key = String(senderId);
        set((state) => ({
          favorites: {
            ...state.favorites,
            [key]: (state.favorites[key] || []).filter((id) => id !== resultId),
          },
        }));
      },

      isFavorite: (senderId, resultId) => {
        const key = String(senderId);
        const state = get();
        return (state.favorites[key] || []).includes(resultId);
      },

      toggleFavorite: (senderId, resultId) => {
        const key = String(senderId);
        const state = get();
        const currentFavorites = state.favorites[key] || [];
        const isCurrentlyFavorite = currentFavorites.includes(resultId);

        if (isCurrentlyFavorite) {
          set({
            favorites: {
              ...state.favorites,
              [key]: currentFavorites.filter((id) => id !== resultId),
            },
          });
          return false; // Now not favorite
        } else {
          set({
            favorites: {
              ...state.favorites,
              [key]: [...currentFavorites, resultId],
            },
          });
          return true; // Now favorite
        }
      },

      getFavorites: (senderId) => {
        const key = String(senderId);
        const state = get();
        return state.favorites[key] || [];
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
