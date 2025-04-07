import { create } from "zustand";

interface PWAState {
  isInstallable: boolean;
  installPrompt: any | null;
  setInstallPrompt: (event: any) => void;
  clearInstallPrompt: () => void;
}

export const usePWAStore = create<PWAState>((set) => ({
  isInstallable: false,
  installPrompt: null,
  setInstallPrompt: (event) =>
    set({ isInstallable: true, installPrompt: event }),
  clearInstallPrompt: () => set({ isInstallable: false, installPrompt: null }),
}));
