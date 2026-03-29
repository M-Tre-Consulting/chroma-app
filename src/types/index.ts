/**
 * Describes a colour in the application. This names a
 * ype called `Colour` that is accessible by application
 * resources.
 */
export interface Colour {
    id: string;
    name: string;
    hex: string;
    hsl: { h: number; s: number; l: number };
    rgb: { r: number; g: number; b: number };
}

/**
 * Contains palette information.
 */
export interface Palette {
    id: string;
    name: string;
    colours: Colour[];
    createdAt: string;
    updatedAt: string;
}

/**
 * Palette token TokenValue definition.
 */
export interface TokenValue {
    colourId: string;
    paletteId: string;
}

/**
 * Defines a palette `Token` that can be
 * referenced in the application
 */
export interface Token {
    id: string;
    name: string;
    description: string;
    value: TokenValue;
}

/**
 * Defines a group of Tokens in the application
 */
export interface TokenGroup {
    id: string;
    name: string;
    tokens: Token[];
}

/**
 * Internal application state
 */
export interface AppState {
    palettes: Palette[];
    activeTokenGroups: TokenGroup[];
}
