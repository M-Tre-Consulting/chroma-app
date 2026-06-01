use gtk4 as gtk;
use libadwaita as adw;
use gtk::gdk;
use gtk::glib;
use gtk::gio;
use adw::prelude::*;
use gtk::prelude::*;
use std::rc::Rc;
use std::cell::RefCell;
use std::time::SystemTime;

mod types;
mod colour_math;
mod store;
mod exporter;

use types::{AppState, Palette, Colour, TokenGroup, Token, TokenValue};
use colour_math::{
    hex_to_colour, hex_to_rgb, rgb_to_hsl, hsl_to_hex, contrast_ratio, wcag_level, suggest_fix
};
use store::Store;

fn main() {
    let app = adw::Application::builder()
        .application_id("com.chroma.app")
        .build();

    app.connect_activate(build_ui);
    app.run();
}

fn apply_widget_css(widget: &impl glib::object::IsA<gtk::Widget>, css: &str) {
    let provider = gtk::CssProvider::new();
    provider.load_from_data(css);
    widget.style_context().add_provider(&provider, gtk::STYLE_PROVIDER_PRIORITY_APPLICATION);
}

fn set_margin_all(widget: &impl glib::object::IsA<gtk::Widget>, margin: i32) {
    widget.set_margin_start(margin);
    widget.set_margin_end(margin);
    widget.set_margin_top(margin);
    widget.set_margin_bottom(margin);
}

