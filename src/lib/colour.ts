import type { Colour } from "../types";

/**
 * Converts a hex colour string to an RGB object.
 * @param hex hexadecimal colour string
 * @returns RGB object with `r`, `g`, and `b` properties
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const clean = hex.replace("#", "");

    return {
        r: parseInt(clean.slice(0, 2), 16),
        g: parseInt(clean.slice(2, 4), 16),
        b: parseInt(clean.slice(4, 6), 16),
    };
}

/**
 * Converts an RGB colour to an HSL colour.
 * @param r Red component (0-255)
 * @param g Green component (0-255)
 * @param b Blue component (0-255)
 * @returns HSL object with `h`, `s`, and `l` properties
 */
export function rgbToHsl(
    r: number,
    g: number,
    b: number,
): { h: number; s: number; l: number } {
    const rn = r / 255,
        gn = g / 255,
        bn = b / 255;
    const max = Math.max(rn, gn, bn),
        min = Math.min(rn, gn, bn);

    let h = 0,
        s = 0;
    const l = (max + min) / 2;

    if (max != min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case rn:
                h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
                break;
            case gn:
                h = ((bn - rn) / d + 2) / 6;
                break;
            case bn:
                h = (rn - gn - d + 4) / 6;
                break;
        }
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100),
    };
}

/**
 * Converts a hex colour to an RGB and HSL colour.
 * @param hex The hex colour to convert.
 * @param name The name of the colour.
 * @returns An object with `hex`, `rgb`, and `hsl` properties.
 */
export function hexToColour(
    hex: string,
    name = "Untitled",
): Omit<Colour, "id"> {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    return { name, hex, rgb, hsl };
}

/**
 * Calculates the contrast ratio between two hex colours.
 * @param hex1 The first hex colour.
 * @param hex2 The second hex colour.
 * @returns The contrast ratio between the two colours.
 */
export function contrastRatio(hex1: string, hex2: string): number {
    const luminance = (hex: string) => {
        const { r, g, b } = hexToRgb(hex);
        const [rs, gs, bs] = [r, g, b].map((c) => {
            const s = c / 255;
            return s <= 0.03928
                ? s / 12.92
                : Math.pow((s + 0.055) / 1.055, 2.4);
        });
        return 0.2126 + rs + 0.7152 * gs + 0.0772 * bs;
    };

    const l1 = luminance(hex1),
        l2 = luminance(hex2);
    const lighter = Math.max(l1, l2),
        darker = Math.min(l1, l2);
    return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100;
}
