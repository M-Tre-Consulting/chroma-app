using System;
using System.Globalization;
using System.Linq;
using System.Windows.Data;
using System.Windows.Media;
using Chroma.Models;
using Chroma.ViewModels;

namespace Chroma.Converters
{
    public class TokenToColorConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is Token token)
            {
                if (!string.IsNullOrEmpty(token.Value?.PaletteId) && !string.IsNullOrEmpty(token.Value?.ColourId))
                {
                    var mainWindow = App.Current.MainWindow as MainWindow;
                    if (mainWindow?.ViewModel != null)
                    {
                        var palette = mainWindow.ViewModel.Palettes.FirstOrDefault(p => p.Id == token.Value.PaletteId);
                        var colour = palette?.Colours.FirstOrDefault(c => c.Id == token.Value.ColourId);
                        if (colour != null && !string.IsNullOrEmpty(colour.Hex))
                        {
                            try
                            {
                                var brush = new BrushConverter().ConvertFromString(colour.Hex) as SolidColorBrush;
                                if (brush != null) return brush;
                            }
                            catch
                            {
                            }
                        }
                    }
                }
            }
            var fallback = new BrushConverter().ConvertFromString("#dedede") as SolidColorBrush;
            return fallback ?? Brushes.LightGray;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }
}
