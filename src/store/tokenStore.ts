import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { Token, TokenGroup } from "../types";

/**
 * Zustand store for managing design token groups, persisted to localStorage
 * under the key "iride-tokens".
 *
 * Tokens are organised into named groups (e.g. "Brand", "Surface").
 * Each token can be assigned a colour from any palette in the palette store.
 *
 * @stores {TokenGroup[]} groups - All token groups
 *
 * @action addGroup - Creates a new empty token group
 * @action removeGroup - Deletes a group and all its tokens
 * @action renameGroup - Updates a group's display name
 * @action addToken - Adds a new unassigned token to a group
 * @action removeToken - Removes a token from a group
 * @action updateToken - Merges a partial patch into an existing token
 * @action assignColour - Links a token to a specific colour in a palette
 */
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

export const useTokenStore = create<TokenStore>()(
    persist<TokenStore>(
        (set) => ({
            groups: [] as TokenGroup[],

            addGroup: (name: string) =>
                set(
                    (state): Partial<TokenStore> => ({
                        groups: [
                            ...state.groups,
                            {
                                id: nanoid(),
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
                                              id: nanoid(),
                                              name,
                                              description: description ?? "",
                                              value: {
                                                  colourId: "",
                                                  paletteId: "",
                                              },
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
                                      tokens: g.tokens.filter(
                                          (t) => t.id !== tokenId,
                                      ),
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
                                          t.id !== tokenId
                                              ? t
                                              : { ...t, ...patch },
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
                                                    value: {
                                                        paletteId,
                                                        colourId,
                                                    },
                                                },
                                      ),
                                  },
                        ),
                    }),
                ),
        }),
        { name: "iride-tokens" },
    ),
);
