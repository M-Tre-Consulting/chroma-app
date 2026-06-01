using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Chroma.Models
{
    /// <summary>
    /// Represents a color palette containing a named collection of colors and metadata.
    /// </summary>
    public class Palette
    {
        /// <summary>
        /// Gets or sets the unique identifier of the palette.
        /// </summary>
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the display name of the palette.
        /// </summary>
        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the collection of colors associated with the palette.
        /// </summary>
        [JsonPropertyName("colours")]
        public List<Colour> Colours { get; set; } = new();

        /// <summary>
        /// Gets or sets the Unix millisecond timestamp when the palette was created.
        /// </summary>
        [JsonPropertyName("createdAt")]
        public long CreatedAt { get; set; }

        /// <summary>
        /// Gets or sets the Unix millisecond timestamp when the palette was last updated.
        /// </summary>
        [JsonPropertyName("updatedAt")]
        public long UpdatedAt { get; set; }
    }
}
