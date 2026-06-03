using System;
using Chroma.Models;

namespace Chroma.Services
{
    /// <summary>
    /// Provides mathematical utilities for color conversions, relative luminance, contrast evaluations, and color auditing.
    /// </summary>
    public static class ColorService
    {
        /// <summary>
        /// Converts a hexadecimal color string into its equivalent <see cref="Rgb"/> structure.
        /// </summary>
        /// <param name="hex">The hex color string to convert.</param>
        /// <returns>A new <see cref="Rgb"/> object if the string is valid; otherwise, null.</returns>
        public static Rgb? HexToRgb(string hex)
        {
            // Strip hash from hex string
            hex = hex.TrimStart('#');

            if (hex.Length < 6) return new Rgb { R = 0, G = 0, B = 0 };

            byte r = Convert.ToByte(hex[0..2], 16);
            byte g = Convert.ToByte(hex[2..4], 16);
            byte b = Convert.ToByte(hex[4..6], 16);

            return new Rgb { R = r , G = g, B = b };
        }

        /// <summary>
        /// Converts an <see cref="Rgb"/> color structure into its equivalent HSL representation.
        /// </summary>
        /// <param name="rgb">The source RGB color components.</param>
        /// <returns>A new <see cref="Hsl"/> structure containing Hue, Saturation, and Lightness components.</returns>
        public static Hsl RgbToHsl(Rgb rgb)
        {
            double rn = rgb.R / 255.0;
            double gn = rgb.G / 255.0;
            double bn = rgb.B / 255.0;

            double max = Math.Max(rn, Math.Max(gn, bn));
            double min = Math.Min(rn, Math.Min(gn, bn));

            double h = 0.0;
            double s = 0.0;
            double l = (max + min) / 2.0;

            if (Math.Abs(max - min) > 0.0001)
            {
                double d = max - min;
                s = l > 0.5 ? d / (2.0 - max - min) : d / (max + min);

                if (Math.Abs(max - rn) < 0.0001)
                    h = ((gn - bn) / d + (gn < bn ? 6.0 : 0.0)) / 6.0;
                else if (Math.Abs(max - gn) < 0.0001)
                    h = ((bn - rn) / d + 2.0) / 6.0;
                else
                    h = ((rn - gn) / d + 4.0) / 6.0;
            }

            return new Hsl
            {
                H = (int)Math.Round(h * 360.0),
                S = (int)Math.Round(s * 100.0),
                L = (int)Math.Round(l * 100.0)
            };
        }

        /// <summary>
        /// Converts HSL color channel components into a standard hexadecimal color string.
        /// </summary>
        /// <param name="h">The Hue component (0 to 360).</param>
        /// <param name="s">The Saturation component (0 to 100).</param>
        /// <param name="l">The Lightness component (0 to 100).</param>
        /// <returns>A formatted hex color string starting with a hash (e.g. #7c6ff7).</returns>
        public static string HslToHex(int h, int s, int l)
        {
            double sn = s / 100.0;
            double ln = l / 100.0;
            double a = sn * Math.Min(ln, 1.0 - ln);

            string f(int n)
            {
                int k = (n + h / 30) % 12;
                double color = ln - a * Math.Max(-1.0, Math.Min(k - 3, Math.Min(9 - k, 1.0)));
                int val = (int)(color * 255.0);
                return $"{Math.Clamp(val, 0, 255):x2}";
            }

            return $"#{f(0)}{f(8)}{f(4)}";
        }

        /// <summary>
        /// Computes the relative luminance of a given RGB color structure.
        /// </summary>
        /// <param name="rgb">The source color components.</param>
        /// <returns>The calculated relative luminance value as a double.</returns>
        public static double RelativeLuminance(Rgb rgb)
        {
            double rs = rgb.R / 255.0;
            double gs = rgb.G / 255.0;
            double bs = rgb.B / 255.0;

            static double transform(double s) => s <= 0.03928 ? s / 12.92 : Math.Pow(((s + 0.055) / 1.055), 2.4);

            rs = transform(rs);
            gs = transform(gs);
            bs = transform(bs);

            return 0.2126 * rs + 0.7152 * gs + 0.0772 * bs;
        }

        /// <summary>
        /// Calculates the contrast ratio between two hexadecimal colors.
        /// </summary>
        /// <param name="hex1">The first color hex value string.</param>
        /// <param name="hex2">The second color hex value string.</param>
        /// <returns>The contrast ratio (between 1.0 and 21.0) as a double, or null if parsing fails.</returns>
        public static double? ContrastRatio(string hex1, string hex2)
        {
            Rgb? rgb1 = HexToRgb(hex1);
            Rgb? rgb2 = HexToRgb(hex2);

            if (rgb1 is null || rgb2 is null) return null;

            double l1 = RelativeLuminance(rgb1);
            double l2 = RelativeLuminance(rgb2);

            double lighter = Math.Max(l1, l2);
            double darker = Math.Min(l1, l2);

            return Math.Round(((lighter + 0.05) / (darker + 0.05) * 100.0)) / 100.0;
        }

        /// <summary>
        /// Resolves the WCAG compliance rating level associated with a contrast ratio.
        /// </summary>
        /// <param name="ratio">The calculated contrast ratio to evaluate.</param>
        /// <returns>A rating string (e.g., AAA, AA, AA Large, or Fail).</returns>
        public static string WcagLevel(double ratio)
        {
            return ratio switch
            {
                >= 7.0 => "AAA",
                >= 4.5 => "AA",
                >= 3.0 => "AA Large",
                _ => "Fail"
            };
        }

        /// <summary>
        /// Suggests an adjusted foreground color hex string that satisfies the target contrast ratio against the background.
        /// </summary>
        /// <param name="hex">The original foreground color hex code.</param>
        /// <param name="background">The background color hex code to contrast against.</param>
        /// <param name="target">The minimum contrast ratio required (default is 4.5 for AA).</param>
        /// <returns>The adjusted hex color code meeting the target contrast ratio, or the original if unchanged.</returns>
        public static string SuggestFix(string hex, string background, double target = 4.5)
        {
            Rgb? rgb = HexToRgb(hex);

            if (rgb is null) return "#FFFFFFFF";

            Hsl hsl = RgbToHsl(rgb);

            for (int i = 1; i <= 100; ++i)
            {
                int darkerL = Math.Max(hsl.L - i, 0);
                int lighterL = Math.Min(hsl.L + i, 100);

                string darker = HslToHex(hsl.H, hsl.S, darkerL);
                string lighter = HslToHex(hsl.H, hsl.S, lighterL);

                if (ContrastRatio(darker, background) >= target)
                    return darker;

                if (ContrastRatio(lighter, background) >= target)
                {
                    int lDist = Math.Abs(lighterL - hsl.L);
                    int dDist = Math.Abs(hsl.L - darkerL);
                    return lDist < dDist ? lighter : darker;
                }
            }

            return hex.ToString();
        }
    }
}
