#include "palettes_page.h"
#include "colour_math.h"
#include "store.h"
#include "ui_helpers.h"
#include <adwaita.h>
#include <algorithm>
#include <ctime>
#include <sstream>
#include <iomanip>
#include <iostream>
#include <cctype>

GtkWidget* build_palettes_page(
    std::shared_ptr<AppState> state,
    std::shared_ptr<std::function<void()>> refresh_palettes_view,
    std::shared_ptr<std::function<void()>> refresh_tokens_view,
    std::shared_ptr<std::function<void()>> refresh_export_view
) {
    GtkWidget* split_view = gtk_paned_new(GTK_ORIENTATION_HORIZONTAL);
    gtk_paned_set_position(GTK_PANED(split_view), 240);

    // Sidebar: Palettes list
    GtkWidget* sidebar_box = gtk_box_new(GTK_ORIENTATION_VERTICAL, 0);
    gtk_widget_set_size_request(sidebar_box, 220, -1);

    GtkWidget* sidebar_header = gtk_label_new("My Palettes");
    gtk_widget_set_margin_top(sidebar_header, 18);
    gtk_widget_set_margin_bottom(sidebar_header, 6);
    gtk_widget_set_margin_start(sidebar_header, 16);
    gtk_widget_set_halign(sidebar_header, GTK_ALIGN_START);
    gtk_widget_add_css_class(sidebar_header, "heading");
    gtk_widget_add_css_class(sidebar_header, "dim-label");
    gtk_box_append(GTK_BOX(sidebar_box), sidebar_header);

    GtkWidget* scrolled_sidebar = gtk_scrolled_window_new();
    gtk_scrolled_window_set_policy(GTK_SCROLLED_WINDOW(scrolled_sidebar), GTK_POLICY_NEVER, GTK_POLICY_AUTOMATIC);
    gtk_widget_set_vexpand(scrolled_sidebar, TRUE);

    GtkWidget* palette_list_box = gtk_list_box_new();
    gtk_widget_add_css_class(palette_list_box, "navigation-sidebar");
    gtk_scrolled_window_set_child(GTK_SCROLLED_WINDOW(scrolled_sidebar), palette_list_box);
    gtk_box_append(GTK_BOX(sidebar_box), scrolled_sidebar);

    // New Palette footer in sidebar
    GtkWidget* sidebar_footer = gtk_box_new(GTK_ORIENTATION_HORIZONTAL, 6);
    set_margin_all(sidebar_footer, 8);

    GtkWidget* entry_new_palette = gtk_entry_new();
    gtk_entry_set_placeholder_text(GTK_ENTRY(entry_new_palette), "New palette…");
    gtk_widget_set_hexpand(entry_new_palette, TRUE);

    GtkWidget* btn_add_palette = gtk_button_new_with_label("+");

    gtk_box_append(GTK_BOX(sidebar_footer), entry_new_palette);
    gtk_box_append(GTK_BOX(sidebar_footer), btn_add_palette);
    gtk_box_append(GTK_BOX(sidebar_box), sidebar_footer);

    gtk_paned_set_start_child(GTK_PANED(split_view), sidebar_box);

    // Content: Active Palette Workspace
    GtkWidget* content_stack = gtk_stack_new();
    gtk_paned_set_end_child(GTK_PANED(split_view), content_stack);

    // Empty state view
    GtkWidget* empty_status = adw_status_page_new();
    adw_status_page_set_title(ADW_STATUS_PAGE(empty_status), "No Palette Selected");
    adw_status_page_set_description(ADW_STATUS_PAGE(empty_status), "Create or select a palette in the sidebar to get started");
    adw_status_page_set_icon_name(ADW_STATUS_PAGE(empty_status), "applications-graphics-symbolic");
    gtk_stack_add_child(GTK_STACK(content_stack), empty_status);

    // Active workspace view
    GtkWidget* active_workspace = gtk_box_new(GTK_ORIENTATION_VERTICAL, 0);

    GtkWidget* active_header = gtk_box_new(GTK_ORIENTATION_VERTICAL, 4);
    set_margin_all(active_header, 12);

    GtkWidget* lbl_active_name = gtk_label_new(NULL);
    gtk_widget_set_halign(lbl_active_name, GTK_ALIGN_START);
    gtk_widget_add_css_class(lbl_active_name, "title-bold");

    GtkWidget* lbl_active_colours = gtk_label_new(NULL);
    gtk_widget_set_halign(lbl_active_colours, GTK_ALIGN_START);
    gtk_widget_add_css_class(lbl_active_colours, "dim-label");

    gtk_box_append(GTK_BOX(active_header), lbl_active_name);
    gtk_box_append(GTK_BOX(active_header), lbl_active_colours);

    GtkWidget* separator = gtk_separator_new(GTK_ORIENTATION_HORIZONTAL);
    gtk_box_append(GTK_BOX(active_workspace), active_header);
    gtk_box_append(GTK_BOX(active_workspace), separator);

    GtkWidget* workspace_body = gtk_box_new(GTK_ORIENTATION_HORIZONTAL, 0);
    gtk_widget_set_vexpand(workspace_body, TRUE);
    gtk_box_append(GTK_BOX(active_workspace), workspace_body);
    gtk_stack_add_child(GTK_STACK(content_stack), active_workspace);

    // 1. LEFT PANEL: COLOR PICKER
    GtkWidget* picker_panel = gtk_box_new(GTK_ORIENTATION_VERTICAL, 12);
    set_margin_all(picker_panel, 12);
    gtk_widget_set_size_request(picker_panel, 240, -1);
    apply_widget_css(picker_panel, ".picker-panel { border-right: 1px solid rgba(0,0,0,0.1); }");
    gtk_widget_add_css_class(picker_panel, "picker-panel");

    GtkWidget* btn_back = gtk_button_new_with_label("← Back to Swatches");
    gtk_widget_set_visible(btn_back, FALSE);
    gtk_widget_add_css_class(btn_back, "flat");
    gtk_box_append(GTK_BOX(picker_panel), btn_back);

    GtkWidget* color_chooser = gtk_color_chooser_widget_new();
    gtk_color_chooser_set_use_alpha(GTK_COLOR_CHOOSER(color_chooser), FALSE);
    gtk_widget_set_size_request(color_chooser, 240, 240);
    gtk_box_append(GTK_BOX(picker_panel), color_chooser);

    connect_clicked(btn_back, [color_chooser](GtkButton* btn) {
        g_object_set(color_chooser, "show-editor", FALSE, NULL);
    });

    connect_notify(color_chooser, "show-editor", [btn_back](GObject* cc) {
        gboolean shows_editor = FALSE;
        g_object_get(cc, "show-editor", &shows_editor, NULL);
        gtk_widget_set_visible(btn_back, shows_editor);
    });

    GtkWidget* entry_col_name = gtk_entry_new();
    gtk_entry_set_placeholder_text(GTK_ENTRY(entry_col_name), "Name (optional)");
    gtk_box_append(GTK_BOX(picker_panel), entry_col_name);

    GtkWidget* btn_add_colour = gtk_button_new_with_label("Add Colour");
    gtk_widget_add_css_class(btn_add_colour, "suggested-action");
    gtk_box_append(GTK_BOX(picker_panel), btn_add_colour);

    gtk_box_append(GTK_BOX(workspace_body), picker_panel);

    // 2. RIGHT PANEL: COLOR CARDS LIST
    GtkWidget* cards_panel = gtk_box_new(GTK_ORIENTATION_VERTICAL, 8);
    set_margin_all(cards_panel, 12);
    gtk_widget_set_hexpand(cards_panel, TRUE);

    GtkWidget* scrolled_cards = gtk_scrolled_window_new();
    gtk_scrolled_window_set_policy(GTK_SCROLLED_WINDOW(scrolled_cards), GTK_POLICY_NEVER, GTK_POLICY_AUTOMATIC);
    gtk_widget_set_vexpand(scrolled_cards, TRUE);

    GtkWidget* cards_list_box = gtk_list_box_new();
    gtk_list_box_set_selection_mode(GTK_LIST_BOX(cards_list_box), GTK_SELECTION_NONE);
    gtk_widget_add_css_class(cards_list_box, "boxed-list");
    gtk_scrolled_window_set_child(GTK_SCROLLED_WINDOW(scrolled_cards), cards_list_box);
    gtk_box_append(GTK_BOX(cards_panel), scrolled_cards);

    gtk_box_append(GTK_BOX(workspace_body), cards_panel);

    auto active_palette_id_ref = std::make_shared<std::string>("");

    // Unified reload logic
    auto refresh_all = [state, palette_list_box, content_stack, active_palette_id_ref,
                        lbl_active_name, lbl_active_colours, cards_list_box, active_workspace, empty_status,
                        refresh_palettes_view, refresh_tokens_view, refresh_export_view]() {
        std::string active_id = *active_palette_id_ref;
        if (active_id.empty()) {
            if (!state->palettes.empty()) {
                active_id = state->palettes.front().id;
                *active_palette_id_ref = active_id;
                state->active_palette_id = active_id;
                Store().save(*state);
            }
        }

        // Clear palette list
        GtkWidget* child;
        while ((child = gtk_widget_get_first_child(palette_list_box)) != NULL) {
            gtk_list_box_remove(GTK_LIST_BOX(palette_list_box), child);
        }

        for (const auto& p : state->palettes) {
            GtkWidget* row_box = gtk_box_new(GTK_ORIENTATION_HORIZONTAL, 8);
            gtk_widget_set_margin_start(row_box, 8);
            gtk_widget_set_margin_end(row_box, 8);
            gtk_widget_set_margin_top(row_box, 6);
            gtk_widget_set_margin_bottom(row_box, 6);

            GtkWidget* dot = gtk_frame_new(NULL);
            gtk_widget_add_css_class(dot, "color-dot");
            gtk_widget_set_size_request(dot, 10, 10);
            gtk_widget_set_valign(dot, GTK_ALIGN_CENTER);

            std::string first_hex = "#888888";
            if (!p.colours.empty()) {
                first_hex = p.colours.front().hex;
            }
            apply_widget_css(dot, ("* { background-color: " + first_hex + "; }").c_str());
            gtk_box_append(GTK_BOX(row_box), dot);

            GtkWidget* label = gtk_label_new(p.name.c_str());
            gtk_label_set_ellipsize(GTK_LABEL(label), PANGO_ELLIPSIZE_END);
            gtk_widget_set_hexpand(label, TRUE);
            gtk_widget_set_halign(label, GTK_ALIGN_START);
            if (active_id == p.id) {
                gtk_widget_add_css_class(label, "title-bold");
            }
            gtk_box_append(GTK_BOX(row_box), label);

            GtkWidget* count_lbl = gtk_label_new(std::to_string(p.colours.size()).c_str());
            gtk_widget_add_css_class(count_lbl, "dim-label");
            gtk_box_append(GTK_BOX(row_box), count_lbl);

            GtkWidget* delete_btn = gtk_button_new_from_icon_name("window-close-symbolic");
            gtk_button_set_has_frame(GTK_BUTTON(delete_btn), FALSE);
            gtk_widget_set_tooltip_text(delete_btn, "Delete Palette");

            std::string pal_id = p.id;
            connect_clicked(delete_btn, [state, pal_id, refresh_palettes_view, refresh_tokens_view, refresh_export_view](GtkButton* btn) {
                state->palettes.erase(
                    std::remove_if(state->palettes.begin(), state->palettes.end(),
                                   [pal_id](const Palette& x) { return x.id == pal_id; }),
                    state->palettes.end()
                );
                if (state->active_palette_id == pal_id) {
                    if (!state->palettes.empty()) {
                        state->active_palette_id = state->palettes.front().id;
                    } else {
                        state->active_palette_id.reset();
                    }
                }
                Store().save(*state);

                if (refresh_palettes_view && *refresh_palettes_view) (*refresh_palettes_view)();
                if (refresh_tokens_view && *refresh_tokens_view) (*refresh_tokens_view)();
                if (refresh_export_view && *refresh_export_view) (*refresh_export_view)();
            });
            gtk_box_append(GTK_BOX(row_box), delete_btn);

            GtkWidget* row = gtk_list_box_row_new();
            gtk_list_box_row_set_child(GTK_LIST_BOX_ROW(row), row_box);
            gtk_list_box_append(GTK_LIST_BOX(palette_list_box), row);

            if (active_id == p.id) {
                gtk_list_box_select_row(GTK_LIST_BOX(palette_list_box), GTK_LIST_BOX_ROW(row));
            }
        }

        // Draw Active Palette Swatches
        const Palette* active_pal = nullptr;
        for (const auto& p : state->palettes) {
            if (p.id == active_id) {
                active_pal = &p;
                break;
            }
        }

        if (active_pal) {
            gtk_stack_set_visible_child(GTK_STACK(content_stack), active_workspace);
            gtk_label_set_text(GTK_LABEL(lbl_active_name), active_pal->name.c_str());
            std::string colours_count_str = std::to_string(active_pal->colours.size()) + " colour" + (active_pal->colours.size() == 1 ? "" : "s");
            gtk_label_set_text(GTK_LABEL(lbl_active_colours), colours_count_str.c_str());

            // Clear colour cards list
            while ((child = gtk_widget_get_first_child(cards_list_box)) != NULL) {
                gtk_list_box_remove(GTK_LIST_BOX(cards_list_box), child);
            }

            for (const auto& col : active_pal->colours) {
                GtkWidget* row_container = gtk_box_new(GTK_ORIENTATION_VERTICAL, 0);

                GtkWidget* expander = adw_action_row_new();
                adw_preferences_row_set_title(ADW_PREFERENCES_ROW(expander), col.name.c_str());
                
                std::string hex_upper = col.hex;
                std::transform(hex_upper.begin(), hex_upper.end(), hex_upper.begin(), ::toupper);
                adw_action_row_set_subtitle(ADW_ACTION_ROW(expander), hex_upper.c_str());

                // Prefix color square
                GtkWidget* sq = gtk_frame_new(NULL);
                gtk_widget_add_css_class(sq, "color-preview-block");
                gtk_widget_set_size_request(sq, 28, 28);
                gtk_widget_set_valign(sq, GTK_ALIGN_CENTER);
                apply_widget_css(sq, ("* { background-color: " + col.hex + "; }").c_str());
                adw_action_row_add_prefix(ADW_ACTION_ROW(expander), sq);

                // Suffix contrast badge
                double ratio = contrast_ratio(col.hex, "#ffffff");
                std::string level = wcag_level(ratio);
                GtkWidget* badge = gtk_label_new(level.c_str());
                gtk_widget_set_valign(badge, GTK_ALIGN_CENTER);
                if (level == "AAA") {
                    gtk_widget_add_css_class(badge, "contrast-badge-aaa");
                } else if (level == "AA") {
                    gtk_widget_add_css_class(badge, "contrast-badge-aa");
                } else if (level == "AA Large") {
                    gtk_widget_add_css_class(badge, "contrast-badge-aal");
                } else {
                    gtk_widget_add_css_class(badge, "contrast-badge-fail");
                }
                adw_action_row_add_suffix(ADW_ACTION_ROW(expander), badge);

                // Delete color button
                GtkWidget* delete_col_btn = gtk_button_new_from_icon_name("user-trash-symbolic");
                gtk_button_set_has_frame(GTK_BUTTON(delete_col_btn), FALSE);
                gtk_widget_set_valign(delete_col_btn, GTK_ALIGN_CENTER);

                std::string palette_id = active_pal->id;
                std::string colour_id = col.id;
                connect_clicked(delete_col_btn, [state, palette_id, colour_id, refresh_palettes_view, refresh_tokens_view, refresh_export_view](GtkButton* btn) {
                    for (auto& pal : state->palettes) {
                        if (pal.id == palette_id) {
                            pal.colours.erase(
                                std::remove_if(pal.colours.begin(), pal.colours.end(),
                                               [colour_id](const Colour& c) { return c.id == colour_id; }),
                                pal.colours.end()
                            );
                            pal.updated_at = static_cast<uint64_t>(std::time(nullptr));
                            break;
                        }
                    }
                    Store().save(*state);

                    if (refresh_palettes_view && *refresh_palettes_view) (*refresh_palettes_view)();
                    if (refresh_tokens_view && *refresh_tokens_view) (*refresh_tokens_view)();
                    if (refresh_export_view && *refresh_export_view) (*refresh_export_view)();
                });
                adw_action_row_add_suffix(ADW_ACTION_ROW(expander), delete_col_btn);

                // Expander body (revealer content)
                GtkWidget* expander_box = gtk_box_new(GTK_ORIENTATION_VERTICAL, 8);
                set_margin_all(expander_box, 8);

                GtkWidget* contrast_header = gtk_box_new(GTK_ORIENTATION_HORIZONTAL, 8);
                GtkWidget* vs_lbl = gtk_label_new("vs");
                gtk_widget_add_css_class(vs_lbl, "dim-label");

                GtkWidget* bg_indicator = gtk_frame_new(NULL);
                gtk_widget_add_css_class(bg_indicator, "color-preview-block");
                gtk_widget_set_size_request(bg_indicator, 20, 20);
                gtk_widget_set_valign(bg_indicator, GTK_ALIGN_CENTER);
                apply_widget_css(bg_indicator, "* { background-color: #ffffff; }");

                GtkWidget* bg_prefix = gtk_label_new("#");
                gtk_widget_add_css_class(bg_prefix, "dim-label");

                GtkWidget* entry_bg = gtk_entry_new();
                gtk_editable_set_text(GTK_EDITABLE(entry_bg), "ffffff");
                gtk_editable_set_width_chars(GTK_EDITABLE(entry_bg), 8);
                gtk_widget_add_css_class(entry_bg, "mono-text");

                std::stringstream initial_ratio_ss;
                initial_ratio_ss << std::fixed << std::setprecision(2) << ratio << ":1";
                GtkWidget* lbl_contrast_ratio = gtk_label_new(initial_ratio_ss.str().c_str());
                gtk_widget_set_hexpand(lbl_contrast_ratio, TRUE);
                gtk_widget_set_halign(lbl_contrast_ratio, GTK_ALIGN_END);

                gtk_box_append(GTK_BOX(contrast_header), vs_lbl);
                gtk_box_append(GTK_BOX(contrast_header), bg_indicator);
                gtk_box_append(GTK_BOX(contrast_header), bg_prefix);
                gtk_box_append(GTK_BOX(contrast_header), entry_bg);
                gtk_box_append(GTK_BOX(contrast_header), lbl_contrast_ratio);
                gtk_box_append(GTK_BOX(expander_box), contrast_header);

                // Preview text GtkLabel
                GtkWidget* test_lbl = gtk_label_new("The quick brown fox");
                gtk_widget_add_css_class(test_lbl, "contrast-test-text");
                apply_widget_css(test_lbl, ("* { background-color: #ffffff; color: " + col.hex + "; }").c_str());
                gtk_box_append(GTK_BOX(expander_box), test_lbl);

                // Fix Box Swatch
                GtkWidget* fix_box = gtk_box_new(GTK_ORIENTATION_HORIZONTAL, 8);
                GtkWidget* fix_lbl = gtk_label_new("Suggested Fix");
                gtk_widget_add_css_class(fix_lbl, "dim-label");
                gtk_box_append(GTK_BOX(fix_box), fix_lbl);

                GtkWidget* fix_indicator = gtk_frame_new(NULL);
                gtk_widget_add_css_class(fix_indicator, "color-preview-block");
                gtk_widget_set_size_request(fix_indicator, 16, 16);
                gtk_widget_set_valign(fix_indicator, GTK_ALIGN_CENTER);
                gtk_box_append(GTK_BOX(fix_box), fix_indicator);

                GtkWidget* fix_hex_lbl = gtk_label_new(NULL);
                gtk_widget_add_css_class(fix_hex_lbl, "mono-text");
                gtk_box_append(GTK_BOX(fix_box), fix_hex_lbl);

                GtkWidget* btn_apply_fix = gtk_button_new_with_label("Apply");
                gtk_widget_set_halign(btn_apply_fix, GTK_ALIGN_END);
                gtk_widget_set_hexpand(btn_apply_fix, TRUE);
                gtk_widget_add_css_class(btn_apply_fix, "suggested-action");
                gtk_box_append(GTK_BOX(fix_box), btn_apply_fix);
                gtk_box_append(GTK_BOX(expander_box), fix_box);

                auto active_fix = std::make_shared<std::string>("");

                auto update_fix_ui = [col_hex = col.hex, bg_indicator, test_lbl, lbl_contrast_ratio,
                                      fix_box, fix_indicator, fix_hex_lbl, state, palette_id, colour_id, active_fix](const std::string& bg_text) {
                    std::string clean = bg_text;
                    if (!clean.empty() && clean[0] == '#') clean = clean.substr(1);
                    if (clean.length() == 6) {
                        std::string bg_hex = "#" + clean;
                        apply_widget_css(bg_indicator, ("* { background-color: " + bg_hex + "; }").c_str());
                        apply_widget_css(test_lbl, ("* { background-color: " + bg_hex + "; color: " + col_hex + "; }").c_str());

                        double r = contrast_ratio(col_hex, bg_hex);
                        std::stringstream ratio_ss;
                        ratio_ss << std::fixed << std::setprecision(2) << r << ":1";
                        gtk_label_set_text(GTK_LABEL(lbl_contrast_ratio), ratio_ss.str().c_str());

                        std::string level = wcag_level(r);
                        if (level == "Fail" || level == "AA Large") {
                            std::string fixed = suggest_fix(col_hex, bg_hex, 4.5);
                            if (fixed != col_hex) {
                                *active_fix = fixed;
                                gtk_widget_set_visible(fix_box, TRUE);
                                apply_widget_css(fix_indicator, ("* { background-color: " + fixed + "; }").c_str());
                                std::string fixed_upper = fixed;
                                std::transform(fixed_upper.begin(), fixed_upper.end(), fixed_upper.begin(), ::toupper);
                                gtk_label_set_text(GTK_LABEL(fix_hex_lbl), fixed_upper.c_str());
                                return;
                            }
                        }
                        *active_fix = "";
                        gtk_widget_set_visible(fix_box, FALSE);
                    }
                };

                // Connect apply click
                connect_clicked(btn_apply_fix, [state, palette_id, colour_id, active_fix,
                                                refresh_palettes_view, refresh_tokens_view, refresh_export_view](GtkButton* btn) {
                    std::string fixed_val = *active_fix;
                    if (!fixed_val.empty()) {
                        for (auto& pal : state->palettes) {
                            if (pal.id == palette_id) {
                                for (auto& c : pal.colours) {
                                    if (c.id == colour_id) {
                                        c.hex = fixed_val;
                                        c.rgb = hex_to_rgb(fixed_val);
                                        c.hsl = rgb_to_hsl(c.rgb.r, c.rgb.g, c.rgb.b);
                                        break;
                                    }
                                }
                                break;
                            }
                        }
                        Store().save(*state);

                        if (refresh_palettes_view && *refresh_palettes_view) (*refresh_palettes_view)();
                        if (refresh_tokens_view && *refresh_tokens_view) (*refresh_tokens_view)();
                        if (refresh_export_view && *refresh_export_view) (*refresh_export_view)();
                    }
                });

                // Connect changed
                connect_changed(entry_bg, [update_fix_ui](GtkEditable* edit) {
                    const char* text = gtk_editable_get_text(edit);
                    std::string text_str = text ? text : "";
                    update_fix_ui(text_str);
                });

                // Initial run
                update_fix_ui("ffffff");

                GtkWidget* revealer = gtk_revealer_new();
                gtk_revealer_set_transition_type(GTK_REVEALER(revealer), GTK_REVEALER_TRANSITION_TYPE_SLIDE_DOWN);
                gtk_revealer_set_transition_duration(GTK_REVEALER(revealer), 250);
                gtk_revealer_set_child(GTK_REVEALER(revealer), expander_box);

                void (*activated_callback)(AdwActionRow*, gpointer) = [](AdwActionRow* row, gpointer user_data) {
                    GtkRevealer* rev = GTK_REVEALER(user_data);
                    gboolean is_revealed = gtk_revealer_get_reveal_child(rev);
                    gtk_revealer_set_reveal_child(rev, !is_revealed);
                };
                g_signal_connect(expander, "activated", G_CALLBACK(activated_callback), revealer);

                GtkGesture* gesture = gtk_gesture_click_new();
                void (*released_callback)(GtkGestureClick*, int, double, double, gpointer) = [](GtkGestureClick* gesture, int n_press, double x, double y, gpointer user_data) {
                    GtkRevealer* rev = GTK_REVEALER(user_data);
                    gboolean is_revealed = gtk_revealer_get_reveal_child(rev);
                    gtk_revealer_set_reveal_child(rev, !is_revealed);
                };
                g_signal_connect(gesture, "released", G_CALLBACK(released_callback), revealer);
                gtk_widget_add_controller(expander, GTK_EVENT_CONTROLLER(gesture));

                gtk_box_append(GTK_BOX(row_container), expander);
                gtk_box_append(GTK_BOX(row_container), revealer);

                gtk_list_box_append(GTK_LIST_BOX(cards_list_box), row_container);
            }
        } else {
            gtk_stack_set_visible_child(GTK_STACK(content_stack), empty_status);
        }
    };

    // Sidebar: Connect Selection
    connect_row_selected(palette_list_box, [state, active_palette_id_ref, refresh_all](GtkListBox* lb, GtkListBoxRow* row) {
        if (row) {
            int idx = gtk_list_box_row_get_index(row);
            if (idx >= 0 && idx < static_cast<int>(state->palettes.size())) {
                std::string new_id = state->palettes[idx].id;
                *active_palette_id_ref = new_id;
                state->active_palette_id = new_id;
                Store().save(*state);
                refresh_all();
            }
        }
    });

    // Sidebar: Add Palette Connection
    auto add_pal_action = [state, entry_new_palette, refresh_palettes_view, refresh_tokens_view, refresh_export_view]() {
        GtkEntryBuffer* buffer = gtk_entry_get_buffer(GTK_ENTRY(entry_new_palette));
        const char* name_c = gtk_entry_buffer_get_text(buffer);
        std::string name = name_c ? name_c : "";
        
        auto trim = [](std::string& s) {
            s.erase(s.begin(), std::find_if(s.begin(), s.end(), [](unsigned char ch) {
                return !std::isspace(ch);
            }));
            s.erase(std::find_if(s.rbegin(), s.rend(), [](unsigned char ch) {
                return !std::isspace(ch);
            }).base(), s.end());
        };
        trim(name);

        if (!name.empty()) {
            std::string id = generate_uuid();
            uint64_t created = static_cast<uint64_t>(std::time(nullptr));
            state->palettes.push_back(Palette{id, name, {}, created, created});
            state->active_palette_id = id;
            Store().save(*state);

            gtk_entry_buffer_set_text(buffer, "", 0);

            if (refresh_palettes_view && *refresh_palettes_view) (*refresh_palettes_view)();
            if (refresh_tokens_view && *refresh_tokens_view) (*refresh_tokens_view)();
            if (refresh_export_view && *refresh_export_view) (*refresh_export_view)();
        }
    };

    connect_clicked(btn_add_palette, [add_pal_action](GtkButton* btn) { add_pal_action(); });
    connect_activate(entry_new_palette, [add_pal_action](GtkEntry* ent) { add_pal_action(); });

    // Add Colour Connection
    connect_clicked(btn_add_colour, [state, color_chooser, entry_col_name, active_palette_id_ref,
                                      refresh_palettes_view, refresh_tokens_view, refresh_export_view](GtkButton* btn) {
        std::string palette_id = *active_palette_id_ref;
        if (!palette_id.empty()) {
            GdkRGBA rgba;
            gtk_color_chooser_get_rgba(GTK_COLOR_CHOOSER(color_chooser), &rgba);
            uint8_t r = static_cast<uint8_t>(std::round(rgba.red * 255.0));
            uint8_t g = static_cast<uint8_t>(std::round(rgba.green * 255.0));
            uint8_t b = static_cast<uint8_t>(std::round(rgba.blue * 255.0));
            
            char hex_buf[16];
            snprintf(hex_buf, sizeof(hex_buf), "#%02x%02x%02x", r, g, b);
            std::string hex_val = hex_buf;

            GtkEntryBuffer* buffer = gtk_entry_get_buffer(GTK_ENTRY(entry_col_name));
            const char* name_c = gtk_entry_buffer_get_text(buffer);
            std::string name_val = name_c ? name_c : "";
            
            auto trim = [](std::string& s) {
                s.erase(s.begin(), std::find_if(s.begin(), s.end(), [](unsigned char ch) {
                    return !std::isspace(ch);
                }));
                s.erase(std::find_if(s.rbegin(), s.rend(), [](unsigned char ch) {
                    return !std::isspace(ch);
                }).base(), s.end());
            };
            trim(name_val);

            std::string col_name = name_val.empty() ? hex_val : name_val;
            if (name_val.empty()) {
                std::transform(col_name.begin(), col_name.end(), col_name.begin(), ::toupper);
            }

            for (auto& pal : state->palettes) {
                if (pal.id == palette_id) {
                    Colour c = hex_to_colour(hex_val, col_name);
                    pal.colours.push_back(c);
                    pal.updated_at = static_cast<uint64_t>(std::time(nullptr));
                    break;
                }
            }
            Store().save(*state);

            gtk_entry_buffer_set_text(buffer, "", 0);

            if (refresh_palettes_view && *refresh_palettes_view) (*refresh_palettes_view)();
            if (refresh_tokens_view && *refresh_tokens_view) (*refresh_tokens_view)();
            if (refresh_export_view && *refresh_export_view) (*refresh_export_view)();
        }
    });

    *refresh_palettes_view = refresh_all;

    return split_view;
}
