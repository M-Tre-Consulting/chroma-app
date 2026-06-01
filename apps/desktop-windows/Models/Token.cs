using System.Text.Json.Serialization;

namespace Chroma.Models
{
    /// <summary>
    /// Represents an abstract design token mapped to a specific color palette entry.
    /// </summary>
    public class Token
    {
        /// <summary>
        /// Gets or sets the unique identifier of the token.
        /// </summary>
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the name identifier of the token (e.g. color-brand-primary).
        /// </summary>
        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the description explaining the token's application context.
        /// </summary>
        [JsonPropertyName("description")]
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the token's mapping reference values.
        /// </summary>
        [JsonPropertyName("value")]
        public TokenValue Value { get; set; } = new();
    }
}
