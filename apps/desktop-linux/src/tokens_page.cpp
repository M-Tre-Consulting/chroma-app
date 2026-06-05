/**
 * @file tokens_page.cpp
 * @brief Implementation of the UI structure, data binding, and callbacks for the semantic design tokens management page.
 */

#include "tokens_page.h"
#include "ui_helpers.h"
#include "store.h"
#include <adwaita.h>
#include <algorithm>
#include <cctype>

/**
 * @brief Constructs the tokens page UI layout.
 * 
 * Sets up a two-pane layout with a Sidebar on the left (showing Token Groups list 
 * and allowing group creation) and a Content Area on the right (showing active tokens in 
 * the selected group, color dropdown mappings, and token creation).
 */
GtkWidget* build_tokens_page(
    std::shared_ptr<AppState> state,
    std::shared_ptr<std::function<void()>> refresh_tokens_view,
    std::shared_ptr<std::function<void()>> refresh_export_view
) {
    GtkWidget* split_view = gtk_paned_new(GTK_ORIENTATION_HORIZONTAL);
    gtk_paned_set_position(GTK_PANED(split_view), 240);

    // Sidebar: Groups list
    GtkWidget* sidebar_box = gtk_box_new(GTK_ORIENTATION_VERTICAL, 0);
    gtk_widget_set_size_request(sidebar_box, 220, -1);

    GtkWidget* sidebar_header = gtk_label_new("Token Groups");
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

    GtkWidget* group_list_box = gtk_list_box_new();
    gtk_widget_add_css_class(group_list_box, "navigation-sidebar");
    gtk_scrolled_window_set_child(GTK_SCROLLED_WINDOW(scrolled_sidebar), group_list_box);
    gtk_box_append(GTK_BOX(sidebar_box), scrolled_sidebar);

    // Footer: New Group Entry
    GtkWidget* sidebar_footer = gtk_box_new(GTK_ORIENTATION_HORIZONTAL, 6);
    set_margin_all(sidebar_footer, 8);

    GtkWidget* entry_new_group = gtk_entry_new();
    gtk_entry_set_placeholder_text(GTK_ENTRY(entry_new_group), "New group…");
    gtk_widget_set_hexpand(entry_new_group, TRUE);

    GtkWidget* btn_add_group = gtk_button_new_with_label("+");

    gtk_box_append(GTK_BOX(sidebar_footer), entry_new_group);
    gtk_box_append(GTK_BOX(sidebar_footer), btn_add_group);
    gtk_box_append(GTK_BOX(sidebar_box), sidebar_footer);

    gtk_paned_set_start_child(GTK_PANED(split_view), sidebar_box);

    // Content: Active Group Tokens Workspace
    GtkWidget* content_stack = gtk_stack_new();
    gtk_paned_set_end_child(GTK_PANED(split_view), content_stack);

    // Empty state view
    GtkWidget* empty_status = adw_status_page_new();
    adw_status_page_set_title(ADW_STATUS_PAGE(empty_status), "No Group Selected");
    adw_status_page_set_description(ADW_STATUS_PAGE(empty_status), "Create or select a group in the sidebar to start mapping tokens");
    adw_status_page_set_icon_name(ADW_STATUS_PAGE(empty_status), "view-list-symbolic");
    gtk_stack_add_child(GTK_STACK(content_stack), empty_status);

    // Active group workspace
    GtkWidget* active_group_workspace = gtk_box_new(GTK_ORIENTATION_VERTICAL, 0);

    GtkWidget* active_header = gtk_box_new(GTK_ORIENTATION_HORIZONTAL, 12);
    set_margin_all(active_header, 12);

    GtkWidget* lbl_active_group_name = gtk_label_new(NULL);
    gtk_widget_set_halign(lbl_active_group_name, GTK_ALIGN_START);
    gtk_widget_add_css_class(lbl_active_group_name, "title-bold");
    gtk_box_append(GTK_BOX(active_header), lbl_active_group_name);

    GtkWidget* btn_delete_group = gtk_button_new_with_label("Remove Group");
    gtk_widget_set_halign(btn_delete_group, GTK_ALIGN_END);
    gtk_widget_set_hexpand(btn_delete_group, TRUE);
    gtk_widget_add_css_class(btn_delete_group, "destructive-action");
    gtk_box_append(GTK_BOX(active_header), btn_delete_group);

    GtkWidget* separator = gtk_separator_new(GTK_ORIENTATION_HORIZONTAL);
    gtk_box_append(GTK_BOX(active_group_workspace), active_header);
    gtk_box_append(GTK_BOX(active_group_workspace), separator);

    GtkWidget* scrolled_tokens = gtk_scrolled_window_new();
    gtk_scrolled_window_set_policy(GTK_SCROLLED_WINDOW(scrolled_tokens), GTK_POLICY_NEVER, GTK_POLICY_AUTOMATIC);
    gtk_widget_set_vexpand(scrolled_tokens, TRUE);

    GtkWidget* token_list_box = gtk_list_box_new();
    gtk_list_box_set_selection_mode(GTK_LIST_BOX(token_list_box), GTK_SELECTION_NONE);
    gtk_widget_add_css_class(token_list_box, "boxed-list");
    gtk_scrolled_window_set_child(GTK_SCROLLED_WINDOW(scrolled_tokens), token_list_box);
    gtk_box_append(GTK_BOX(active_group_workspace), scrolled_tokens);

    // Footer: Add token row
    GtkWidget* active_footer = gtk_box_new(GTK_ORIENTATION_HORIZONTAL, 8);
    set_margin_all(active_footer, 12);

    GtkWidget* entry_new_token = gtk_entry_new();
    gtk_entry_set_placeholder_text(GTK_ENTRY(entry_new_token), "Token name…");
    gtk_widget_set_hexpand(entry_new_token, TRUE);

    GtkWidget* btn_add_token = gtk_button_new_with_label("Add Token");
    gtk_widget_add_css_class(btn_add_token, "suggested-action");

    gtk_box_append(GTK_BOX(active_footer), entry_new_token);
    gtk_box_append(GTK_BOX(active_footer), btn_add_token);
    gtk_box_append(GTK_BOX(active_group_workspace), active_footer);

    gtk_stack_add_child(GTK_STACK(content_stack), active_group_workspace);

    auto active_group_id_ref = std::make_shared<std::string>("");
    auto is_updating = std::make_shared<bool>(false);

    /**
     * @brief Refreshes and redrafts the token list elements.
     * 
     * Rebuilds the sidebar of token groups, constructs action row selectors for 
     * mapping color swatches to individual tokens, and displays preview color circles.
     */
    auto refresh_all = [state, group_list_box, content_stack, active_group_id_ref,
                        lbl_active_group_name, token_list_box, active_group_workspace, empty_status,
                        refresh_tokens_view, refresh_export_view, is_updating]() {
        if (*is_updating) return;
        *is_updating = true;
        std::string active_id = *active_group_id_ref;
        if (active_id.empty()) {
            if (!state->token_groups.empty()) {
                active_id = state->token_groups.front().id;
                *active_group_id_ref = active_id;
            }
        }

        // Clear group list
        GtkWidget* child;
        while ((child = gtk_widget_get_first_child(group_list_box)) != NULL) {
            gtk_list_box_remove(GTK_LIST_BOX(group_list_box), child);
        }

        for (const auto& g : state->token_groups) {
            GtkWidget* row_box = gtk_box_new(GTK_ORIENTATION_HORIZONTAL, 8);
            gtk_widget_set_margin_start(row_box, 8);
            gtk_widget_set_margin_end(row_box, 8);
            gtk_widget_set_margin_top(row_box, 6);
            gtk_widget_set_margin_bottom(row_box, 6);

            GtkWidget* label = gtk_label_new(g.name.c_str());
            gtk_label_set_ellipsize(GTK_LABEL(label), PANGO_ELLIPSIZE_END);
            gtk_widget_set_hexpand(label, TRUE);
            gtk_widget_set_halign(label, GTK_ALIGN_START);
            if (active_id == g.id) {
                gtk_widget_add_css_class(label, "title-bold");
            }
            gtk_box_append(GTK_BOX(row_box), label);

            GtkWidget* count_label = gtk_label_new(std::to_string(g.tokens.size()).c_str());
            gtk_widget_add_css_class(count_label, "dim-label");
            gtk_box_append(GTK_BOX(row_box), count_label);

            GtkWidget* row = gtk_list_box_row_new();
            gtk_list_box_row_set_child(GTK_LIST_BOX_ROW(row), row_box);
            gtk_list_box_append(GTK_LIST_BOX(group_list_box), row);

            if (active_id == g.id) {
                gtk_list_box_select_row(GTK_LIST_BOX(group_list_box), GTK_LIST_BOX_ROW(row));
            }
        }

        // Active Workspace
        const TokenGroup* active_group = nullptr;
        for (const auto& g : state->token_groups) {
            if (g.id == active_id) {
                active_group = &g;
                break;
            }
        }

        if (active_group) {
            gtk_stack_set_visible_child(GTK_STACK(content_stack), active_group_workspace);
            gtk_label_set_text(GTK_LABEL(lbl_active_group_name), active_group->name.c_str());

            // Clear token list
            while ((child = gtk_widget_get_first_child(token_list_box)) != NULL) {
                gtk_list_box_remove(GTK_LIST_BOX(token_list_box), child);
            }

            for (const auto& t : active_group->tokens) {
                GtkWidget* token_row = adw_action_row_new();
                adw_preferences_row_set_title(ADW_PREFERENCES_ROW(token_row), t.name.c_str());
                gtk_widget_add_css_class(token_row, "mono-text");

                // Preview color block
                GtkWidget* preview = gtk_frame_new(NULL);
                gtk_widget_add_css_class(preview, "color-preview-block");
                gtk_widget_set_size_request(preview, 20, 20);
                gtk_widget_set_valign(preview, GTK_ALIGN_CENTER);

                std::string resolved_hex = "#dedede";
                if (!t.value.palette_id.empty() && !t.value.colour_id.empty()) {
                    for (const auto& p : state->palettes) {
                        if (p.id == t.value.palette_id) {
                            for (const auto& c : p.colours) {
                                if (c.id == t.value.colour_id) {
                                    resolved_hex = c.hex;
                                    break;
                                }
                            }
                            break;
                        }
                    }
                }
                std::string css = "* { background-color: " + resolved_hex + "; }";
                apply_widget_css(preview, css.c_str());
                adw_action_row_add_prefix(ADW_ACTION_ROW(token_row), preview);

                // ComboBox dropdown selector
                GtkWidget* combobox = gtk_combo_box_text_new();
                gtk_widget_set_valign(combobox, GTK_ALIGN_CENTER);
                gtk_combo_box_text_append(GTK_COMBO_BOX_TEXT(combobox), "none", "— none —");

                int active_index = 0;
                int current_idx = 1;

                for (const auto& p : state->palettes) {
                    for (const auto& col : p.colours) {
                        std::string label = p.name + " : " + col.name;
                        std::string key = p.id + "::" + col.id;
                        gtk_combo_box_text_append(GTK_COMBO_BOX_TEXT(combobox), key.c_str(), label.c_str());

                        if (t.value.palette_id == p.id && t.value.colour_id == col.id) {
                            active_index = current_idx;
                        }
                        current_idx++;
                    }
                }
                gtk_combo_box_set_active(GTK_COMBO_BOX(combobox), active_index);

                std::string group_id = active_group->id;
                std::string token_id = t.id;
                connect_combo_changed(combobox, [state, group_id, token_id, refresh_tokens_view, refresh_export_view](GtkComboBox* c) {
                    const char* active_key_c = gtk_combo_box_get_active_id(GTK_COMBO_BOX(c));
                    std::string active_key = active_key_c ? active_key_c : "";

                    for (auto& grp : state->token_groups) {
                        if (grp.id == group_id) {
                            for (auto& tkn : grp.tokens) {
                                if (tkn.id == token_id) {
                                    if (active_key == "none" || active_key.empty()) {
                                        tkn.value = TokenValue{"", ""};
                                    } else {
                                        size_t pos = active_key.find("::");
                                        if (pos != std::string::npos) {
                                            tkn.value.palette_id = active_key.substr(0, pos);
                                            tkn.value.colour_id = active_key.substr(pos + 2);
                                        }
                                    }
                                    break;
                                }
                            }
                            break;
                        }
                    }
                    Store().save(*state);

                    if (refresh_tokens_view && *refresh_tokens_view) (*refresh_tokens_view)();
                    if (refresh_export_view && *refresh_export_view) (*refresh_export_view)();
                });

                adw_action_row_add_suffix(ADW_ACTION_ROW(token_row), combobox);

                // Delete Token Button
                GtkWidget* delete_tkn_btn = gtk_button_new_from_icon_name("user-trash-symbolic");
                gtk_button_set_has_frame(GTK_BUTTON(delete_tkn_btn), FALSE);
                gtk_widget_set_valign(delete_tkn_btn, GTK_ALIGN_CENTER);

                connect_clicked(delete_tkn_btn, [state, group_id, token_id, refresh_tokens_view, refresh_export_view](GtkButton* btn) {
                    for (auto& grp : state->token_groups) {
                        if (grp.id == group_id) {
                            grp.tokens.erase(
                                std::remove_if(grp.tokens.begin(), grp.tokens.end(),
                                               [token_id](const Token& x) { return x.id == token_id; }),
                                grp.tokens.end()
                            );
                            break;
                        }
                    }
                    Store().save(*state);

                    if (refresh_tokens_view && *refresh_tokens_view) (*refresh_tokens_view)();
                    if (refresh_export_view && *refresh_export_view) (*refresh_export_view)();
                });

                adw_action_row_add_suffix(ADW_ACTION_ROW(token_row), delete_tkn_btn);

                gtk_list_box_append(GTK_LIST_BOX(token_list_box), token_row);
            }
        } else {
            gtk_stack_set_visible_child(GTK_STACK(content_stack), empty_status);
        }
        *is_updating = false;
    };

    // Sidebar: Connect Selection
    connect_row_selected(group_list_box, [state, active_group_id_ref, refresh_all, is_updating](GtkListBox* lb, GtkListBoxRow* row) {
        if (*is_updating) return;
        if (row) {
            int idx = gtk_list_box_row_get_index(row);
            if (idx >= 0 && idx < static_cast<int>(state->token_groups.size())) {
                *active_group_id_ref = state->token_groups[idx].id;
                refresh_all();
            }
        }
    });

    // Sidebar: Add Group
    auto add_grp_action = [state, entry_new_group, active_group_id_ref, refresh_tokens_view, refresh_export_view]() {
        GtkEntryBuffer* buffer = gtk_entry_get_buffer(GTK_ENTRY(entry_new_group));
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
            std::string new_id = generate_uuid();
            state->token_groups.push_back(TokenGroup{new_id, name, {}});
            *active_group_id_ref = new_id;
            Store().save(*state);

            gtk_entry_buffer_set_text(buffer, "", 0);

            if (refresh_tokens_view && *refresh_tokens_view) (*refresh_tokens_view)();
            if (refresh_export_view && *refresh_export_view) (*refresh_export_view)();
        }
    };

    connect_clicked(btn_add_group, [add_grp_action](GtkButton* btn) { add_grp_action(); });
    connect_activate(entry_new_group, [add_grp_action](GtkEntry* ent) { add_grp_action(); });

    // Header: Delete Group
    connect_clicked(btn_delete_group, [state, active_group_id_ref, refresh_tokens_view, refresh_export_view](GtkButton* btn) {
        std::string active_id = *active_group_id_ref;
        if (!active_id.empty()) {
            state->token_groups.erase(
                std::remove_if(state->token_groups.begin(), state->token_groups.end(),
                               [active_id](const TokenGroup& g) { return g.id == active_id; }),
                state->token_groups.end()
            );

            if (!state->token_groups.empty()) {
                *active_group_id_ref = state->token_groups.front().id;
            } else {
                *active_group_id_ref = "";
            }

            Store().save(*state);

            if (refresh_tokens_view && *refresh_tokens_view) (*refresh_tokens_view)();
            if (refresh_export_view && *refresh_export_view) (*refresh_export_view)();
        }
    });

    // Add Token
    auto add_token_action = [state, entry_new_token, active_group_id_ref, refresh_tokens_view, refresh_export_view]() {
        std::string active_id = *active_group_id_ref;
        if (!active_id.empty()) {
            GtkEntryBuffer* buffer = gtk_entry_get_buffer(GTK_ENTRY(entry_new_token));
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
                for (auto& grp : state->token_groups) {
                    if (grp.id == active_id) {
                        grp.tokens.push_back(Token{
                            generate_uuid(),
                            name,
                            "",
                            TokenValue{"", ""}
                        });
                        break;
                    }
                }
                Store().save(*state);

                gtk_entry_buffer_set_text(buffer, "", 0);

                if (refresh_tokens_view && *refresh_tokens_view) (*refresh_tokens_view)();
                if (refresh_export_view && *refresh_export_view) (*refresh_export_view)();
            }
        }
    };

    connect_clicked(btn_add_token, [add_token_action](GtkButton* btn) { add_token_action(); });
    connect_activate(entry_new_token, [add_token_action](GtkEntry* ent) { add_token_action(); });

    *refresh_tokens_view = refresh_all;

    return split_view;
}
