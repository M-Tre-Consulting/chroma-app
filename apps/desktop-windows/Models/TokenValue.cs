using System.Text.Json.Serialization;

namespace Chroma.Models
{
    /// <summary>
    /// Represents the mapping references linking a design token to a specific color within a palette.
    /// </summary>
    public class TokenValue
    {
        /// <summary>
        /// Gets or sets the target color identifier.
        /// </summary>
        [JsonPropertyName("colourId")]
        public string ColourId { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the parent palette identifier.
        /// </summary>
        [JsonPropertyName("paletteId")]
        public string PaletteId { get; set; } = string.Empty;
    }
}
