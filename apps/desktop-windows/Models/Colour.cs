using System.Text.Json.Serialization;

namespace Chroma.Models
{
    /// <summary>
    /// Represents color values in the RGB color model.
    /// </summary>
    public class Rgb
    {
        /// <summary>
        /// Gets or sets the Red component value (0 to 255).
        /// </summary>
        [JsonPropertyName("r")]
        public byte R { get; set; }

        /// <summary>
        /// Gets or sets the Green component value (0 to 255).
        /// </summary>
        [JsonPropertyName("g")]
        public byte G { get; set; }

        /// <summary>
        /// Gets or sets the Blue component value (0 to 255).
        /// </summary>
        [JsonPropertyName("b")]
        public byte B { get; set; }
    }

    /// <summary>
    /// Represents color values in the HSL color model.
    /// </summary>
    public class Hsl
    {
        /// <summary>
        /// Gets or sets the Hue component value (0 to 360).
        /// </summary>
        [JsonPropertyName("h")]
        public int H { get; set; }

        /// <summary>
        /// Gets or sets the Saturation component value (0 to 100).
        /// </summary>
        [JsonPropertyName("s")]
        public int S { get; set; }

        /// <summary>
        /// Gets or sets the Lightness component value (0 to 100).
        /// </summary>
        [JsonPropertyName("l")]
        public int L { get; set; }
    }

    /// <summary>
    /// Represents a design color defined by name, hex, and its equivalent RGB and HSL structures.
    /// </summary>
    public class Colour
    {
        /// <summary>
        /// Gets or sets the unique identifier of the color.
        /// </summary>
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the display name of the color.
        /// </summary>
        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the hexadecimal color value string (e.g. #7c6ff7).
        /// </summary>
        [JsonPropertyName("hex")]
        public string Hex { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the RGB representation of the color.
        /// </summary>
        [JsonPropertyName("rgb")]
        public Rgb Rgb { get; set; } = new();

        /// <summary>
        /// Gets or sets the HSL representation of the color.
        /// </summary>
        [JsonPropertyName("hsl")]
        public Hsl Hsl { get; set; } = new();
    }
}
