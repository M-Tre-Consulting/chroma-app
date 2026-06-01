use gtk4 as gtk;
use libadwaita as adw;
use adw::prelude::*;
use std::rc::Rc;
use std::cell::RefCell;

use crate::types::{AppState, TokenGroup, Token, TokenValue};
use crate::store::Store;
use crate::ui_helpers::{apply_widget_css, set_margin_all};

#[allow(deprecated)]
pub fn build_tokens_page(
    state: Rc<RefCell<AppState>>,
    refresh_tokens_view: Rc<RefCell<Option<Rc<dyn Fn()>>>>,
    refresh_export_view: Rc<RefCell<Option<Rc<dyn Fn()>>>>,
) -> gtk::Widget {
    let split_view = gtk::Paned::new(gtk::Orientation::Horizontal);
    split_view.set_position(240);

    // Sidebar: Groups list
    let sidebar_box = gtk::Box::new(gtk::Orientation::Vertical, 0);

    let sidebar_header = gtk::Label::new(Some("Token Groups"));
    sidebar_header.set_margin_top(18);
    sidebar_header.set_margin_bottom(6);
    sidebar_header.set_margin_start(16);
    sidebar_header.set_halign(gtk::Align::Start);
    sidebar_header.add_css_class("heading");
    sidebar_header.add_css_class("dim-label");
    sidebar_box.append(&sidebar_header);

    let scrolled_sidebar = gtk::ScrolledWindow::builder()
        .hscrollbar_policy(gtk::PolicyType::Never)
        .vscrollbar_policy(gtk::PolicyType::Automatic)
        .vexpand(true)
        .build();

    let group_list_box = gtk::ListBox::new();
    group_list_box.add_css_class("navigation-sidebar");
    scrolled_sidebar.set_child(Some(&group_list_box));
    sidebar_box.append(&scrolled_sidebar);

    // Footer: New Group Entry
    let sidebar_footer = gtk::Box::new(gtk::Orientation::Horizontal, 6);
    set_margin_all(&sidebar_footer, 8);
    let entry_new_group = gtk::Entry::builder()
        .placeholder_text("New group…")
        .hexpand(true)
        .build();
    let btn_add_group = gtk::Button::builder()
        .label("+")
        .build();
    sidebar_footer.append(&entry_new_group);
    sidebar_footer.append(&btn_add_group);
    sidebar_box.append(&sidebar_footer);

    split_view.set_start_child(Some(&sidebar_box));

    // Content: Active Group Tokens Workspace
    let content_stack = gtk::Stack::new();
    split_view.set_end_child(Some(&content_stack));

    // Empty state view
    let empty_status = adw::StatusPage::builder()
        .title("No Group Selected")
        .description("Create or select a group in the sidebar to start mapping tokens")
        .icon_name("view-list-symbolic")
        .build();
    content_stack.add_child(&empty_status);

    // Active group workspace
    let active_group_workspace = gtk::Box::new(gtk::Orientation::Vertical, 0);
    let active_header = gtk::Box::new(gtk::Orientation::Horizontal, 12);
    set_margin_all(&active_header, 12);

    let lbl_active_group_name = gtk::Label::builder()
        .halign(gtk::Align::Start)
        .build();
    lbl_active_group_name.add_css_class("title-bold");
    active_header.append(&lbl_active_group_name);

    let btn_delete_group = gtk::Button::builder()
        .label("Remove Group")
        .halign(gtk::Align::End)
        .hexpand(true)
        .build();
    btn_delete_group.add_css_class("destructive-action");
    active_header.append(&btn_delete_group);

    let separator = gtk::Separator::new(gtk::Orientation::Horizontal);
    active_group_workspace.append(&active_header);
    active_group_workspace.append(&separator);

    let scrolled_tokens = gtk::ScrolledWindow::builder()
        .hscrollbar_policy(gtk::PolicyType::Never)
        .vscrollbar_policy(gtk::PolicyType::Automatic)
        .vexpand(true)
        .build();
    let token_list_box = gtk::ListBox::new();
    token_list_box.set_selection_mode(gtk::SelectionMode::None);
    scrolled_tokens.set_child(Some(&token_list_box));
    active_group_workspace.append(&scrolled_tokens);

    // Footer: Add token row
    let active_footer = gtk::Box::new(gtk::Orientation::Horizontal, 8);
    set_margin_all(&active_footer, 12);
    let entry_new_token = gtk::Entry::builder()
        .placeholder_text("Token name…")
        .hexpand(true)
        .build();
    let btn_add_token = gtk::Button::builder()
        .label("Add Token")
        .build();
    btn_add_token.add_css_class("suggested-action");
    active_footer.append(&entry_new_token);
    active_footer.append(&btn_add_token);
    active_group_workspace.append(&active_footer);

    content_stack.add_child(&active_group_workspace);

    let active_group_id_ref = Rc::new(RefCell::new(None::<String>));

    // Reload UI trigger
    let refresh_all = {
        let state = state.clone();
        let group_list_box = group_list_box.clone();
        let content_stack = content_stack.clone();
        let active_group_id_ref = active_group_id_ref.clone();
        let lbl_active_group_name = lbl_active_group_name.clone();
        let token_list_box = token_list_box.clone();
        let refresh_tokens_inner = refresh_tokens_view.clone();
        let refresh_export_inner = refresh_export_view.clone();

        move || {
            let s = state.borrow();
            let mut active_id = active_group_id_ref.borrow().clone();
            if active_id.is_none() {
                if let Some(first_g) = s.token_groups.first() {
                    let first_id = first_g.id.clone();
                    active_id = Some(first_id.clone());
                    *active_group_id_ref.borrow_mut() = Some(first_id);
                }
            }

            // Clear Group List
            while let Some(child) = group_list_box.first_child() {
                group_list_box.remove(&child);
            }

            for g in &s.token_groups {
                let row_box = gtk::Box::new(gtk::Orientation::Horizontal, 8);
                row_box.set_margin_start(8);
                row_box.set_margin_end(8);
                row_box.set_margin_top(6);
                row_box.set_margin_bottom(6);

                let label = gtk::Label::new(Some(&g.name));
                label.set_ellipsize(gtk::pango::EllipsizeMode::End);
                label.set_hexpand(true);
                label.set_halign(gtk::Align::Start);
                if active_id.as_ref() == Some(&g.id) {
                    label.add_css_class("title-bold");
                }
                row_box.append(&label);

                let count_label = gtk::Label::new(Some(&g.tokens.len().to_string()));
                count_label.add_css_class("dim-label");
                row_box.append(&count_label);

                let row = gtk::ListBoxRow::new();
                row.set_child(Some(&row_box));
                group_list_box.append(&row);

                if active_id.as_ref() == Some(&g.id) {
                    group_list_box.select_row(Some(&row));
                }
            }

            // Active Workspace Content
            let active_group = s.token_groups.iter().find(|x| Some(&x.id) == active_id.as_ref());
            if let Some(g) = active_group {
                content_stack.set_visible_child(&active_group_workspace);
                lbl_active_group_name.set_text(&g.name);

                // Clear token list
                while let Some(child) = token_list_box.first_child() {
                    token_list_box.remove(&child);
                }

                for t in &g.tokens {
                    let token_row = adw::ActionRow::new();
                    token_row.set_title(&t.name);
                    token_row.add_css_class("mono-text");

                    // Map colour preview circle
                    let preview = gtk::Frame::new(None);
                    preview.add_css_class("color-preview-block");
                    preview.set_size_request(20, 20);
                    preview.set_valign(gtk::Align::Center);

                    // Find assigned color
                    let mut resolved_hex = "#dedede".to_string();
                    if !t.value.palette_id.is_empty() && !t.value.colour_id.is_empty() {
                        if let Some(pal) = s.palettes.iter().find(|p| p.id == t.value.palette_id) {
                            if let Some(col) = pal.colours.iter().find(|c| c.id == t.value.colour_id) {
                                resolved_hex = col.hex.clone();
                            }
                        }
                    }
                    apply_widget_css(&preview, &format!("* {{ background-color: {}; }}", resolved_hex));
                    token_row.add_prefix(&preview);

                    // ComboBox dropdown selector
                    let combobox = gtk::ComboBoxText::new();
                    combobox.set_valign(gtk::Align::Center);
                    combobox.append(Some("none"), "— none —");

                    let mut active_index = 0;
                    let mut current_idx = 1;

                    for p in &s.palettes {
                        for col in &p.colours {
                            let label = format!("{} : {}", p.name, col.name);
                            let key = format!("{}::{}", p.id, col.id);
                            combobox.append(Some(&key), &label);

                            if t.value.palette_id == p.id && t.value.colour_id == col.id {
                                active_index = current_idx;
                            }
                            current_idx += 1;
                        }
                    }
                    combobox.set_active(Some(active_index));

                    // Combo change listener
                    let state_inner = state.clone();
                    let group_id = g.id.clone();
                    let token_id = t.id.clone();
                    let refresh_tokens_nested = refresh_tokens_inner.clone();
                    let refresh_export_nested = refresh_export_inner.clone();
                    combobox.connect_changed(move |c| {
                        let active_key = c.active_id().unwrap_or_default().to_string();
                        {
                            let mut mut_s = state_inner.borrow_mut();
                            if let Some(grp) = mut_s.token_groups.iter_mut().find(|x| x.id == group_id) {
                                if let Some(tkn) = grp.tokens.iter_mut().find(|x| x.id == token_id) {
                                    if active_key == "none" || active_key.is_empty() {
                                        tkn.value = TokenValue { palette_id: String::new(), colour_id: String::new() };
                                    } else {
                                        let parts: Vec<&str> = active_key.split("::").collect();
                                        if parts.len() == 2 {
                                            tkn.value = TokenValue {
                                                palette_id: parts[0].to_string(),
                                                colour_id: parts[1].to_string(),
                                            };
                                        }
                                    }
                                }
                            }
                            Store::new().save(&mut_s);
                        }
                        if let Some(ref_t) = &*refresh_tokens_nested.borrow() { ref_t(); }
                        if let Some(ref_e) = &*refresh_export_nested.borrow() { ref_e(); }
                    });

                    token_row.add_suffix(&combobox);

                    // Delete Token Button
                    let delete_tkn_btn = gtk::Button::builder()
                        .icon_name("user-trash-symbolic")
                        .has_frame(false)
                        .valign(gtk::Align::Center)
                        .build();

                    let state_inner = state.clone();
                    let group_id = g.id.clone();
                    let token_id = t.id.clone();
                    let refresh_tokens_nested = refresh_tokens_inner.clone();
                    let refresh_export_nested = refresh_export_inner.clone();
                    delete_tkn_btn.connect_clicked(move |_| {
                        {
                            let mut mut_s = state_inner.borrow_mut();
                            if let Some(grp) = mut_s.token_groups.iter_mut().find(|x| x.id == group_id) {
                                grp.tokens.retain(|x| x.id != token_id);
                            }
                            Store::new().save(&mut_s);
                        }
                        if let Some(ref_t) = &*refresh_tokens_nested.borrow() { ref_t(); }
                        if let Some(ref_e) = &*refresh_export_nested.borrow() { ref_e(); }
                    });
                    token_row.add_suffix(&delete_tkn_btn);

                    token_list_box.append(&token_row);
                }
            } else {
                content_stack.set_visible_child(&empty_status);
            }
        }
    };

    // Sidebar: Connect selection trigger
    {
        let state = state.clone();
        let active_group_id_ref = active_group_id_ref.clone();
        let refresh = refresh_all.clone();
        group_list_box.connect_row_selected(move |_, row| {
            if let Some(r) = row {
                let idx = r.index();
                if idx >= 0 {
                    let s = state.borrow();
                    if let Some(g) = s.token_groups.get(idx as usize) {
                        *active_group_id_ref.borrow_mut() = Some(g.id.clone());
                    }
                }
            }
            refresh();
        });
    }

    // Sidebar: Add Group trigger
    {
        let state = state.clone();
        let entry = entry_new_group.clone();
        let refresh_tokens_inner = refresh_tokens_view.clone();
        let refresh_export_inner = refresh_export_view.clone();
        let active_group_id_ref = active_group_id_ref.clone();

        let add_grp_action = move || {
            let name = entry.text().to_string();
            if !name.trim().is_empty() {
                let id = uuid::Uuid::new_v4().to_string();
                {
                    let mut mut_s = state.borrow_mut();
                    let new_group = TokenGroup {
                        id: id.clone(),
                        name: name.trim().to_string(),
                        tokens: Vec::new(),
                    };
                    mut_s.token_groups.push(new_group);
                    *active_group_id_ref.borrow_mut() = Some(id);
                    Store::new().save(&mut_s);
                }
                entry.set_text("");
                if let Some(ref_t) = &*refresh_tokens_inner.borrow() { ref_t(); }
                if let Some(ref_e) = &*refresh_export_inner.borrow() { ref_e(); }
            }
        };

        let add_clone = add_grp_action.clone();
        btn_add_group.connect_clicked(move |_| add_clone());
        let add_clone = add_grp_action.clone();
        entry_new_group.connect_activate(move |_| add_clone());
    }

    // Header: Delete Group trigger
    {
        let state = state.clone();
        let active_group_id_ref = active_group_id_ref.clone();
        let refresh_tokens_inner = refresh_tokens_view.clone();
        let refresh_export_inner = refresh_export_view.clone();

        btn_delete_group.connect_clicked(move |_| {
            let active_id = active_group_id_ref.borrow().clone();
            if let Some(group_id) = active_id {
                {
                    let mut mut_s = state.borrow_mut();
                    mut_s.token_groups.retain(|x| x.id != group_id);
                    *active_group_id_ref.borrow_mut() = mut_s.token_groups.first().map(|x| x.id.clone());
                    Store::new().save(&mut_s);
                }
                if let Some(ref_t) = &*refresh_tokens_inner.borrow() { ref_t(); }
                if let Some(ref_e) = &*refresh_export_inner.borrow() { ref_e(); }
            }
        });
    }

    // Add Token trigger
    {
        let state = state.clone();
        let entry = entry_new_token.clone();
        let active_group_id_ref = active_group_id_ref.clone();
        let refresh_tokens_inner = refresh_tokens_view.clone();
        let refresh_export_inner = refresh_export_view.clone();

        let add_token_action = move || {
            let active_id = active_group_id_ref.borrow().clone();
            if let Some(group_id) = active_id {
                let name = entry.text().to_string();
                if !name.trim().is_empty() {
                    {
                        let mut mut_s = state.borrow_mut();
                        if let Some(grp) = mut_s.token_groups.iter_mut().find(|x| x.id == group_id) {
                            let new_token = Token {
                                id: uuid::Uuid::new_v4().to_string(),
                                name: name.trim().to_string(),
                                description: String::new(),
                                value: TokenValue { palette_id: String::new(), colour_id: String::new() },
                            };
                            grp.tokens.push(new_token);
                        }
                        Store::new().save(&mut_s);
                    }
                    entry.set_text("");
                    if let Some(ref_t) = &*refresh_tokens_inner.borrow() { ref_t(); }
                    if let Some(ref_e) = &*refresh_export_inner.borrow() { ref_e(); }
                }
            }
        };

        let add_clone = add_token_action.clone();
        btn_add_token.connect_clicked(move |_| add_clone());
        let add_clone = add_token_action.clone();
        entry_new_token.connect_activate(move |_| add_clone());
    }

    *refresh_tokens_view.borrow_mut() = Some(Rc::new(refresh_all));

    split_view.upcast::<gtk::Widget>()
}
