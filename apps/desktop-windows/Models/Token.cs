using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Text.Json.Serialization;

namespace Chroma.Models
{
    /// <summary>
    /// Represents an abstract design token mapped to a specific color palette entry.
    /// </summary>
    public class Token : INotifyPropertyChanged
    {
        public event PropertyChangedEventHandler? PropertyChanged;

        protected void OnPropertyChanged([CallerMemberName] string propertyName = "")
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        private string _id = string.Empty;
        /// <summary>
        /// Gets or sets the unique identifier of the token.
        /// </summary>
        [JsonPropertyName("id")]
        public string Id
        {
            get => _id;
            set { _id = value; OnPropertyChanged(); }
        }

        private string _name = string.Empty;
        /// <summary>
        /// Gets or sets the name identifier of the token (e.g. color-brand-primary).
        /// </summary>
        [JsonPropertyName("name")]
        public string Name
        {
            get => _name;
            set { _name = value; OnPropertyChanged(); }
        }

        private string _description = string.Empty;
        /// <summary>
        /// Gets or sets the description explaining the token's application context.
        /// </summary>
        [JsonPropertyName("description")]
        public string Description
        {
            get => _description;
            set { _description = value; OnPropertyChanged(); }
        }

        private TokenValue _value = new();
        /// <summary>
        /// Gets or sets the token's mapping reference values.
        /// </summary>
        [JsonPropertyName("value")]
        public TokenValue Value
        {
            get => _value;
            set { _value = value; OnPropertyChanged(); OnPropertyChanged(nameof(ValueKey)); }
        }

        /// <summary>
        /// Exposes a combined string representation of the palette and color ID for selection binding.
        /// </summary>
        [JsonIgnore]
        public string ValueKey
        {
            get
            {
                if (Value == null || string.IsNullOrEmpty(Value.PaletteId) || string.IsNullOrEmpty(Value.ColourId))
                    return "none";
                return $"{Value.PaletteId}::{Value.ColourId}";
            }
            set
            {
                if (Value == null) Value = new TokenValue();
                if (value == "none" || string.IsNullOrEmpty(value))
                {
                    Value.PaletteId = string.Empty;
                    Value.ColourId = string.Empty;
                }
                else
                {
                    var parts = value.Split("::");
                    if (parts.Length == 2)
                    {
                        Value.PaletteId = parts[0];
                        Value.ColourId = parts[1];
                    }
                }
                OnPropertyChanged();
                OnPropertyChanged(nameof(ValueKey));
            }
        }
    }
}
