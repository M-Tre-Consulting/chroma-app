using System.Collections.Generic;
using Chroma.Models;

namespace Chroma.Services
{
    /// <summary>
    /// Coordinates loading and saving palettes and token group maps to native offline storage.
    /// </summary>
    public static class StorageService
    {
        /// <summary>
        /// Reads and deserializes color palettes from native JSON files.
        /// </summary>
        /// <returns>A collection of loaded <see cref="Palette"/> objects, or an empty list if none exist.</returns>
        public static List<Palette> LoadPalettes()
        {
            // TODO: Load and deserialize palettes from native AppData path
            return new List<Palette>();
        }

        /// <summary>
        /// Serializes and persists color palettes into a native JSON file.
        /// </summary>
        /// <param name="palettes">The collection of palettes to save.</param>
        public static void SavePalettes(List<Palette> palettes)
        {
            // TODO: Serialize and write palettes to local JSON files
        }

        /// <summary>
        /// Reads and deserializes design token groups from native JSON files.
        /// </summary>
        /// <returns>A collection of loaded <see cref="TokenGroup"/> objects, or an empty list if none exist.</returns>
        public static List<TokenGroup> LoadTokenGroups()
        {
            // TODO: Load and deserialize token groups from native AppData path
            return new List<TokenGroup>();
        }

        /// <summary>
        /// Serializes and persists design token groups into a native JSON file.
        /// </summary>
        /// <param name="groups">The collection of token groups to save.</param>
        public static void SaveTokenGroups(List<TokenGroup> groups)
        {
            // TODO: Serialize and write token groups to local JSON files
        }
    }
}
