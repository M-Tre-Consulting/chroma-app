#ifndef CHROMA_PALETTES_PAGE_H
#define CHROMA_PALETTES_PAGE_H

#include <gtk/gtk.h>
#include <memory>
#include <functional>
#include "types.h"

GtkWidget* build_palettes_page(
    std::shared_ptr<AppState> state,
    std::shared_ptr<std::function<void()>> refresh_palettes_view,
    std::shared_ptr<std::function<void()>> refresh_tokens_view,
    std::shared_ptr<std::function<void()>> refresh_export_view
);

#endif // CHROMA_PALETTES_PAGE_H
