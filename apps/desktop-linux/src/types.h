/**
 * @file types.h
 * @brief Definition of core domain models and data structures for the Chroma application.
 * 
 * Contains data structures representing colors, color spaces (RGB/HSL), palettes, 
 * design tokens, token groups, and the global application state. Includes 
 * functions for serialization/deserialization to/from JSON.
 */

#ifndef CHROMA_TYPES_H
#define CHROMA_TYPES_H

#include <string>
#include <vector>
#include <optional>
#include <random>
#include <sstream>
#include <iomanip>
#include <json/json.h>

/**
 * @brief Generates a cryptographically-styled version 4 UUID.
 * 
 * @return A std::string containing the generated UUID in standard 8-4-4-4-12 format.
 */
inline std::string generate_uuid() {
    static std::random_device rd;
    static std::mt19937 gen(rd());
    static std::uniform_int_distribution<> dis(0, 15);
    static std::uniform_int_distribution<> dis2(8, 11);

    std::stringstream ss;
    ss << std::hex;
    for (int i = 0; i < 8; i++) ss << dis(gen);
    ss << "-";
    for (int i = 0; i < 4; i++) ss << dis(gen);
    ss << "-4";
    for (int i = 0; i < 3; i++) ss << dis(gen);
    ss << "-";
    ss << dis2(gen);
    for (int i = 0; i < 3; i++) ss << dis(gen);
    ss << "-";
    for (int i = 0; i < 12; i++) ss << dis(gen);
    return ss.str();
}

/**
 * @struct Rgb
 * @brief Represents a color in the RGB (Red, Green, Blue) color space.
 */
struct Rgb {
    /** @brief Red channel value, ranging from 0 to 255. */
    uint8_t r = 0;
    /** @brief Green channel value, ranging from 0 to 255. */
    uint8_t g = 0;
    /** @brief Blue channel value, ranging from 0 to 255. */
    uint8_t b = 0;

    /**
     * @brief Serializes the RGB color values to a JSON object.
     * @return A Json::Value containing the serialized "r", "g", and "b" keys.
     */
    Json::Value toJson() const {
        Json::Value val;
        val["r"] = r;
        val["g"] = g;
        val["b"] = b;
        return val;
    }

    /**
     * @brief Deserializes an RGB structure from a JSON object.
     * @param val The Json::Value containing the RGB properties.
     * @return An Rgb struct populated with the deserialized values.
     */
    static Rgb fromJson(const Json::Value& val) {
        Rgb rgb;
        if (val.isMember("r")) rgb.r = static_cast<uint8_t>(val["r"].asUInt());
        if (val.isMember("g")) rgb.g = static_cast<uint8_t>(val["g"].asUInt());
        if (val.isMember("b")) rgb.b = static_cast<uint8_t>(val["b"].asUInt());
        return rgb;
    }
};

/**
 * @struct Hsl
 * @brief Represents a color in the HSL (Hue, Saturation, Lightness) color space.
 */
struct Hsl {
    /** @brief Hue channel value in degrees, ranging from 0 to 360. */
    int h = 0;
    /** @brief Saturation channel percentage, ranging from 0 to 100. */
    int s = 0;
    /** @brief Lightness channel percentage, ranging from 0 to 100. */
    int l = 0;

    /**
     * @brief Serializes the HSL color values to a JSON object.
     * @return A Json::Value containing the serialized "h", "s", and "l" keys.
     */
    Json::Value toJson() const {
        Json::Value val;
        val["h"] = h;
        val["s"] = s;
        val["l"] = l;
        return val;
    }

    /**
     * @brief Deserializes an HSL structure from a JSON object.
     * @param val The Json::Value containing the HSL properties.
     * @return An Hsl struct populated with the deserialized values.
     */
    static Hsl fromJson(const Json::Value& val) {
        Hsl hsl;
        if (val.isMember("h")) hsl.h = val["h"].asInt();
        if (val.isMember("s")) hsl.s = val["s"].asInt();
        if (val.isMember("l")) hsl.l = val["l"].asInt();
        return hsl;
    }
};

/**
 * @struct Colour
 * @brief Represents a specific color inside a palette, containing various representation formats.
 */
struct Colour {
    /** @brief Unique identifier for the color (UUID). */
    std::string id;
    /** @brief User-friendly name of the color (e.g., "Primary Blue"). */
    std::string name;
    /** @brief Hexadecimal string representation of the color (e.g., "#3584e4"). */
    std::string hex;
    /** @brief RGB representation of the color. */
    Rgb rgb;
    /** @brief HSL representation of the color. */
    Hsl hsl;

