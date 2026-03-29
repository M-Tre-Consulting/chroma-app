import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { Palette, Colour } from "../types";
import { hexToColour } from "../lib/colour";

/**
 * Palette storage type defined as `PaletteStore`
 */
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

/**
 * Global Zustand store for managing colour palettes, persisted to localStorage
 * under the key "chroma-palettes" via the persist middleware.
 *
 * Provides full CRUD operations for both palettes and the colours within them.
 * All mutating actions update the `updatedAt` timestamp on the affected palette.
 */
export const usePaletteStore = create<PaletteStore>()(
    persist<PaletteStore>(
        (set) => ({
            palettes: [],
            activePaletteId: null,

            addPalette: (name) =>
                set((state) => ({
                    palettes: [
                        ...state.palettes,
                        {
                            id: nanoid(),
                            name,
                            colours: [],
                            createdAt: Date.now(),
                            updatedAt: Date.now(),
                        },
                    ],
                })),

            removePalette: (id) =>
                set((state) => ({
                    palettes: state.palettes.filter((p) => p.id !== id),
                    activePaletteId:
                        state.activePaletteId === id
                            ? null
                            : state.activePaletteId,
                })),

            setActivePalette: (id) => set({ activePaletteId: id }),

            addColour: (paletteId, hex, name) =>
                set((state) => ({
                    palettes: state.palettes.map((p) =>
                        p.id !== paletteId
                            ? p
                            : {
                                  ...p,
                                  updatedAt: Date.now(),
                                  colours: [
                                      ...p.colours,
                                      {
                                          id: nanoid(),
                                          ...hexToColour(hex, name),
                                      },
                                  ],
                              },
                    ),
                })),

            updateColour: (paletteId, colourId, patch) =>
                set((state) => ({
                    palettes: state.palettes.map((p) =>
                        p.id !== paletteId
                            ? p
                            : {
                                  ...p,
                                  updatedAt: Date.now(),
                                  colours: p.colours.map((c) =>
                                      c.id !== colourId
                                          ? c
                                          : { ...c, ...patch },
                                  ),
                              },
                    ),
                })),

            removeColour: (paletteId, colourId) =>
                set((state) => ({
                    palettes: state.palettes.map((p) =>
                        p.id !== paletteId
                            ? p
                            : {
                                  ...p,
                                  updatedAt: Date.now(),
                                  colours: p.colours.filter(
                                      (c) => c.id !== colourId,
                                  ),
                              },
                    ),
                })),
        }),
        { name: "chroma-palettes" },
    ),
);
