#include "store.h"
#include <fstream>
#include <cstdlib>

Store::Store() {
    const char* home = std::getenv("HOME");
    std::filesystem::path config_dir = home ? std::filesystem::path(home) / ".config" / "chroma" : std::filesystem::current_path();
    try {
        std::filesystem::create_directories(config_dir);
    } catch (...) {}
    path = config_dir / "state.json";
}

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
