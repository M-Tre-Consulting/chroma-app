/**
 * @file colour_math.h
 * @brief Color utility functions including RGB, HSL, Hex conversions, WCAG contrast calculations, and color adjustment suggestions.
 */

#ifndef CHROMA_COLOUR_MATH_H
#define CHROMA_COLOUR_MATH_H

#include <string>
#include "types.h"

/**
 * @brief Converts a hexadecimal color string to an Rgb structure.
 * 
 * Handles hex strings with or without a leading '#' character. Supports 6-character hex values.
 * If the string is invalid or too short, returns black (Rgb{0, 0, 0}).
 * 
 * @param hex The hex color string (e.g., "#3584e4" or "3584e4").
 * @return Rgb The converted RGB color structure.
 */
Rgb hex_to_rgb(const std::string& hex);

/**
 * @brief Converts RGB values (0-255) to an Hsl structure.
 * 
 * @param r Red component (0-255).
 * @param g Green component (0-255).
 * @param b Blue component (0-255).
 * @return Hsl The converted HSL color structure.
 */
Hsl rgb_to_hsl(uint8_t r, uint8_t g, uint8_t b);

/**
 * @brief Converts HSL values (Hue 0-360, Saturation 0-100, Lightness 0-100) to a hexadecimal color string.
 * 
 * @param h Hue component in degrees [0, 360].
 * @param s Saturation percentage [0, 100].
 * @param l Lightness percentage [0, 100].
 * @return std::string A hex color string starting with '#' (e.g., "#3584e4").
 */
std::string hsl_to_hex(int h, int s, int l);

/**
 * @brief Helper that creates a Colour structure using a hex string and a color name.
 * 
 * This automatically generates a UUID, parses the RGB/HSL values from the hex color, 
 * and populates the fields of the returned Colour struct.
 * 
 * @param hex The hex color string.
 * @param name The user-friendly name for this color.
 * @return Colour A fully populated Colour structure.
 */
Colour hex_to_colour(const std::string& hex, const std::string& name);

/**
 * @brief Computes the WCAG 2.0 contrast ratio between two colors.
 * 
 * Contrast ratio is calculated using relative luminance values and ranges from 1.0 to 21.0.
 * 
 * @param hex1 The first color in hex format.
 * @param hex2 The second color in hex format.
 * @return double The contrast ratio, rounded to two decimal places (e.g., 4.52).
 */
double contrast_ratio(const std::string& hex1, const std::string& hex2);

/**
 * @brief Returns the WCAG 2.0 conformance level string for a given contrast ratio.
 * 
 * Map of ratios:
 * - >= 7.0: "AAA"
 * - >= 4.5: "AA"
 * - >= 3.0: "AA Large"
 * - < 3.0: "Fail"
 * 
 * @param ratio The contrast ratio to evaluate.
 * @return std::string The WCAG level string ("AAA", "AA", "AA Large", "Fail").
 */
std::string wcag_level(double ratio);

/**
 * @brief Suggests a new lightness-adjusted hex color that satisfies a target contrast ratio.
 * 
 * Increments or decrements the lightness (L) of the base color until the target ratio 
 * against the background is achieved, preserving hue and saturation.
 * 
 * @param hex The base color in hex format.
 * @param background The background color in hex format.
 * @param target The target contrast ratio (e.g. 4.5).
 * @return std::string The suggested color in hex format, or the original hex if no fix is found.
 */
std::string suggest_fix(const std::string& hex, const std::string& background, double target);

#endif // CHROMA_COLOUR_MATH_H
