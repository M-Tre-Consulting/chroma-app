using System;
using System.Runtime.InteropServices;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Interop;
using System.Windows.Media;
using Chroma.Services;
using Chroma.Models;

namespace Chroma
{
    /// <summary>
    /// Interaction logic for ColorPickerWindow.xaml
    /// </summary>
    public partial class ColorPickerWindow : Window
    {
        [DllImport("dwmapi.dll")]
        private static extern int DwmSetWindowAttribute(IntPtr hwnd, int attr, ref int attrValue, int attrSize);

        private const int DWMWA_USE_IMMERSIVE_DARK_MODE_BEFORE_20H1 = 19;
        private const int DWMWA_USE_IMMERSIVE_DARK_MODE = 20;

        protected override void OnSourceInitialized(EventArgs e)
        {
            base.OnSourceInitialized(e);
            try
            {
                IntPtr hwnd = new WindowInteropHelper(this).EnsureHandle();
                int useDarkMode = 1;
                DwmSetWindowAttribute(hwnd, DWMWA_USE_IMMERSIVE_DARK_MODE, ref useDarkMode, sizeof(int));
                DwmSetWindowAttribute(hwnd, DWMWA_USE_IMMERSIVE_DARK_MODE_BEFORE_20H1, ref useDarkMode, sizeof(int));
            }
            catch
            {
                // Fallback gracefully on older OS versions or non-compatible platforms
            }
        }

        private bool _isSyncing = false;
        private bool _isMouseDownOnSquare = false;

        /// <summary>
        /// Gets the final color hex value selected by the user.
        /// </summary>
        public string SelectedHex { get; private set; } = "#7C6FF7";

        public ColorPickerWindow(string initialHex)
        {
            InitializeComponent();
            
            if (!string.IsNullOrWhiteSpace(initialHex))
            {
                SelectedHex = initialHex;
            }

            Loaded += (s, e) =>
            {
                if (TxtHex != null)
                {
                    TxtHex.Text = SelectedHex;
                }
                SyncFromHex(SelectedHex);
            };

            // Force recalculating marker placement once the layout system computes size
            ColorSquare.SizeChanged += (s, e) =>
            {
                if (AreControlsInitialized())
                {
                    var rgb = ColorService.HexToRgb(TxtHex.Text) ?? new Rgb();
                    RgbToHsv(rgb, out double h, out double sat, out double val);
                    UpdateMarkerAndSquare(h, sat, val);
                }
            };
        }

        private bool AreControlsInitialized()
        {
            return SliderR != null && SliderG != null && SliderB != null &&
                   SliderH != null && SliderS != null && SliderL != null &&
                   TxtHex != null && TxtR != null && TxtG != null && TxtB != null &&
                   TxtH != null && TxtS != null && TxtL != null &&
                   ColorPreviewBorder != null && BrushS != null && BrushL != null &&
                   ColorSquare != null && HueBackgroundBorder != null &&
                   MarkerCanvas != null && ColorMarker != null;
        }

        private static Rgb HsvToRgb(double h, double s, double v)
        {
            double r = 0, g = 0, b = 0;
            if (s == 0)
            {
                r = v;
                g = v;
                b = v;
            }
            else
            {
                double sector = h / 60.0;
                int i = (int)Math.Floor(sector);
                double f = sector - i;
                double p = v * (1.0 - s);
                double q = v * (1.0 - s * f);
                double t = v * (1.0 - s * (1.0 - f));
                switch (i % 6)
                {
                    case 0: r = v; g = t; b = p; break;
                    case 1: r = q; g = v; b = p; break;
                    case 2: r = p; g = v; b = t; break;
                    case 3: r = p; g = q; b = v; break;
                    case 4: r = t; g = p; b = v; break;
                    case 5: r = v; g = p; b = q; break;
                }
            }
            return new Rgb { R = (byte)Math.Clamp(r * 255, 0, 255), G = (byte)Math.Clamp(g * 255, 0, 255), B = (byte)Math.Clamp(b * 255, 0, 255) };
        }

