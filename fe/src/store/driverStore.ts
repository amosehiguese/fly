import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Driver {
  id: number;
  fullname: string;
  email: string;
  phone_number: string;
  role: string;
}

interface DriverStore {
  driver: Driver | null;
  token: string | null;
  isAuthenticated: boolean;
  setDriver: (driver: Driver) => void;
  setToken: (token: string) => void;
  login: (data: { driver: Driver; token: string }) => void;
  logout: () => void;
}

export const useDriverStore = create<DriverStore>()(
  persist(
    (set) => ({
      driver: null,
      token: null,
      isAuthenticated: false,
      setDriver: (driver) => set({ driver }),
      setToken: (token) => set({ token }),
      login: (data) => 
        set({ 
          driver: data.driver, 
          token: data.token,
          isAuthenticated: true 
        }),
      logout: () => 
        set({ 
          driver: null, 
          token: null, 
          isAuthenticated: false 
        }),
    }),
    {
      name: 'driver-storage', // unique name for localStorage key
      storage: createJSONStorage(() => localStorage), // use localStorage for persistence
    }
  )
);