using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Chroma.Models
{
    /// <summary>
    /// Represents a group of design tokens organized by context or branding criteria.
    /// </summary>
    public class TokenGroup
    {
        /// <summary>
        /// Gets or sets the unique identifier of the token group.
        /// </summary>
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the display name of the token group.
        /// </summary>
        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the collection of tokens contained within this group.
        /// </summary>
        [JsonPropertyName("tokens")]
        public List<Token> Tokens { get; set; } = new();
    }
}