        private static void RgbToHsv(Rgb rgb, out double h, out double s, out double v)
        {
            double rn = rgb.R / 255.0;
            double gn = rgb.G / 255.0;
            double bn = rgb.B / 255.0;

            double max = Math.Max(rn, Math.Max(gn, bn));
            double min = Math.Min(rn, Math.Min(gn, bn));
            double delta = max - min;

            h = 0;
            if (delta > 0)
            {
                if (max == rn) h = (gn - bn) / delta + (gn < bn ? 6.0 : 0.0);
                else if (max == gn) h = (bn - rn) / delta + 2.0;
                else h = (rn - gn) / delta + 4.0;
                h *= 60.0;
            }

            s = max == 0 ? 0 : delta / max;
            v = max;
        }

        private void UpdateMarkerAndSquare(double h, double s, double v)
        {
            if (!AreControlsInitialized()) return;

            // 1. Update visual hue background
            Rgb baseRgb = HsvToRgb(h, 1.0, 1.0);
            HueBackgroundBorder.Background = new SolidColorBrush(Color.FromRgb(baseRgb.R, baseRgb.G, baseRgb.B));

            // 2. Position selection marker
            double width = ColorSquare.ActualWidth > 0 ? ColorSquare.ActualWidth : 200;
            double height = ColorSquare.ActualHeight > 0 ? ColorSquare.ActualHeight : 200;
            double x = s * width;
            double y = (1.0 - v) * height;

            Canvas.SetLeft(ColorMarker, x);
            Canvas.SetTop(ColorMarker, y);
        }

        private void SyncFromHex(string hex)
        {
            if (!AreControlsInitialized()) return;
            if (_isSyncing) return;
            _isSyncing = true;

            try
            {
                Rgb? rgb = ColorService.HexToRgb(hex);
                if (rgb != null)
                {
                    // RGB
                    SliderR.Value = rgb.R;
                    SliderG.Value = rgb.G;
                    SliderB.Value = rgb.B;

                    TxtR.Text = rgb.R.ToString();
                    TxtG.Text = rgb.G.ToString();
                    TxtB.Text = rgb.B.ToString();

                    // HSL
                    Hsl hsl = ColorService.RgbToHsl(rgb);
                    SliderH.Value = hsl.H;
                    SliderS.Value = hsl.S;
                    SliderL.Value = hsl.L;

                    TxtH.Text = hsl.H.ToString();
                    TxtS.Text = hsl.S.ToString();
                    TxtL.Text = hsl.L.ToString();

                    UpdateColorPreview(hex);
                    UpdateSliderGradients(hsl.H, hsl.S, hsl.L);

                    // Update 2D Selection Marker
                    RgbToHsv(rgb, out double h, out double sat, out double val);
                    UpdateMarkerAndSquare(h, sat, val);
                }
            }
            catch
            {
                // Ignore parse errors while typing
            }
            finally
            {
                _isSyncing = false;
            }
        }

        private void SyncFromHsl()
        {
            if (!AreControlsInitialized()) return;
            if (_isSyncing) return;
            _isSyncing = true;

            try
            {
                int h = (int)SliderH.Value;
                int s = (int)SliderS.Value;
                int l = (int)SliderL.Value;

                string hex = ColorService.HslToHex(h, s, l);
                Rgb? rgb = ColorService.HexToRgb(hex);

                if (rgb != null)
                {
                    // Hex text
                    TxtHex.Text = hex.ToUpper();

                    // RGB
                    SliderR.Value = rgb.R;
                    SliderG.Value = rgb.G;
                    SliderB.Value = rgb.B;

                    TxtR.Text = rgb.R.ToString();
                    TxtG.Text = rgb.G.ToString();
                    TxtB.Text = rgb.B.ToString();

                    UpdateColorPreview(hex);
                    UpdateSliderGradients(h, s, l);

                    // Update 2D Selection Marker
                    RgbToHsv(rgb, out double hue, out double sat, out double val);
                    UpdateMarkerAndSquare(hue, sat, val);
                }
            }
            catch
            {
            }
            finally
            {
                _isSyncing = false;
            }
        }

