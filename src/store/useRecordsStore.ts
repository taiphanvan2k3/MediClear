import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  HistoryRecord,
  DEFAULT_HISTORY_RECORDS,
  MedSearchHistoryItem,
  DEFAULT_MED_SEARCH_HISTORY
} from "../types";

export interface RecordsState {
  historyRecords: HistoryRecord[];
  medSearchHistory: MedSearchHistoryItem[];

  addRecord: (record: HistoryRecord) => void;
  deleteRecord: (id: string) => void;
  addPhotosToRecord: (recordId: string, newPhotos: string[]) => void;
  saveMedSearchHistory: (item: MedSearchHistoryItem) => void;
  deleteMedSearchItem: (id: string) => void;
}

export const useRecordsStore = create<RecordsState>()(
  persist(
    (set) => ({
      historyRecords: DEFAULT_HISTORY_RECORDS,
      medSearchHistory: DEFAULT_MED_SEARCH_HISTORY,

      addRecord: (record) =>
        set((state) => ({
          historyRecords: [record, ...state.historyRecords]
        })),

      deleteRecord: (id) =>
        set((state) => ({
          historyRecords: state.historyRecords.filter((r) => r.id !== id)
        })),

      addPhotosToRecord: (recordId, newPhotos) =>
        set((state) => ({
          historyRecords: state.historyRecords.map((rec) => {
            if (rec.id === recordId) {
              const currentImgs = rec.imageUrls || (rec.imageUrl ? [rec.imageUrl] : []);
              return {
                ...rec,
                imageUrls: [...currentImgs, ...newPhotos]
              };
            }
            return rec;
          })
        })),

      saveMedSearchHistory: (item) =>
        set((state) => {
          const filtered = state.medSearchHistory.filter((i) => i.name !== item.name);
          return { medSearchHistory: [item, ...filtered] };
        }),

      deleteMedSearchItem: (id) =>
        set((state) => ({
          medSearchHistory: state.medSearchHistory.filter((item) => item.id !== id)
        }))
    }),
    {
      name: "mediClear_records_store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        historyRecords: state.historyRecords,
        medSearchHistory: state.medSearchHistory
      })
    }
  )
);
