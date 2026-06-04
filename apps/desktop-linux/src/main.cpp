#include <gtk/gtk.h>
#include <adwaita.h>
#include <memory>
#include <functional>
#include "types.h"
#include "store.h"
#include "palettes_page.h"
#include "tokens_page.h"
#include "export_page.h"

static void build_ui(AdwApplication* app, gpointer user_data) {
    auto store = std::make_shared<Store>();
    auto state = std::make_shared<AppState>(store->load());

    // Custom global styling
    GtkCssProvider* provider = gtk_css_provider_new();
    gtk_css_provider_load_from_string(provider, R"(
        .color-dot {
            border-radius: 9999px;
            border: 1px solid rgba(0, 0, 0, 0.15);
        }
        .color-preview-block {
            border-radius: 8px;
            border: 1px solid rgba(0, 0, 0, 0.15);
        }
        .contrast-badge-aaa {
            background-color: rgba(46, 194, 126, 0.18);
            color: #2ec27e;
            font-weight: bold;
            padding: 2px 8px;
            border-radius: 9999px;
            font-size: 10px;
        }
        .contrast-badge-aa {
            background-color: rgba(53, 132, 228, 0.18);
            color: #3584e4;
            font-weight: bold;
            padding: 2px 8px;
            border-radius: 9999px;
            font-size: 10px;
        }
        .contrast-badge-aal {
            background-color: rgba(99, 195, 237, 0.18);
            color: #1c71d8;
            font-weight: bold;
            padding: 2px 8px;
            border-radius: 9999px;
            font-size: 10px;
        }
        .contrast-badge-fail {
            background-color: rgba(224, 27, 36, 0.18);
            color: #e01b24;
            font-weight: bold;
            padding: 2px 8px;
            border-radius: 9999px;
            font-size: 10px;
        }
        .title-bold {
            font-weight: bold;
        }
        .dim-label {
            opacity: 0.5;
            font-size: 11px;
        }
        .mono-text {
            font-family: monospace;
            font-size: 11px;
        }
        .contrast-test-text {
            font-weight: 600;
            font-size: 14px;
            padding: 8px 12px;
            border-radius: 6px;
            border: 1px solid rgba(0, 0, 0, 0.08);
        }
    )");
    
    gtk_style_context_add_provider_for_display(
        gdk_display_get_default(),
        GTK_STYLE_PROVIDER(provider),
        GTK_STYLE_PROVIDER_PRIORITY_APPLICATION
    );
    g_object_unref(provider);

    GtkWidget* window = adw_application_window_new(GTK_APPLICATION(app));
    gtk_window_set_title(GTK_WINDOW(window), "Chroma");
    gtk_window_set_default_size(GTK_WINDOW(window), 1024, 700);

    GtkWidget* main_layout = gtk_box_new(GTK_ORIENTATION_VERTICAL, 0);
    GtkWidget* header_bar = adw_header_bar_new();
    gtk_box_append(GTK_BOX(main_layout), header_bar);

    GtkWidget* view_stack = adw_view_stack_new();
    gtk_widget_set_vexpand(view_stack, TRUE);
    gtk_box_append(GTK_BOX(main_layout), view_stack);

    GtkWidget* view_switcher = adw_view_switcher_new();
    adw_view_switcher_set_stack(ADW_VIEW_SWITCHER(view_switcher), ADW_VIEW_STACK(view_stack));
    adw_header_bar_set_title_widget(ADW_HEADER_BAR(header_bar), view_switcher);

    // Shared visual refresh callbacks
    auto refresh_palettes_view = std::make_shared<std::function<void()>>();
    auto refresh_tokens_view = std::make_shared<std::function<void()>>();
    auto refresh_export_view = std::make_shared<std::function<void()>>();

    // Build pages
    GtkWidget* palettes_page = build_palettes_page(
        state,
        refresh_palettes_view,
        refresh_tokens_view,
        refresh_export_view
    );
    GtkWidget* tokens_page = build_tokens_page(
        state,
        refresh_tokens_view,
        refresh_export_view
    );
    GtkWidget* export_page = build_export_page(
        state,
        refresh_export_view
    );

    // Add to stack
    AdwViewStackPage* stack_page_palettes = adw_view_stack_add_titled(ADW_VIEW_STACK(view_stack), palettes_page, "palettes", "Palettes");
    adw_view_stack_page_set_icon_name(stack_page_palettes, "applications-graphics-symbolic");

    AdwViewStackPage* stack_page_tokens = adw_view_stack_add_titled(ADW_VIEW_STACK(view_stack), tokens_page, "tokens", "Tokens");
    adw_view_stack_page_set_icon_name(stack_page_tokens, "view-list-symbolic");

    AdwViewStackPage* stack_page_export = adw_view_stack_add_titled(ADW_VIEW_STACK(view_stack), export_page, "export", "Export");
    adw_view_stack_page_set_icon_name(stack_page_export, "document-save-symbolic");

    adw_application_window_set_content(ADW_APPLICATION_WINDOW(window), main_layout);
    gtk_window_present(GTK_WINDOW(window));

    if (refresh_palettes_view && *refresh_palettes_view) {
        (*refresh_palettes_view)();
    }
}

int main(int argc, char* argv[]) {
    AdwApplication* app = adw_application_new("com.chroma.app", G_APPLICATION_DEFAULT_FLAGS);
    g_signal_connect(app, "activate", G_CALLBACK(build_ui), NULL);
    int status = g_application_run(G_APPLICATION(app), argc, argv);
    g_object_unref(app);
    return status;
}
