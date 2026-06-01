use crate::types::{Colour, Rgb, Hsl};

pub fn hex_to_rgb(hex: &str) -> Rgb {
    let clean = hex.trim_start_matches('#');
    if clean.len() < 6 {
        return Rgb { r: 0, g: 0, b: 0 };
    }
    let r = u8::from_str_radix(&clean[0..2], 16).unwrap_or(0);
    let g = u8::from_str_radix(&clean[2..4], 16).unwrap_or(0);
    let b = u8::from_str_radix(&clean[4..6], 16).unwrap_or(0);
    Rgb { r, g, b }
}

pub fn rgb_to_hsl(r: u8, g: u8, b: u8) -> Hsl {
    let rn = r as f64 / 255.0;
    let gn = g as f64 / 255.0;
    let bn = b as f64 / 255.0;

    let max = rn.max(gn).max(bn);
    let min = rn.min(gn).min(bn);

    let mut h = 0.0;
    let mut s = 0.0;
    let l = (max + min) / 2.0;

    if (max - min).abs() > 1e-9 {
        let d = max - min;
        s = if l > 0.5 { d / (2.0 - max - min) } else { d / (max + min) };

        if (max - rn).abs() < 1e-9 {
            h = ((gn - bn) / d + (if gn < bn { 6.0 } else { 0.0 })) / 6.0;
        } else if (max - gn).abs() < 1e-9 {
            h = ((bn - rn) / d + 2.0) / 6.0;
        } else {
            h = ((rn - gn) / d + 4.0) / 6.0;
        }
    }

    Hsl {
        h: (h * 360.0).round() as i32,
        s: (s * 100.0).round() as i32,
        l: (l * 100.0).round() as i32,
    }
}

pub fn hsl_to_hex(h: i32, s: i32, l: i32) -> String {
    let sn = s as f64 / 100.0;
    let ln = l as f64 / 100.0;
    let a = sn * ln.min(1.0 - ln);

    let f = |n: i32| {
        let k = (n + h / 30) % 12;
        let color = ln - a * (-1.0f64).max((k - 3) as f64).min((9 - k) as f64).min(1.0);
        let val = (color * 255.0).round() as i32;
        format!("{:02x}", val.clamp(0, 255))
    };

    format!("#{}{}{}", f(0), f(8), f(4))
}

pub fn hex_to_colour(hex: &str, name: &str) -> Colour {
    let normalized_hex = if hex.starts_with('#') {
        hex.to_string()
    } else {
        format!("#{}", hex)
    };
    let rgb = hex_to_rgb(&normalized_hex);
    let hsl = rgb_to_hsl(rgb.r, rgb.g, rgb.b);
    Colour {
        id: uuid::Uuid::new_v4().to_string(),
        name: name.to_string(),
        hex: normalized_hex,
        rgb,
        hsl,
    }
}

pub fn contrast_ratio(hex1: &str, hex2: &str) -> f64 {
    let luminance = |hex: &str| {
        let rgb = hex_to_rgb(hex);
        let r_s = rgb.r as f64 / 255.0;
        let g_s = rgb.g as f64 / 255.0;
        let b_s = rgb.b as f64 / 255.0;

        let transform = |s: f64| {
            if s <= 0.03928 {
                s / 12.92
            } else {
                ((s + 0.055) / 1.055).powf(2.4)
            }
        };

        let rs = transform(r_s);
        let gs = transform(g_s);
        let bs = transform(b_s);

        // Standard relative luminance formula matching packages/core/src/lib/colour.ts
        0.2126 * rs + 0.7152 * gs + 0.0772 * bs
    };

    let l1 = luminance(hex1);
    let l2 = luminance(hex2);

    let lighter = l1.max(l2);
    let darker = l1.min(l2);

    ((lighter + 0.05) / (darker + 0.05) * 100.0).round() / 100.0
}

pub fn wcag_level(ratio: f64) -> &'static str {
    if ratio >= 7.0 {
        "AAA"
    } else if ratio >= 4.5 {
        "AA"
    } else if ratio >= 3.0 {
        "AA Large"
    } else {
        "Fail"
    }
}

pub fn suggest_fix(hex: &str, background: &str, target: f64) -> String {
    let rgb = hex_to_rgb(hex);
    let Hsl { h, s, l } = rgb_to_hsl(rgb.r, rgb.g, rgb.b);

    for i in 1..=100 {
        let darker_l = (l - i).max(0);
        let lighter_l = (l + i).min(100);

        let darker = hsl_to_hex(h, s, darker_l);
        let lighter = hsl_to_hex(h, s, lighter_l);

        if contrast_ratio(&darker, background) >= target {
            return darker;
        }
        if contrast_ratio(&lighter, background) >= target {
            let l_dist = (lighter_l - l).abs();
            let d_dist = (l - darker_l).abs();
            return if l_dist < d_dist { lighter } else { darker };
        }
    }

    hex.to_string()
}
