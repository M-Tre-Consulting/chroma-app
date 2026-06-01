using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using Chroma.Models;
using Chroma.Services;

namespace Chroma.ViewModels
{
    /// <summary>
    /// Represents the main application state and binding manager for Chroma's WPF interface.
    /// </summary>
    public class MainWindowViewModel : INotifyPropertyChanged
    {
        /// <summary>
        /// Raised when a bound property value changes.
        /// </summary>
        public event PropertyChangedEventHandler? PropertyChanged;

        /// <summary>
        /// Triggers property change notifications on bound UI fields.
        /// </summary>
        /// <param name="propertyName">The name of the modified property.</param>
        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = "")
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        private ObservableCollection<Palette> _palettes = new();
        /// <summary>
        /// Gets or sets the collection of available color palettes.
        /// </summary>
        public ObservableCollection<Palette> Palettes
        {
            get => _palettes;
            set { _palettes = value; OnPropertyChanged(); }
        }

        private Palette? _activePalette;
        /// <summary>
        /// Gets or sets the currently selected active palette.
        /// </summary>
        public Palette? ActivePalette
        {
            get => _activePalette;
            set 
            { 
                _activePalette = value; 
                OnPropertyChanged(); 
                OnPropertyChanged(nameof(ActivePaletteColoursCountText));
            }
        }

        /// <summary>
        /// Gets the helper status text showing color counts on the active palette.
        /// </summary>
        public string ActivePaletteColoursCountText
        {
            get
            {
                if (ActivePalette == null) return "Create or select a palette to get started";
                int count = ActivePalette.Colours.Count;
                return $"{count} colour{(count != 1 ? "s" : "")}";
            }
        }

        private ObservableCollection<TokenGroup> _tokenGroups = new();
        /// <summary>
        /// Gets or sets the collection of token groups.
        /// </summary>
        public ObservableCollection<TokenGroup> TokenGroups
        {
            get => _tokenGroups;
            set { _tokenGroups = value; OnPropertyChanged(); }
        }

        private TokenGroup? _activeTokenGroup;
        /// <summary>
        /// Gets or sets the currently selected token group.
        /// </summary>
        public TokenGroup? ActiveTokenGroup
        {
            get => _activeTokenGroup;
            set { _activeTokenGroup = value; OnPropertyChanged(); }
        }

        private string _selectedColorHex = "#7c6ff7";
        /// <summary>
        /// Gets or sets the current hex value selected in the color input panel.
        /// </summary>
        public string SelectedColorHex
        {
            get => _selectedColorHex;
            set { _selectedColorHex = value; OnPropertyChanged(); }
        }

        private string _selectedColorName = "Accent Purple";
        /// <summary>
        /// Gets or sets the current color name value in the input panel.
        /// </summary>
        public string SelectedColorName
        {
            get => _selectedColorName;
            set { _selectedColorName = value; OnPropertyChanged(); }
        }

        private string _exportFormat = "css";
        /// <summary>
        /// Gets or sets the target format selection (e.g. css, scss, json, tailwind, android).
        /// </summary>
        public string ExportFormat
        {
            get => _exportFormat;
            set 
            { 
                _exportFormat = value; 
                OnPropertyChanged(); 
                UpdateExportPreview(); 
            }
        }

        private string _exportPreviewText = string.Empty;
        /// <summary>
        /// Gets or sets the formatted preview text representing the active token outputs.
        /// </summary>
        public string ExportPreviewText
        {
            get => _exportPreviewText;
            set { _exportPreviewText = value; OnPropertyChanged(); }
        }

        /// <summary>
        /// Initializes a new instance of <see cref="MainWindowViewModel"/>, loading local mock configurations.
        /// </summary>
        public MainWindowViewModel()
        {
            // TODO: Call storage services to load palettes and token groups on startup
            LoadMockData();
            UpdateExportPreview();
        }

