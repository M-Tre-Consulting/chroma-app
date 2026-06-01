use gtk4 as gtk;
use libadwaita as adw;
use gtk::gdk;
use adw::prelude::*;
use std::rc::Rc;
use std::cell::RefCell;

mod types;
mod colour_math;
mod store;
mod exporter;
mod ui_helpers;
mod palettes_page;
mod tokens_page;
mod export_page;

use store::Store;
use palettes_page::build_palettes_page;
use tokens_page::build_tokens_page;
use export_page::build_export_page;

fn main() {
    let app = adw::Application::builder()
        .application_id("com.chroma.app")
        .build();

    app.connect_activate(build_ui);
    app.run();
}

fn build_ui(app: &adw::Application) {
    let store = Store::new();
    let state = Rc::new(RefCell::new(store.load()));

    // Custom global styling
    let provider = gtk::CssProvider::new();
    provider.load_from_string(r#"
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
        .default_width(1024)
        .default_height(700)
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
