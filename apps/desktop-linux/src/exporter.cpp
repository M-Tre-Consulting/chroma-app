/**
 * @file exporter.cpp
 * @brief Implementation of token resolution and formatting generators for different exporter configurations.
 */

#include "exporter.h"
#include <map>
#include <algorithm>
#include <sstream>

/**
 * @brief Resolves active tokens by matching their IDs to palettes and color elements.
 * 
 * Traverses all tokens in all groups, matches the assigned palette and color ID, 
 * and stores the resulting name, resolved hex value, and group name in the resolved array.
 */
std::vector<ResolvedToken> resolve_tokens(const std::vector<TokenGroup>& groups, const std::vector<Palette>& palettes) {
    std::vector<ResolvedToken> resolved;
    for (const auto& g : groups) {
        for (const auto& t : g.tokens) {
            if (!t.value.colour_id.empty() && !t.value.palette_id.empty()) {
                const Palette* found_palette = nullptr;
                for (const auto& p : palettes) {
                    if (p.id == t.value.palette_id) {
                        found_palette = &p;
                        break;
                    }
                }

                if (found_palette) {
                    const Colour* found_colour = nullptr;
                    for (const auto& c : found_palette->colours) {
                        if (c.id == t.value.colour_id) {
                            found_colour = &c;
                            break;
                        }
                    }

                    std::string hex_str = found_colour ? found_colour->hex : "#000000";
                    resolved.push_back(ResolvedToken{t.name, hex_str, g.name});
                }
            }
        }
    }
    return resolved;
}

/**
 * @brief Formats resolved tokens into standard CSS Custom Properties.
 */
std::string export_css(const std::vector<TokenGroup>& groups, const std::vector<Palette>& palettes) {
    auto tokens = resolve_tokens(groups, palettes);
    std::stringstream ss;
    ss << ":root {\n";
    for (const auto& t : tokens) {
        ss << "  --" << t.name << ": " << t.hex << ";\n";
    }
    ss << "}";
    return ss.str();
}

/**
 * @brief Groups resolved tokens by their group name and formats them as SCSS variables.
 */
std::string export_scss(const std::vector<TokenGroup>& groups, const std::vector<Palette>& palettes) {
    auto tokens = resolve_tokens(groups, palettes);
    std::map<std::string, std::vector<const ResolvedToken*>> grouped;
    for (const auto& t : tokens) {
        grouped[t.group].push_back(&t);
    }

    std::stringstream ss;
    bool first = true;
    for (const auto& [group_name, list] : grouped) {
        if (!first) {
            ss << "\n\n";
        }
        first = false;
        ss << "// " << group_name << "\n";
        for (const auto* t : list) {
            ss << "$" << t->name << ": " << t->hex << ";\n";
        }
    }
    return ss.str();
}

/**
 * @brief Builds a hierarchical Json object for resolved tokens, compatible with Style Dictionary.
 */
std::string export_json(const std::vector<TokenGroup>& groups, const std::vector<Palette>& palettes) {
    auto tokens = resolve_tokens(groups, palettes);
    Json::Value root(Json::objectValue);
    Json::Value color_map(Json::objectValue);

    for (const auto& t : tokens) {
        if (!color_map.isMember(t.group)) {
            color_map[t.group] = Json::Value(Json::objectValue);
        }
        Json::Value val_map(Json::objectValue);
        val_map["value"] = t.hex;
        color_map[t.group][t.name] = val_map;
    }
    root["color"] = color_map;

    Json::StreamWriterBuilder builder;
    builder["commentStyle"] = "None";
    builder["indentation"] = "  ";
    return Json::writeString(builder, root);
}

/**
 * @brief Formats resolved tokens as a TypeScript/JavaScript config export block.
 */
std::string export_tailwind(const std::vector<TokenGroup>& groups, const std::vector<Palette>& palettes) {
    auto tokens = resolve_tokens(groups, palettes);
    std::stringstream ss;
    ss << "// tailwind.config.ts — paste into the colors key\nconst colors = {\n";
    for (const auto& t : tokens) {
        ss << "  '" << t.name << "': '" << t.hex << "',\n";
    }
    ss << "}";
    return ss.str();
}

/**
 * @brief Generates Android resources XML, converting token names from kebab-case/hyphens to snake_case.
 */
std::string export_android_xml(const std::vector<TokenGroup>& groups, const std::vector<Palette>& palettes) {
    auto tokens = resolve_tokens(groups, palettes);
    std::stringstream ss;
    ss << "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<resources>\n";
    for (const auto& t : tokens) {
        std::string snake_name = t.name;
        std::replace(snake_name.begin(), snake_name.end(), '-', '_');
        ss << "  <color name=\"" << snake_name << "\">" << t.hex << "</color>\n";
    }
    ss << "</resources>";
    return ss.str();
}
