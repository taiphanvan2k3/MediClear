import { create } from "zustand";
import { ScanStateType, PrescriptionScanResult } from "../types";

export interface ScanState {
  scanState: ScanStateType;
  setScanState: (state: ScanStateType) => void;
  selectedImages: string[];
  setSelectedImages: (images: string[] | ((prev: string[]) => string[])) => void;
  addSelectedImages: (newImages: string[]) => void;
  activeImageIndex: number;
  setActiveImageIndex: (idx: number) => void;
  scanResult: PrescriptionScanResult | null;
  setScanResult: (res: PrescriptionScanResult | null) => void;
  removeImageFromBatch: (indexToRemove: number) => void;
  resetScan: () => void;
}

export const useScanStore = create<ScanState>((set, get) => ({
  scanState: "IDLE",
  setScanState: (scanState) => set({ scanState }),
  selectedImages: [],
  setSelectedImages: (imagesOrFn) =>
    set((state) => ({
      selectedImages: typeof imagesOrFn === "function" ? imagesOrFn(state.selectedImages) : imagesOrFn
    })),
  addSelectedImages: (newImages) =>
    set((state) => ({
      selectedImages: [...state.selectedImages, ...newImages]
    })),
  activeImageIndex: 0,
  setActiveImageIndex: (activeImageIndex) => set({ activeImageIndex }),
  scanResult: null,
  setScanResult: (scanResult) => set({ scanResult }),

  removeImageFromBatch: (indexToRemove) => {
    const { selectedImages, activeImageIndex } = get();
    const updated = selectedImages.filter((_, idx) => idx !== indexToRemove);
    set({
      selectedImages: updated,
      activeImageIndex: activeImageIndex >= updated.length ? Math.max(0, updated.length - 1) : activeImageIndex,
      scanState: updated.length === 0 ? "IDLE" : get().scanState
    });
  },

  resetScan: () => {
    set({
      selectedImages: [],
      activeImageIndex: 0,
      scanResult: null,
      scanState: "IDLE"
    });
  }
}));
