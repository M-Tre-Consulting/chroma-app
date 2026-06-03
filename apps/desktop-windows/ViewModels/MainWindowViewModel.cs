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
            set
            {
                if (_selectedColorHex != value)
                {
                    _selectedColorHex = value;
                    OnPropertyChanged();
                    SyncFromHex();
                }
            }
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

        private byte _selectedColorR = 124;
        /// <summary>
        /// Gets or sets the Red component (0 to 255) of the selected color.
        /// </summary>
        public byte SelectedColorR
        {
            get => _selectedColorR;
            set
            {
                if (_selectedColorR != value)
                {
                    _selectedColorR = value;
                    OnPropertyChanged();
                    SyncFromRgb();
                }
            }
        }

        private byte _selectedColorG = 111;
        /// <summary>
        /// Gets or sets the Green component (0 to 255) of the selected color.
        /// </summary>
        public byte SelectedColorG
        {
            get => _selectedColorG;
            set
            {
                if (_selectedColorG != value)
                {
                    _selectedColorG = value;
                    OnPropertyChanged();
                    SyncFromRgb();
                }
            }
        }

        private byte _selectedColorB = 247;
        /// <summary>
        /// Gets or sets the Blue component (0 to 255) of the selected color.
        /// </summary>
        public byte SelectedColorB
        {
            get => _selectedColorB;
            set
            {
                if (_selectedColorB != value)
                {
                    _selectedColorB = value;
                    OnPropertyChanged();
                    SyncFromRgb();
                }
            }
        }

        private int _selectedColorH = 246;
        /// <summary>
        /// Gets or sets the Hue channel (0 to 360) of the selected color.
        /// </summary>
        public int SelectedColorH
        {
            get => _selectedColorH;
            set
            {
                if (_selectedColorH != value)
                {
                    _selectedColorH = value;
                    OnPropertyChanged();
                    SyncFromHsl();
                }
            }
        }

        private int _selectedColorS = 89;
        /// <summary>
        /// Gets or sets the Saturation channel (0 to 100) of the selected color.
        /// </summary>
        public int SelectedColorS
        {
            get => _selectedColorS;
            set
            {
                if (_selectedColorS != value)
                {
                    _selectedColorS = value;
                    OnPropertyChanged();
                    SyncFromHsl();
                }
            }
        }

        private byte _selectedColorL = 70;
        /// <summary>
        /// Gets or sets the Lightness channel (0 to 100) of the selected color.
        /// </summary>
        public byte SelectedColorL
        {
            get => _selectedColorL;
            set
            {
                if (_selectedColorL != value)
                {
                    _selectedColorL = value;
                    OnPropertyChanged();
                    SyncFromHsl();
                }
            }
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

        private bool _isSyncing = false;

        /// <summary>
        /// Initializes a new instance of <see cref="MainWindowViewModel"/>, loading local mock configurations.
        /// </summary>
        public MainWindowViewModel()
        {
            LoadDataFromStorage();
            UpdateExportPreview();
        }

        /// <summary>
        /// Loads data from local JSON storage in the application AppData directory.
        /// </summary>
        private void LoadDataFromStorage()
        {
            List<Palette> loadedPalettes = StorageService.LoadPalettes();
            List<TokenGroup> loadedGroups = StorageService.LoadTokenGroups();

            Palettes = [.. loadedPalettes];

            if (Palettes.Count != 0)
                ActivePalette = Palettes.First();

            TokenGroups = [.. loadedGroups];

            if (TokenGroups.Count != 0)
                ActiveTokenGroup = TokenGroups.First();
        }

        /// <summary>
        /// Syncs current colors from RGB values.
        /// </summary>
        private void SyncFromRgb()
        {
            if (_isSyncing) return;
            _isSyncing = true;

            try
            {
                Rgb rgb = new() { R = SelectedColorR, G = SelectedColorG, B = SelectedColorB };
                Hsl hsl = ColorService.RgbToHsl(rgb);

                SelectedColorHex = ColorService.HslToHex(hsl.H, hsl.S, hsl.L);

                SelectedColorH = hsl.H;
                SelectedColorS = hsl.S;
                SelectedColorL = hsl.L;
            }
            finally
            {
                _isSyncing = false;
            }
        }

        /// <summary>
        /// Synchronizes the selected color values from HSL to RGB and updates the corresponding hex representation.
        /// </summary>
        private void SyncFromHsl()
        {
            if (_isSyncing) return;
            _isSyncing = true;
            try
            {
                Rgb rgb = ColorService.HslToRgb(SelectedColorH, SelectedColorS, SelectedColorL);

                SelectedColorHex = ColorService.RgbToHex(rgb.R, rgb.G, rgb.B);

                SelectedColorR = rgb.R;
                SelectedColorG = rgb.G;
                SelectedColorB = rgb.B;
            }
            finally
            {
                _isSyncing = false;
            }
        }

        /// <summary>
        /// Synchronizes the selected color values from a hexadecimal string representation.
        /// </summary>
        private void SyncFromHex()
        {
            if (_isSyncing) return;
            _isSyncing = true;
            try
            {
                Rgb rgb = ColorService.HexToRgb(SelectedColorHex);
                Hsl hsl = ColorService.RgbToHsl(rgb);

                SelectedColorR = rgb.R;
                SelectedColorG = rgb.G;
                SelectedColorB = rgb.B;

                SelectedColorH = hsl.H;
                SelectedColorS = hsl.S;
                SelectedColorL = hsl.L;
            }
            finally
            {
                _isSyncing = false;
            }
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