//
//  ColourUtils.swift
//  Chroma
//
//  Created by Simone Rolando (M-Tre Consulting) on 02/05/2026.
//

import Foundation

/// Parses a hex colour string into its RGB components.
/// Accepts strings with or without a leading `#`. Returns black on malformed input.
func hexToRgb(hex: String) -> ColourRgb {
    let clean = String(hex.drop(while: { $0 == "#" }))

    let rStart = clean.startIndex
    let rEnd = clean.index(rStart, offsetBy: 2)

    let gStart = rEnd
    let gEnd = clean.index(gStart, offsetBy: 2)

    let bStart = gEnd
    let bEnd = clean.index(bStart, offsetBy: 2)

    let r = Int(clean[rStart..<rEnd], radix: 16) ?? 0
    let g = Int(clean[gStart..<gEnd], radix: 16) ?? 0
    let b = Int(clean[bStart..<bEnd], radix: 16) ?? 0

    return ColourRgb(r: r, g: g, b: b)
}

/// Converts RGB components (each 0–255) to HSL (h: 0–360, s: 0–100, l: 0–100).
func rgbToHsl(r: Int, g: Int, b: Int) -> ColourHsl {
    let rn = Double(r) / 255.0
    let gn = Double(g) / 255.0
    let bn = Double(b) / 255.0

    let mx = max(rn, max(gn, bn))
    let mn = min(rn, min(gn, bn))

    let l = (mx + mn) / 2.0
    var h = 0.0
    var s = 0.0

    if mx != mn {
        let d = mx - mn
        s = l > 0.5 ? d / (2.0 - mx - mn) : d / (mx + mn)

        switch mx {
        case rn:
            h = ((gn - bn) / d + (gn < bn ? 6.0 : 0.0)) / 6.0
        case gn:
            h = ((bn - rn) / d + 2.0) / 6.0
        default:
            h = ((rn - gn) / d + 4.0) / 6.0
        }
    }

    return ColourHsl(
        h: Int(round(h * 360)),
        s: Int(round(s * 100)),
        l: Int(round(l * 100))
    )
}

/// Converts HSL components (h: 0–360, s: 0–100, l: 0–100) to a lowercase hex string with a leading `#`.
func hslToHex(h: Int, s: Int, l: Int) -> String {
    let sn = Double(s) / 100.0
    let ln = Double(l) / 100.0
    let a = sn * min(ln, 1.0 - ln)

    func f(_ n: Int) -> String {
        let k = (Double(n) + Double(h) / 30.0)
            .truncatingRemainder(dividingBy: 12.0)

        let color = ln - a * max(
            min(k - 3.0, min(9.0 - k, 1.0)),
            -1.0
        )

        let value = min(max(Int(round(255.0 * color)), 0), 255)

        return String(format: "%02x", value)
    }

    return "#\(f(0))\(f(8))\(f(4))"
}

/// Builds a ``Colour`` from a hex string, deriving RGB and HSL automatically.
func hexToColour(hex: String, name: String = "Untitled", id: String) -> Colour {
    let rgb = hexToRgb(hex: hex)
    let hsl = rgbToHsl(r: rgb.r, g: rgb.g, b: rgb.b)
    
    return Colour(
        id: id,
        name: name,
        hex: hex,
        rgb: rgb,
        hsl: hsl
    )
}

/// Computes the WCAG contrast ratio between two hex colours, rounded to two decimal places.
func contrastRatio(hex1: String, hex2: String) -> Double {
    func luminance(_ hex: String) -> Double {
        let rgb = hexToRgb(hex: hex)

        let values = [rgb.r, rgb.g, rgb.b].map { c -> Double in
            let s = Double(c) / 255.0

            if s <= 0.03928 {
                return s / 12.92
            } else {
                return pow((s + 0.055) / 1.055, 2.4)
            }
        }

        let rs = values[0]
        let gs = values[1]
        let bs = values[2]

        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
    }

    let l1 = luminance(hex1)
    let l2 = luminance(hex2)

    let lighter = max(l1, l2)
    let darker = min(l1, l2)

    return round(((lighter + 0.05) / (darker + 0.05)) * 100.0) / 100.0
}

/// WCAG 2.1 conformance level for a given contrast ratio.
enum WcagLevel {
    case AAA
    case AA
    case AA_LARGE
    case FAIL
}

/// Returns the display string for a ``WcagLevel``.
func wcagLabel(level: WcagLevel) -> String {
    switch level {
    case .AAA: return "AAA"
    case .AA: return "AA"
    case .AA_LARGE: return "AA Large"
    case .FAIL: return "Fail"
    }
}

/// Classifies a WCAG contrast ratio into a conformance level.
func wcagLevel(_ ratio: Double) -> WcagLevel {
    if ratio >= 7.0 { return .AAA }
    if ratio >= 4.5 { return .AA }
    if ratio >= 3.0 { return .AA_LARGE }
    return .FAIL
}

/// Generates a unique ID combining 9 random alphanumeric characters and a base-36 millisecond timestamp.
func generateId() -> String {
    let chars = Array("abcdefghijklmnopqrstuvwxyz0123456789")

    let randomPart = String((1...9).map { _ in
        chars.randomElement()!
    })

    let timestamp = String(Int64(Date().timeIntervalSince1970 * 1000), radix: 36)

    return randomPart + timestamp
}

extension Comparable {
    /// Clamps the value to the given closed range.
    func clamped(to range: ClosedRange<Self>) -> Self {
        min(max(self, range.lowerBound), range.upperBound)
    }
}

extension String {
    /// Returns the string left-padded with `pad` to at least `length` characters.
    func leftPadded(toLength length: Int, withPad pad: Character) -> String {
        let paddingCount = length - self.count

        guard paddingCount > 0 else {
            return self
        }

        return String(repeating: String(pad), count: paddingCount) + self
    }
}
