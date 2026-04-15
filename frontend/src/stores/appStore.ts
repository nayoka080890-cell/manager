import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AppState {
  user: any | null;
  isAuthenticated: boolean;
  loading: boolean;
  setUser: (user: any) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        loading: false,
        setUser: (user) => set({ user, isAuthenticated: !!user }),
        setLoading: (loading) => set({ loading }),
        logout: () => set({ user: null, isAuthenticated: false }),
      }),
      {
        name: 'app-storage',
      }
    ),
    {
      name: 'app-store',
    }
  )
);