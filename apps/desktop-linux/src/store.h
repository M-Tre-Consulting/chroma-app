#ifndef CHROMA_STORE_H
#define CHROMA_STORE_H

#include <filesystem>
#include "types.h"

class Store {
public:
    Store();
    AppState load() const;
    void save(const AppState& state) const;

private:
    std::filesystem::path path;
};

#endif // CHROMA_STORE_H