    /**
     * @brief Serializes the color and its representations to a JSON object.
     * @return A Json::Value containing the serialized properties.
     */
    Json::Value toJson() const {
        Json::Value val;
        val["id"] = id;
        val["name"] = name;
        val["hex"] = hex;
        val["rgb"] = rgb.toJson();
        val["hsl"] = hsl.toJson();
        return val;
    }

    /**
     * @brief Deserializes a Colour structure from a JSON object.
     * @param val The Json::Value containing the color properties.
     * @return A Colour struct populated with the deserialized values.
     */
    static Colour fromJson(const Json::Value& val) {
        Colour c;
        if (val.isMember("id")) c.id = val["id"].asString();
        if (val.isMember("name")) c.name = val["name"].asString();
        if (val.isMember("hex")) c.hex = val["hex"].asString();
        if (val.isMember("rgb")) c.rgb = Rgb::fromJson(val["rgb"]);
        if (val.isMember("hsl")) c.hsl = Hsl::fromJson(val["hsl"]);
        return c;
    }
};

/**
 * @struct Palette
 * @brief Represents a color palette containing a list of colors and metadata.
 */
struct Palette {
    /** @brief Unique identifier for the palette (UUID). */
    std::string id;
    /** @brief User-friendly name of the palette (e.g., "Nord Light"). */
    std::string name;
    /** @brief The collection of colors belonging to this palette. */
    std::vector<Colour> colours;
    /** @brief Unix timestamp (seconds) when the palette was created. */
    uint64_t created_at = 0;
    /** @brief Unix timestamp (seconds) when the palette was last updated. */
    uint64_t updated_at = 0;

    /**
     * @brief Serializes the palette and its list of colors to a JSON object.
     * @return A Json::Value representing the palette.
     */
    Json::Value toJson() const {
        Json::Value val;
        val["id"] = id;
        val["name"] = name;
        val["createdAt"] = (Json::Value::UInt64)created_at;
        val["updatedAt"] = (Json::Value::UInt64)updated_at;
        Json::Value cols(Json::arrayValue);
        for (const auto& c : colours) {
            cols.append(c.toJson());
        }
        val["colours"] = cols;
        return val;
    }

    /**
     * @brief Deserializes a Palette structure from a JSON object.
     * @param val The Json::Value containing the palette properties.
     * @return A Palette struct populated with the deserialized values.
     */
    static Palette fromJson(const Json::Value& val) {
        Palette p;
        if (val.isMember("id")) p.id = val["id"].asString();
        if (val.isMember("name")) p.name = val["name"].asString();
        if (val.isMember("createdAt")) p.created_at = val["createdAt"].asUInt64();
        if (val.isMember("updatedAt")) p.updated_at = val["updatedAt"].asUInt64();
        if (val.isMember("colours") && val["colours"].isArray()) {
            for (const auto& col_val : val["colours"]) {
                p.colours.push_back(Colour::fromJson(col_val));
            }
        }
        return p;
    }
};

/**
 * @struct TokenValue
 * @brief Represents the values assigned to a design token, linking it to a color in a palette.
 */
struct TokenValue {
    /** @brief Reference to the assigned color's unique ID. */
    std::string colour_id;
    /** @brief Reference to the assigned color's parent palette unique ID. */
    std::string palette_id;

    /**
     * @brief Serializes the token value to a JSON object.
     * @return A Json::Value with colourId and paletteId fields.
     */
    Json::Value toJson() const {
        Json::Value val;
        val["colourId"] = colour_id;
        val["paletteId"] = palette_id;
        return val;
    }

    /**
     * @brief Deserializes a TokenValue structure from a JSON object.
     * @param val The Json::Value containing the token value properties.
     * @return A TokenValue struct populated with the deserialized values.
     */
    static TokenValue fromJson(const Json::Value& val) {
        TokenValue tv;
        if (val.isMember("colourId")) tv.colour_id = val["colourId"].asString();
        if (val.isMember("paletteId")) tv.palette_id = val["paletteId"].asString();
        return tv;
    }
};

/**
 * @struct Token
 * @brief Represents a semantic design token that can be assigned to a specific color.
 */
struct Token {
    /** @brief Unique identifier for the token (UUID). */
    std::string id;
    /** @brief Semantic name of the token (e.g., "surface-background"). */
    std::string name;
    /** @brief Description of the token's purpose and usage context. */
    std::string description;
    /** @brief The current color/palette assignment values for the token. */
    TokenValue value;

