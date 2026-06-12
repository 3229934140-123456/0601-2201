import { create } from 'zustand';
import type { BrandConfig } from '@/types';

interface BrandStore extends BrandConfig {
  setLogo: (logo: string | null) => void;
  addColor: (color: string) => void;
  removeColor: (color: string) => void;
  setColors: (colors: string[]) => void;
  addFont: (font: string) => void;
  removeFont: (font: string) => void;
}

export const useBrandStore = create<BrandStore>((set) => ({
  logo: null,
  colors: ['#1e1b4b', '#f97316', '#ffffff', '#000000'],
  fonts: ['Inter', 'Playfair Display'],

  setLogo: (logo) => set({ logo }),

  addColor: (color) => set((state) => ({
    colors: state.colors.includes(color) ? state.colors : [...state.colors, color],
  })),

  removeColor: (color) => set((state) => ({
    colors: state.colors.filter(c => c !== color),
  })),

  setColors: (colors) => set({ colors }),

  addFont: (font) => set((state) => ({
    fonts: state.fonts.includes(font) ? state.fonts : [...state.fonts, font],
  })),

  removeFont: (font) => set((state) => ({
    fonts: state.fonts.filter(f => f !== font),
  })),
}));
