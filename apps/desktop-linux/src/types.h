#ifndef CHROMA_TYPES_H
#define CHROMA_TYPES_H

#include <string>
#include <vector>
#include <optional>
#include <random>
#include <sstream>
#include <iomanip>
#include <json/json.h>

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

struct Rgb {
    uint8_t r = 0;
    uint8_t g = 0;
    uint8_t b = 0;

    Json::Value toJson() const {
        Json::Value val;
        val["r"] = r;
        val["g"] = g;
        val["b"] = b;
        return val;
    }

    static Rgb fromJson(const Json::Value& val) {
        Rgb rgb;
        if (val.isMember("r")) rgb.r = static_cast<uint8_t>(val["r"].asUInt());
        if (val.isMember("g")) rgb.g = static_cast<uint8_t>(val["g"].asUInt());
        if (val.isMember("b")) rgb.b = static_cast<uint8_t>(val["b"].asUInt());
        return rgb;
    }
};

struct Hsl {
    int h = 0;
    int s = 0;
    int l = 0;

    Json::Value toJson() const {
        Json::Value val;
        val["h"] = h;
        val["s"] = s;
        val["l"] = l;
        return val;
    }

    static Hsl fromJson(const Json::Value& val) {
        Hsl hsl;
        if (val.isMember("h")) hsl.h = val["h"].asInt();
        if (val.isMember("s")) hsl.s = val["s"].asInt();
        if (val.isMember("l")) hsl.l = val["l"].asInt();
        return hsl;
    }
};

struct Colour {
    std::string id;
    std::string name;
    std::string hex;
    Rgb rgb;
    Hsl hsl;

    Json::Value toJson() const {
        Json::Value val;
        val["id"] = id;
        val["name"] = name;
        val["hex"] = hex;
        val["rgb"] = rgb.toJson();
        val["hsl"] = hsl.toJson();
        return val;
    }

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

struct Palette {
    std::string id;
    std::string name;
    std::vector<Colour> colours;
    uint64_t created_at = 0;
    uint64_t updated_at = 0;

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

struct TokenValue {
    std::string colour_id;
    std::string palette_id;

    Json::Value toJson() const {
        Json::Value val;
        val["colourId"] = colour_id;
        val["paletteId"] = palette_id;
        return val;
    }

    static TokenValue fromJson(const Json::Value& val) {
        TokenValue tv;
        if (val.isMember("colourId")) tv.colour_id = val["colourId"].asString();
        if (val.isMember("paletteId")) tv.palette_id = val["paletteId"].asString();
        return tv;
    }
};

struct Token {
    std::string id;
    std::string name;
    std::string description;
    TokenValue value;

    Json::Value toJson() const {
        Json::Value val;
        val["id"] = id;
        val["name"] = name;
        val["description"] = description;
        val["value"] = value.toJson();
        return val;
    }

    static Token fromJson(const Json::Value& val) {
        Token t;
        if (val.isMember("id")) t.id = val["id"].asString();
        if (val.isMember("name")) t.name = val["name"].asString();
        if (val.isMember("description")) t.description = val["description"].asString();
        if (val.isMember("value")) t.value = TokenValue::fromJson(val["value"]);
        return t;
    }
};

struct TokenGroup {
    std::string id;
    std::string name;
    std::vector<Token> tokens;

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

struct AppState {
    std::vector<Palette> palettes;
    std::vector<TokenGroup> token_groups;
    std::optional<std::string> active_palette_id;

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
