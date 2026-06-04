#include "export_page.h"
#include "exporter.h"
#include "ui_helpers.h"
#include <fstream>
#include <iostream>

GtkWidget* build_export_page(
    std::shared_ptr<AppState> state,
    std::shared_ptr<std::function<void()>> refresh_export_view
) {
    GtkWidget* main_box = gtk_box_new(GTK_ORIENTATION_VERTICAL, 12);
    set_margin_all(main_box, 12);

    // Header Format Selector
    GtkWidget* format_header = gtk_box_new(GTK_ORIENTATION_HORIZONTAL, 8);
    gtk_widget_set_halign(format_header, GTK_ALIGN_CENTER);
    gtk_box_append(GTK_BOX(main_box), format_header);

    auto current_format = std::make_shared<std::string>("css");

    GtkWidget* text_view = gtk_text_view_new();
    gtk_text_view_set_monospace(GTK_TEXT_VIEW(text_view), TRUE);
    gtk_text_view_set_editable(GTK_TEXT_VIEW(text_view), FALSE);
    gtk_text_view_set_cursor_visible(GTK_TEXT_VIEW(text_view), FALSE);
    gtk_text_view_set_wrap_mode(GTK_TEXT_VIEW(text_view), GTK_WRAP_WORD_CHAR);
    gtk_widget_add_css_class(text_view, "mono-text");
    apply_widget_css(text_view, "* { padding: 12px; background-color: @theme_bg_color; border-radius: 8px; border: 1px solid rgba(0,0,0,0.1); }");

    GtkWidget* scrolled = gtk_scrolled_window_new();
    gtk_widget_set_vexpand(scrolled, TRUE);
    gtk_scrolled_window_set_child(GTK_SCROLLED_WINDOW(scrolled), text_view);
    gtk_box_append(GTK_BOX(main_box), scrolled);

    // Actions Footer
    GtkWidget* actions_box = gtk_box_new(GTK_ORIENTATION_HORIZONTAL, 12);
    gtk_widget_set_margin_top(actions_box, 8);

    GtkWidget* btn_copy = gtk_button_new_with_label("Copy to Clipboard");
    gtk_widget_set_hexpand(btn_copy, TRUE);
    gtk_widget_add_css_class(btn_copy, "suggested-action");

    GtkWidget* btn_save = gtk_button_new_with_label("Save as File…");
    gtk_widget_set_hexpand(btn_save, TRUE);

    gtk_box_append(GTK_BOX(actions_box), btn_copy);
    gtk_box_append(GTK_BOX(actions_box), btn_save);
    gtk_box_append(GTK_BOX(main_box), actions_box);

    struct FormatInfo {
        const char* id;
        const char* label;
    };
    FormatInfo formats[] = {
        {"css", "CSS vars"},
        {"scss", "SCSS vars"},
        {"json", "Style Dict"},
        {"tailwind", "Tailwind"},
        {"android", "Android XML"}
    };

    // Redraw logic
    auto refresh_all = [state, current_format, text_view, main_box]() {
        bool is_empty = state->token_groups.empty();
        if (!is_empty) {
            is_empty = true;
            for (const auto& g : state->token_groups) {
                if (!g.tokens.empty()) {
                    is_empty = false;
                    break;
                }
            }
        }

        GtkTextBuffer* buffer = gtk_text_view_get_buffer(GTK_TEXT_VIEW(text_view));
        if (is_empty) {
            gtk_text_buffer_set_text(buffer, "Add tokens in the Tokens tab to generate exports.", -1);
            gtk_widget_set_sensitive(main_box, FALSE);
        } else {
            gtk_widget_set_sensitive(main_box, TRUE);
            std::string format = *current_format;
            std::string output;
            if (format == "css") {
                output = export_css(state->token_groups, state->palettes);
            } else if (format == "scss") {
                output = export_scss(state->token_groups, state->palettes);
            } else if (format == "json") {
                output = export_json(state->token_groups, state->palettes);
            } else if (format == "tailwind") {
                output = export_tailwind(state->token_groups, state->palettes);
            } else if (format == "android") {
                output = export_android_xml(state->token_groups, state->palettes);
            }
            gtk_text_buffer_set_text(buffer, output.c_str(), -1);
        }
    };

    // Format buttons connections
    for (const auto& fmt : formats) {
        GtkWidget* btn = gtk_button_new_with_label(fmt.label);
        gtk_box_append(GTK_BOX(format_header), btn);

        connect_clicked(btn, [current_format, fmt_id = std::string(fmt.id), refresh_all](GtkButton* button) {
            *current_format = fmt_id;
            refresh_all();
        });
    }

    // Copy Connection
    connect_clicked(btn_copy, [text_view](GtkButton* btn) {
        GtkTextBuffer* buffer = gtk_text_view_get_buffer(GTK_TEXT_VIEW(text_view));
        GtkTextIter start, end;
        gtk_text_buffer_get_bounds(buffer, &start, &end);
        char* text = gtk_text_buffer_get_text(buffer, &start, &end, FALSE);

        GdkClipboard* clipboard = gdk_display_get_clipboard(gdk_display_get_default());
        gdk_clipboard_set_text(clipboard, text);
        g_free(text);

        gtk_button_set_label(btn, "Copied!");
        
        struct TimeoutData {
            GtkButton* btn;
        };
        auto* tdata = new TimeoutData{btn};
        g_timeout_add_seconds(2, [](gpointer data) -> gboolean {
            auto* td = static_cast<TimeoutData*>(data);
            gtk_button_set_label(td->btn, "Copy to Clipboard");
            delete td;
            return G_SOURCE_REMOVE;
        }, tdata);
    });

    // Save Connection
    connect_clicked(btn_save, [text_view, current_format](GtkButton* btn) {
        GtkTextBuffer* buffer = gtk_text_view_get_buffer(GTK_TEXT_VIEW(text_view));
        GtkTextIter start, end;
        gtk_text_buffer_get_bounds(buffer, &start, &end);
        char* text = gtk_text_buffer_get_text(buffer, &start, &end, FALSE);
        std::string text_str = text;
        g_free(text);

        std::string ext = *current_format;
        std::string ext_val = ext;
        if (ext == "android") ext_val = "xml";
        else if (ext == "tailwind") ext_val = "ts";
        std::string file_name = "tokens." + ext_val;

        GtkFileDialog* dialog = gtk_file_dialog_new();
        gtk_file_dialog_set_title(dialog, "Save Exported Tokens");
        gtk_file_dialog_set_initial_name(dialog, file_name.c_str());

        struct SaveData {
            std::string text;
        };
        auto* sdata = new SaveData{text_str};

        gtk_file_dialog_save(dialog, NULL, NULL, [](GObject* source_object, GAsyncResult* res, gpointer data) {
            GtkFileDialog* file_dialog = GTK_FILE_DIALOG(source_object);
            auto* sd = static_cast<SaveData*>(data);
            GError* error = NULL;
            GFile* file = gtk_file_dialog_save_finish(file_dialog, res, &error);
            if (file) {
                char* path = g_file_get_path(file);
                if (path) {
                    std::ofstream ofs(path);
                    if (ofs.is_open()) {
                        ofs << sd->text;
                    }
                    g_free(path);
                }
                g_object_unref(file);
            }
            delete sd;
        }, sdata);
    });

    *refresh_export_view = refresh_all;

    return main_box;
}
