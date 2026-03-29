import type { TokenGroup, Palette } from "../types";

/**
 * Resolves token groups and palettes into a flat list of name/hex pairs.
 * Filters out any tokens that have not been assigned a colour.
 *
 * @param groups - Token groups to resolve
 * @param palettes - Palettes to look up colours from
 * @returns Flat array of resolved token name and hex value pairs
 */
function resolveTokens(
    groups: TokenGroup[],
    palettes: Palette[],
): { name: string; hex: string; group: string }[] {
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
                    hex: colour?.hex ?? "#000000",
                    group: g.name,
                };
            }),
    );
}

/**
 * Generates a CSS custom properties file from the current token groups.
 * Output can be pasted into any stylesheet.
 *
 * @param groups - Token groups to export
 * @param palettes - Palettes to resolve colour values from
 * @returns CSS string
 */
export function exportCSS(groups: TokenGroup[], palettes: Palette[]): string {
    const tokens = resolveTokens(groups, palettes);
    const entries = tokens.map((t) => `  --${t.name}: ${t.hex};`).join("\n");

    return `:root {\n${entries}\n}`;
}

/**
 * Generates a SCSS variables file from the current token groups.
 * Output can be imported into any SCSS project.
 *
 * @param groups - Token groups to export
 * @param palettes - Palettes to resolve colour values from
 * @returns SCSS string
 */
export function exportSCSS(groups: TokenGroup[], palettes: Palette[]): string {
    const tokens = resolveTokens(groups, palettes);
    const grouped = tokens.reduce<Record<string, typeof tokens>>((acc, t) => {
        acc[t.group] = acc[t.group] ?? [];
        acc[t.group].push(t);
        return acc;
    }, {});

    return Object.entries(grouped)
        .map(([group, ts]) => {
            const vars = ts.map((t) => `$${t.name}: ${t.hex};`).join("\n");
            return `// ${group}\n${vars}`;
        })
        .join("\n\n");
}

/**
 * Generates a Style Dictionary compatible JSON file from the current token groups.
 * Output can be used directly with Amazon's Style Dictionary tool.
 *
 * @param groups - Token groups to export
 * @param palettes - Palettes to resolve colour values from
 * @returns JSON string
 */
export function exportJSON(groups: TokenGroup[], palettes: Palette[]): string {
    const tokens = resolveTokens(groups, palettes);
    const grouped = tokens.reduce<
        Record<string, Record<string, { value: string }>>
    >((acc, t) => {
        acc[t.group] = acc[t.group] ?? {};
        acc[t.group][t.name] = { value: t.hex };
        return acc;
    }, {});

    return JSON.stringify({ color: grouped }, null, 2);
}

/**
 * Generates a Tailwind CSS colors config block from the current token groups.
 * Output can be pasted directly into the colors key of tailwind.config.ts.
 *
 * @param groups - Token groups to export
 * @param palettes - Palettes to resolve colour values from
 * @returns Tailwind config string
 */
export function exportTailwind(
    groups: TokenGroup[],
    palettes: Palette[],
): string {
    const tokens = resolveTokens(groups, palettes);
    const entries = tokens.map((t) => `  '${t.name}': '${t.hex}',`).join("\n");

    return `// tailwind.config.ts — paste into the colors key\nconst colors = {\n${entries}\n}`;
}

/**
 * Generates an Android colors.xml resource file from the current token groups.
 * Output is ready to drop into res/values/colors.xml.
 * Token names are converted from kebab-case to snake_case to comply with
 * Android resource naming rules.
 *
 * @param groups - Token groups to export
 * @param palettes - Palettes to resolve colour values from
 * @returns Android XML string
 */
export function exportAndroidXml(
    groups: TokenGroup[],
    palettes: Palette[],
): string {
    const tokens = resolveTokens(groups, palettes);
    const entries = tokens
        .map(
            (t) =>
                `  <color name="${t.name.replace(/-/g, "_")}">${t.hex}</color>`,
        )
        .join("\n");

    return `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n${entries}\n</resources>`;
}
