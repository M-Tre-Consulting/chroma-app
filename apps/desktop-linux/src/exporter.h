/**
 * @file exporter.h
 * @brief Exporter utility engines for mapping and generating various format configurations from resolved design tokens.
 */

#ifndef CHROMA_EXPORTER_H
#define CHROMA_EXPORTER_H

#include <string>
#include <vector>
#include "types.h"

/**
 * @struct ResolvedToken
 * @brief Represents a semantic design token resolved to its final color values for exporting.
 */
struct ResolvedToken {
    std::string name;   /**< The name of the token (e.g., "color-bg-primary"). */
    std::string hex;    /**< The resolved hexadecimal color value (e.g., "#ffffff"). */
    std::string group;  /**< The group name of the token (e.g., "Buttons"). */
};

/**
 * @brief Resolves active tokens by mapping token values to matching palette colors.
 * 
 * Filters out tokens that are unassigned (missing palette_id or colour_id).
 * 
 * @param groups The list of design token groups.
 * @param palettes The list of color palettes.
 * @return std::vector<ResolvedToken> A flat list of resolved tokens with active hex mappings.
 */
std::vector<ResolvedToken> resolve_tokens(const std::vector<TokenGroup>& groups, const std::vector<Palette>& palettes);

/**
 * @brief Exports tokens as CSS Custom Properties (Variables) inside a `:root` block.
 * 
 * @param groups The list of design token groups.
 * @param palettes The list of color palettes.
 * @return std::string CSS variables file content.
 */
std::string export_css(const std::vector<TokenGroup>& groups, const std::vector<Palette>& palettes);

/**
 * @brief Exports tokens as SCSS variables grouped and commented by their token group.
 * 
 * @param groups The list of design token groups.
 * @param palettes The list of color palettes.
 * @return std::string SCSS variables file content.
 */
std::string export_scss(const std::vector<TokenGroup>& groups, const std::vector<Palette>& palettes);

/**
 * @brief Exports tokens as a Style Dictionary compatible JSON object.
 * 
 * @param groups The list of design token groups.
 * @param palettes The list of color palettes.
 * @return std::string JSON formatted token dictionary.
 */
std::string export_json(const std::vector<TokenGroup>& groups, const std::vector<Palette>& palettes);

/**
 * @brief Exports tokens formatted as a TypeScript / JavaScript configuration object for Tailwind CSS.
 * 
 * @param groups The list of design token groups.
 * @param palettes The list of color palettes.
 * @return std::string Tailwind configuration module content.
 */
std::string export_tailwind(const std::vector<TokenGroup>& groups, const std::vector<Palette>& palettes);

/**
 * @brief Exports tokens as an Android resources XML color configuration sheet.
 * 
 * Automatically translates token names with hyphens to snake_case format.
 * 
 * @param groups The list of design token groups.
 * @param palettes The list of color palettes.
 * @return std::string Android resource XML content.
 */
std::string export_android_xml(const std::vector<TokenGroup>& groups, const std::vector<Palette>& palettes);

#endif // CHROMA_EXPORTER_H
