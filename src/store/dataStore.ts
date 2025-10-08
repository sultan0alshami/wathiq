import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SectionData<T> {
  [dateKey: string]: T;
}

export interface FinanceData {
  currentLiquidity: number;
  entries: Array<any>;
}

export interface SalesData {
  customersContacted: number;
  entries: Array<any>;
  dailySummary?: string;
}

interface DataStoreState {
  financeByDate: SectionData<FinanceData>;
  salesByDate: SectionData<SalesData>;
  setFinance(dateKey: string, data: FinanceData): void;
  setSales(dateKey: string, data: SalesData): void;
  getFinance(dateKey: string): FinanceData | undefined;
  getSales(dateKey: string): SalesData | undefined;
  clearAll(): void;
}

export const useDataStore = create<DataStoreState>()(
  persist(
    (set, get) => ({
      financeByDate: {},
      salesByDate: {},
      setFinance: (dateKey, data) => set((s) => ({ financeByDate: { ...s.financeByDate, [dateKey]: data } })),
      setSales: (dateKey, data) => set((s) => ({ salesByDate: { ...s.salesByDate, [dateKey]: data } })),
      getFinance: (dateKey) => get().financeByDate[dateKey],
      getSales: (dateKey) => get().salesByDate[dateKey],
      clearAll: () => set({ financeByDate: {}, salesByDate: {} }),
    }),
    { name: 'wathiq-data-store' }
  )
);
