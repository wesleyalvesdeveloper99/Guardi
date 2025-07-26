import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage, persist } from "zustand/middleware";
import { ScannerModeType } from "@/interface/other";
import { ApiResponse } from "@/interface/response";
import { AxiosError } from "axios";
import { create } from "zustand";

export type ScannerHistoryType = {
  value: string;
  channel: string;
  createdAt: string;
  resultData?: ApiResponse;
  modeType: ScannerModeType;
  error?: Partial<AxiosError>;
};

type ScannerStore = {
  clearHistory: () => void;
  history: ScannerHistoryType[];
  addHistory: (item: ScannerHistoryType) => void;
  addToHistory: (item: ScannerHistoryType[]) => void;
};

export const useScannerStore = create<ScannerStore>()(
  persist(
    (set) => ({
      history: [],
      clearHistory: () => set({ history: [] }),
      addHistory: (item) =>
        set((state) => ({ history: [item, ...state.history] })),
      addToHistory: (item) => {},
    }),
    {
      name: "scanner-history",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