        private void SyncFromRgb()
        {
            if (!AreControlsInitialized()) return;
            if (_isSyncing) return;
            _isSyncing = true;

            try
            {
                byte r = (byte)SliderR.Value;
                byte g = (byte)SliderG.Value;
                byte b = (byte)SliderB.Value;

                Rgb rgb = new Rgb { R = r, G = g, B = b };
                string hex = $"#{r:X2}{g:X2}{b:X2}";
                Hsl hsl = ColorService.RgbToHsl(rgb);

                // Hex
                TxtHex.Text = hex.ToUpper();

                // HSL
                SliderH.Value = hsl.H;
                SliderS.Value = hsl.S;
                SliderL.Value = hsl.L;

                TxtH.Text = hsl.H.ToString();
                TxtS.Text = hsl.S.ToString();
                TxtL.Text = hsl.L.ToString();

                UpdateColorPreview(hex);
                UpdateSliderGradients(hsl.H, hsl.S, hsl.L);

                // Update 2D Selection Marker
                RgbToHsv(rgb, out double hue, out double sat, out double val);
                UpdateMarkerAndSquare(hue, sat, val);
            }
            catch
            {
            }
            finally
            {
                _isSyncing = false;
            }
        }

        private void UpdateColorPreview(string hex)
        {
            if (!AreControlsInitialized()) return;
            try
            {
                var color = (Color)ColorConverter.ConvertFromString(hex);
                ColorPreviewBorder.Background = new SolidColorBrush(color);
            }
            catch
            {
            }
        }

        private void UpdateSliderGradients(int h, int s, int l)
        {
            if (!AreControlsInitialized()) return;
            try
            {
                // Saturation slider goes from gray at current Lightness (S=0) to pure hue/lightness at S=100
                string startSatHex = ColorService.HslToHex(h, 0, l);
                string endSatHex = ColorService.HslToHex(h, 100, l);
                BrushS.GradientStops[0].Color = (Color)ColorConverter.ConvertFromString(startSatHex);
                BrushS.GradientStops[1].Color = (Color)ColorConverter.ConvertFromString(endSatHex);

                // Lightness slider goes from Black to Pure Color (L=50) to White
                string centerLightHex = ColorService.HslToHex(h, s, 50);
                BrushL.GradientStops[0].Color = Colors.Black;
                BrushL.GradientStops[1].Color = (Color)ColorConverter.ConvertFromString(centerLightHex);
                BrushL.GradientStops[2].Color = Colors.White;
            }
            catch
            {
            }
        }

        private void SliderHsl_ValueChanged(object sender, RoutedPropertyChangedEventArgs<double> e)
        {
            if (!AreControlsInitialized()) return;
            
            // Sync values to textboxes
            if (!_isSyncing)
            {
                TxtH.Text = ((int)SliderH.Value).ToString();
                TxtS.Text = ((int)SliderS.Value).ToString();
                TxtL.Text = ((int)SliderL.Value).ToString();
                SyncFromHsl();
            }
        }

        private void SliderRgb_ValueChanged(object sender, RoutedPropertyChangedEventArgs<double> e)
        {
            if (!AreControlsInitialized()) return;

            // Sync values to textboxes
            if (!_isSyncing)
            {
                TxtR.Text = ((int)SliderR.Value).ToString();
                TxtG.Text = ((int)SliderG.Value).ToString();
                TxtB.Text = ((int)SliderB.Value).ToString();
                SyncFromRgb();
            }
        }

        private void TxtHex_TextChanged(object sender, TextChangedEventArgs e)
        {
            if (!AreControlsInitialized()) return;
            string hex = TxtHex.Text.Trim();
            if (hex.Length == 7 && hex.StartsWith("#"))
            {
                SyncFromHex(hex);
            }
            else if (hex.Length == 6 && !hex.StartsWith("#"))
            {
                SyncFromHex("#" + hex);
            }
        }

