using Chroma.Models;
using System.Text.Json;

namespace Chroma.Services
{
    /// <summary>
    /// Represents a resolved design token with its name, concrete hex value, and parent category group name.
    /// </summary>
    public class ResolvedToken
    {
        /// <summary>
        /// Gets or sets the resolved token key name.
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the resolved color hexadecimal value.
        /// </summary>
        public string Hex { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the name of the parent group categorizing the token.
        /// </summary>
        public string GroupName { get; set; } = string.Empty;
    }

    /// <summary>
    /// Exposes formatting engines converting resolved design tokens into developer-centric format strings.
    /// </summary>
    public static class ExportService
    {
        /// <summary>
        /// Default JSON serializer options for consistent formatting across JSON export methods.
        /// </summary>
        private static readonly JsonSerializerOptions _jsonOptions = new()
        {
            WriteIndented = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DictionaryKeyPolicy = JsonNamingPolicy.CamelCase
        };

        /// <summary>
        /// Resolves active mappings by matching token identifiers with corresponding color properties inside user palettes.
        /// </summary>
        /// <param name="groups">The list of token groups to resolve.</param>
        /// <param name="palettes">The list of palettes containing target color properties.</param>
        /// <returns>A flat collection of successfully resolved tokens.</returns>
        public static List<ResolvedToken> ResolveTokens(List<TokenGroup> groups, List<Palette> palettes)
        {
            List<ResolvedToken> resolved = [];

            foreach (TokenGroup group in groups)
            {
                foreach (Token t in group.Tokens)
                {
                    if (!string.IsNullOrEmpty(t.Value.ColourId) && !string.IsNullOrEmpty(t.Value.PaletteId))
                    {
                        Palette? palette = palettes.Find(p => p.Id == t.Value.PaletteId);
                        Colour? colour = palette?.Colours.FirstOrDefault(c => c.Id == t.Value.ColourId);

                        resolved.Add(new ResolvedToken
                        {
                            Name = (string)t.Name.Clone(),
                            Hex = colour?.Hex ?? "#000000",
                            GroupName = (string)group.Name.Clone()
                        });
                    }
                }
            }

            return resolved;
        }

        /// <summary>
        /// Formats the active design tokens into a CSS Custom Properties stylesheet block.
        /// </summary>
        /// <param name="groups">The active token groups.</param>
        /// <param name="palettes">The active color palettes.</param>
        /// <returns>A formatted CSS stylesheet variables block string.</returns>
        public static string ExportCSS(List<TokenGroup> groups, List<Palette> palettes)
        {
            List<ResolvedToken> tokens = ResolveTokens(groups, palettes);
            List<string> entries = [.. tokens.Select(t => $"  --{t.Name}: {t.Hex};")];
            return $":root {{\n{string.Join("\n", entries)}\n}}";
        }

        /// <summary>
        /// Formats the active design tokens into a SCSS variables stylesheet declarations block.
        /// </summary>
        /// <param name="groups">The active token groups.</param>
        /// <param name="palettes">The active color palettes.</param>
        /// <returns>A formatted SCSS stylesheet variables block string.</returns>
        public static string ExportSCSS(List<TokenGroup> groups, List<Palette> palettes)
        {
            List<ResolvedToken> tokens = ResolveTokens(groups, palettes);
            SortedDictionary<string, List<ResolvedToken>> grouped = [];

            foreach (ResolvedToken t in tokens)
            {
                if (!grouped.ContainsKey(t.GroupName))
                    grouped.Add(t.GroupName, []);

                grouped[t.GroupName].Add(t);
            }

            List<string> sections = [.. grouped
                .Select(group =>
                {
                    var vars = group.Value
                        .Select(t => $"${t.Name}: {t.Hex};")
                        .ToList();

                    return $"// {group.Key}\n{string.Join("\n", vars)}";
                })];

            return string.Join("\n\n", sections);
        }

        /// <summary>
        /// Formats the active design tokens into an Amazon Style Dictionary compatible JSON string block.
        /// </summary>
        /// <param name="groups">The active token groups.</param>
        /// <param name="palettes">The active color palettes.</param>
        /// <returns>A formatted JSON string block.</returns>
        public static string ExportJSON(List<TokenGroup> groups, List<Palette> palettes)
        {
            var tokens = ResolveTokens(groups, palettes);

            Dictionary<string, Dictionary<string, Dictionary<string, string>>> colorMap = [];

            foreach (ResolvedToken t in tokens)
            {
                if (!colorMap.ContainsKey(t.GroupName))
                    colorMap[t.GroupName] = [];

                colorMap[t.GroupName][t.Name] = new()
                {
                    ["value"] = t.Hex
                };
            }

            var root = new Dictionary<string, object>
            {
                ["color"] = colorMap
            };

            return JsonSerializer.Serialize(root, _jsonOptions) ?? string.Empty;
        }

        /// <summary>
        /// Formats the active design tokens into a Tailwind CSS config colors block typescript string.
        /// </summary>
        /// <param name="groups">The active token groups.</param>
        /// <param name="palettes">The active color palettes.</param>
        /// <returns>A formatted typescript constant code block string.</returns>
        public static string ExportTailwind(List<TokenGroup> groups, List<Palette> palettes)
        {
            List<ResolvedToken> tokens = ResolveTokens(groups, palettes);
            List<string> entries = [.. tokens.Select(t => $"  {t.Name}: '{t.Hex}',")];
            return $"// tailwind.config.ts - paste into the colors key\nconst colors = {{\n{string.Join("\n", entries)}\n}};";
        }

        /// <summary>
        /// Formats the active design tokens into an Android colors.xml resources string.
        /// </summary>
        /// <param name="groups">The active token groups.</param>
        /// <param name="palettes">The active color palettes.</param>
        /// <returns>A formatted XML document string.</returns>
        public static string ExportAndroidXml(List<TokenGroup> groups, List<Palette> palettes)
        {
            List<ResolvedToken> tokens = ResolveTokens(groups, palettes);
            List<string> entries = [.. tokens.Select(t =>
            {
                string snakeName = t.Name.Replace('-', '_');
                return $"  <color name=\"{snakeName}\">{t.Hex}</color>";
            })];
            return $"<?xml version\"1.0\" encoding=\"utf-8\"?>\n<resources>\n{string.Join("\n", entries)}\n</resources>";
        }
    }
}
