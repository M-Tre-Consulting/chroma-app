using System;
using System.IO;
using System.Windows;
using System.Windows.Controls;
using Microsoft.Win32;
using Chroma.Models;
using Chroma.ViewModels;
using Chroma.Services;

namespace Chroma
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        /// <summary>
        /// Gets the ViewModel data-context bound to this view.
        /// </summary>
        public MainWindowViewModel ViewModel { get; }

        /// <summary>
        /// Initializes a new instance of <see cref="MainWindow"/> and sets its DataContext.
        /// </summary>
        public MainWindow()
        {
            InitializeComponent();
            
            ViewModel = new MainWindowViewModel();
            DataContext = ViewModel;

            // Set initial active tab
            MainViewStack.SelectedIndex = 0;
        }

        private void BtnNav_Click(object sender, RoutedEventArgs e)
        {
            if (sender is Button btn && btn.Tag != null)
            {
                if (int.TryParse(btn.Tag.ToString(), out int index))
                {
                    // Switch active tab page programmatically
                    MainViewStack.SelectedIndex = index;
                }
            }
        }

        private void BtnAddPalette_Click(object sender, RoutedEventArgs e)
        {
            string name = TxtNewPaletteName.Text;
            if (!string.IsNullOrWhiteSpace(name))
            {
                ViewModel.AddPalette(name);
                TxtNewPaletteName.Text = string.Empty;
            }
        }

        private void BtnDeletePalette_Click(object sender, RoutedEventArgs e)
        {
            if (ViewModel.ActivePalette != null)
            {
                var result = MessageBox.Show($"Are you sure you want to delete palette '{ViewModel.ActivePalette.Name}'?", "Confirm Delete", MessageBoxButton.YesNo, MessageBoxImage.Warning);
                if (result == MessageBoxResult.Yes)
                {
                    ViewModel.RemovePalette(ViewModel.ActivePalette);
                }
            }
        }

        private void BtnAddColour_Click(object sender, RoutedEventArgs e)
        {
            if (ViewModel.ActivePalette == null)
            {
                MessageBox.Show("Please select or create a palette first.", "No Active Palette", MessageBoxButton.OK, MessageBoxImage.Information);
                return;
            }

            string hex = ViewModel.SelectedColorHex;
            string name = ViewModel.SelectedColorName;

            if (string.IsNullOrWhiteSpace(hex) || !hex.StartsWith("#") || hex.Length != 7)
            {
                MessageBox.Show("Please enter a valid 7-character hex color code (e.g. #7c6ff7).", "Invalid Hex", MessageBoxButton.OK, MessageBoxImage.Error);
                return;
            }

            ViewModel.AddColourToActivePalette(hex, name);
        }

        private void BtnDeleteColour_Click(object sender, RoutedEventArgs e)
        {
            if (sender is Button btn && btn.Tag is Colour colour)
            {
                ViewModel.RemoveColourFromActivePalette(colour);
            }
        }

        private void BtnAddTokenGroup_Click(object sender, RoutedEventArgs e)
        {
            string name = TxtNewGroupName.Text;
            if (!string.IsNullOrWhiteSpace(name))
            {
                ViewModel.AddTokenGroup(name);
                TxtNewGroupName.Text = string.Empty;
            }
        }

        private void BtnDeleteTokenGroup_Click(object sender, RoutedEventArgs e)
        {
            if (ViewModel.ActiveTokenGroup != null)
            {
                var result = MessageBox.Show($"Are you sure you want to delete token group '{ViewModel.ActiveTokenGroup.Name}'?", "Confirm Delete", MessageBoxButton.YesNo, MessageBoxImage.Warning);
                if (result == MessageBoxResult.Yes)
                {
                    ViewModel.RemoveTokenGroup(ViewModel.ActiveTokenGroup);
                }
            }
        }

        private void BtnAddToken_Click(object sender, RoutedEventArgs e)
        {
            if (ViewModel.ActiveTokenGroup == null)
            {
                MessageBox.Show("Please select or create a token group first.", "No Active Group", MessageBoxButton.OK, MessageBoxImage.Information);
                return;
            }

            string name = TxtNewTokenName.Text;
            string desc = TxtNewTokenDesc.Text;

            if (string.IsNullOrWhiteSpace(name))
            {
                MessageBox.Show("Please enter a token name.", "Invalid Token Name", MessageBoxButton.OK, MessageBoxImage.Error);
                return;
            }

            ViewModel.AddTokenToActiveGroup(name, desc);
            TxtNewTokenName.Text = string.Empty;
            TxtNewTokenDesc.Text = string.Empty;
        }

        private void BtnDeleteToken_Click(object sender, RoutedEventArgs e)
        {
            if (sender is Button btn && btn.Tag is Token token)
            {
                ViewModel.RemoveTokenFromActiveGroup(token);
            }
        }

        private void BtnExportFormat_Click(object sender, RoutedEventArgs e)
        {
            if (sender is Button btn && btn.Tag != null)
            {
                ViewModel.ExportFormat = btn.Tag.ToString() ?? "css";
            }
        }

        private void BtnCopyClipboard_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                Clipboard.SetText(ViewModel.ExportPreviewText);
                MessageBox.Show("Export output copied to clipboard!", "Copied", MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Failed to copy to clipboard: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void BtnSaveFile_Click(object sender, RoutedEventArgs e)
        {
            var dialog = new SaveFileDialog();
            string ext = ViewModel.ExportFormat.ToLower() switch
            {
                "css" => "css",
                "scss" => "scss",
                "json" => "json",
                "tailwind" => "ts",
                "android" => "xml",
                _ => "txt"
            };

            dialog.FileName = $"tokens.{ext}";
            dialog.DefaultExt = $".{ext}";
            dialog.Filter = $"{ViewModel.ExportFormat.ToUpper()} Files (*.{ext})|*.{ext}|All Files (*.*)|*.*";

            if (dialog.ShowDialog() == true)
            {
                try
                {
                    File.WriteAllText(dialog.FileName, ViewModel.ExportPreviewText);
                    MessageBox.Show("Tokens exported successfully!", "Saved", MessageBoxButton.OK, MessageBoxImage.Information);
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Failed to save file: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }
        }

        private void BtnPickNativeColor_Click(object sender, RoutedEventArgs e)
        {
            var picker = new ColorPickerWindow(ViewModel.SelectedColorHex);
            picker.Owner = this;
            if (picker.ShowDialog() == true)
            {
                ViewModel.SelectedColorHex = picker.SelectedHex;
            }
        }

        private void BtnApplyContrastFix_Click(object sender, RoutedEventArgs e)
        {
            if (sender is Button btn && btn.Tag is Colour colour)
            {
                string fixedHex = colour.SuggestedFixHex;
                var rgb = ColorService.HexToRgb(fixedHex) ?? new Rgb();
                
                colour.Hex = fixedHex;
                colour.Rgb = rgb;
                colour.Hsl = ColorService.RgbToHsl(rgb);
                
                ViewModel.SavePalettesState();

                var temp = ViewModel.ActivePalette;
                ViewModel.ActivePalette = null;
                ViewModel.ActivePalette = temp;
            }
        }

        private void CboTokenColor_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (sender is ComboBox cbo && cbo.Tag is Token token)
            {
                ViewModel.SaveTokenGroupsState();

                var temp = ViewModel.ActiveTokenGroup;
                ViewModel.ActiveTokenGroup = null;
                ViewModel.ActiveTokenGroup = temp;
            }
        }
    }
}
