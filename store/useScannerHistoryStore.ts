import { ApiResponse } from "@/interface/response";
import { persist } from "zustand/middleware";
import { AxiosError } from "axios";
import { create } from "zustand";

type ScannerHistoryType = {
  value: string;
  channel: string;
  createdAt: Date;
  resultData?: ApiResponse;
  error?: Partial<AxiosError>;
};

type ScannerStore = {
  history: ScannerHistoryType[];
  addHistory: (item: ScannerHistoryType) => void;
  clearHistory: () => void;
};

export const useScannerStore = create<ScannerStore>()(
  persist(
    (set) => ({
      history: [],
      addHistory: (item) =>
        set((state) => ({ history: [item, ...state.history] })),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: "scanner-history",
    }
  )
);
