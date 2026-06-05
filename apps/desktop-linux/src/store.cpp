/**
 * @file store.cpp
 * @brief Implementation of the local state storage serialization engine.
 */

#include "store.h"
#include <fstream>
#include <cstdlib>

/**
 * @brief Prepares state storage path.
 * 
 * Verifies standard `$HOME` environment variables, creates `~/.config/chroma/` directory 
 * if missing, and targets `state.json`.
 */
Store::Store() {
    const char* home = std::getenv("HOME");
    std::filesystem::path config_dir = home ? std::filesystem::path(home) / ".config" / "chroma" : std::filesystem::current_path();
    try {
        std::filesystem::create_directories(config_dir);
    } catch (...) {}
    path = config_dir / "state.json";
}

/**
 * @brief Deserializes local state.json file into AppState structures.
 * 
 * Safe-guards against missing files, corrupted streams, and invalid json formats.
 */
AppState Store::load() const {
    if (!std::filesystem::exists(path)) {
        return AppState{};
    }
    std::ifstream file(path);
    if (!file.is_open()) {
        return AppState{};
    }

    Json::Value root;
    Json::CharReaderBuilder builder;
    std::string errs;
    if (Json::parseFromStream(builder, file, &root, &errs)) {
        return AppState::fromJson(root);
    }
    return AppState{};
}

/**
 * @brief Serializes the current active state data structure to state.json.
 * 
 * Generates structured JSON formatted outputs and writes them directly to disk.
 */
void Store::save(const AppState& state) const {
    std::ofstream file(path);
    if (!file.is_open()) {
        return;
    }
    Json::Value root = state.toJson();
    Json::StreamWriterBuilder builder;
    builder["commentStyle"] = "None";
    builder["indentation"] = "  ";
    std::unique_ptr<Json::StreamWriter> writer(builder.newStreamWriter());
    writer->write(root, &file);
}
