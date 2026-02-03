/**
 * Zustand Store for User Settings
 * Manages persistent settings like favorites, stored in localStorage.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ResultPeriodFilter = 'today' | '7days' | '30days' | 'all' | 'archive';

interface SettingsState {
  // Global favorites list (resultIds)
  favorites: number[];

  // Preview mode - enables additional preview features
  previewMode: boolean;

  // Results period filter
  resultsPeriod: ResultPeriodFilter;

  // Actions
  addFavorite: (resultId: number) => void;
  removeFavorite: (resultId: number) => void;
  isFavorite: (resultId: number) => boolean;
  toggleFavorite: (resultId: number) => boolean; // Returns new state
  getFavorites: () => number[];
  togglePreviewMode: () => void;
  setPreviewMode: (enabled: boolean) => void;
  setResultsPeriod: (period: ResultPeriodFilter) => void;
  reset: () => void; // Reset all settings to defaults
}

const STORAGE_KEY = 'labgate-settings';

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      favorites: [],
      previewMode: false,
      resultsPeriod: 'today' as ResultPeriodFilter,

      addFavorite: (resultId) => {
        set((state) => ({
          favorites: [...new Set([...state.favorites, resultId])],
        }));
      },

      removeFavorite: (resultId) => {
        set((state) => ({
          favorites: state.favorites.filter((id) => id !== resultId),
        }));
      },

      isFavorite: (resultId) => {
        const state = get();
        return state.favorites.includes(resultId);
      },

      toggleFavorite: (resultId) => {
        // Use atomic update to prevent race conditions
        let isNowFavorite = false;
        set((state) => {
          const isCurrentlyFavorite = state.favorites.includes(resultId);
          if (isCurrentlyFavorite) {
            isNowFavorite = false;
            return { favorites: state.favorites.filter((id) => id !== resultId) };
          } else {
            isNowFavorite = true;
            // Use Set to prevent duplicates in case of race condition
            return { favorites: [...new Set([...state.favorites, resultId])] };
          }
        });
        return isNowFavorite;
      },

      getFavorites: () => {
        const state = get();
        return state.favorites;
      },

      togglePreviewMode: () => {
        set((state) => ({ previewMode: !state.previewMode }));
      },

      setPreviewMode: (enabled) => {
        set({ previewMode: enabled });
      },

      setResultsPeriod: (period) => {
        set({ resultsPeriod: period });
      },

      reset: () => {
        set({
          favorites: [],
          previewMode: false,
          resultsPeriod: 'today',
        });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
