import { create } from "zustand";
import { BeforeInstallPromptEvent } from "../types/pwaTypes";

interface PWAStore {
  isInstallable: boolean;
  isIOSDevice: boolean;
  installPrompt: BeforeInstallPromptEvent | null;
  setInstallPrompt: (event: BeforeInstallPromptEvent) => void;
  clearInstallPrompt: () => void;
  setIOSDevice: (isIOS: boolean) => void;
}

export const usePWAStore = create<PWAStore>((set) => ({
  isInstallable: false,
  isIOSDevice: false,
  installPrompt: null,
  setInstallPrompt: (event: BeforeInstallPromptEvent) =>
    set({
      isInstallable: true,
      installPrompt: event,
    }),
  clearInstallPrompt: () =>
    set({
      isInstallable: false,
      installPrompt: null,
    }),
  setIOSDevice: (isIOS: boolean) =>
    set({
      isIOSDevice: isIOS,
    }),
}));
