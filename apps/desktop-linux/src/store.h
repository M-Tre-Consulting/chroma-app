/**
 * @file store.h
 * @brief Header definition of the local Store class for local JSON state persistence.
 */

#ifndef CHROMA_STORE_H
#define CHROMA_STORE_H

#include <filesystem>
#include "types.h"

/**
 * @class Store
 * @brief Handles loading and saving of the global application state to a local configuration file.
 * 
 * Typically stores configurations in the user's home configuration folder (`~/.config/chroma/state.json`).
 */
class Store {
public:
    /**
     * @brief Constructs a new Store object, preparing configuration file paths and directories.
     */
    Store();

    /**
     * @brief Loads the AppState from disk if the file exists.
     * 
     * Parses the JSON configuration and converts it back to model structures.
     * 
     * @return AppState The loaded application state, or a clean/empty AppState if parsing fails or no file is found.
     */
    AppState load() const;

    /**
     * @brief Serializes and writes the current AppState to local storage.
     * 
     * Converts state models into hierarchical JSON objects and writes them back to the configuration file.
     * 
     * @param state The AppState object to save.
     */
    void save(const AppState& state) const;

private:
    std::filesystem::path path; /**< The computed absolute filesystem path to the config file on disk. */
};

#endif // CHROMA_STORE_H
