import { create } from "zustand";
import {
  persist,
  createJSONStorage,
  type StateStorage,
} from "zustand/middleware";
import type { Palette, Colour } from "../types";
import generateId from "./generateId";

interface PaletteStore {
  palettes: Palette[];
  activePaletteId: string | null;
  addPalette: (name: string) => void;
  removePalette: (id: string) => void;
  setActivePalette: (id: string) => void;
  addColour: (paletteId: string, hex: string, name?: string) => void;
  updateColour: (
    paletteId: string,
    colourId: string,
    patch: Partial<Colour>,
  ) => void;
  removeColour: (paletteId: string, colourId: string) => void;
}

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export function createPaletteStore(storage: StateStorage = noopStorage) {
  return create<PaletteStore>()(
    persist<PaletteStore>(
      (set) => ({
        palettes: [] as Palette[],
        activePaletteId: null,

        addPalette: (name: string) =>
          set(
            (state): Partial<PaletteStore> => ({
              palettes: [
                ...state.palettes,
                {
                  id: generateId(),
                  name,
                  colours: [] as Colour[],
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                },
              ],
            }),
          ),

        removePalette: (id: string) =>
          set(
            (state): Partial<PaletteStore> => ({
              palettes: state.palettes.filter((p) => p.id !== id),
              activePaletteId:
                state.activePaletteId === id ? null : state.activePaletteId,
            }),
          ),

        setActivePalette: (id: string) => set({ activePaletteId: id }),

        addColour: (paletteId: string, hex: string, name?: string) =>
          set(
            (state): Partial<PaletteStore> => ({
              palettes: state.palettes.map((p) =>
                p.id !== paletteId
                  ? p
                  : {
                      ...p,
                      updatedAt: Date.now(),
                      colours: [
                        ...p.colours,
                        {
                          id: generateId(),
                          name: name ?? "",
                          hex,
                          rgb: { r: 0, g: 0, b: 0 },
                          hsl: { h: 0, s: 0, l: 0 },
                        },
                      ],
                    },
              ),
            }),
          ),

        updateColour: (
          paletteId: string,
          colourId: string,
          patch: Partial<Colour>,
        ) =>
          set(
            (state): Partial<PaletteStore> => ({
              palettes: state.palettes.map((p) =>
                p.id !== paletteId
                  ? p
                  : {
                      ...p,
                      updatedAt: Date.now(),
                      colours: p.colours.map((c) =>
                        c.id !== colourId ? c : { ...c, ...patch },
                      ),
                    },
              ),
            }),
          ),

        removeColour: (paletteId: string, colourId: string) =>
          set(
            (state): Partial<PaletteStore> => ({
              palettes: state.palettes.map((p) =>
                p.id !== paletteId
                  ? p
                  : {
                      ...p,
                      updatedAt: Date.now(),
                      colours: p.colours.filter((c) => c.id !== colourId),
                    },
              ),
            }),
          ),
      }),
      {
        name: "chroma-palettes",
        storage: createJSONStorage(() => storage),
      },
    ),
  );
}

export const usePaletteStore = createPaletteStore();
