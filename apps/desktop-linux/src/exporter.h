#ifndef CHROMA_EXPORTER_H
#define CHROMA_EXPORTER_H

#include <string>
#include <vector>
#include "types.h"

struct ResolvedToken {
    std::string name;
    std::string hex;
    std::string group;
};

std::vector<ResolvedToken> resolve_tokens(const std::vector<TokenGroup>& groups, const std::vector<Palette>& palettes);

std::string export_css(const std::vector<TokenGroup>& groups, const std::vector<Palette>& palettes);
std::string export_scss(const std::vector<TokenGroup>& groups, const std::vector<Palette>& palettes);
std::string export_json(const std::vector<TokenGroup>& groups, const std::vector<Palette>& palettes);
std::string export_tailwind(const std::vector<TokenGroup>& groups, const std::vector<Palette>& palettes);
std::string export_android_xml(const std::vector<TokenGroup>& groups, const std::vector<Palette>& palettes);

#endif // CHROMA_EXPORTER_H