    /**
     * @brief Serializes the token to a JSON object.
     * @return A Json::Value representing the token.
     */
    Json::Value toJson() const {
        Json::Value val;
        val["id"] = id;
        val["name"] = name;
        val["description"] = description;
        val["value"] = value.toJson();
        return val;
    }

    /**
     * @brief Deserializes a Token structure from a JSON object.
     * @param val The Json::Value containing the token properties.
     * @return A Token struct populated with the deserialized values.
     */
    static Token fromJson(const Json::Value& val) {
        Token t;
        if (val.isMember("id")) t.id = val["id"].asString();
        if (val.isMember("name")) t.name = val["name"].asString();
        if (val.isMember("description")) t.description = val["description"].asString();
        if (val.isMember("value")) t.value = TokenValue::fromJson(val["value"]);
        return t;
    }
};

/**
 * @struct TokenGroup
 * @brief Represents a logical grouping of semantic design tokens (e.g., "Buttons", "Typography").
 */
struct TokenGroup {
    /** @brief Unique identifier for the group (UUID). */
    std::string id;
    /** @brief User-friendly name of the group. */
    std::string name;
    /** @brief The list of design tokens belonging to this group. */
    std::vector<Token> tokens;

    /**
     * @brief Serializes the token group and its tokens to a JSON object.
     * @return A Json::Value representing the token group.
     */
    Json::Value toJson() const {
        Json::Value val;
        val["id"] = id;
        val["name"] = name;
        Json::Value tkns(Json::arrayValue);
        for (const auto& t : tokens) {
            tkns.append(t.toJson());
        }
        val["tokens"] = tkns;
        return val;
    }

    /**
     * @brief Deserializes a TokenGroup structure from a JSON object.
     * @param val The Json::Value containing the token group properties.
     * @return A TokenGroup struct populated with the deserialized values.
     */
    static TokenGroup fromJson(const Json::Value& val) {
        TokenGroup tg;
        if (val.isMember("id")) tg.id = val["id"].asString();
        if (val.isMember("name")) tg.name = val["name"].asString();
        if (val.isMember("tokens") && val["tokens"].isArray()) {
            for (const auto& tkn_val : val["tokens"]) {
                tg.tokens.push_back(Token::fromJson(tkn_val));
            }
        }
        return tg;
    }
};

/**
 * @struct AppState
 * @brief Represents the global application state containing all palettes, token groups, and the active palette.
 */
struct AppState {
    /** @brief All color palettes loaded into the application. */
    std::vector<Palette> palettes;
    /** @brief All design token groups loaded into the application. */
    std::vector<TokenGroup> token_groups;
    /** @brief Optional ID of the currently active palette. */
    std::optional<std::string> active_palette_id;

    /**
     * @brief Serializes the global application state to a JSON object.
     * @return A Json::Value containing all state properties.
     */
    Json::Value toJson() const {
        Json::Value val;
        Json::Value pals(Json::arrayValue);
        for (const auto& p : palettes) {
            pals.append(p.toJson());
        }
        val["palettes"] = pals;

        Json::Value grps(Json::arrayValue);
        for (const auto& tg : token_groups) {
            grps.append(tg.toJson());
        }
        val["tokenGroups"] = grps;

        if (active_palette_id.has_value()) {
            val["activePaletteId"] = *active_palette_id;
        } else {
            val["activePaletteId"] = Json::Value::null;
        }
        return val;
    }

    /**
     * @brief Deserializes the AppState structure from a JSON object.
     * @param val The Json::Value containing the global state properties.
     * @return An AppState struct populated with the deserialized values.
     */
    static AppState fromJson(const Json::Value& val) {
        AppState state;
        if (val.isMember("palettes") && val["palettes"].isArray()) {
            for (const auto& p_val : val["palettes"]) {
                state.palettes.push_back(Palette::fromJson(p_val));
            }
        }
        if (val.isMember("tokenGroups") && val["tokenGroups"].isArray()) {
            for (const auto& tg_val : val["tokenGroups"]) {
                state.token_groups.push_back(TokenGroup::fromJson(tg_val));
            }
        }
        if (val.isMember("activePaletteId") && !val["activePaletteId"].isNull()) {
            state.active_palette_id = val["activePaletteId"].asString();
        }
        return state;
    }
};

#endif // CHROMA_TYPES_H