        private void LoadMockData()
        {
            // TODO: Replace with native loaded data in your implementation
            var defaultPalette = new Palette
            {
                Id = "default-palette",
                Name = "Default Palette",
                Colours = new System.Collections.Generic.List<Colour>
                {
                    new Colour { Id = "purple", Name = "Accent Purple", Hex = "#A374F2" },
                    new Colour { Id = "blue", Name = "Theme Blue", Hex = "#3584E4" }
                }
            };
            Palettes.Add(defaultPalette);
            ActivePalette = defaultPalette;

            var defaultGroup = new TokenGroup
            {
                Id = "brand-guidelines",
                Name = "Brand Guidelines",
                Tokens = new System.Collections.Generic.List<Token>
                {
                    new Token 
                    { 
                        Id = "brand-primary", 
                        Name = "color-brand-primary", 
                        Description = "Primary accent brand color token",
                        Value = new TokenValue { PaletteId = "default-palette", ColourId = "purple" }
                    },
                    new Token 
                    { 
                        Id = "brand-secondary", 
                        Name = "color-brand-secondary", 
                        Description = "Secondary system brand color token",
                        Value = new TokenValue { PaletteId = "default-palette", ColourId = "blue" }
                    }
                }
            };
            TokenGroups.Add(defaultGroup);
            ActiveTokenGroup = defaultGroup;
        }

        /// <summary>
        /// Adds a new color palette to the collection.
        /// </summary>
        /// <param name="name">The display name of the new palette.</param>
        public void AddPalette(string name)
        {
            // TODO: Implement adding a palette, generating IDs, and calling StorageService.SavePalettes()
        }

        /// <summary>
        /// Removes a color palette from the collection.
        /// </summary>
        /// <param name="palette">The palette to remove.</param>
        public void RemovePalette(Palette palette)
        {
            // TODO: Implement removing a palette and calling StorageService.SavePalettes()
        }

        /// <summary>
        /// Appends a new color to the currently active color palette.
        /// </summary>
        /// <param name="hex">The hexadecimal representation of the color.</param>
        /// <param name="name">The display name of the color.</param>
        public void AddColourToActivePalette(string hex, string name)
        {
            // TODO: Implement parsing hex and HSL components, adding to Colours list, and updating StorageService.SavePalettes()
        }

        /// <summary>
        /// Deletes a color from the active color palette.
        /// </summary>
        /// <param name="colour">The color to remove.</param>
        public void RemoveColourFromActivePalette(Colour colour)
        {
            // TODO: Implement removing a colour and calling StorageService.SavePalettes()
        }

        /// <summary>
        /// Adds a new token group to the collection.
        /// </summary>
        /// <param name="name">The display name of the new group.</param>
        public void AddTokenGroup(string name)
        {
            // TODO: Implement adding a token group and updating StorageService.SaveTokenGroups()
        }

        /// <summary>
        /// Removes a token group from the collection.
        /// </summary>
        /// <param name="group">The token group to remove.</param>
        public void RemoveTokenGroup(TokenGroup group)
        {
            // TODO: Implement removing a token group and updating StorageService.SaveTokenGroups()
        }

        /// <summary>
        /// Creates a new design token within the active token group.
        /// </summary>
        /// <param name="name">The name identifier of the token.</param>
        /// <param name="description">The descriptive metadata of the token.</param>
        public void AddTokenToActiveGroup(string name, string description)
        {
            // TODO: Implement adding a token and updating StorageService.SaveTokenGroups()
        }

        /// <summary>
        /// Deletes a design token from the active token group.
        /// </summary>
        /// <param name="token">The token to remove.</param>
        public void RemoveTokenFromActiveGroup(Token token)
        {
            // TODO: Implement removing a token and updating StorageService.SaveTokenGroups()
        }

        /// <summary>
        /// Triggers regeneration of the export formatted preview text block.
        /// </summary>
        public void UpdateExportPreview()
        {
            // TODO: Implement calling ExportService based on selected ExportFormat
            ExportPreviewText = ExportFormat.ToLower() switch
            {
                "css" => ExportService.ExportCSS(new System.Collections.Generic.List<TokenGroup>(TokenGroups), new System.Collections.Generic.List<Palette>(Palettes)),
                "scss" => ExportService.ExportSCSS(new System.Collections.Generic.List<TokenGroup>(TokenGroups), new System.Collections.Generic.List<Palette>(Palettes)),
                "json" => ExportService.ExportJSON(new System.Collections.Generic.List<TokenGroup>(TokenGroups), new System.Collections.Generic.List<Palette>(Palettes)),
                "tailwind" => ExportService.ExportTailwind(new System.Collections.Generic.List<TokenGroup>(TokenGroups), new System.Collections.Generic.List<Palette>(Palettes)),
                "android" => ExportService.ExportAndroidXml(new System.Collections.Generic.List<TokenGroup>(TokenGroups), new System.Collections.Generic.List<Palette>(Palettes)),
                _ => string.Empty
            };
        }
    }
}
