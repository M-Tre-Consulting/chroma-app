/**
 * @file export_page.h
 * @brief Header definition for constructing the Chroma application's export page view.
 */

#ifndef CHROMA_EXPORT_PAGE_H
#define CHROMA_EXPORT_PAGE_H

#include <gtk/gtk.h>
#include <memory>
#include <functional>
#include "types.h"

/**
 * @brief Constructs the export page user interface.
 * 
 * Creates a GTK widget container containing UI controls for selecting various export 
 * formats (CSS, SCSS, JSON, Tailwind config, Android XML), displaying the export code 
 * preview, and copying/saving the export files.
 * 
 * @param state Shared pointer to the global application state.
 * @param refresh_export_view Out-parameter/callback pointer used to trigger UI updates on the export page.
 * @return GtkWidget* A pointer to the root GTK widget container for the export page.
 */
GtkWidget* build_export_page(
    std::shared_ptr<AppState> state,
    std::shared_ptr<std::function<void()>> refresh_export_view
);

#endif // CHROMA_EXPORT_PAGE_H
