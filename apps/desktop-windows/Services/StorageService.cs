using Chroma.Models;
using System.Data.SqlTypes;
using System.IO;
using System.Text.Json;

namespace Chroma.Services
{
    /// <summary>
    /// Coordinates loading and saving palettes and token group maps to native offline storage.
    /// </summary>
    public static class StorageService
    {
        /// <summary>
        /// Application data storage path for Chroma, typically located
        /// in the user's AppData folder on Windows.
        /// </summary>
        private static readonly string s_storagePath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
            "Chroma"
        );

        /// <summary>
        /// Default file path for storing serialized color palettes in JSON
        /// format within the native application data directory.
        /// </summary>
        private static readonly string s_palettesFile = Path.Combine(s_storagePath, "palettes.json");

        /// <summary>
        /// Default file path for storing serialized design token groups in JSON
        /// format within the native application data directory.
        /// </summary>
        private static readonly string s_tokenGroupsFile = Path.Combine(s_storagePath, "tokenGroups.json");

        /// <summary>
        /// Default application-wide JSON serializer options for consistent formatting
        /// and camelCase property naming across all storage operations.
        /// </summary>
        private static readonly JsonSerializerOptions s_jsonOptions = new()
        {
            WriteIndented = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        /// <summary>
        /// Reads and deserializes color palettes from native JSON files.
        /// </summary>
        /// <returns>A collection of loaded <see cref="Palette"/> objects, or an empty list if none exist.</returns>
        public static List<Palette> LoadPalettes()
        {
            if (!File.Exists(s_palettesFile))
                return [];

            string jsonData = File.ReadAllText(s_palettesFile);
            List<Palette>? palettes = JsonSerializer.Deserialize<List<Palette>>(jsonData, s_jsonOptions);
            return palettes ?? [];
        }

        /// <summary>
        /// Serializes and persists color palettes into a native JSON file.
        /// </summary>
        /// <param name="palettes">The collection of palettes to save.</param>
        public static void SavePalettes(List<Palette> palettes)
        {
            Directory.CreateDirectory(s_storagePath);
            string jsonData = JsonSerializer.Serialize(palettes, s_jsonOptions);
            File.WriteAllText(s_palettesFile, jsonData);
        }

        /// <summary>
        /// Reads and deserializes design token groups from native JSON files.
        /// </summary>
        /// <returns>A collection of loaded <see cref="TokenGroup"/> objects, or an empty list if none exist.</returns>
        public static List<TokenGroup> LoadTokenGroups()
        {
            if (!File.Exists(s_tokenGroupsFile))
                return [];

            string jsonData = File.ReadAllText(s_tokenGroupsFile);
            List<TokenGroup>? tokenGroups = JsonSerializer.Deserialize<List<TokenGroup>>(jsonData, s_jsonOptions);
            return tokenGroups ?? [];
        }

        /// <summary>
        /// Serializes and persists design token groups into a native JSON file.
        /// </summary>
        /// <param name="groups">The collection of token groups to save.</param>
        public static void SaveTokenGroups(List<TokenGroup> groups)
        {
            Directory.CreateDirectory(s_storagePath);
            string jsonData = JsonSerializer.Serialize(groups, s_jsonOptions);
            File.WriteAllText(s_tokenGroupsFile, jsonData);
        }
    }
}
