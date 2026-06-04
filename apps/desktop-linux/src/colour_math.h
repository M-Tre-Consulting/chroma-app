#ifndef CHROMA_COLOUR_MATH_H
#define CHROMA_COLOUR_MATH_H

#include <string>
#include "types.h"

Rgb hex_to_rgb(const std::string& hex);
Hsl rgb_to_hsl(uint8_t r, uint8_t g, uint8_t b);
std::string hsl_to_hex(int h, int s, int l);
Colour hex_to_colour(const std::string& hex, const std::string& name);
double contrast_ratio(const std::string& hex1, const std::string& hex2);
std::string wcag_level(double ratio);
std::string suggest_fix(const std::string& hex, const std::string& background, double target);

#endif // CHROMA_COLOUR_MATH_H
