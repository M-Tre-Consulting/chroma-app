#include "colour_math.h"
#include <algorithm>
#include <cmath>
#include <sstream>
#include <iomanip>
#include <iostream>

Rgb hex_to_rgb(const std::string& hex) {
    std::string clean = hex;
    if (!clean.empty() && clean[0] == '#') {
        clean = clean.substr(1);
    }
    if (clean.length() < 6) {
        return Rgb{0, 0, 0};
    }
    uint8_t r = 0, g = 0, b = 0;
    try {
        r = static_cast<uint8_t>(std::stoul(clean.substr(0, 2), nullptr, 16));
    } catch (...) {}
    try {
        g = static_cast<uint8_t>(std::stoul(clean.substr(2, 2), nullptr, 16));
    } catch (...) {}
    try {
        b = static_cast<uint8_t>(std::stoul(clean.substr(4, 2), nullptr, 16));
    } catch (...) {}
    return Rgb{r, g, b};
}

Hsl rgb_to_hsl(uint8_t r, uint8_t g, uint8_t b) {
    double rn = r / 255.0;
    double gn = g / 255.0;
    double bn = b / 255.0;

    double max = std::max({rn, gn, bn});
    double min = std::min({rn, gn, bn});

    double h = 0.0;
    double s = 0.0;
    double l = (max + min) / 2.0;

    if (std::abs(max - min) > 1e-9) {
        double d = max - min;
        s = l > 0.5 ? d / (2.0 - max - min) : d / (max + min);

        if (std::abs(max - rn) < 1e-9) {
            h = ((gn - bn) / d + (gn < bn ? 6.0 : 0.0)) / 6.0;
        } else if (std::abs(max - gn) < 1e-9) {
            h = ((bn - rn) / d + 2.0) / 6.0;
        } else {
            h = ((rn - gn) / d + 4.0) / 6.0;
        }
    }

    return Hsl{
        static_cast<int>(std::round(h * 360.0)),
        static_cast<int>(std::round(s * 100.0)),
        static_cast<int>(std::round(l * 100.0))
    };
}

std::string hsl_to_hex(int h, int s, int l) {
    double sn = s / 100.0;
    double ln = l / 100.0;
    double a = sn * std::min(ln, 1.0 - ln);

    auto f = [h, ln, a](int n) {
        int k = (n + h / 30) % 12;
        double color = ln - a * std::max(-1.0, std::min({static_cast<double>(k - 3), static_cast<double>(9 - k), 1.0}));
        int val = static_cast<int>(std::round(color * 255.0));
        val = std::clamp(val, 0, 255);
        std::stringstream ss;
        ss << std::hex << std::setw(2) << std::setfill('0') << val;
        return ss.str();
    };

    return "#" + f(0) + f(8) + f(4);
}

Colour hex_to_colour(const std::string& hex, const std::string& name) {
    std::string normalized_hex = hex;
    if (normalized_hex.empty() || normalized_hex[0] != '#') {
        normalized_hex = "#" + normalized_hex;
    }
    Rgb rgb = hex_to_rgb(normalized_hex);
    Hsl hsl = rgb_to_hsl(rgb.r, rgb.g, rgb.b);
    return Colour{
        generate_uuid(),
        name,
        normalized_hex,
        rgb,
        hsl
    };
}

double contrast_ratio(const std::string& hex1, const std::string& hex2) {
    auto luminance = [](const std::string& hex) {
        Rgb rgb = hex_to_rgb(hex);
        double r_s = rgb.r / 255.0;
        double g_s = rgb.g / 255.0;
        double b_s = rgb.b / 255.0;

        auto transform = [](double s) {
            if (s <= 0.03928) {
                return s / 12.92;
            } else {
                return std::pow((s + 0.055) / 1.055, 2.4);
            }
        };

        double rs = transform(r_s);
        double gs = transform(g_s);
        double bs = transform(b_s);

        return 0.2126 * rs + 0.7152 * gs + 0.0772 * bs;
    };

    double l1 = luminance(hex1);
    double l2 = luminance(hex2);

    double lighter = std::max(l1, l2);
    double darker = std::min(l1, l2);

    return std::round(((lighter + 0.05) / (darker + 0.05)) * 100.0) / 100.0;
}

std::string wcag_level(double ratio) {
    if (ratio >= 7.0) {
        return "AAA";
    } else if (ratio >= 4.5) {
        return "AA";
    } else if (ratio >= 3.0) {
        return "AA Large";
    } else {
        return "Fail";
    }
}

std::string suggest_fix(const std::string& hex, const std::string& background, double target) {
    Rgb rgb = hex_to_rgb(hex);
    Hsl hsl = rgb_to_hsl(rgb.r, rgb.g, rgb.b);

    for (int i = 1; i <= 100; i++) {
        int darker_l = std::max(hsl.l - i, 0);
        int lighter_l = std::min(hsl.l + i, 100);

        std::string darker = hsl_to_hex(hsl.h, hsl.s, darker_l);
        std::string lighter = hsl_to_hex(hsl.h, hsl.s, lighter_l);

        if (contrast_ratio(darker, background) >= target) {
            return darker;
        }
        if (contrast_ratio(lighter, background) >= target) {
            int l_dist = std::abs(lighter_l - hsl.l);
            int d_dist = std::abs(hsl.l - darker_l);
            return l_dist < d_dist ? lighter : darker;
        }
    }

    return hex;
}
