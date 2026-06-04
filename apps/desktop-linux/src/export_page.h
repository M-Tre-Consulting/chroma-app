#ifndef CHROMA_EXPORT_PAGE_H
#define CHROMA_EXPORT_PAGE_H

#include <gtk/gtk.h>
#include <memory>
#include <functional>
#include "types.h"

GtkWidget* build_export_page(
    std::shared_ptr<AppState> state,
    std::shared_ptr<std::function<void()>> refresh_export_view
);

#endif // CHROMA_EXPORT_PAGE_H