        private void TxtHsl_TextChanged(object sender, TextChangedEventArgs e)
        {
            if (!AreControlsInitialized()) return;
            if (_isSyncing) return;
            
            if (int.TryParse(TxtH.Text, out int h) &&
                int.TryParse(TxtS.Text, out int s) &&
                int.TryParse(TxtL.Text, out int l))
            {
                SliderH.Value = Math.Clamp(h, 0, 360);
                SliderS.Value = Math.Clamp(s, 0, 100);
                SliderL.Value = Math.Clamp(l, 0, 100);
                SyncFromHsl();
            }
        }

        private void TxtRgb_TextChanged(object sender, TextChangedEventArgs e)
        {
            if (!AreControlsInitialized()) return;
            if (_isSyncing) return;

            if (int.TryParse(TxtR.Text, out int r) &&
                int.TryParse(TxtG.Text, out int g) &&
                int.TryParse(TxtB.Text, out int b))
            {
                SliderR.Value = Math.Clamp(r, 0, 255);
                SliderG.Value = Math.Clamp(g, 0, 255);
                SliderB.Value = Math.Clamp(b, 0, 255);
                SyncFromRgb();
            }
        }

        private void ColorSquare_MouseDown(object sender, System.Windows.Input.MouseButtonEventArgs e)
        {
            if (e.LeftButton == System.Windows.Input.MouseButtonState.Pressed)
            {
                _isMouseDownOnSquare = true;
                ColorSquare.CaptureMouse();
                UpdateColorFromSquareMousePosition(e.GetPosition(ColorSquare));
            }
        }

        private void ColorSquare_MouseMove(object sender, System.Windows.Input.MouseEventArgs e)
        {
            if (_isMouseDownOnSquare && e.LeftButton == System.Windows.Input.MouseButtonState.Pressed)
            {
                UpdateColorFromSquareMousePosition(e.GetPosition(ColorSquare));
            }
        }

        private void ColorSquare_MouseUp(object sender, System.Windows.Input.MouseButtonEventArgs e)
        {
            if (_isMouseDownOnSquare)
            {
                _isMouseDownOnSquare = false;
                ColorSquare.ReleaseMouseCapture();
            }
        }

        private void UpdateColorFromSquareMousePosition(Point p)
        {
            if (!AreControlsInitialized()) return;
            if (_isSyncing) return;
            _isSyncing = true;

            try
            {
                double width = ColorSquare.ActualWidth > 0 ? ColorSquare.ActualWidth : 200;
                double height = ColorSquare.ActualHeight > 0 ? ColorSquare.ActualHeight : 200;
                double x = Math.Clamp(p.X, 0, width);
                double y = Math.Clamp(p.Y, 0, height);

                double s = x / width;
                double v = 1.0 - (y / height);
                double h = SliderH.Value;

                Rgb rgb = HsvToRgb(h, s, v);
                string hex = $"#{rgb.R:X2}{rgb.G:X2}{rgb.B:X2}";
                Hsl hsl = ColorService.RgbToHsl(rgb);

                // Update inputs (Hex)
                TxtHex.Text = hex.ToUpper();

                // RGB sliders & textboxes
                SliderR.Value = rgb.R;
                SliderG.Value = rgb.G;
                SliderB.Value = rgb.B;

                TxtR.Text = rgb.R.ToString();
                TxtG.Text = rgb.G.ToString();
                TxtB.Text = rgb.B.ToString();

                // HSL sliders & textboxes (Keep Hue constant at slider value to prevent conversions jitter)
                SliderS.Value = hsl.S;
                SliderL.Value = hsl.L;

                TxtS.Text = hsl.S.ToString();
                TxtL.Text = hsl.L.ToString();

                UpdateColorPreview(hex);
                UpdateSliderGradients((int)h, hsl.S, hsl.L);

                // Update marker positioning directly
                Canvas.SetLeft(ColorMarker, x);
                Canvas.SetTop(ColorMarker, y);
            }
            finally
            {
                _isSyncing = false;
            }
        }

        private void BtnOk_Click(object sender, RoutedEventArgs e)
        {
            if (TxtHex != null)
            {
                SelectedHex = TxtHex.Text.ToUpper();
            }
            DialogResult = true;
            Close();
        }

        private void BtnCancel_Click(object sender, RoutedEventArgs e)
        {
            DialogResult = false;
            Close();
        }
    }
}
