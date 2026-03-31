'use client';

import { create } from 'zustand';

interface SearchState {
  query: string;
  selectedLabels: number[];
  matchMode: 'ANY' | 'ALL';
  showFilters: boolean;
  selectedPriceLevels: number[];
  selectedVenueTypes: string[];
  setQuery: (query: string) => void;
  setSelectedLabels: (labels: number[]) => void;
  setMatchMode: (mode: 'ANY' | 'ALL') => void;
  setShowFilters: (show: boolean) => void;
  setSelectedPriceLevels: (levels: number[]) => void;
  setSelectedVenueTypes: (types: string[]) => void;
  clearAll: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  selectedLabels: [],
  matchMode: 'ANY',
  showFilters: false,
  selectedPriceLevels: [],
  selectedVenueTypes: [],

  setQuery: (query) => set({ query }),
  setSelectedLabels: (labels) => set({ selectedLabels: labels }),
  setMatchMode: (mode) => set({ matchMode: mode }),
  setShowFilters: (show) => set({ showFilters: show }),
  setSelectedPriceLevels: (levels) => set({ selectedPriceLevels: levels }),
  setSelectedVenueTypes: (types) => set({ selectedVenueTypes: types }),
  clearAll: () => set({ query: '', selectedLabels: [], showFilters: false, selectedPriceLevels: [], selectedVenueTypes: [] }),
}));
