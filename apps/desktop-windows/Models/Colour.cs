using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Text.Json.Serialization;
using Chroma.Services;

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
    public class Colour : INotifyPropertyChanged
    {
        public event PropertyChangedEventHandler? PropertyChanged;

        protected void OnPropertyChanged([CallerMemberName] string propertyName = "")
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        private string _id = string.Empty;
        /// <summary>
        /// Gets or sets the unique identifier of the color.
        /// </summary>
        [JsonPropertyName("id")]
        public string Id
        {
            get => _id;
            set { _id = value; OnPropertyChanged(); }
        }

        private string _name = string.Empty;
        /// <summary>
        /// Gets or sets the display name of the color.
        /// </summary>
        [JsonPropertyName("name")]
        public string Name
        {
            get => _name;
            set { _name = value; OnPropertyChanged(); }
        }

        private string _hex = string.Empty;
        /// <summary>
        /// Gets or sets the hexadecimal color value string (e.g. #7c6ff7).
        /// </summary>
        [JsonPropertyName("hex")]
        public string Hex
        {
            get => _hex;
            set { _hex = value; OnPropertyChanged(); TriggerContrastUpdates(); }
        }

        private Rgb _rgb = new();
        /// <summary>
        /// Gets or sets the RGB representation of the color.
        /// </summary>
        [JsonPropertyName("rgb")]
        public Rgb Rgb
        {
            get => _rgb;
            set { _rgb = value; OnPropertyChanged(); }
        }

        private Hsl _hsl = new();
        /// <summary>
        /// Gets or sets the HSL representation of the color.
        /// </summary>
        [JsonPropertyName("hsl")]
        public Hsl Hsl
        {
            get => _hsl;
            set { _hsl = value; OnPropertyChanged(); }
        }

        private string _contrastBgHex = "#FFFFFF";
        /// <summary>
        /// Gets or sets the contrast background color hex code.
        /// </summary>
        [JsonIgnore]
        public string ContrastBgHex
        {
            get => _contrastBgHex;
            set
            {
                if (_contrastBgHex != value)
                {
                    _contrastBgHex = value;
                    OnPropertyChanged();
                    TriggerContrastUpdates();
                }
            }
        }

        [JsonIgnore]
        public string ContrastRatioText
        {
            get
            {
                double? ratio = ColorService.ContrastRatio(Hex, ContrastBgHex);
                return ratio.HasValue ? $"{ratio.Value:F1}:1" : "1.0:1";
            }
        }

        [JsonIgnore]
        public string WcagRating
        {
            get
            {
                double? ratio = ColorService.ContrastRatio(Hex, ContrastBgHex);
                return ratio.HasValue ? ColorService.WcagLevel(ratio.Value) : "Fail";
            }
        }

        [JsonIgnore]
        public bool IsContrastFail
        {
            get
            {
                string rating = WcagRating;
                return rating == "Fail" || rating == "AA Large";
            }
        }

        [JsonIgnore]
        public string SuggestedFixHex
        {
            get
            {
                return ColorService.SuggestFix(Hex, ContrastBgHex);
            }
        }

        [JsonIgnore]
        public string WcagBadgeBrush
        {
            get
            {
                return WcagRating switch
                {
                    "AAA" => "#222EC27E",      // Soft green
                    "AA" => "#223584E4",       // Soft blue
                    "AA Large" => "#221C71D8",  // Soft indigo
                    _ => "#22E01B24"           // Soft red
                };
            }
        }

        [JsonIgnore]
        public string WcagTextBrush
        {
            get
            {
                return WcagRating switch
                {
                    "AAA" => "#2EC27E",
                    "AA" => "#3584E4",
                    "AA Large" => "#1C71D8",
                    _ => "#E01B24"
                };
            }
        }

        public void TriggerContrastUpdates()
        {
            OnPropertyChanged(nameof(ContrastRatioText));
            OnPropertyChanged(nameof(WcagRating));
            OnPropertyChanged(nameof(WcagBadgeBrush));
            OnPropertyChanged(nameof(WcagTextBrush));
            OnPropertyChanged(nameof(IsContrastFail));
            OnPropertyChanged(nameof(SuggestedFixHex));
        }
    }
}
