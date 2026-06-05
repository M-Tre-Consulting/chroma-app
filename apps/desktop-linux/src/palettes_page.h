/**
 * @file palettes_page.h
 * @brief Header definition for constructing the color palettes management page view.
 */

#ifndef CHROMA_PALETTES_PAGE_H
#define CHROMA_PALETTES_PAGE_H

#include <gtk/gtk.h>
#include <memory>
#include <functional>
#include "types.h"

/**
 * @brief Constructs the palettes page user interface.
 * 
 * Creates a split pane / sidebar view allowing the user to create, import, export, 
 * select, edit, and delete color palettes. Also includes the color editor panel, 
 * which supports hex/name creation, HSL/RGB adjustment, and WCAG contrast check.
 * 
 * @param state Shared pointer to the global application state.
 * @param refresh_palettes_view Out-parameter/callback pointer used to trigger UI updates on this page.
 * @param refresh_tokens_view Callback to trigger token page refreshes when colors change.
 * @param refresh_export_view Callback to trigger export page refreshes when colors change.
 * @return GtkWidget* A pointer to the root GTK widget container for the palettes page.
 */
GtkWidget* build_palettes_page(
    std::shared_ptr<AppState> state,
    std::shared_ptr<std::function<void()>> refresh_palettes_view,
    std::shared_ptr<std::function<void()>> refresh_tokens_view,
    std::shared_ptr<std::function<void()>> refresh_export_view
);

#endif // CHROMA_PALETTES_PAGE_H