fn build_ui(app: &adw::Application) {
    let store = Store::new();
    let state = Rc::new(RefCell::new(store.load()));

    // Custom global styling
    let provider = gtk::CssProvider::new();
    provider.load_from_data(r#"
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
    "#);
    gtk::style_context_add_provider_for_display(
        &gdk::Display::default().unwrap(),
        &provider,
        gtk::STYLE_PROVIDER_PRIORITY_APPLICATION,
    );

    let window = adw::ApplicationWindow::builder()
        .application(app)
        .title("Chroma")
        .default_width(900)
        .default_height(600)
        .build();

    let main_layout = gtk::Box::new(gtk::Orientation::Vertical, 0);
    let header_bar = adw::HeaderBar::new();
    main_layout.append(&header_bar);

    let view_stack = adw::ViewStack::new();
    view_stack.set_vexpand(true);
    main_layout.append(&view_stack);

    let view_switcher = adw::ViewSwitcher::new();
    view_switcher.set_stack(Some(&view_stack));
    header_bar.set_title_widget(Some(&view_switcher));

    // Shared visual refresh helpers
    let refresh_palettes_view = Rc::new(RefCell::new(None::<Rc<dyn Fn()>>));
    let refresh_tokens_view = Rc::new(RefCell::new(None::<Rc<dyn Fn()>>));
    let refresh_export_view = Rc::new(RefCell::new(None::<Rc<dyn Fn()>>));

    // Build the three main views
    let palettes_page = build_palettes_page(
        state.clone(),
        refresh_palettes_view.clone(),
        refresh_tokens_view.clone(),
        refresh_export_view.clone(),
    );
    let tokens_page = build_tokens_page(
        state.clone(),
        refresh_tokens_view.clone(),
        refresh_export_view.clone(),
    );
    let export_page = build_export_page(
        state.clone(),
        refresh_export_view.clone(),
    );

    // Add pages to ViewStack
    let stack_page_palettes = view_stack.add_titled(&palettes_page, Some("palettes"), "Palettes");
    stack_page_palettes.set_icon_name(Some("applications-graphics-symbolic"));

    let stack_page_tokens = view_stack.add_titled(&tokens_page, Some("tokens"), "Tokens");
    stack_page_tokens.set_icon_name(Some("view-list-symbolic"));

    let stack_page_export = view_stack.add_titled(&export_page, Some("export"), "Export");
    stack_page_export.set_icon_name(Some("document-save-symbolic"));

    window.set_content(Some(&main_layout));
    window.present();

    let initial_refresh = refresh_palettes_view.borrow().clone();
    if let Some(f) = initial_refresh {
        f();
    }
}

// =========================================================================
// VIEW 1: PALETTES PAGE
// =========================================================================
fn build_palettes_page(
    state: Rc<RefCell<AppState>>,
    refresh_palettes_view: Rc<RefCell<Option<Rc<dyn Fn()>>>>,
    refresh_tokens_view: Rc<RefCell<Option<Rc<dyn Fn()>>>>,
    refresh_export_view: Rc<RefCell<Option<Rc<dyn Fn()>>>>,
) -> gtk::Widget {
    let split_view = gtk::Paned::new(gtk::Orientation::Horizontal);
    split_view.set_position(240);

    // Sidebar: Palettes list
    let sidebar_box = gtk::Box::new(gtk::Orientation::Vertical, 0);
    sidebar_box.set_width_request(220);

    let sidebar_header = gtk::Label::new(Some("My Palettes"));
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

    let palette_list_box = gtk::ListBox::new();
    palette_list_box.add_css_class("navigation-sidebar");
    scrolled_sidebar.set_child(Some(&palette_list_box));
    sidebar_box.append(&scrolled_sidebar);

    // New Palette footer in sidebar
    let sidebar_footer = gtk::Box::new(gtk::Orientation::Horizontal, 6);
    set_margin_all(&sidebar_footer, 8);
    let entry_new_palette = gtk::Entry::builder()
        .placeholder_text("New palette…")
        .hexpand(true)
        .build();
    let btn_add_palette = gtk::Button::builder()
        .label("+")
        .build();
    sidebar_footer.append(&entry_new_palette);
    sidebar_footer.append(&btn_add_palette);
    sidebar_box.append(&sidebar_footer);

    split_view.set_start_child(Some(&sidebar_box));

    // Content: Active Palette Workspace
    let content_stack = gtk::Stack::new();
    split_view.set_end_child(Some(&content_stack));

    // Empty state view
    let empty_status = adw::StatusPage::builder()
        .title("No Palette Selected")
        .description("Create or select a palette in the sidebar to get started")
        .icon_name("applications-graphics-symbolic")
        .build();
    content_stack.add_child(&empty_status);

    // Active workspace view
    let active_workspace = gtk::Box::new(gtk::Orientation::Vertical, 0);
    let active_header = gtk::Box::new(gtk::Orientation::Vertical, 4);
    set_margin_all(&active_header, 12);
    let lbl_active_name = gtk::Label::builder()
        .halign(gtk::Align::Start)
        .build();
    lbl_active_name.add_css_class("title-bold");
    let lbl_active_colours = gtk::Label::builder()
        .halign(gtk::Align::Start)
        .build();
    lbl_active_colours.add_css_class("dim-label");
    active_header.append(&lbl_active_name);
    active_header.append(&lbl_active_colours);

    let separator = gtk::Separator::new(gtk::Orientation::Horizontal);
    active_workspace.append(&active_header);
    active_workspace.append(&separator);

    let workspace_body = gtk::Box::new(gtk::Orientation::Horizontal, 0);
    workspace_body.set_vexpand(true);
    active_workspace.append(&workspace_body);
    content_stack.add_child(&active_workspace);

    // 1. LEFT PANEL: COLOR PICKER
    let picker_panel = gtk::Box::new(gtk::Orientation::Vertical, 12);
    set_margin_all(&picker_panel, 12);
    picker_panel.set_width_request(240);
    apply_widget_css(&picker_panel, ".picker-panel { border-right: 1px solid rgba(0,0,0,0.1); }");
    picker_panel.add_css_class("picker-panel");

    let color_chooser = gtk::ColorChooserWidget::new();
    color_chooser.set_use_alpha(false);
    color_chooser.set_size_request(240, 240);
    picker_panel.append(&color_chooser);

    let entry_col_name = gtk::Entry::builder()
        .placeholder_text("Name (optional)")
        .build();
    picker_panel.append(&entry_col_name);

    let btn_add_colour = gtk::Button::builder()
        .label("Add Colour")
        .build();
    btn_add_colour.add_css_class("suggested-action");
    picker_panel.append(&btn_add_colour);

    workspace_body.append(&picker_panel);

    // 2. RIGHT PANEL: COLOR CARDS LIST
    let cards_panel = gtk::Box::new(gtk::Orientation::Vertical, 8);
    set_margin_all(&cards_panel, 12);
    cards_panel.set_hexpand(true);

    let scrolled_cards = gtk::ScrolledWindow::builder()
        .hscrollbar_policy(gtk::PolicyType::Never)
        .vscrollbar_policy(gtk::PolicyType::Automatic)
        .vexpand(true)
        .build();
    let cards_list_box = gtk::ListBox::new();
    cards_list_box.set_selection_mode(gtk::SelectionMode::None);
    scrolled_cards.set_child(Some(&cards_list_box));
    cards_panel.append(&scrolled_cards);

    workspace_body.append(&cards_panel);

    // Inter-panel State & Redraw
    let active_palette_id_ref = Rc::new(RefCell::new(None::<String>));


    // Unified reload logic
    let refresh_all = {
        let state = state.clone();
        let palette_list_box = palette_list_box.clone();
        let content_stack = content_stack.clone();
        let active_palette_id_ref = active_palette_id_ref.clone();
        let lbl_active_name = lbl_active_name.clone();
        let lbl_active_colours = lbl_active_colours.clone();
        let cards_list_box = cards_list_box.clone();
        let refresh_palettes = refresh_palettes_view.clone();
        let refresh_tokens = refresh_tokens_view.clone();
        let refresh_export = refresh_export_view.clone();

        move || {
            let s = state.borrow();
            let active_id = s.active_palette_id.clone();
            *active_palette_id_ref.borrow_mut() = active_id.clone();

            // Clear palette sidebar list
            while let Some(child) = palette_list_box.first_child() {
                palette_list_box.remove(&child);
            }

            for p in &s.palettes {
                let row_box = gtk::Box::new(gtk::Orientation::Horizontal, 8);
                row_box.set_margin_start(8);
                row_box.set_margin_end(8);
                row_box.set_margin_top(6);
                row_box.set_margin_bottom(6);

                let dot = gtk::Frame::new(None);
                dot.add_css_class("color-dot");
                dot.set_size_request(10, 10);
                dot.set_valign(gtk::Align::Center);
                if let Some(first_colour) = p.colours.first() {
                    apply_widget_css(&dot, &format!("* {{ background-color: {}; }}", first_colour.hex));
                } else {
                    apply_widget_css(&dot, "* { background-color: #888888; }");
                }
                row_box.append(&dot);

                let label = gtk::Label::new(Some(&p.name));
                label.set_ellipsize(gtk::pango::EllipsizeMode::End);
                label.set_hexpand(true);
                label.set_halign(gtk::Align::Start);
                if active_id.as_ref() == Some(&p.id) {
                    label.add_css_class("title-bold");
                }
                row_box.append(&label);

                let count_label = gtk::Label::new(Some(&p.colours.len().to_string()));
                count_label.add_css_class("dim-label");
                row_box.append(&count_label);

                let delete_btn = gtk::Button::builder()
                    .icon_name("window-close-symbolic")
                    .has_frame(false)
                    .tooltip_text("Delete Palette")
                    .build();

                let state_inner = state.clone();
                let palette_id = p.id.clone();
                let refresh_tokens_inner = refresh_tokens.clone();
                let refresh_export_inner = refresh_export.clone();
                let refresh_palettes_inner = refresh_palettes.clone();
                delete_btn.connect_clicked(move |_| {
                    {
                        let mut mut_s = state_inner.borrow_mut();
                        mut_s.palettes.retain(|x| x.id != palette_id);
                        if mut_s.active_palette_id.as_ref() == Some(&palette_id) {
                            mut_s.active_palette_id = mut_s.palettes.first().map(|x| x.id.clone());
                        }
                        Store::new().save(&mut_s);
                    }
                    if let Some(ref_p) = &*refresh_palettes_inner.borrow() { ref_p(); }
                    if let Some(ref_t) = &*refresh_tokens_inner.borrow() { ref_t(); }
                    if let Some(ref_e) = &*refresh_export_inner.borrow() { ref_e(); }
                });

                row_box.append(&delete_btn);

                let row = gtk::ListBoxRow::new();
                row.set_child(Some(&row_box));
                palette_list_box.append(&row);
            }

            // Sync selections in sidebar list box
            if let Some(ref_active_id) = &active_id {
                if let Some(idx) = s.palettes.iter().position(|x| x.id == *ref_active_id) {
                    if let Some(row) = palette_list_box.row_at_index(idx as i32) {
                        palette_list_box.select_row(Some(&row));
                    }
                }
            }

            // Draw active palette workspace
            let active_pal_opt = s.palettes.iter().find(|x| Some(&x.id) == active_id.as_ref());
            if let Some(p) = active_pal_opt {
                content_stack.set_visible_child(&active_workspace);
                lbl_active_name.set_text(&p.name);
                lbl_active_colours.set_text(&format!("{} colour{}", p.colours.len(), if p.colours.len() == 1 { "" } else { "s" }));

                // Clear colour list cards
                while let Some(child) = cards_list_box.first_child() {
                    cards_list_box.remove(&child);
                }

                for col in &p.colours {
                    let row_container = gtk::Box::new(gtk::Orientation::Vertical, 0);

                    let expander = adw::ActionRow::new();
                    expander.set_title(&col.name);
                    expander.set_subtitle(&col.hex.to_uppercase());

                    // Prefix colour square
                    let sq = gtk::Frame::new(None);
                    sq.add_css_class("color-preview-block");
                    sq.set_size_request(28, 28);
                    sq.set_valign(gtk::Align::Center);
                    apply_widget_css(&sq, &format!("* {{ background-color: {}; }}", col.hex));
                    expander.add_prefix(&sq);

                    // Suffix: contrast badge + delete btn
                    let ratio = contrast_ratio(&col.hex, "#ffffff");
                    let level = wcag_level(ratio);
                    let badge = gtk::Label::new(Some(level));
                    badge.set_valign(gtk::Align::Center);
                    match level {
                        "AAA" => badge.add_css_class("contrast-badge-aaa"),
                        "AA" => badge.add_css_class("contrast-badge-aa"),
                        "AA Large" => badge.add_css_class("contrast-badge-aal"),
                        _ => badge.add_css_class("contrast-badge-fail"),
                    }
                    expander.add_suffix(&badge);

                    let delete_col_btn = gtk::Button::builder()
                        .icon_name("user-trash-symbolic")
                        .has_frame(false)
                        .valign(gtk::Align::Center)
                        .build();

                    let state_inner = state.clone();
                    let palette_id = p.id.clone();
                    let colour_id = col.id.clone();
                    let refresh_tokens_inner = refresh_tokens.clone();
                    let refresh_export_inner = refresh_export.clone();
                    let refresh_palettes_inner = refresh_palettes.clone();
                    delete_col_btn.connect_clicked(move |_| {
                        {
                            let mut mut_s = state_inner.borrow_mut();
                            if let Some(pal) = mut_s.palettes.iter_mut().find(|x| x.id == palette_id) {
                                pal.colours.retain(|x| x.id != colour_id);
                                pal.updated_at = SystemTime::now()
                                    .duration_since(SystemTime::UNIX_EPOCH)
                                    .unwrap_or_default()
                                    .as_secs();
                            }
                            Store::new().save(&mut_s);
                        }
                        if let Some(ref_p) = &*refresh_palettes_inner.borrow() { ref_p(); }
                        if let Some(ref_t) = &*refresh_tokens_inner.borrow() { ref_t(); }
                        if let Some(ref_e) = &*refresh_export_inner.borrow() { ref_e(); }
                    });
                    expander.add_suffix(&delete_col_btn);

                    // Inside expander row: Contrast checking workspace
                    let expander_box = gtk::Box::new(gtk::Orientation::Vertical, 8);
                    set_margin_all(&expander_box, 8);

                    let contrast_header = gtk::Box::new(gtk::Orientation::Horizontal, 8);
                    let vs_lbl = gtk::Label::new(Some("vs"));
                    vs_lbl.add_css_class("dim-label");

                    let bg_indicator = gtk::Frame::new(None);
                    bg_indicator.add_css_class("color-preview-block");
                    bg_indicator.set_size_request(20, 20);
                    bg_indicator.set_valign(gtk::Align::Center);
                    apply_widget_css(&bg_indicator, "* { background-color: #ffffff; }");

                    let bg_prefix = gtk::Label::new(Some("#"));
                    bg_prefix.add_css_class("dim-label");

                    let entry_bg = gtk::Entry::builder()
                        .text("ffffff")
                        .width_chars(8)
                        .build();
                    entry_bg.add_css_class("mono-text");

                    let lbl_contrast_ratio = gtk::Label::new(Some(&format!("{}:1", ratio)));
                    lbl_contrast_ratio.set_hexpand(true);
                    lbl_contrast_ratio.set_halign(gtk::Align::End);

                    contrast_header.append(&vs_lbl);
                    contrast_header.append(&bg_indicator);
                    contrast_header.append(&bg_prefix);
                    contrast_header.append(&entry_bg);
                    contrast_header.append(&lbl_contrast_ratio);
                    expander_box.append(&contrast_header);

                    // Text preview box
                    let test_frame = gtk::Frame::new(None);
                    let test_lbl = gtk::Label::new(Some("The quick brown fox"));
                    test_lbl.add_css_class("contrast-test-text");
                    apply_widget_css(&test_lbl, &format!("* {{ background-color: #ffffff; color: {}; }}", col.hex));
                    test_frame.set_child(Some(&test_lbl));
                    expander_box.append(&test_frame);

                    // Suggested Fix row
                    let fix_box = gtk::Box::new(gtk::Orientation::Horizontal, 8);
                    let fix_lbl = gtk::Label::new(Some("Suggested Fix"));
                    fix_lbl.add_css_class("dim-label");
                    fix_box.append(&fix_lbl);

                    let fix_indicator = gtk::Frame::new(None);
                    fix_indicator.add_css_class("color-preview-block");
                    fix_indicator.set_size_request(16, 16);
                    fix_indicator.set_valign(gtk::Align::Center);
                    fix_box.append(&fix_indicator);

                    let fix_hex_lbl = gtk::Label::new(None);
                    fix_hex_lbl.add_css_class("mono-text");
                    fix_box.append(&fix_hex_lbl);

                    let btn_apply_fix = gtk::Button::builder()
                        .label("Apply")
                        .halign(gtk::Align::End)
                        .hexpand(true)
                        .build();
                    btn_apply_fix.add_css_class("suggested-action");
                    fix_box.append(&btn_apply_fix);
                    expander_box.append(&fix_box);

                    let update_fix_ui = {
                        let col_hex = col.hex.clone();
                        let bg_indicator = bg_indicator.clone();
                        let test_lbl = test_lbl.clone();
                        let lbl_contrast_ratio = lbl_contrast_ratio.clone();
                        let fix_box = fix_box.clone();
                        let fix_indicator = fix_indicator.clone();
                        let fix_hex_lbl = fix_hex_lbl.clone();
                        let btn_apply_fix = btn_apply_fix.clone();
                        let state_inner = state.clone();
                        let palette_id = p.id.clone();
                        let colour_id = col.id.clone();
                        let refresh_tokens_inner = refresh_tokens.clone();
                        let refresh_export_inner = refresh_export.clone();
                        let refresh_palettes_inner = refresh_palettes.clone();

                        move |bg_text: &str| {
                            let clean = bg_text.trim_start_matches('#');
                            if clean.len() == 6 {
                                let bg_hex = format!("#{}", clean);
                                apply_widget_css(&bg_indicator, &format!("* {{ background-color: {}; }}", bg_hex));
                                apply_widget_css(&test_lbl, &format!("* {{ background-color: {}; color: {}; }}", bg_hex, col_hex));

                                let r = contrast_ratio(&col_hex, &bg_hex);
                                lbl_contrast_ratio.set_text(&format!("{}:1", r));

                                let level = wcag_level(r);
                                if level == "Fail" || level == "AA Large" {
                                    let fixed = suggest_fix(&col_hex, &bg_hex, 4.5);
                                    if fixed != col_hex {
                                        fix_box.set_visible(true);
                                        apply_widget_css(&fix_indicator, &format!("* {{ background-color: {}; }}", fixed));
                                        fix_hex_lbl.set_text(&fixed.to_uppercase());

                                        // Apply fix connection
                                        let fixed_clone = fixed.clone();
                                        let state_in = state_inner.clone();
                                        let pal_id = palette_id.clone();
                                        let col_id = colour_id.clone();
                                        let ref_p = refresh_palettes_inner.clone();
                                        let ref_t = refresh_tokens_inner.clone();
                                        let ref_e = refresh_export_inner.clone();
                                        btn_apply_fix.connect_clicked(move |_| {
                                            {
                                                let mut mut_s = state_in.borrow_mut();
                                                if let Some(pal) = mut_s.palettes.iter_mut().find(|x| x.id == pal_id) {
                                                    if let Some(c) = pal.colours.iter_mut().find(|x| x.id == col_id) {
                                                        c.hex = fixed_clone.clone();
                                                        let rgb = hex_to_rgb(&fixed_clone);
                                                        c.rgb = rgb.clone();
                                                        c.hsl = rgb_to_hsl(rgb.r, rgb.g, rgb.b);
                                                    }
                                                }
                                                Store::new().save(&mut_s);
                                            }
                                            if let Some(ref_p_fn) = &*ref_p.borrow() { ref_p_fn(); }
                                            if let Some(ref_t_fn) = &*ref_t.borrow() { ref_t_fn(); }
                                            if let Some(ref_e_fn) = &*ref_e.borrow() { ref_e_fn(); }
                                        });
                                        return;
                                    }
                                }
                                fix_box.set_visible(false);
                            }
                        }
                    };

                    // Bg Entry Connection
                    {
                        let update = update_fix_ui.clone();
                        entry_bg.connect_changed(move |e| update(&e.text()));
                    }

                    // Initial run
                    update_fix_ui("ffffff");

                    let revealer = gtk::Revealer::new();
                    revealer.set_transition_type(gtk::RevealerTransitionType::SlideDown);
                    revealer.set_transition_duration(250);

                    let rev_clone = revealer.clone();
                    expander.connect_activated(move |_| {
                        let is_rev = rev_clone.reveals_child();
                        rev_clone.set_reveal_child(!is_rev);
                    });
                    expander.set_activatable(true);

                    revealer.set_child(Some(&expander_box));

                    row_container.append(&expander);
                    row_container.append(&revealer);

                    cards_list_box.append(&row_container);
                }
            } else {
                content_stack.set_visible_child(&empty_status);
            }
        }
    };

    // Sidebar: Connect row selection
    {
        let state = state.clone();
        let refresh = refresh_all.clone();
        palette_list_box.connect_row_selected(move |_, row| {
            if let Some(r) = row {
                let idx = r.index();
                if idx >= 0 {
                    if let Ok(mut s) = state.try_borrow_mut() {
                        if let Some(p) = s.palettes.get(idx as usize) {
                            s.active_palette_id = Some(p.id.clone());
                            Store::new().save(&s);
                        }
                        drop(s);
                        refresh();
                    }
                }
            }
        });
    }

    // Sidebar: Add Palette Connection
    {
        let state = state.clone();
        let entry = entry_new_palette.clone();
        let refresh_palettes_inner = refresh_palettes_view.clone();
        let refresh_tokens_inner = refresh_tokens_view.clone();
        let refresh_export_inner = refresh_export_view.clone();

        let add_pal_action = move || {
            let name = entry.text().to_string();
            if !name.trim().is_empty() {
                {
                    let mut mut_s = state.borrow_mut();
                    let id = uuid::Uuid::new_v4().to_string();
                    let created = SystemTime::now()
                        .duration_since(SystemTime::UNIX_EPOCH)
                        .unwrap_or_default()
                        .as_secs();
                    let new_palette = Palette {
                        id: id.clone(),
                        name: name.trim().to_string(),
                        colours: Vec::new(),
                        created_at: created,
                        updated_at: created,
                    };
                    mut_s.palettes.push(new_palette);
                    mut_s.active_palette_id = Some(id);
                    Store::new().save(&mut_s);
                }
                entry.set_text("");
                if let Some(ref_p) = &*refresh_palettes_inner.borrow() { ref_p(); }
                if let Some(ref_t) = &*refresh_tokens_inner.borrow() { ref_t(); }
                if let Some(ref_e) = &*refresh_export_inner.borrow() { ref_e(); }
            }
        };

        let add_clone = add_pal_action.clone();
        btn_add_palette.connect_clicked(move |_| add_clone());
        let add_clone = add_pal_action.clone();
        entry_new_palette.connect_activate(move |_| add_clone());
    }

    // Add Colour Connection
    {
        let state = state.clone();
        let color_chooser = color_chooser.clone();
        let entry_name = entry_col_name.clone();
        let active_palette_id_ref = active_palette_id_ref.clone();
        let refresh_palettes_inner = refresh_palettes_view.clone();
        let refresh_tokens_inner = refresh_tokens_view.clone();
        let refresh_export_inner = refresh_export_view.clone();

        btn_add_colour.connect_clicked(move |_| {
            let active_id = active_palette_id_ref.borrow().clone();
            if let Some(palette_id) = active_id {
                let rgba = color_chooser.rgba();
                let r = (rgba.red() * 255.0).round() as u8;
                let g = (rgba.green() * 255.0).round() as u8;
                let b = (rgba.blue() * 255.0).round() as u8;
                let hex_val = format!("#{:02x}{:02x}{:02x}", r, g, b);

                let name_val = entry_name.text().to_string();
                let col_name = if name_val.trim().is_empty() {
                    hex_val.to_uppercase()
                } else {
                    name_val.trim().to_string()
                };

                {
                    let mut mut_s = state.borrow_mut();
                    if let Some(pal) = mut_s.palettes.iter_mut().find(|x| x.id == palette_id) {
                        let c = hex_to_colour(&hex_val, &col_name);
                        pal.colours.push(c);
                        pal.updated_at = SystemTime::now()
                            .duration_since(SystemTime::UNIX_EPOCH)
                            .unwrap_or_default()
                            .as_secs();
                    }
                    Store::new().save(&mut_s);
                }

                entry_name.set_text("");
                if let Some(ref_p) = &*refresh_palettes_inner.borrow() { ref_p(); }
                if let Some(ref_t) = &*refresh_tokens_inner.borrow() { ref_t(); }
                if let Some(ref_e) = &*refresh_export_inner.borrow() { ref_e(); }
            }
        });
    }

    *refresh_palettes_view.borrow_mut() = Some(Rc::new(refresh_all));

    split_view.upcast::<gtk::Widget>()
}

// =========================================================================
// VIEW 2: TOKENS PAGE
// =========================================================================
fn build_tokens_page(
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
            let active_id = active_group_id_ref.borrow().clone();

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
            }

            // Sync selections
            if let Some(ref_g_id) = &active_id {
                if let Some(idx) = s.token_groups.iter().position(|x| x.id == *ref_g_id) {
                    if let Some(row) = group_list_box.row_at_index(idx as i32) {
                        group_list_box.select_row(Some(&row));
                    }
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

// =========================================================================
// VIEW 3: EXPORT PAGE
// =========================================================================
fn build_export_page(
    state: Rc<RefCell<AppState>>,
    refresh_export_view: Rc<RefCell<Option<Rc<dyn Fn()>>>>,
) -> gtk::Widget {
    let main_box = gtk::Box::new(gtk::Orientation::Vertical, 12);
    set_margin_all(&main_box, 12);

    // Header Format Selector
    let format_header = gtk::Box::new(gtk::Orientation::Horizontal, 8);
    format_header.set_halign(gtk::Align::Center);
    main_box.append(&format_header);

    let current_format = Rc::new(RefCell::new("css".to_string()));

    let text_view = gtk::TextView::builder()
        .monospace(true)
        .editable(false)
        .cursor_visible(false)
        .wrap_mode(gtk::WrapMode::WordChar)
        .build();
    text_view.add_css_class("mono-text");
    apply_widget_css(&text_view, "* { padding: 12px; background-color: @theme_bg_color; border-radius: 8px; border: 1px solid rgba(0,0,0,0.1); }");

    let scrolled = gtk::ScrolledWindow::builder()
        .vexpand(true)
        .child(&text_view)
        .build();
    main_box.append(&scrolled);

    // Actions Footer
    let actions_box = gtk::Box::new(gtk::Orientation::Horizontal, 12);
    actions_box.set_margin_top(8);
    let btn_copy = gtk::Button::builder()
        .label("Copy to Clipboard")
        .hexpand(true)
        .build();
    btn_copy.add_css_class("suggested-action");
    let btn_save = gtk::Button::builder()
        .label("Save as File…")
        .hexpand(true)
        .build();
    actions_box.append(&btn_copy);
    actions_box.append(&btn_save);
    main_box.append(&actions_box);

    let formats = [
        ("css", "CSS vars"),
        ("scss", "SCSS vars"),
        ("json", "Style Dict"),
        ("tailwind", "Tailwind"),
        ("android", "Android XML"),
    ];

    // Redraw logic
    let refresh_all = {
        let state = state.clone();
        let current_format = current_format.clone();
        let text_view = text_view.clone();
        let main_box = main_box.clone();

        move || {
            let s = state.borrow();
            let is_empty = s.token_groups.is_empty() || s.token_groups.iter().all(|g| g.tokens.is_empty());

            if is_empty {
                text_view.buffer().set_text("Add tokens in the Tokens tab to generate exports.");
                main_box.set_sensitive(false);
            } else {
                main_box.set_sensitive(true);
                let format = current_format.borrow().clone();
                let output = match format.as_str() {
                    "css" => exporter::export_css(&s.token_groups, &s.palettes),
                    "scss" => exporter::export_scss(&s.token_groups, &s.palettes),
                    "json" => exporter::export_json(&s.token_groups, &s.palettes),
                    "tailwind" => exporter::export_tailwind(&s.token_groups, &s.palettes),
                    "android" => exporter::export_android_xml(&s.token_groups, &s.palettes),
                    _ => String::new(),
                };
                text_view.buffer().set_text(&output);
            }
        }
    };

    // Format buttons connections
    for (fmt_id, label) in formats {
        let btn = gtk::Button::builder()
            .label(label)
            .build();
        format_header.append(&btn);

        let fmt_id_str = fmt_id.to_string();
        let current_format_clone = current_format.clone();
        let refresh_clone = refresh_all.clone();
        btn.connect_clicked(move |_| {
            *current_format_clone.borrow_mut() = fmt_id_str.clone();
            refresh_clone();
        });
    }

    // Copy Connection
    {
        let text_view = text_view.clone();
        btn_copy.connect_clicked(move |btn| {
            let buffer = text_view.buffer();
            let (start, end) = buffer.bounds();
            let text = buffer.text(&start, &end, false).to_string();

            let clipboard = gdk::Display::default().unwrap().clipboard();
            clipboard.set_text(&text);

            let old_label = btn.label().unwrap_or_default();
            btn.set_label("Copied!");
            let btn_clone = btn.clone();
            glib::timeout_add_local(std::time::Duration::from_secs(2), move || {
                btn_clone.set_label(&old_label);
                glib::ControlFlow::Break
            });
        });
    }

    // Save Connection
    {
        let text_view = text_view.clone();
        let current_format = current_format.clone();
        btn_save.connect_clicked(move |_| {
            let buffer = text_view.buffer();
            let (start, end) = buffer.bounds();
            let text = buffer.text(&start, &end, false).to_string();

            let ext = current_format.borrow().clone();
            let file_name = format!("tokens.{}", if ext == "android" { "xml" } else if ext == "tailwind" { "ts" } else { &ext });

            let dialog = gtk::FileDialog::builder()
                .title("Save Exported Tokens")
                .initial_name(&file_name)
                .build();

            dialog.save(None::<&gtk::Window>, gtk::gio::Cancellable::NONE, move |res| {
                if let Ok(file) = res {
                    if let Some(path) = file.path() {
                        let _ = std::fs::write(path, &text);
                    }
                }
            });
        });
    }

    *refresh_export_view.borrow_mut() = Some(Rc::new(refresh_all));

    main_box.upcast::<gtk::Widget>()
}
