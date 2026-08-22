import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { TabType } from "../types";

export interface UIState {
  // Navigation
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;

  // Senior & Accessibility
  isLargeText: boolean;
  toggleLargeText: () => void;

  // Modals & Dialogs
  lightboxImage: { url: string; title: string } | null;
  setLightboxImage: (img: { url: string; title: string } | null) => void;
  alertMessage: string | null;
  setAlertMessage: (msg: string | null) => void;
  confirmDialog: { message: string; onConfirm: () => void } | null;
  setConfirmDialog: (dialog: { message: string; onConfirm: () => void } | null) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      activeTab: "RECORDS",
      setActiveTab: (tab) => set({ activeTab: tab }),

      isLargeText: false,
      toggleLargeText: () => set((state) => ({ isLargeText: !state.isLargeText })),

      lightboxImage: null,
      setLightboxImage: (img) => set({ lightboxImage: img }),

      alertMessage: null,
      setAlertMessage: (msg) => set({ alertMessage: msg }),

      confirmDialog: null,
      setConfirmDialog: (dialog) => set({ confirmDialog: dialog })
    }),
    {
      name: "mediClear_ui_store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isLargeText: state.isLargeText
      })
    }
  )
);
