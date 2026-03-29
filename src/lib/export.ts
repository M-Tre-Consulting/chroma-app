import type { TokenGroup } from "../types";
import type { Palette } from "../types";

function resolveColour(
    groups: TokenGroup[],
    palettes: Palette[],
): { name: string; hex: string }[] {
    return groups.flatMap((g) =>
        g.tokens
            .filter((t) => t.value.colourId && t.value.paletteId)
            .map((t) => {
                const palette = palettes.find(
                    (p) => p.id === t.value.paletteId,
                );
                const colour = palette?.colours.find(
                    (c) => c.id === t.value.colourId,
                );
                return {
                    name: t.name,
                    hex: colour?.hex ?? "#00000000",
                };
            }),
    );
}

export function exportTailwind(
    groups: TokenGroup[],
    palettes: Palette[],
): string {
    const tokens = resolveColour(groups, palettes);
    const entries = tokens
        .map((t) => `    '${t.name}': '${t.hex}',`)
        .join("\n");

    return `// tailwind.config.ts — paste into the colors key
    const colors = {
    ${entries}
    }`;
}

export function exportAndroidXml(
    groups: TokenGroup[],
    palettes: Palette[],
): string {
    const tokens = resolveColour(groups, palettes);
    const entries = tokens
        .map(
            (t) =>
                `    <color name="${t.name.replace(/-/g, "_")}">${t.hex}</color>`,
        )
        .join("\n");

    return `<?xml version="1.0" encoding="utf-8"?>
<resources>
${entries}
</resources>`;
}
