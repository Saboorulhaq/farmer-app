import { create } from 'zustand';

interface DebugState {
  isDebugMode: boolean;
  setDebugMode: (enabled: boolean) => void;
}

export const useDebugStore = create<DebugState>()((set) => ({
  isDebugMode: false,
  setDebugMode: (enabled: boolean) => set({ isDebugMode: enabled }),
}));
