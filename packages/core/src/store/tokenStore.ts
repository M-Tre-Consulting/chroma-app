import { create } from "zustand";
import {
  persist,
  createJSONStorage,
  type StateStorage,
} from "zustand/middleware";
import type { Token, TokenGroup } from "../types";
import generateId from "./generateId";

interface TokenStore {
  groups: TokenGroup[];
  addGroup: (name: string) => void;
  removeGroup: (groupId: string) => void;
  renameGroup: (groupId: string, name: string) => void;
  addToken: (groupId: string, name: string, description?: string) => void;
  removeToken: (groupId: string, tokenId: string) => void;
  updateToken: (
    groupId: string,
    tokenId: string,
    patch: Partial<Token>,
  ) => void;
  assignColour: (
    groupId: string,
    tokenId: string,
    paletteId: string,
    colourId: string,
  ) => void;
}

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export function createTokenStore(storage: StateStorage = noopStorage) {
  return create<TokenStore>()(
    persist<TokenStore>(
      (set) => ({
        groups: [] as TokenGroup[],

        addGroup: (name: string) =>
          set(
            (state): Partial<TokenStore> => ({
              groups: [
                ...state.groups,
                {
                  id: generateId(),
                  name,
                  tokens: [] as Token[],
                },
              ],
            }),
          ),

        removeGroup: (groupId: string) =>
          set(
            (state): Partial<TokenStore> => ({
              groups: state.groups.filter((g) => g.id !== groupId),
            }),
          ),

        renameGroup: (groupId: string, name: string) =>
          set(
            (state): Partial<TokenStore> => ({
              groups: state.groups.map((g) =>
                g.id !== groupId ? g : { ...g, name },
              ),
            }),
          ),

        addToken: (groupId: string, name: string, description?: string) =>
          set(
            (state): Partial<TokenStore> => ({
              groups: state.groups.map((g) =>
                g.id !== groupId
                  ? g
                  : {
                      ...g,
                      tokens: [
                        ...g.tokens,
                        {
                          id: generateId(),
                          name,
                          description: description ?? "",
                          value: { colourId: "", paletteId: "" },
                        },
                      ],
                    },
              ),
            }),
          ),

        removeToken: (groupId: string, tokenId: string) =>
          set(
            (state): Partial<TokenStore> => ({
              groups: state.groups.map((g) =>
                g.id !== groupId
                  ? g
                  : {
                      ...g,
                      tokens: g.tokens.filter((t) => t.id !== tokenId),
                    },
              ),
            }),
          ),

        updateToken: (
          groupId: string,
          tokenId: string,
          patch: Partial<Token>,
        ) =>
          set(
            (state): Partial<TokenStore> => ({
              groups: state.groups.map((g) =>
                g.id !== groupId
                  ? g
                  : {
                      ...g,
                      tokens: g.tokens.map((t) =>
                        t.id !== tokenId ? t : { ...t, ...patch },
                      ),
                    },
              ),
            }),
          ),

        assignColour: (
          groupId: string,
          tokenId: string,
          paletteId: string,
          colourId: string,
        ) =>
          set(
            (state): Partial<TokenStore> => ({
              groups: state.groups.map((g) =>
                g.id !== groupId
                  ? g
                  : {
                      ...g,
                      tokens: g.tokens.map((t) =>
                        t.id !== tokenId
                          ? t
                          : {
                              ...t,
                              value: { paletteId, colourId },
                            },
                      ),
                    },
              ),
            }),
          ),
      }),
      {
        name: "chroma-tokens",
        storage: createJSONStorage(() => storage),
      },
    ),
  );
}

export const useTokenStore = createTokenStore();
