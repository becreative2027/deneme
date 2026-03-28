'use client';

import { create } from 'zustand';

interface SearchState {
  query: string;
  selectedLabels: number[];
  matchMode: 'ANY' | 'ALL';
  showFilters: boolean;
  setQuery: (query: string) => void;
  setSelectedLabels: (labels: number[]) => void;
  setMatchMode: (mode: 'ANY' | 'ALL') => void;
  setShowFilters: (show: boolean) => void;
  clearAll: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  selectedLabels: [],
  matchMode: 'ANY',
  showFilters: false,

  setQuery: (query) => set({ query }),
  setSelectedLabels: (labels) => set({ selectedLabels: labels }),
  setMatchMode: (mode) => set({ matchMode: mode }),
  setShowFilters: (show) => set({ showFilters: show }),
  clearAll: () => set({ query: '', selectedLabels: [], showFilters: false }),
}));
