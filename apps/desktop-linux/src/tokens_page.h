/**
 * @file tokens_page.h
 * @brief Header definition for constructing the semantic design tokens management page view.
 */

#ifndef CHROMA_TOKENS_PAGE_H
#define CHROMA_TOKENS_PAGE_H

#include <gtk/gtk.h>
#include <memory>
#include <functional>
#include "types.h"

/**
 * @brief Constructs the design tokens management page.
 * 
 * Creates a split pane / sidebar view allowing the user to create, edit, group, 
 * delete, and map design tokens to colors within their selected color palette.
 * 
 * @param state Shared pointer to the global application state.
 * @param refresh_tokens_view Out-parameter/callback pointer used to trigger UI updates on this page.
 * @param refresh_export_view Callback to trigger export page updates when token maps change.
 * @return GtkWidget* A pointer to the root GTK widget container for the tokens page.
 */
GtkWidget* build_tokens_page(
    std::shared_ptr<AppState> state,
    std::shared_ptr<std::function<void()>> refresh_tokens_view,
    std::shared_ptr<std::function<void()>> refresh_export_view
);

#endif // CHROMA_TOKENS_PAGE_H
