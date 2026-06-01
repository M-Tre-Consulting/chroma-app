use gtk4 as gtk;
use libadwaita as adw;
use gtk::gdk;
use gtk::glib;
use adw::prelude::*;
use std::rc::Rc;
use std::cell::RefCell;

use crate::types::AppState;
use crate::exporter;
use crate::ui_helpers::{apply_widget_css, set_margin_all};

pub fn build_export_page(
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
